import { 
  auth, 
  googleProvider,
  signInWithPopup,
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  signOut
} from '../firebase/config';

const CUSTOMERS_COLLECTION = 'customers';

/**
 * Sign in Customer using Firebase Google Authentication popup.
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Sync or create customer profile in Firestore
    const profile = await syncCustomerProfile(user);
    return { success: true, user, profile };
  } catch (error) {
    console.error('Google Sign-In Error:', error.code, error.message);
    
    let userMsg = 'Unable to sign in with Google. Please try again.';
    
    if (error.code === 'auth/popup-closed-by-user') {
      userMsg = 'Sign-in popup was closed before completing. Please try again.';
    } else if (error.code === 'auth/popup-blocked') {
      userMsg = 'Google sign-in popup was blocked by your browser. Please allow popups for this site.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      userMsg = 'Sign-in attempt was cancelled.';
    } else if (error.code === 'auth/operation-not-allowed') {
      userMsg = 'Google Sign-In is not enabled in Firebase Console. Please enable Google provider under Authentication -> Sign-in method in Firebase Console.';
    } else if (error.code === 'auth/network-request-failed') {
      userMsg = 'Network connection failed. Please check your internet connection.';
    }

    return { 
      success: false, 
      message: userMsg, 
      errorCode: error.code, 
      rawError: error.message 
    };
  }
}

/**
 * Create or Update customer profile in Firestore customers/{uid}.
 * Document ID is strictly the Firebase Authentication UID.
 */
export async function syncCustomerProfile(user) {
  if (!user || !user.uid) return null;

  const docRef = doc(db, CUSTOMERS_COLLECTION, user.uid);
  const nowIso = new Date().toISOString();

  try {
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // First Login: Create new customer profile document
      const newProfile = {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        phoneNumber: user.phoneNumber || '',
        address: '',
        city: 'Karaikudi',
        state: 'Tamil Nadu',
        pincode: '630001',
        createdAt: nowIso,
        updatedAt: nowIso,
        lastLoginAt: nowIso,
        active: true
      };
      await setDoc(docRef, newProfile);
      return newProfile;
    } else {
      // Returning Customer: Preserve existing details and update Google name/email/photo + last login
      const existingData = docSnap.data();
      const updatedFields = {
        displayName: existingData.displayName || user.displayName || '',
        email: existingData.email || user.email || '',
        photoURL: user.photoURL || existingData.photoURL || '',
        lastLoginAt: nowIso,
        updatedAt: nowIso
      };
      await updateDoc(docRef, updatedFields);
      return { ...existingData, ...updatedFields };
    }
  } catch (error) {
    console.warn('Firestore customer profile sync warning:', error);
    return {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      address: '',
      city: 'Karaikudi',
      state: 'Tamil Nadu',
      pincode: '630001',
      active: true
    };
  }
}

/**
 * Fetch customer profile from Firestore customers/{uid}
 */
export async function getCustomerProfile(uid) {
  if (!uid) return null;
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() };
    }
  } catch (error) {
    console.warn('Error reading customer profile:', error);
  }
  return null;
}

/**
 * Update customer profile fields (displayName, email, address, city, state, pincode)
 */
export async function updateCustomerProfile(uid, profileData) {
  if (!uid) return null;
  const docRef = doc(db, CUSTOMERS_COLLECTION, uid);
  const nowIso = new Date().toISOString();

  const payload = {
    displayName: profileData.displayName || '',
    email: profileData.email || '',
    address: profileData.address || '',
    city: profileData.city || '',
    state: profileData.state || '',
    pincode: profileData.pincode || '',
    updatedAt: nowIso
  };

  try {
    await updateDoc(docRef, payload);
    return true;
  } catch (error) {
    console.error('Error updating customer profile:', error);
    throw error;
  }
}

/**
 * Sign Out Customer via Firebase Auth
 */
export async function logoutCustomer() {
  try {
    await signOut(auth);
  } catch (error) {
    console.warn('Firebase signOut warning:', error);
  }
  return true;
}
