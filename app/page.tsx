import Link from 'next/link';
import ContactForm from './components/ContactForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <header className="mb-16 text-center pt-16">
        <h1 className="text-5xl font-bold tracking-tight">BigWave</h1>
        <p className="text-neutral-400 mt-4 text-lg">
          특정 타겟의 명확한 결핍을 해결하는 버티컬 AI 스튜디오
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Contact 카드 — 폼 인터랙션만 클라이언트로 격리 */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col hover:border-neutral-700 transition-colors">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Contact</h2>
            <p className="text-sm text-neutral-400">비즈니스 의뢰 및 협업 제안</p>
          </div>
          <ContactForm />
        </div>

        {/* About & AI Blog 카드 — 완전한 정적 서버 컴포넌트 */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col justify-between hover:border-neutral-700 transition-colors">
          <div>
            <h2 className="text-xl font-semibold mb-1">About & AI Blog</h2>
            <p className="text-sm text-neutral-400 mb-8">
              BigWave는 특정 산업 내 명확한 결핍을 발굴하고, AI로 정밀하게 해결하는 버티컬 스튜디오입니다.
            </p>

            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-0.5">→</span>
                <span>의뢰 기반의 버티컬 AI 솔루션 제작</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-0.5">→</span>
                <span>하이퍼 오토메이션 워크플로우 설계 및 구현</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-0.5">→</span>
                <span>프로세스 자동화 및 AI 에이전트 개발</span>
              </li>
            </ul>
          </div>

          {/* AI Blog 유도 배너 */}
          <Link
            href="/blog"
            className="mt-8 flex items-center justify-between p-4 bg-neutral-800 border border-neutral-700 rounded-2xl group hover:border-blue-700 hover:bg-neutral-800/80 transition-all duration-200"
          >
            <div>
              <p className="text-sm font-semibold text-white">AI Labs & Blog</p>
              <p className="text-xs text-neutral-500 mt-0.5">최신 버티컬 AI 리서치 & 인사이트</p>
            </div>
            <span className="text-neutral-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200 text-lg">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
