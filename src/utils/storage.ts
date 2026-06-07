import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Submission } from '../types';

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'dc8oiygc0';
const CLOUDINARY_UPLOAD_PRESET = 'memebrship_screenshots';

// We create an interface for what UserForm sends us, before it becomes a 'Submission'
export interface SubmissionPayload {
  orderId: string;
  fullName: string;
  houseName: string;
  phoneNumber: string;
  profilePhotoFile: File | null;
  paymentScreenshotFile: File;
  posterDataUrl: string; // The generated poster is a base64 string
}

// Uploads a file to Cloudinary and returns the secure URL
const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Cloudinary upload failed:', errorData);
    throw new Error('Failed to upload image to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
};

export const saveSubmission = async (payload: SubmissionPayload): Promise<void> => {
  try {
    const timestamp = Date.now();
    
    // 1. Upload Payment Screenshot to Cloudinary
    // As requested, we ONLY upload the payment screenshot to save massive amounts of storage space.
    // The generated poster and profile photo are deliberately NOT saved to the database.
    const paymentScreenshotUrl = await uploadToCloudinary(payload.paymentScreenshotFile);

    // 2. Save to Firestore
    const submissionData: Omit<Submission, 'id'> = {
      orderId: payload.orderId,
      fullName: payload.fullName,
      houseName: payload.houseName,
      phoneNumber: payload.phoneNumber,
      paymentScreenshotUrl,
      status: 'pending',
      createdAt: timestamp,
    };

    await addDoc(collection(db, 'submissions'), submissionData);
  } catch (err) {
    console.error('Error saving submission:', err);
    throw err;
  }
};


export const getSubmissions = async (): Promise<Submission[]> => {
  try {
    const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Submission[];
  } catch (err) {
    console.error('Error getting submissions from Firebase:', err);
    return [];
  }
};

export const updateSubmissionStatus = async (id: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> => {
  try {
    const docRef = doc(db, 'submissions', id);
    await updateDoc(docRef, { status });
  } catch (err) {
    console.error('Error updating status in Firebase:', err);
    throw err;
  }
};

export const deleteSubmission = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'submissions', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting submission from Firebase:', err);
    throw err;
  }
};
