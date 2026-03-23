'use client';

import Link from 'next/link';

export type HomeBlogTeaser = {
  id: number;
  title: string;
  created_at: string;
};

export default function HomeLatestPosts({ posts }: { posts: HomeBlogTeaser[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white/10 px-6 py-12 text-center">
        <p className="font-sans text-sm text-black/60">아직 공개된 글이 없습니다.</p>
        <Link href="/blog" className="mt-4 inline-block text-sm font-medium text-black underline-offset-4 hover:underline">
          블로그로 이동
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3 md:gap-4">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={`/blog/${post.id}`}
            className="group flex flex-col gap-1 rounded-2xl border border-black/10 bg-white/10 px-5 py-4 transition-colors hover:border-black/25 hover:bg-white/20 md:flex-row md:items-baseline md:justify-between md:gap-8 md:px-6 md:py-5"
          >
            <span className="font-serif text-lg text-black md:text-xl md:group-hover:underline md:underline-offset-4">
              {post.title}
            </span>
            <time
              dateTime={new Date(post.created_at).toISOString()}
              suppressHydrationWarning
              className="shrink-0 font-sans text-xs tracking-wide text-black/50"
            >
              {new Date(post.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}
