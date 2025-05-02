import { useState } from 'react'

interface Resume {
  id: string
  fileName: string
  company?: string
  jobTitle?: string
  date?: string
  status: 'applied' | 'interviewed' | 'not applied'
  notes?: string
}

export function ResumeList() {
  const [resumes, setResumes] = useState<Resume[]>([])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Resumes</h2>
      
      {resumes.length === 0 ? (
        <p className="text-gray-500">No resumes uploaded yet.</p>
      ) : (
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}
    </div>
  )
}

function ResumeCard({ resume }: { resume: Resume }) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{resume.fileName}</h3>
          {resume.company && (
            <p className="text-sm text-gray-600">Company: {resume.company}</p>
          )}
          {resume.jobTitle && (
            <p className="text-sm text-gray-600">Position: {resume.jobTitle}</p>
          )}
          {resume.date && (
            <p className="text-sm text-gray-600">Date: {resume.date}</p>
          )}
        </div>
        <div className="text-sm">
          <span className={`px-2 py-1 rounded ${getStatusColor(resume.status)}`}>
            {resume.status}
          </span>
        </div>
      </div>
      {resume.notes && (
        <div className="mt-2 text-sm text-gray-600">
          <p>Notes: {resume.notes}</p>
        </div>
      )}
    </div>
  )
}

function getStatusColor(status: Resume['status']) {
  switch (status) {
    case 'applied':
      return 'bg-blue-100 text-blue-800'
    case 'interviewed':
      return 'bg-green-100 text-green-800'
    case 'not applied':
      return 'bg-gray-100 text-gray-800'
  }
} 