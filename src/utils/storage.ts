import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import type { Submission } from '../types';

// Helper to convert base64 data URL to Blob for uploading
export const dataURLtoBlob = (dataurl: string): Blob => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// We create an interface for what UserForm sends us, before it becomes a 'Submission'
export interface SubmissionPayload {
  fullName: string;
  houseName: string;
  phoneNumber: string;
  profilePhotoFile: File | null;
  paymentScreenshotFile: File;
  posterDataUrl: string; // The generated poster is a base64 string
}

export const saveSubmission = async (payload: SubmissionPayload): Promise<void> => {
  try {
    const timestamp = Date.now();
    const folderName = `submissions/${timestamp}`;
    
    // 1. Upload Payment Screenshot
    const paymentRef = ref(storage, `${folderName}/payment_screenshot_${timestamp}`);
    await uploadBytes(paymentRef, payload.paymentScreenshotFile);
    const paymentScreenshotUrl = await getDownloadURL(paymentRef);

    // 2. Upload Profile Photo (if it exists)
    let profilePhotoUrl: string | undefined = undefined;
    if (payload.profilePhotoFile) {
      const profileRef = ref(storage, `${folderName}/profile_photo_${timestamp}`);
      await uploadBytes(profileRef, payload.profilePhotoFile);
      profilePhotoUrl = await getDownloadURL(profileRef);
    }

    // 3. Upload Poster Data URL
    const posterBlob = dataURLtoBlob(payload.posterDataUrl);
    const posterRef = ref(storage, `${folderName}/poster_${timestamp}.png`);
    await uploadBytes(posterRef, posterBlob);
    const posterUrl = await getDownloadURL(posterRef);

    // 4. Save to Firestore
    const submissionData: Omit<Submission, 'id'> = {
      fullName: payload.fullName,
      houseName: payload.houseName,
      phoneNumber: payload.phoneNumber,
      paymentScreenshotUrl,
      posterUrl,
      status: 'pending',
      createdAt: timestamp,
    };
    
    if (profilePhotoUrl) {
      submissionData.profilePhotoUrl = profilePhotoUrl;
    }

    await addDoc(collection(db, 'submissions'), submissionData);
  } catch (err) {
    console.error('Error saving submission to Firebase:', err);
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

export const updateSubmissionStatus = async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
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
