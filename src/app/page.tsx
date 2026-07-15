'use client';
import { useState } from 'react';

export default function Home() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');
    const [error, setError] = useState('');

    const handleExtract = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResultUrl('');
        setDownloadUrl('');

        try {
            const res = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                setResultUrl(data.videoUrl);
                setDownloadUrl(data.downloadUrl || data.videoUrl);
            } else {
                setError(data.error || '다운로드에 실패했습니다. 다시 시도해주세요.');
            }
        } catch {
            setError('네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0C10] text-[#E2E8F0] font-sans selection:bg-pink-500/30 overflow-x-hidden">
            {/* Navbar */}
            <header className="flex items-center justify-between px-6 md:px-8 py-6 max-w-7xl mx-auto w-full">
                <div className="text-xl md:text-2xl font-bold tracking-tighter flex items-center gap-1">
                    <span className="text-white">KINETIC</span>
                    <span className="text-pink-400">REELS</span>
                </div>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <a href="#" className="hover:text-gray-200 transition-colors">히스토리</a>
                    <a href="#" className="hover:text-gray-200 transition-colors">기능</a>
                    <a href="#" className="hover:text-gray-200 transition-colors">가격</a>
                </nav>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <a href="#" className="text-gray-300 hover:text-white transition-colors">로그인</a>
                    <a href="#" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all hover:-translate-y-0.5 font-bold">
                        프로 시작하기
                    </a>
                </div>
                {/* 모바일용 심플 메뉴 버튼 */}
                <div className="md:hidden flex">
                    <button className="text-pink-400 font-bold text-sm bg-pink-500/10 px-4 py-2 rounded-full border border-pink-500/20">시작하기</button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-24 flex flex-col items-center w-full">
                {/* Hero Section */}
                <div className="text-center w-full max-w-3xl mb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.2] md:leading-[1.15] tracking-tight mb-6 text-white break-keep">
                        인스타그램 릴스를<br/>
                        즉시 비디오로 <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-black">변환하세요</span>
                    </h1>
                    <p className="text-[#94A3B8] text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10 font-normal break-keep">
                        제한 없는 고화질 MP4 다운로드. 고성능 엔진으로 좋아하는 순간을 영원한 추억으로 바꾸세요.
                    </p>

                    {/* Search Pill */}
                    <form onSubmit={handleExtract} className="relative group w-full max-w-2xl mx-auto p-[1px] rounded-3xl md:rounded-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-pink-500 hover:to-purple-500 transition-all duration-300">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-[2rem] md:rounded-full blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
                        <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-[#13151D] rounded-[1.4rem] md:rounded-full p-2 md:pr-2.5">
                            <div className="hidden md:flex pl-6 text-gray-500 shrink-0">
                                <svg width="20" height="20" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                            </div>
                            <input 
                                type="url" 
                                placeholder="릴스 주소 붙여넣기..." 
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                                className="flex-1 bg-transparent border-none outline-none px-6 md:px-4 py-4 md:py-4 text-white placeholder-gray-500 w-full font-medium"
                            />
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="px-8 py-4 md:py-3.5 mt-2 md:mt-0 rounded-2xl md:rounded-full bg-gradient-to-l from-pink-400 to-rose-400 text-white font-bold shadow-lg flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap min-w-[140px] justify-center shrink-0"
                            >
                                {loading ? (
                                    <svg width="20" height="20" className="animate-spin w-5 h-5 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <>변환하기 🪄</>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-8 text-[12px] md:text-[13px] font-semibold text-[#6E7B92]">
                        <span className="flex items-center gap-2 whitespace-nowrap"><div className="w-3.5 h-3.5 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-[9px] pt-px">✔</div> 워터마크 없음</span>
                        <span className="flex items-center gap-2 whitespace-nowrap"><div className="w-3.5 h-3.5 shrink-0 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 text-[9px] pt-px">✔</div> 초고속 처리</span>
                        <span className="flex items-center gap-2 whitespace-nowrap"><div className="w-3.5 h-3.5 shrink-0 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-[9px] pt-px">✔</div> 4K 지원</span>
                    </div>

                    {error && (
                        <div className="mt-8 w-full max-w-xl mx-auto p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-semibold animate-fade-in shadow-xl break-words">
                            {error}
                        </div>
                    )}
                </div>

                {/* Result Section */}
                {resultUrl ? (
                    <div className="w-full max-w-4xl p-6 md:p-8 bg-[#13151D] border border-[#232736] rounded-3xl shadow-2xl animate-fade-in-up mt-4 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-400"></div>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">변환 처리 완료 🎉</h2>
                        <p className="text-gray-400 text-sm mb-8 text-center break-keep">동영상을 재생해 보거나 창을 열어 다운로드(우클릭/점3개) 하세요.</p>
                        
                        <div className="flex flex-col md:flex-row gap-8 items-center w-full">
                            <div className="w-full md:w-1/2 flex justify-center">
                                <video 
                                    src={resultUrl} 
                                    controls 
                                    autoPlay
                                    className="max-h-[400px] w-full max-w-[300px] md:max-w-full rounded-2xl object-cover bg-black border border-white/5 shadow-2xl"
                                />
                            </div>
                            
                            <div className="w-full md:w-1/2 flex flex-col gap-6">
                                <div className="p-6 md:p-8 bg-[#181A25] rounded-3xl border border-white/5 shadow-xl w-full">
                                    <div className="w-10 h-10 shrink-0 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                                        <svg width="20" height="20" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">고화질 원본 처리 성공</h3>
                                    <p className="text-sm text-gray-400 mb-8 leading-relaxed break-keep">워터마크 없는 오리지널 해상도의 MP4 영상입니다. 아래 버튼을 눌러 기기에 저장하세요.</p>
                                    
                                    <a 
                                        href={downloadUrl || resultUrl}
                                        download
                                        className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-3"
                                    >
                                        <svg width="20" height="20" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        파일 바로 보기 및 저장
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Features Grid - only show when no result */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mt-10">
                        {/* Card 1 */}
                        <div className="bg-[#191C29] border border-[#232736] rounded-[2rem] p-8 relative overflow-hidden group hover:border-[#2F3548] transition-colors shadow-xl w-full">
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all"></div>
                            <div className="w-12 h-12 shrink-0 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
                                <svg width="24" height="24" className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">빠른 처리</h3>
                            <p className="text-sm text-[#8B98AD] leading-relaxed mb-10 break-keep">클라우드 기반 서버가 단 몇 초 만에 비디오를 처리하여 원본과 동일한 품질로 신속하게 제공합니다.</p>
                            
                            <div className="w-full bg-[#0B0D14] rounded-full h-1 mt-auto">
                                <div className="bg-gradient-to-r from-indigo-500 to-rose-400 h-1 rounded-full relative" style={{width: '75%'}}>
                                    <span className="absolute -right-1 -top-5 text-[10px] text-gray-400 font-bold tracking-wider">75%</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-[#191C29] border border-[#232736] rounded-[2rem] p-8 relative overflow-hidden group hover:border-[#2F3548] transition-colors shadow-xl w-full">
                             <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-rose-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-rose-500/20 transition-all"></div>
                            <div className="w-12 h-12 shrink-0 bg-rose-500/10 rounded-2xl border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-inner">
                                <svg width="24" height="24" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">다양한 포맷</h3>
                            <p className="text-sm text-[#8B98AD] leading-relaxed mb-10 break-keep">MP4, MOV 중에서 선택하거나 고음질 MP3 형식으로 오디오만 즉시 추출할 수 있습니다.</p>
                            <div className="flex flex-wrap gap-2 mt-auto">
                                <span className="px-4 py-1.5 bg-[#202434] border border-[#2A2F45] rounded-lg text-xs font-bold text-gray-300">MP4</span>
                                <span className="px-4 py-1.5 bg-[#202434] border border-[#2A2F45] rounded-lg text-xs font-bold text-gray-300">MP3</span>
                                <span className="px-4 py-1.5 bg-[#202434] border border-[#2A2F45] rounded-lg text-xs font-bold text-gray-300">MOV</span>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-[#191C29] border border-[#232736] rounded-[2rem] p-8 relative overflow-hidden group hover:border-[#2F3548] transition-colors shadow-xl w-full">
                            <div className="w-12 h-12 shrink-0 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6 shadow-inner">
                                <svg width="24" height="24" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">제한 없음</h3>
                            <p className="text-sm text-[#8B98AD] leading-relaxed break-keep">다운로드 속도를 제한하지 않으며, 하루에 변환할 수 있는 릴스의 개수에도 완전히 제한이 없습니다.</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-white/5 bg-[#0B0C10] py-10 mt-auto">
                <div className="w-full max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
                        <div className="text-lg font-bold tracking-tighter">
                            <span className="text-white">KINETIC</span> <span className="text-gray-500">REELS</span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium tracking-wide">© 2024 Kinetic Reels. 콘텐츠를 위한 디지털 연금술.</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-[12px] md:text-[13px] text-gray-500 font-semibold tracking-wide">
                        <a href="#" className="hover:text-gray-300 transition-colors">도움말 센터</a>
                        <a href="#" className="hover:text-gray-300 transition-colors">개인정보 처리방침</a>
                        <a href="#" className="hover:text-gray-300 transition-colors">이용 약관</a>
                        <a href="#" className="hover:text-gray-300 transition-colors">API</a>
                    </div>
                    <div className="flex gap-4">
                        <div className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer">
                            <svg width="20" height="20" className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                        </div>
                        <div className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer">
                            <svg width="20" height="20" className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
