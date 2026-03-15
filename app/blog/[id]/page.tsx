import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostById } from '../../admin/actions';

export const revalidate = 0;

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(Number(id));

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-3xl mx-auto pt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-10"
        >
          ← 목록으로 돌아가기
        </Link>

        <article>
          <header className="mb-10 pb-8 border-b border-neutral-800">
            <h1 className="text-3xl font-bold tracking-tight leading-snug mb-4">
              {post.title}
            </h1>
            <p className="text-sm text-neutral-500">
              {new Date(post.created_at).toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </header>

          <div className="text-neutral-300 text-base leading-8 whitespace-pre-wrap">
            {post.content}
          </div>
        </article>
      </div>
    </div>
  );
}
