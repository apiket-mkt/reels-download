import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();
        if (!url || !url.includes('instagram.com')) {
            return NextResponse.json({ error: '유효한 인스타그램 주소를 입력해주세요.' }, { status: 400 });
        }

        const postUrl = new URL(url);
        postUrl.searchParams.set('__a', '1');
        postUrl.searchParams.set('__d', 'dis');

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'x-ig-app-id': '936619743392459',
            'x-requested-with': 'XMLHttpRequest',
        };

        const response = await fetch(postUrl.href, { headers });
        let rawUrl = null;
        let videoUrl = null;

        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            
            function findMp4(obj: any): string | null {
                if (!obj || typeof obj !== 'object') return null;
                if (typeof obj === 'string' && obj.includes('.mp4')) return obj;
                if (obj.video_url && typeof obj.video_url === 'string') return obj.video_url;
                if (obj.video_versions && Array.isArray(obj.video_versions) && obj.video_versions.length > 0 && obj.video_versions[0].url) {
                    return obj.video_versions[0].url;
                }
                for (const key in obj) {
                    const res = findMp4(obj[key]);
                    if (res) return res;
                }
                return null;
            }
            videoUrl = findMp4(data);
        }

        // 2차 Fallback: HTML 원시 스크랩 (서버사이드 정규식 우회)
        if (!videoUrl) {
            const htmlRes = await fetch(url, { headers });
            const htmlData = await htmlRes.text();

            const match1 = htmlData.match(/"video_url"\s*:\s*"([^"]+)"/);
            if (match1 && match1[1]) rawUrl = match1[1];
            else {
                const match2 = htmlData.match(/"video_versions"\s*:\s*\[.*?url"\s*:\s*"([^"]+)"/);
                if (match2 && match2[1]) rawUrl = match2[1];
                else {
                    const match3 = htmlData.match(/(https:(?:\\\/\\\/|\/\/)[^\s"'<>]+\.mp4[^\s"'\\]*)/);
                    if (match3 && match3[1]) rawUrl = match3[1];
                }
            }

            if (rawUrl) {
                try {
                    videoUrl = JSON.parse('"' + rawUrl + '"');
                } catch (e) {
                    videoUrl = rawUrl.replace(/\\u0026/g, '&').replace(/\\\//g, '/');
                }
            }
        }

        if (videoUrl) {
            return NextResponse.json({ success: true, videoUrl });
        } else {
            return NextResponse.json({ error: '원본 동영상 주소를 찾을 수 없습니다. (게시물이 비공개이거나 서버 차단 상태입니다)' }, { status: 404 });
        }

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
    }
}
