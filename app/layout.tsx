import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import ApiKeyGate from '@/components/ApiKeyGate';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SecondBrain',
  description: 'Your AI-powered second brain',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white`}>
        <ApiKeyGate>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-gray-950">
              {children}
            </main>
          </div>
        </ApiKeyGate>
        <SpeedInsights />
      </body>
    </html>
  );
}
