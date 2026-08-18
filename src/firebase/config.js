import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  runTransaction,
  serverTimestamp 
} from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut, 
  onAuthStateChanged
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase configuration for Natural Blend
const firebaseConfig = {
  apiKey: "AIzaSyAFZtOPovsjl-o7LxK_odqjodonZaWs23c",
  authDomain: "natural-blend-c0935.firebaseapp.com",
  databaseURL: "https://natural-blend-c0935-default-rtdb.firebaseio.com",
  projectId: "natural-blend-c0935",
  storageBucket: "natural-blend-c0935.firebasestorage.app",
  messagingSenderId: "288682447219",
  appId: "1:288682447219:web:ffe5209d59ba24c658b506"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

console.log("⚡ [Firebase Config] App initialized successfully.");
console.log("⚡ [Firebase Config] Active Project ID:", app.options.projectId);
console.log("⚡ [Firebase Config] Auth Domain:", app.options.authDomain);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Force account selection popup prompt
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  runTransaction,
  serverTimestamp,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut, 
  onAuthStateChanged,
  ref, 
  uploadBytes, 
  getDownloadURL 
};

export default app;
