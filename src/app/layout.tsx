// app/layout.tsx
import './globals.css';
import { Lexend } from 'next/font/google';
import type { Metadata } from 'next';

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',      // fica disponível como var(--font-lexend)
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Minha App',
  description: 'Login + Main',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={lexend.variable}>
      <body className="font-sans antialiased bg-zinc-50">{children}</body>
    </html>
  );
}
