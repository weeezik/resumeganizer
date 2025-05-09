export interface Resume {
  id: string
  fileName: string
  fileUrl: string
  category: string
  userId: string
  company?: string
  jobTitle?: string
  date?: string
  status: ResumeStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type ResumeStatus = 'applied' | 'interviewed' | 'not applied'

export interface ResumeCategory {
  id: string
  name: string
  color: string
  userId: string
  createdAt: Date
  updatedAt: Date
} 