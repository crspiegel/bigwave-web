'use client';

import Link from 'next/link';
import PostTagBadges from './PostTagBadges';
import { useBlogPostsSearch } from './BlogPostsSearchContext';

export default function BlogListClient() {
  const { filteredPosts } = useBlogPostsSearch();

  return (
    <>
      <header className="mb-12">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-black">AI Labs & Blog</h1>
        <p className="mt-2 text-base text-black/70">버티컬 AI 리서치 & 인사이트</p>
      </header>

      <div>
        {filteredPosts.length === 0 ? (
          <div className="py-20 text-center text-sm text-black/50">검색 결과가 없거나 아직 발행된 글이 없습니다.</div>
        ) : (
          <ul className="flex flex-col gap-4">
            {filteredPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.id}`}
                  className="group block rounded-2xl border border-black/10 bg-neutral-50 p-6 transition-colors hover:border-[#7BC862]/40 hover:bg-neutral-100"
                >
                  <h2 className="mb-2 font-serif text-lg font-semibold text-black transition-colors group-hover:underline group-hover:decoration-black/40 group-hover:underline-offset-4">
                    {post.title}
                  </h2>
                  <PostTagBadges tags={post.tags} />
                  <time
                    dateTime={new Date(post.created_at).toISOString()}
                    suppressHydrationWarning
                    className="mb-3 block text-xs text-black/50"
                  >
                    {new Date(post.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <p className="line-clamp-2 text-sm leading-relaxed text-black/70">{post.content}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
