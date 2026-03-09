import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JobRight — Find the 5 jobs you\'ll actually get',
  description: 'AI-powered personal job seeking tool for the Indian market',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
