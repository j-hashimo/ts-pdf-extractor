'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useGetUploadsQuery, apiSlice, useDeletePdfMutation } from '../redux/api';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

interface Upload {
  id: number;
  filename: string;
  highlights: string[];
  images: { imageData: string }[];
  userId: number;
}

type DecodedToken = {
  email: string;
  userId: number;
  exp: number;
};

export default function PdfList() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<DecodedToken | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data = [], error, refetch } = useGetUploadsQuery();
const uploads: Upload[] = data;

  // ✅ Only decode token on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          setCurrentUser(decoded);
        } catch {
          localStorage.removeItem('token');
          router.replace('/');
        }
      } else {
        router.replace('/');
      }
    }
  }, [router]);

  // 🧠 Fix Back Button cache issues
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.reload();
        }
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (error && 'status' in error && error.status === 401) {
      router.replace('/');
    }
  }, [error, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(apiSlice.util.resetApiState());
    router.replace('/');
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert('No file selected');
    setUploading(true);

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/pdf/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      alert('Upload successful!');
      await refetch();
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      alert('Upload failed');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleViewExtractedData = (upload: Upload) => {
    const highlightsHTML = upload.highlights.length
      ? `<ul>${upload.highlights.map((hl) => `<li>${hl}</li>`).join('')}</ul>`
      : '<p><i>No highlights found.</i></p>';

    const imagesHTML = upload.images.length
      ? upload.images
          .map(
            (imgObj) =>
              `<img src="data:image/png;base64,${imgObj.imageData}" width="200" style="margin: 10px;" />`
          )
          .join('')
      : '<p><i>No images found.</i></p>';

    const html = `
      <html>
        <head><title>Extracted Data - ${upload.filename}</title></head>
        <body style="font-family:sans-serif;">
          <h2>Highlights</h2>
          ${highlightsHTML}
          <h2>Images</h2>
          ${imagesHTML}
        </body>
      </html>
    `;

    const newTab = window.open('', '_blank');
    newTab?.document.write(html);
    newTab?.document.close();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this PDF?')) return;
    try {
      await deletePdf(id).unwrap();
      alert('Deleted!');
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredUploads = currentUser
  ? uploads.filter((upload) => upload.userId === currentUser.userId)
  : [];

  return (
    <div style={{ padding: '2rem' }}>
      {currentUser && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <span>👤 {currentUser.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      <h2>Upload a new PDF</h2>
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </button>

      <h2>Uploaded PDFs</h2>
      {filteredUploads.length === 0 ? (
        <p>No PDFs uploaded yet.</p>
      ) : (
        <ul>
          {filteredUploads.map((upload) => (
            <li key={upload.id}>
              <p>
                <strong>{upload.filename}</strong>
              </p>
              <button onClick={() => handleViewExtractedData(upload)}>
                View Extracted Highlights & Images
              </button>
              <button onClick={() => handleDelete(upload.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
