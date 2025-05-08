"use client"

import React, { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useParams } from 'next/navigation'

export default function ResumeViewPage() {
  const params = useParams();
  const id = params.id as string;
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResume() {
      const docRef = doc(db, "resumes", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setResume(docSnap.data());
      }
      setLoading(false);
    }
    fetchResume();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!resume) return <div>Resume not found.</div>;

  return (
    <div className="flex h-screen">
      {/* Left: Resume Viewer */}
      <div className="flex-1 border-r p-6">
        <h2 className="text-xl font-bold mb-4">Resume Preview</h2>
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(resume.fileUrl)}&embedded=true`}
          width="100%"
          height="600"
          style={{ border: "none" }}
          title="Resume"
          allowFullScreen
        />
      </div>
      {/* Right: AI Suggestions */}
      <div className="w-1/3 p-6">
        <h2 className="text-xl font-bold mb-4">AI Suggestions</h2>
        <ul className="list-disc pl-5">
          {resume.suggestions?.map((s: string, i: number) => (
            <li key={i} className="mb-2">{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
} 