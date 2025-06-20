'use client';
import { useEffect } from 'react';
import PdfList from '../../components/PdfList';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/');
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1>Uploaded PDFs</h1>
      <PdfList />
    </main>
  );
}
