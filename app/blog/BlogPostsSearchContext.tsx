'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Post } from '../admin/actions';

type BlogSearchContextValue = {
  query: string;
  setQuery: (q: string) => void;
  filteredPosts: Post[];
  allPosts: Post[];
};

const BlogSearchContext = createContext<BlogSearchContextValue | null>(null);

export function BlogPostsSearchProvider({ posts, children }: { posts: Post[]; children: ReactNode }) {
  const [query, setQuery] = useState('');

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      const titleMatch = p.title.toLowerCase().includes(q);
      const tagMatch = (p.tags ?? []).some((t) => t.toLowerCase().includes(q));
      return titleMatch || tagMatch;
    });
  }, [posts, query]);

  const value = useMemo(
    () => ({ query, setQuery, filteredPosts, allPosts: posts }),
    [query, filteredPosts, posts],
  );

  return <BlogSearchContext.Provider value={value}>{children}</BlogSearchContext.Provider>;
}

export function useBlogPostsSearch() {
  const ctx = useContext(BlogSearchContext);
  if (!ctx) {
    throw new Error('useBlogPostsSearch must be used within BlogPostsSearchProvider');
  }
  return ctx;
}
