'use client';
import { useState } from 'react';

export default function Home() {
    const [url, setUrl] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState('');
    const [error, setError] = useState('');

    const handleExtract = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStep(2); // 분석
        setError('');
        setResultUrl('');

        try {
            const res = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                setStep(3); // 변환
                setTimeout(() => {
                    setResultUrl(data.videoUrl);
                    setStep(4); // 다운로드
                    setLoading(false);
                }, 800); // 딜레이를 주어 애니메이션/단계 감상
            } else {
                setError(data.error || '알 수 없는 에러가 발생했습니다.');
                setLoading(false);
                setStep(1);
            }
        } catch (err) {
            setError('네트워크 오류가 발생했습니다.');
            setLoading(false);
            setStep(1);
        }
    };

    return (
        <main className="min-h-screen bg-[#0F0F13] text-gray-200 flex flex-col items-center pt-24 pb-12 px-6 font-sans relative overflow-hidden">
            {/* 배경 그리드 및 옅은 글로우 */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none"></div>

            {/* 상단 뱃지 */}
            <div className="relative z-10 px-5 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-semibold mb-6 shadow-lg shadow-purple-500/10 tracking-widest bg-black/50 backdrop-blur-md">
                스스로마케팅연구소
            </div>

            {/* 메인 타이틀 */}
            <h1 className="relative z-10 text-5xl font-extrabold mb-4 tracking-tight text-center">
                <span className="text-white block mb-2">인스타그램 영상</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    자동화 파이프라인
                </span>
            </h1>

            {/* 서브 타이틀 영역 */}
            <div className="relative z-10 flex items-center gap-6 mb-12 text-gray-400 font-medium text-sm tracking-wide">
                <span>URL 입력 ➔ 분석 ➔ MP4 전환 ➔ 최고화질 다운로드</span>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-700 transition">
                    <span>🔑</span> 키 변경
                </button>
            </div>

            {/* 스텝 표시기 (Stepper) */}
            <div className="relative z-10 flex items-center justify-center gap-4 mb-14 w-full max-w-lg">
                <StepItem num="1" text="업로드" active={step >= 1} />
                <div className="flex-1 h-px bg-gray-700"></div>
                <StepItem num="2" text="분석" active={step >= 2} />
                <div className="flex-1 h-px bg-gray-700"></div>
                <StepItem num="3" text="추출" active={step >= 3} />
                <div className="flex-1 h-px bg-gray-700"></div>
                <StepItem num="4" text="다운로드" active={step === 4} />
            </div>

            {/* 메인 입력 카드 */}
            <div className="relative z-10 w-full max-w-4xl bg-[#1A1A21] border border-gray-800 p-8 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/30">1</div>
                    <span className="font-semibold text-lg tracking-wide text-gray-100">URL 연결</span>
                </div>

                <div className="border border-dashed border-gray-700 hover:border-purple-500/50 transition-colors rounded-xl p-10 flex flex-col items-center bg-gray-900/30">
                    <div className="mb-4 p-4 bg-gray-800 rounded-2xl text-purple-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">인스타그램 릴스/영상 URL 입력</h2>
                    <p className="text-gray-500 mb-8 text-sm">추출할 게시물의 전체 URL 주소를 복사하여 아래에 붙여넣어 주세요.</p>
                    
                    <form onSubmit={handleExtract} className="w-full max-w-2xl flex flex-col gap-4">
                        <input 
                            type="url" 
                            placeholder="https://www.instagram.com/reel/..." 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            className="w-full px-5 py-4 bg-black/60 border border-gray-700 rounded-xl outline-none focus:border-purple-500 transition-all text-white placeholder-gray-600 text-center text-lg shadow-inner"
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-[#7030A0] hover:bg-[#8A3FD0] rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all disabled:opacity-50 flex justify-center items-center gap-3 text-white"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span>파이프라인 가동 중...</span>
                                </>
                            ) : '추출 파이프라인 가동'}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="mt-6 w-full p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center animate-fade-in font-medium flex items-center justify-center gap-2">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {error}
                    </div>
                )}

                {resultUrl && (
                    <div className="mt-8 border-t border-gray-800 pt-8 animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold border border-purple-500/30">4</div>
                            <span className="font-semibold text-lg tracking-wide text-gray-100">최종 파일 다운로드</span>
                        </div>
                        <div className="flex gap-8 items-center bg-[#13131A] p-6 rounded-2xl border border-gray-800 shadow-inner">
                            <video 
                                src={resultUrl} 
                                controls 
                                className="w-[300px] max-h-96 rounded-xl border border-gray-700 bg-black shadow-lg"
                            />
                            <div className="flex flex-col gap-4 flex-1">
                                <h3 className="text-2xl font-bold text-white mb-2">분석 및 추출 완료! 🎉</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">최고 해상도의 원본 품질 MP4 파일 스트림을 무사히 확보했습니다. 아래 버튼을 눌러 창이 열리면 <span className="text-purple-300 font-semibold px-1">우클릭 ➔ 동영상 저장</span>을 통해 PC에 저장하세요.</p>
                                <a 
                                    href={resultUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-4 bg-[#23232E] border border-gray-700 hover:bg-[#2A2A35] hover:border-gray-500 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 text-center w-full mt-2 text-white"
                                >
                                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    새 창에서 원본 뷰어 열기
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <p className="mt-16 text-gray-600 text-xs font-medium tracking-[0.2em] transform scale-y-110 z-10 flex items-center gap-2">
                SSRO MARKETING CORP.
            </p>
        </main>
    );
}

function StepItem({ num, text, active }: { num: string, text: string, active: boolean }) {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-lg 
                ${active ? 'bg-[#2A2A3E] border-2 border-indigo-400 text-indigo-200 shadow-indigo-500/20' : 'bg-gray-800 border-2 border-gray-700 text-gray-500'}`}>
                {num}
            </div>
            <span className={`text-sm tracking-wide font-medium ${active ? 'text-indigo-200' : 'text-gray-600'} transition-all`}>{text}</span>
        </div>
    );
}
