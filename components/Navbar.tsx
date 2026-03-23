'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/#experiences', label: 'Experiences', chevron: true },
  { href: '/#services', label: 'Services', chevron: true },
  { href: '/#blog', label: 'Blog', chevron: false },
] as const;

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname() ?? '';
  const isBlog = pathname.startsWith('/blog');

  const headerClass = isBlog
    ? 'fixed top-0 left-0 right-0 z-50 w-full border-b border-black/10 bg-white backdrop-blur-md supports-[backdrop-filter]:bg-white/95'
    : 'fixed top-0 left-0 right-0 z-50 w-full border-b border-black/10 bg-[#7BC862]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[#7BC862]/70';

  const linkMuted = isBlog ? 'text-gray-700 hover:text-gray-900' : 'text-black/80 hover:text-black';
  const chevronClass = isBlog ? 'text-gray-500' : 'text-black/55';

  return (
    <header className={headerClass}>
      <nav
        className="flex w-full items-center justify-between gap-4 px-6 py-4 sm:px-8 lg:px-12"
        aria-label="Main"
      >
        <Link
          href="/"
          className={`font-serif text-lg tracking-tight md:text-xl ${isBlog ? 'text-gray-900' : 'text-black'}`}
        >
          BigWave
        </Link>

        <ul className="font-sans absolute left-1/2 hidden -translate-x-1/2 items-center gap-12 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`inline-flex items-center gap-0.5 text-sm font-medium transition-colors ${linkMuted}`}
              >
                <span>{item.label}</span>
                {item.chevron ? <ChevronDown className={`mt-px shrink-0 ${chevronClass}`} /> : null}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-3">
          <ul className={`flex gap-3 md:hidden ${isBlog ? 'text-gray-700' : 'text-black/80'}`}>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-0.5 text-xs font-medium transition-colors ${linkMuted}`}
                >
                  <span>{item.label}</span>
                  {item.chevron ? (
                    <ChevronDown className={`mt-px h-2.5 w-2.5 shrink-0 ${chevronClass}`} />
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/#contact"
            className="rounded-xl bg-black px-5 py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90 md:px-6 md:py-3"
          >
            Contact us
          </Link>
        </div>
      </nav>
    </header>
  );
}
