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

const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com', 'm.instagram.com']);
const INSTAGRAM_GRAPHQL_DOCUMENT_ID = '9510064595728286';

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

    const attempts = [() => extractWithGraphql(shortcode), () => extractWithLibrary(url)];

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
