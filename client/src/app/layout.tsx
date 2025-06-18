import { ReactNode } from 'react';
import Providers from './providers';

export const metadata = {
  title: 'PDF Highlighter App',
  description: 'Extract highlights and images from PDF files',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}