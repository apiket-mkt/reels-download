'use client';
import { useState } from 'react';

export default function Home() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState('');
    const [error, setError] = useState('');

    const handleExtract = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
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
                setResultUrl(data.videoUrl);
            } else {
                setError(data.error || '알 수 없는 에러가 발생했습니다.');
            }
        } catch (err) {
            setError('네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
                <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mb-6 shadow-lg shadow-purple-500/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </div>
                <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">InstaSave Web</h1>
                <p className="text-gray-300 mb-10 font-light text-center px-4">릴스 및 동영상 링크 하나로 워터마크 없는 원본을 추출하세요.</p>
                
                <form onSubmit={handleExtract} className="w-full flex flex-col gap-5">
                    <input 
                        type="url" 
                        placeholder="https://www.instagram.com/reel/..." 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder-gray-500 text-lg shadow-inner"
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-3"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>원본 영상 탐색 중...</span>
                            </>
                        ) : '고화질 동영상 추출'}
                    </button>
                </form>

                {error && (
                    <div className="mt-8 w-full p-5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-center animate-fade-in font-medium">
                        {error}
                    </div>
                )}

                {resultUrl && (
                    <div className="mt-10 w-full flex flex-col items-center animate-fade-in-up">
                        <div className="w-full p-2 bg-white/5 rounded-3xl border border-white/10 mb-6 shadow-2xl">
                            <video 
                                src={resultUrl} 
                                controls 
                                className="w-full max-h-[500px] rounded-2xl bg-black"
                            />
                        </div>
                        <a 
                            href={resultUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-white/10 border border-white/20 hover:bg-white/20 rounded-full font-semibold transition-all shadow-xl flex items-center gap-2"
                        >
                            <span>🔗 새 창에서 열기 (우클릭 ➔ 동영상 저장)</span>
                        </a>
                    </div>
                )}
            </div>
            
            <p className="mt-12 text-gray-500 text-sm font-light tracking-widest z-10">
                POWERED BY VERCEL
            </p>
        </main>
    );
}
