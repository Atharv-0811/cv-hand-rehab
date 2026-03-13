import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { SessionProvider } from '@/context/SessionContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Physio-CV',
  description: 'Browser-based gamified rehabilitation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* MediaPipe loaded globally so all exercise components can access window.Hands */}
        <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}