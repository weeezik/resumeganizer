import { storage, db } from './firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { Resume, ResumeCategory } from '../types'

export async function uploadResume(file: File, category: string) {
  try {
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `resumes/${category}/${file.name}`)
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    // Create the resume document in Firestore
    const resumeData: Omit<Resume, 'id'> = {
      fileName: file.name,
      fileUrl: downloadURL,
      category,
      status: 'not applied',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const docRef = await addDoc(collection(db, 'resumes'), resumeData)
    
    return {
      id: docRef.id,
      ...resumeData,
    }
  } catch (error) {
    console.error('Error uploading resume:', error)
    throw error
  }
}

export async function updateResumeDetails(
  resumeId: string,
  updates: Partial<Resume>
) {
  try {
    const resumeRef = doc(db, 'resumes', resumeId)
    await updateDoc(resumeRef, {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error updating resume:', error)
    throw error
  }
}

export async function deleteResume(resumeId: string) {
  try {
    await deleteDoc(doc(db, 'resumes', resumeId))
  } catch (error) {
    console.error('Error deleting resume:', error)
    throw error
  }
}

// Category functions
export async function updateCategoryName(categoryId: string, newName: string) {
  const categoryRef = doc(db, 'categories', categoryId)
  await updateDoc(categoryRef, { name: newName, updatedAt: new Date() })
}

export async function deleteCategory(categoryId: string) {
  const categoryRef = doc(db, 'categories', categoryId)
  await deleteDoc(categoryRef)
}

export async function createCategory(name: string) {
  try {
    const categoryData: Omit<ResumeCategory, 'id'> = {
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const docRef = await addDoc(collection(db, 'categories'), categoryData)
    
    return {
      id: docRef.id,
      ...categoryData,
    }
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
} 