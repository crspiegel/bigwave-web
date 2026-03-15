import Link from 'next/link';
import { getPosts } from '../admin/actions';

export const revalidate = 0;

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <header className="mb-12 pt-10 max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-8"
        >
          ← 홈으로
        </Link>
        <h1 className="text-4xl font-bold tracking-tight">AI Labs & Blog</h1>
        <p className="text-neutral-400 mt-2 text-base">버티컬 AI 리서치 & 인사이트</p>
      </header>

      <div className="max-w-3xl mx-auto">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-neutral-600 text-sm">
            아직 발행된 글이 없습니다.
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.id}`}
                  className="block bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-600 transition-colors group"
                >
                  <h2 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-xs text-neutral-500 mb-3">
                    {new Date(post.created_at).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2">
                    {post.content}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
