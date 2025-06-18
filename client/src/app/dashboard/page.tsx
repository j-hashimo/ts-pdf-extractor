'use client';
import { useEffect } from 'react';
import { useGetUploadsQuery } from '../../redux/api';
import PdfList from '../../components/PdfList';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data, error, isLoading } = useGetUploadsQuery();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/');
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1>Uploaded PDFs</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading uploads.</p>}
      {data && <PdfList uploads={data} />}
    </main>
  );
}
