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
      console.log("Fetching document with ID:", id);
      const docRef = doc(db, "resumes", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Fetched resume:", data);
        console.log("Chunks:", data.chunks);
        console.log("Tags:", data.tags);
        setResume(data);
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
      <div className="w-1/3 p-6 space-y-6">
        <h2 className="text-xl font-bold mb-4">AI Suggestions</h2>
        <ul className="list-disc pl-5 mb-6">
          {resume.suggestions?.map((s: string, i: number) => (
            <li key={i} className="mb-2">{s}</li>
          ))}
        </ul>

        {resume.chunks?.summary && (
          <div>
            <h3 className="font-semibold mb-2">Summary</h3>
            <div className="bg-gray-100 p-3 rounded text-gray-800 text-sm">{resume.chunks.summary}</div>
          </div>
        )}

        {resume.chunks?.skills && (
          <div>
            <h3 className="font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {resume.chunks.skills.map((skill: string, i: number) => (
                <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {resume.chunks?.workExperience && (
          <div>
            <h3 className="font-semibold mb-2">Work Experience</h3>
            <ul className="list-disc pl-5">
              {resume.chunks.workExperience.map((exp: string, i: number) => (
                <li key={i} className="mb-2 text-sm">{exp}</li>
              ))}
            </ul>
          </div>
        )}

        {resume.tags && (
          <div>
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {resume.tags.map((tag: string, i: number) => (
                <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 