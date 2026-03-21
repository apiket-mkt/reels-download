import { NextResponse } from 'next/server';
// @ts-ignore
import instagramUrlDirect from 'instagram-url-direct';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();
        
        if (!url || !url.includes('instagram.com')) {
            return NextResponse.json({ error: '유효한 인스타그램 릴스/게시물 주소를 입력해주세요.' }, { status: 400 });
        }

        // 강력한 오픈소스 패키지를 활용한 릴스/영상 URL 추출 엔진 가동
        const links = await instagramUrlDirect.instagramGetUrl(url);

        if (links && links.url_list && links.url_list.length > 0) {
            // 최상단 결과가 보통 가장 화질이 높음
            return NextResponse.json({ success: true, videoUrl: links.url_list[0] });
        } else {
            return NextResponse.json({ error: '비공개 게시물이거나, 인스타그램 구조 변경으로 추출이 불가능합니다.' }, { status: 404 });
        }

    } catch (error) {
        console.error('인스타그램 추출 에러:', error);
        return NextResponse.json({ error: '인스타그램 서버로부터 동영상 주소를 긁어오는 중 치명적 에러가 발생했습니다.' }, { status: 500 });
    }
}
