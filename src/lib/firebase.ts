import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAIzbcNcYJA49SZUAC6vmzORNg1En0DRuc",
  authDomain: "membership-21394.firebaseapp.com",
  projectId: "membership-21394",
  storageBucket: "membership-21394.firebasestorage.app",
  messagingSenderId: "662235511171",
  appId: "1:662235511171:web:a9acc495af5e4eeaeb1eb6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);
