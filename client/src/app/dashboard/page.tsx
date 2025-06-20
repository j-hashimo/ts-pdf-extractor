'use client';

import { useEffect } from 'react';
import PdfList from '../../components/PdfList';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic'; 

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) router.push('/');
  }, [router]);

  return (
    <main style={{ padding: 40 }}>
      <h1>Uploaded PDFs</h1>
      <PdfList />
    </main>
  );
}
