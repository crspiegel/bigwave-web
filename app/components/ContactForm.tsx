'use client';
import { useState } from 'react';
import { submitContact } from '../actions';

export default function ContactForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  // 이메일과 문의 내용이 모두 1글자 이상, 로딩 중 아닐 때만 활성화
  const isButtonEnabled = email.trim().length > 0 && message.trim().length > 0 && status !== 'loading';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isButtonEnabled) return; // 빈 데이터 전송 원천 차단

    setStatus('loading');

    const result = await submitContact(email.trim(), message.trim());

    if (result.success) {
      setEmail('');
      setMessage('');
      alert('문의가 성공적으로 접수되었습니다. 빠르게 검토 후 연락드리겠습니다.');
    } else {
      alert('전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }

    setStatus('idle');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-2">
        <label className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-neutral-600"
        />
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <label className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="문의 내용을 입력하세요"
          rows={6}
          className="p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-neutral-600"
        />
      </div>

      {/* 이메일 + 문의 내용 모두 입력 시에만 활성화 */}
      <button
        type="submit"
        disabled={!isButtonEnabled}
        className={`mt-auto p-3 rounded-xl font-bold text-sm transition-all duration-200 ${
          isButtonEnabled
            ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-500'
            : 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-700'
        }`}
      >
        {status === 'loading' ? '전송 중...' : '문의 보내기'}
      </button>
    </form>
  );
}
