'use client';
import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  
  // 데이터 상태 변화 감지: 이메일이 한 글자 이상 입력되었을 때만 true
  const isButtonEnabled = email.trim().length > 0; 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isButtonEnabled) return;
    console.log('DB 전송 대기:', email);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <header className="mb-12 text-center pt-10">
        <h1 className="text-5xl font-bold tracking-tight">BigWave</h1>
        <p className="text-gray-400 mt-4 text-lg">Vertical AI & Hyper-automation Studio</p>
      </header>

      {/* 벤토 그리드 컨테이너 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        
        {/* 블로그/뉴스 카드 (2칸 차지) */}
        <div className="col-span-1 md:col-span-2 bg-neutral-900 border border-neutral-800 p-8 rounded-3xl hover:border-neutral-700 transition-colors">
          <h2 className="text-2xl font-semibold mb-4">AI Labs & Blog</h2>
          <p className="text-neutral-400">최신 버티컬 AI 프로젝트와 기술 동향이 업데이트될 공간입니다.</p>
        </div>

        {/* Contact & Waitlist 폼 카드 (1칸 차지) */}
        <div className="col-span-1 bg-neutral-900 border border-neutral-800 p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Waitlist</h2>
            <p className="text-sm text-neutral-400 mb-6">프로젝트 의뢰 및 사전 예약</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소 입력"
              className="p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!isButtonEnabled}
              className={`p-3 rounded-xl font-bold transition-all duration-200 ${
                isButtonEnabled 
                  ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-500' 
                  : 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-700' // 비활성화 상태 명확히 분리
              }`}
            >
              저장 및 확인
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}