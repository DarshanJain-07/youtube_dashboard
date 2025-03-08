import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'YouTube Dashboard',
  description: 'Analytics dashboard for YouTube creators',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  );
}
