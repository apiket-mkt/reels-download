import { NextResponse } from 'next/server';
import { instagramGetUrl } from 'instagram-url-direct';

type InstagramDirectResult = {
  url_list?: string[];
};

type InstagramMediaNode = {
  is_video?: boolean;
  video_url?: string;
  display_url?: string;
  edge_sidecar_to_children?: {
    edges?: Array<{
      node?: InstagramMediaNode;
    }>;
  };
};

type ApifyInputMode = 'url' | 'urls' | 'directUrls' | 'startUrls';

const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com', 'm.instagram.com']);
const INSTAGRAM_GRAPHQL_DOCUMENT_ID = '9510064595728286';
const VIDEO_URL_KEYS = [
  'videoUrl',
  'videoURL',
  'video_url',
  'downloadUrl',
  'downloadURL',
  'download_url',
  'url',
  'mediaUrl',
  'mediaURL',
  'media_url',
  'mp4',
];

const MEDIA_LIST_KEYS = ['medias', 'media', 'items', 'downloads'];

function isInstagramUrl(value: string) {
  try {
    const parsed = new URL(value);
    return INSTAGRAM_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function getShortcode(value: string) {
  const parsed = new URL(value);
  const segments = parsed.pathname.split('/').filter(Boolean);
  const markerIndex = segments.findIndex((segment) =>
    ['p', 'reel', 'reels', 'tv'].includes(segment)
  );

  if (markerIndex === -1 || !segments[markerIndex + 1]) {
    return null;
  }

  return segments[markerIndex + 1];
}

async function resolveShareUrl(value: string) {
  const parsed = new URL(value);
  const segments = parsed.pathname.split('/').filter(Boolean);

  if (!segments.includes('share')) {
    return value;
  }

  const response = await fetch(value, {
    method: 'HEAD',
    redirect: 'follow',
    headers: {
      'user-agent': getUserAgent(),
    },
  });

  return response.url || value;
}

function getUserAgent() {
  return (
    process.env.INSTAGRAM_USER_AGENT ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  );
}

function getCookieHeader() {
  if (process.env.INSTAGRAM_COOKIES) {
    return process.env.INSTAGRAM_COOKIES;
  }

  if (process.env.INSTAGRAM_SESSIONID) {
    return `sessionid=${process.env.INSTAGRAM_SESSIONID};`;
  }

  return '';
}

function getCsrfToken(cookieHeader: string) {
  const fromCookie = cookieHeader.match(/(?:^|;\s*)csrftoken=([^;]+)/)?.[1];
  return process.env.INSTAGRAM_CSRF_TOKEN || fromCookie || 'missing';
}

async function extractWithLibrary(url: string) {
  const result = (await instagramGetUrl(url, {
    retries: 1,
    delay: 500,
  })) as InstagramDirectResult;

  return result.url_list?.find(Boolean) || null;
}

function getApifyInputMode(): ApifyInputMode {
  const mode = process.env.APIFY_INPUT_MODE;

  if (mode === 'urls' || mode === 'directUrls' || mode === 'startUrls') {
    return mode;
  }

  return 'url';
}

function createApifyInput(url: string) {
  const customTemplate = process.env.APIFY_INPUT_TEMPLATE;

  if (customTemplate) {
    return JSON.parse(customTemplate.replaceAll('{{url}}', url));
  }

  switch (getApifyInputMode()) {
    case 'urls':
      return { urls: [url] };
    case 'directUrls':
      return { directUrls: [url] };
    case 'startUrls':
      return { startUrls: [{ url }] };
    default:
      return { url };
  }
}

function normalizeActorId(actorId: string) {
  return actorId.trim().replace('/', '~');
}

function isLikelyVideoUrl(value: string) {
  try {
    const parsed = new URL(value);
    const pathname = parsed.pathname.toLowerCase();
    return parsed.protocol === 'https:' && pathname.includes('.mp4');
  } catch {
    return false;
  }
}

function isVideoMediaRecord(value: Record<string, unknown>) {
  const type = String(value.type || value.mediaType || '').toLowerCase();
  const extension = String(value.extension || '').toLowerCase();
  const mimeType = String(value.mimeType || '').toLowerCase();

  return (
    type === 'video' ||
    extension === 'mp4' ||
    mimeType.startsWith('video/') ||
    value.is_video === true
  );
}

function findVideoUrl(value: unknown): string | null {
  if (typeof value === 'string') {
    return isLikelyVideoUrl(value) ? value : null;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findVideoUrl(item);

      if (found) {
        return found;
      }
    }

    return null;
  }

  const record = value as Record<string, unknown>;

  if (isVideoMediaRecord(record)) {
    for (const key of VIDEO_URL_KEYS) {
      const found = findVideoUrl(record[key]);

      if (found) {
        return found;
      }
    }
  }

  for (const key of MEDIA_LIST_KEYS) {
    const found = findVideoUrl(record[key]);

    if (found) {
      return found;
    }
  }

  for (const key of VIDEO_URL_KEYS) {
    const found = findVideoUrl(record[key]);

    if (found) {
      return found;
    }
  }

  for (const nested of Object.values(record)) {
    const found = findVideoUrl(nested);

    if (found) {
      return found;
    }
  }

  return null;
}

async function extractWithApify(url: string) {
  const token = process.env.APIFY_TOKEN;
  const actorId = process.env.APIFY_ACTOR_ID;

  if (!token || !actorId) {
    return null;
  }

  const timeout = process.env.APIFY_TIMEOUT_SECONDS || '120';
  const maxCharge = process.env.APIFY_MAX_CHARGE_USD || '0.1';
  const endpoint = new URL(
    `https://api.apify.com/v2/actors/${encodeURIComponent(
      normalizeActorId(actorId)
    )}/run-sync-get-dataset-items`
  );

  endpoint.searchParams.set('timeout', timeout);
  endpoint.searchParams.set('maxItems', '1');
  endpoint.searchParams.set('maxTotalChargeUsd', maxCharge);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(createApifyInput(url)),
  });

  if (!response.ok) {
    console.warn('Apify extraction failed:', response.status, await response.text());
    return null;
  }

  const items = (await response.json()) as unknown;
  return findVideoUrl(items);
}

