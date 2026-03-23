import Navbar from '@/components/Navbar';
import { getPosts } from '../admin/actions';
import BlogSidebar from './BlogSidebar';
import { BlogPostsSearchProvider } from './BlogPostsSearchContext';

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const posts = await getPosts();
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-black">
      <Navbar />
      <BlogPostsSearchProvider posts={posts}>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-24 sm:px-8 sm:pt-28">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            <div className="min-w-0 lg:col-span-3">{children}</div>
            <aside className="mt-12 lg:mt-0 lg:col-span-1">
              <BlogSidebar />
            </aside>
          </div>
        </main>
      </BlogPostsSearchProvider>
      <footer className="mt-auto border-t border-black/10 bg-neutral-50 py-8 text-center text-sm text-black/55">
        <p>© {year} BigWave. All rights reserved.</p>
      </footer>
    </div>
  );
}
