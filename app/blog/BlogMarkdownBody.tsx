'use client';

import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IT_IMAGE_FALLBACK_POOL } from '@/lib/itImageFallbackPool';

const markdownComponents: Partial<Components> = {
  h2: ({ children, className, ...rest }) => (
    <h2
      className={[
        'mb-4 mt-10 font-serif text-2xl font-semibold tracking-tight text-black first:mt-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className, ...rest }) => (
    <h3
      className={['mb-3 mt-8 font-serif text-xl font-medium tracking-tight text-black', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </h3>
  ),
  h4: ({ children, className, ...rest }) => (
    <h4
      className={['mb-2 text-base font-medium text-gray-600', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </h4>
  ),
  p: ({ children, className, ...rest }) => (
    <p
      className={['mb-4 text-[15px] leading-relaxed text-black/80', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </p>
  ),
  li: ({ children, className, ...rest }) => (
    <li className={['text-[15px] leading-relaxed text-black/80', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </li>
  ),
  em: ({ children, className, ...rest }) => (
    <em
      className={['text-xs font-normal not-italic text-gray-500', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </em>
  ),
  a: ({ href, children, className, ...rest }) => (
    <a
      href={typeof href === 'string' ? href : undefined}
      className={['text-sm text-gray-600 underline-offset-2 transition-colors hover:text-black', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </a>
  ),
  img: ({ src, alt, className, ...rest }) => (
    // 임의 외부 도메인 — next/image 미사용; onError 시 검증된 풀 순회
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === 'string' ? src : ''}
      alt={typeof alt === 'string' ? alt : ''}
      className={['my-4 w-full rounded-none object-cover', className].filter(Boolean).join(' ')}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const el = e.currentTarget;
        const idx = Number(el.dataset.fallbackIdx ?? '0');
        if (idx >= IT_IMAGE_FALLBACK_POOL.length) return;
        el.dataset.fallbackIdx = String(idx + 1);
        el.src = IT_IMAGE_FALLBACK_POOL[idx];
      }}
      {...rest}
    />
  ),
};

export default function BlogMarkdownBody({ content }: { content: string }) {
  return (
    <div className="[&_h4+ul]:text-sm [&_h4+ul]:text-gray-700 [&_ul:last-of-type]:text-sm [&_ul:last-of-type]:text-gray-600">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
