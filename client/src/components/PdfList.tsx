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
  images: string[];
}

type DecodedToken = {
  email: string;
  userId: number;
  exp: number;
};




function getCurrentUser(): DecodedToken | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
}
export default function PdfList() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const username = currentUser?.email || '';
  const userId = currentUser?.userId;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: uploads = [], error, refetch } = useGetUploadsQuery();
  
  const dispatch = useDispatch();


  
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      const token = localStorage.getItem('token');

      // If the page was restored from BFCache and token is missing, reload hard
      if (event.persisted && !token) {
        console.log('🚨 BFCache restore detected — forcing hard reload');
        window.location.reload();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // 🔐 Redirect if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('🔐 No token found — redirecting');
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    refetch(); // Always get fresh uploads even if BFCache restored page
  }, []);

  // 🔐 Redirect if API says unauthorized
  useEffect(() => {
    if (error && 'status' in error && error.status === 401) {
      console.log('🚫 Unauthorized API response — redirecting');
      window.location.href = '/';
    }
  }, [error]);

  // 🧹 Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(apiSlice.util.resetApiState()); // Clear uploads from cache
    window.location.replace('/'); // Replace history to block Back
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert('No file selected');
    setUploading(true);

  

  const formData = new FormData();
  formData.append('pdf', selectedFile);

    try {
      const clientURL = process.env.CLIENT_URL || 'localhost:5000';
      const res = await fetch(`${clientUrl}/pdf/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      alert('Upload successful!');
      await refetch();                   // 🔄 refresh PDF list
      setSelectedFile(null);             // ✅ reset state
      fileInputRef.current!.value = '';  // ✅ clear input UI
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
      ? upload.images.map((imgObj) =>
          `<img src="data:image/png;base64,${imgObj.imageData}" width="200" style="margin: 10px;" />`
        ).join('')
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

  const [deletePdf] = useDeletePdfMutation();
  const handleDelete = async (id: number) => {
      if (!confirm('Are you sure you want to delete this PDF?')) return;

      try {
        await deletePdf(id).unwrap();
        alert('Deleted!');
      } catch (err) {
        alert('Delete failed');
      }
  };

  const filteredUploads = uploads.filter((upload: any) => upload.userId === userId);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      {username && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center', padding: '1rem' }}>
          <span>👤 {username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
      {filteredUploads.length === 0 ? (
        <p>No PDFs uploaded yet.</p>
      ) : (
        <ul>
          {filteredUploads.map((upload) => (
            <li key={upload.id}>
              <p><strong>{upload.filename}</strong></p>
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