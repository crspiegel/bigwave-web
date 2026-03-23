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
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="font-sans text-xs font-medium uppercase tracking-wider text-black/50">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="font-sans border-0 border-b border-black/25 bg-transparent py-3 text-sm text-black outline-none transition-colors placeholder:text-black/35 focus:border-black"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <label className="font-sans text-xs font-medium uppercase tracking-wider text-black/50">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="문의 내용을 입력하세요"
          rows={6}
          className="font-sans resize-none border-0 border-b border-black/25 bg-transparent py-3 text-sm text-black outline-none transition-colors placeholder:text-black/35 focus:border-black"
        />
      </div>

      {/* 이메일 + 문의 내용 모두 입력 시에만 활성화 */}
      <button
        type="submit"
        disabled={!isButtonEnabled}
        className={`mt-auto rounded-xl px-6 py-3 font-sans text-sm font-medium transition-all duration-200 ${
          isButtonEnabled
            ? 'cursor-pointer bg-black text-white hover:opacity-90'
            : 'cursor-not-allowed bg-black/30 text-black/50'
        }`}
      >
        {status === 'loading' ? '전송 중...' : '문의 보내기'}
      </button>
    </form>
  );
}
