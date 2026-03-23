'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from './actions';

export default function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isButtonEnabled = password.trim().length > 0 && status !== 'loading';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    if (!isButtonEnabled) return;

    setError(null);
    setStatus('loading');

    const result = await loginAdmin(password.trim());

    if (result.success) {
      router.refresh();
    } else {
      setError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }

    setStatus('idle');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#6BA354] p-8 font-sans text-white">
      <div className="w-full max-w-md rounded-3xl border border-black/15 bg-white/10 p-8">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">관리자 로그인</h1>
        <p className="mt-2 text-sm text-white/80">비밀번호를 입력하세요.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="admin-password" className="text-sm font-medium text-white/90">
              비밀번호
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-black/15 bg-white p-3 text-black outline-none transition-colors placeholder:text-black/45 focus:border-black/35 focus:ring-2 focus:ring-black/10"
              placeholder="••••••••"
            />
          </div>

          {error ? <p className="text-sm text-red-200">{error}</p> : null}

          <button
            type="submit"
            disabled={!isButtonEnabled}
            className={`rounded-xl p-3 font-bold transition-all duration-200 ${
              isButtonEnabled
                ? 'cursor-pointer bg-black text-white hover:bg-black/90'
                : 'cursor-not-allowed border border-black/15 bg-white/25 text-black/45'
            }`}
          >
            {status === 'loading' ? '확인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
