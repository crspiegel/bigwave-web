import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogMarkdownBody from '../BlogMarkdownBody';
import PostTagBadges from '../PostTagBadges';
import { getPostById } from '../../admin/actions';

export const revalidate = 0;

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(Number(id));

  if (!post) notFound();

  return (
    <>
      <Link
        href="/blog"
        className="mb-10 inline-flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black"
      >
        ← 목록으로 돌아가기
      </Link>

      <article>
        <header className="mb-10 border-b border-black/10 pb-8">
          <h1 className="mb-4 font-serif text-3xl font-semibold leading-snug tracking-tight text-black">
            {post.title}
          </h1>
          <PostTagBadges tags={post.tags} />
          <time
            dateTime={new Date(post.created_at).toISOString()}
            suppressHydrationWarning
            className="text-sm text-black/50"
          >
            {new Date(post.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </header>

        <div className="prose prose-neutral max-w-none prose-p:font-sans prose-headings:font-serif prose-headings:font-semibold prose-h2:font-semibold prose-h3:font-medium prose-h4:font-semibold prose-strong:text-black prose-a:text-sm prose-a:text-gray-600 prose-a:no-underline hover:prose-a:text-black hover:prose-a:underline prose-blockquote:border-black/20 prose-blockquote:text-black/70 prose-blockquote:text-[15px] prose-blockquote:leading-relaxed prose-code:rounded-md prose-code:bg-black/5 prose-code:px-1 prose-code:text-black prose-pre:border prose-pre:border-black/10 prose-pre:bg-black/5 prose-pre:text-black prose-img:max-w-none prose-img:rounded-none prose-th:text-[15px] prose-td:text-[15px]">
          <BlogMarkdownBody content={post.content} />
        </div>
      </article>
    </>
  );
}
