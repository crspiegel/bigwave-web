'use client';

import Link from 'next/link';
import { useBlogPostsSearch } from './BlogPostsSearchContext';

export default function BlogSidebar() {
  const { query, setQuery, filteredPosts, allPosts } = useBlogPostsSearch();
  const sidebarList = (query.trim() ? filteredPosts : allPosts).slice(0, 8);

  return (
    <div className="sticky top-28 space-y-8">
      <div>
        <label htmlFor="blog-search-ui" className="mb-2 block text-xs font-medium uppercase tracking-wide text-black/50">
          블로그 검색
        </label>
        <input
          id="blog-search-ui"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목·태그로 검색"
          className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-black/40 outline-none transition-colors focus:border-black/30 focus:ring-1 focus:ring-black/10"
          aria-label="블로그 검색"
          autoComplete="off"
        />
      </div>
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/50">최신 글</h2>
        {sidebarList.length === 0 ? (
          <p className="text-sm text-black/45">{query.trim() ? '검색 결과가 없습니다.' : '등록된 글이 없습니다.'}</p>
        ) : (
          <ul className="space-y-2.5 border-t border-black/10 pt-3">
            {sidebarList.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/blog/${p.id}`}
                  className="line-clamp-2 text-sm leading-snug text-black/75 transition-colors hover:text-black hover:underline"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
