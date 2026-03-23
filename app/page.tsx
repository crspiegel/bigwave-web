import Link from 'next/link';
import { getPosts } from './admin/actions';
import ContactForm from './components/ContactForm';
import HomeLatestPosts from './components/HomeLatestPosts';
import Navbar from '@/components/Navbar';

export const revalidate = 60;

const services = [
  {
    title: '의뢰 기반 버티컬 AI 솔루션',
    body: '산업별 결핍에 맞춘 맞춤형 AI 제품·도구를 기획부터 구현까지 함께합니다.',
  },
  {
    title: '하이퍼 오토메이션 워크플로우',
    body: '반복 업무를 줄이는 프로세스 설계와 자동화 파이프라인을 구축합니다.',
  },
  {
    title: '프로세스 자동화 & 에이전트',
    body: '업무 흐름에 맞는 자동화와 AI 에이전트로 운영 효율을 높입니다.',
  },
  {
    title: 'AI 도입 컨설팅',
    body: '도입 범위·ROI·리스크를 정리하고 실행 가능한 로드맵을 제안합니다.',
  },
] as const;

export default async function Home() {
  const allPosts = await getPosts();
  const latestPosts = allPosts.slice(0, 3).map((p) => ({
    id: p.id,
    title: p.title,
    created_at: p.created_at,
  }));

  return (
    <div className="min-h-screen bg-[#7BC862] text-black">
      <Navbar />

      <main className="font-sans">
        {/* Hero — EXPERIENCES */}
        <section
          id="experiences"
          className="relative min-h-[85vh] scroll-mt-24 px-5 pb-24 pt-28 md:px-8 md:pb-32 md:pt-32"
        >
          <div className="mx-auto max-w-6xl">
            <h1 className="font-serif text-[clamp(2.75rem,12vw,7.5rem)] font-normal leading-[0.95] tracking-tight text-black">
              Vertical AI.
              <br />
              Hyper Automation.
            </h1>
            <p className="mt-10 max-w-md font-sans text-sm leading-relaxed text-black/75 md:absolute md:bottom-24 md:right-8 md:mt-0 md:max-w-sm md:text-right lg:right-[max(2rem,calc(50%-36rem))]">
              BigWave는 특정 산업의 명확한 결핍을 발굴하고, AI로 정밀하게 해결하는 버티컬 스튜디오입니다. 비즈니스에 맞는
              리추얼을 새로 설계합니다.
            </p>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="scroll-mt-24 border-t border-black/10 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="font-sans text-xs font-medium tracking-[0.25em] text-black/50">SERVICES</p>
            <h2 className="mt-3 font-serif text-3xl text-black md:text-4xl">무엇을 만드는가</h2>
            <p className="mt-4 max-w-xl font-sans text-sm text-black/70">
              의뢰 기반 솔루션부터 워크플로우 설계까지, 핵심 역량을 한눈에 정리했습니다.
            </p>

            <div className="mt-14 grid gap-px bg-black/10 sm:grid-cols-2">
              {services.map((item) => (
                <article
                  key={item.title}
                  className="bg-[#7BC862] p-6 md:p-8"
                >
                  <h3 className="font-serif text-xl text-black md:text-2xl">{item.title}</h3>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-black/75">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Blog */}
        <section id="blog" className="scroll-mt-24 border-t border-black/10 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-sans text-xs font-medium tracking-[0.25em] text-black/50">BLOG</p>
                <h2 className="mt-3 font-serif text-3xl text-black md:text-4xl">최신 인사이트</h2>
                <p className="mt-2 max-w-md font-sans text-sm text-black/70">AI Labs에서 다루는 버티컬 AI 리서치와 노트입니다.</p>
              </div>
              <Link
                href="/blog"
                className="font-sans text-sm font-medium text-black underline-offset-4 hover:underline"
              >
                전체 보기 →
              </Link>
            </div>

            <div className="mt-12">
              <HomeLatestPosts posts={latestPosts} />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-24 border-t border-black/10 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="font-sans text-xs font-medium tracking-[0.25em] text-black/50">CONTACT</p>
            <h2 className="mt-3 font-serif text-3xl text-black md:text-4xl">프로젝트 문의</h2>
            <p className="mt-4 max-w-lg font-sans text-sm text-black/70">
              비즈니스 의뢰·협업 제안을 남겨 주세요. 검토 후 빠르게 연락드립니다.
            </p>

            <div className="mt-10 max-w-xl rounded-3xl bg-white/20 p-6 backdrop-blur-sm md:p-8">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10 px-5 py-8 text-center font-sans text-xs text-black/50 md:px-8">
        © {new Date().getFullYear()} BigWave. All rights reserved.
      </footer>
    </div>
  );
}