function collectVideoUrls(node: InstagramMediaNode | null | undefined): string[] {
  if (!node) {
    return [];
  }

  const urls: string[] = [];

  if (node.is_video && node.video_url) {
    urls.push(node.video_url);
  }

  for (const edge of node.edge_sidecar_to_children?.edges || []) {
    urls.push(...collectVideoUrls(edge.node));
  }

  return urls;
}

async function extractWithGraphql(shortcode: string) {
  const cookieHeader = getCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  const body = new URLSearchParams({
    variables: JSON.stringify({
      shortcode,
      fetch_tagged_user_count: null,
      hoisted_comment_id: null,
      hoisted_reply_id: null,
    }),
    doc_id: INSTAGRAM_GRAPHQL_DOCUMENT_ID,
  });

  const response = await fetch('https://www.instagram.com/graphql/query', {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/x-www-form-urlencoded',
      cookie: cookieHeader,
      'user-agent': getUserAgent(),
      'x-csrftoken': getCsrfToken(cookieHeader),
      'x-ig-app-id': '936619743392459',
      'x-requested-with': 'XMLHttpRequest',
    },
    body,
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const media = data?.data?.xdt_shortcode_media as InstagramMediaNode | undefined;
  return collectVideoUrls(media).find(Boolean) || null;
}

function createProxyUrl(videoUrl: string) {
  return `/api/proxy?url=${encodeURIComponent(videoUrl)}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: unknown };
    const rawUrl = typeof body.url === 'string' ? body.url.trim() : '';

    if (!rawUrl || !isInstagramUrl(rawUrl)) {
      return NextResponse.json(
        { error: '인스타그램 릴스 또는 게시물 주소를 입력해 주세요.' },
        { status: 400 }
      );
    }

    const url = await resolveShareUrl(rawUrl);
    const shortcode = getShortcode(url);

    if (!shortcode) {
      return NextResponse.json(
        { error: '릴스 코드가 포함된 인스타그램 주소인지 확인해 주세요.' },
        { status: 400 }
      );
    }

    const attempts = [
      () => extractWithApify(url),
      () => extractWithGraphql(shortcode),
      () => extractWithLibrary(url),
    ];

    for (const attempt of attempts) {
      try {
        const videoUrl = await attempt();

        if (videoUrl) {
          return NextResponse.json({
            success: true,
            videoUrl,
            downloadUrl: createProxyUrl(videoUrl),
          });
        }
      } catch (error) {
        console.warn('Instagram extraction attempt failed:', error);
      }
    }

    return NextResponse.json(
      {
        error:
          '다운로드 링크를 찾지 못했습니다. 비공개 게시물이거나 Instagram에서 서버 요청을 제한하고 있습니다.',
      },
      { status: 422 }
    );
  } catch (error) {
    console.error('Instagram extraction error:', error);
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    );
  }
}
