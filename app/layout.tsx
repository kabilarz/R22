import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nemo',
  description: 'Natural language data analysis powered by AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
        {/* TODO: Remove iframe-navigation.js in production, should never be removed by AI */}
        <script src="/scripts/iframe-navigation.js"></script>
      </body>
    </html>
  );
}
