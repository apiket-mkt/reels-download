import { NextResponse } from 'next/server';

const ALLOWED_VIDEO_HOST_PARTS = ['cdninstagram.com', 'fbcdn.net'];

function isAllowedVideoUrl(value: string) {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === 'https:' &&
      ALLOWED_VIDEO_HOST_PARTS.some((hostPart) => parsed.hostname.endsWith(hostPart))
    );
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url') || '';

  if (!isAllowedVideoUrl(videoUrl)) {
    return NextResponse.json({ error: '유효한 다운로드 링크가 아닙니다.' }, { status: 400 });
  }

  const response = await fetch(videoUrl, {
    headers: {
      'user-agent':
        process.env.INSTAGRAM_USER_AGENT ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      referer: 'https://www.instagram.com/',
    },
  });

  if (!response.ok || !response.body) {
    return NextResponse.json(
      { error: '파일을 가져오지 못했습니다. 링크가 만료되었을 수 있습니다.' },
      { status: 502 }
    );
  }

  return new NextResponse(response.body, {
    headers: {
      'content-disposition': 'attachment; filename="instagram-reel.mp4"',
      'content-type': response.headers.get('content-type') || 'video/mp4',
      'cache-control': 'private, no-store',
    },
  });
}
