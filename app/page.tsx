'use client';
import { useState } from 'react';
import { submitWaitlist } from './actions';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  
  // 상태 변화 감지: 이메일 텍스트가 존재하고, 로딩 중이 아닐 때만 true (버튼 활성화 조건)
  const isButtonEnabled = email.trim().length > 0 && status !== 'loading'; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isButtonEnabled) return; // 이중 차단
    
    setStatus('loading');
    
    // 서버 액션 호출 (Neon DB 전송)
    const result = await submitWaitlist(email);

    if (result.success) {
      setStatus('success');
      setEmail(''); // 성공 시 폼 초기화
      alert('BigWave 대기 명단에 성공적으로 등록되었습니다.');
    } else {
      setStatus('idle');
      alert('이미 등록된 이메일이거나 서버에 문제가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <header className="mb-12 text-center pt-10">
        <h1 className="text-5xl font-bold tracking-tight">BigWave</h1>
        <p className="text-gray-400 mt-4 text-lg">Vertical AI & Hyper-automation Studio</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="col-span-1 md:col-span-2 bg-neutral-900 border border-neutral-800 p-8 rounded-3xl hover:border-neutral-700 transition-colors">
          <h2 className="text-2xl font-semibold mb-4">AI Labs & Blog</h2>
          <p className="text-neutral-400">최신 버티컬 AI 프로젝트와 기술 동향이 업데이트될 공간입니다.</p>
        </div>

        <div className="col-span-1 bg-neutral-900 border border-neutral-800 p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Waitlist</h2>
            <p className="text-sm text-neutral-400 mb-6">프로젝트 의뢰 및 사전 예약</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input 
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'success') setStatus('idle');
              }}
              placeholder="이메일 주소 입력"
              className="p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
            />
            {/* 상태 변화에 따른 엄격한 버튼 활성화/비활성화 통제 로직 적용 */}
            <button 
              type="submit"
              disabled={!isButtonEnabled}
              className={`p-3 rounded-xl font-bold transition-all duration-200 ${
                isButtonEnabled 
                  ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-500' // 활성화 상태 (명확한 액션 가능 표시)
                  : 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-700' // 비활성화 상태 (무효한 전송 사전 차단)
              }`}
            >
              {status === 'loading' ? '처리 중...' : '저장 및 확인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}