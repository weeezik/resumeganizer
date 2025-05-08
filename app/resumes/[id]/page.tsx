"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Resume } from '@/types'
import { UploadResume } from '@/components/UploadResume'
import { ResumeList } from '@/components/ResumeList'
import Link from 'next/link'
import { PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { updateResumeDetails, deleteResume, createResume, uploadResume } from '@/lib/resumeUtils'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import RequireAuth from '@/components/RequireAuth'

export default function ResumeViewPage({ params }: { params: { id: string } }) {
  const { id } = params;
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
          src={resume.fileUrl} // Make sure you store the file URL in Firestore!
          width="100%"
          height="600"
          style={{ border: "none" }}
          title="Resume"
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