import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'BigWave | 버티컬 AI 스튜디오',
    template: '%s | BigWave',
  },
  description: '특정 타겟의 명확한 결핍을 해결하는 버티컬 AI 솔루션 및 초자동화 워크플로우를 설계합니다.',
  keywords: ['AI 스튜디오', '버티컬 AI', '초자동화', 'AI 에이전트', '1인 기업', 'BigWave'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
