import type { Metadata } from "next";
import { Geist_Mono, Nanum_Gothic, Playfair_Display } from "next/font/google";
import "./globals.css";

const nanumGothic = Nanum_Gothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-nanum-gothic",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
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
    <html lang="ko" className="scroll-smooth">
      <body
        className={`${nanumGothic.variable} ${nanumGothic.className} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
