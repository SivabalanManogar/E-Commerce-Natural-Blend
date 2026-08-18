import { 
  auth, 
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  signOut
} from '../firebase/config';

const CUSTOMERS_COLLECTION = 'customers';

/**
 * Helper to translate Firebase Auth Error Codes into friendly Messages
 */
function getFirebaseErrorMessage(code, fallbackMessage) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact customer support.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please wait a few minutes before trying again.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    default:
      return fallbackMessage || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Sign in Customer using Email & Password.
 * If user.emailVerified === false, signs user out and returns unverified status.
 */
export async function signInWithEmailPassword(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = result.user;

    // Check email verification status for email/password accounts
    if (!user.emailVerified) {
      await signOut(auth);
      return { 
        success: false, 
        unverified: true, 
        email: user.email, 
        message: 'Please verify your email before logging in.' 
      };
    }

    const profile = await syncCustomerProfile(user);
    return { success: true, user, profile };
  } catch (error) {
    console.error('Email Sign-In Error:', error.code, error.message);
    return { 
      success: false, 
      message: getFirebaseErrorMessage(error.code, 'Invalid email or password. Please try again.'), 
      errorCode: error.code 
    };
  }
}

/**
 * Register Customer using Email, Password & Full Name.
 * 1. Creates user in Firebase Auth.
 * 2. Updates display name.
 * 3. Saves profile document in Firestore.
 * 4. Sends email verification link via sendEmailVerification(user).
 * 5. Signs user out immediately so unverified access is blocked.
 */
export async function signUpWithEmailPassword(name, email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = result.user;

    if (name && name.trim()) {
      try {
        await updateProfile(user, { displayName: name.trim() });
      } catch (pErr) {
        console.warn('Could not update profile displayName:', pErr);
      }
    }

    // Save profile document in Firestore
    const profile = await syncCustomerProfile({ ...user, displayName: name ? name.trim() : (user.displayName || '') });

    // Send email verification
    try {
      await sendEmailVerification(user);
    } catch (vErr) {
      console.warn('Initial sendEmailVerification error:', vErr);
    }

    // Immediately sign out after sending verification email
    await signOut(auth);

    return { 
      success: true, 
      needsVerification: true, 
      email: user.email || email.trim(),
      profile 
    };
  } catch (error) {
    console.error('Email Sign-Up Error:', error.code, error.message);
    return { 
      success: false, 
      message: getFirebaseErrorMessage(error.code, 'Failed to create account. Please try again.'), 
      errorCode: error.code 
    };
  }
}

/**
 * Resend Email Verification link to customer.
 */
export async function resendVerificationEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = result.user;

    if (user.emailVerified) {
      await signOut(auth);
      return { success: true, alreadyVerified: true, message: 'Your email is already verified! You can now sign in.' };
    }

    await sendEmailVerification(user);
    await signOut(auth);

    return { success: true, message: 'Verification email sent! Please check your inbox and spam folder.' };
  } catch (error) {
    console.error('Resend Verification Email Error:', error.code, error.message);
    return { 
      success: false, 
      message: getFirebaseErrorMessage(error.code, 'Failed to resend verification email. Please check your credentials.'), 
      errorCode: error.code 
    };
  }
}

/**
 * Check if customer's email is verified by re-authenticating and reloading user object.
 */
export async function checkVerificationStatus(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = result.user;

    await user.reload();

    if (user.emailVerified) {
      const profile = await syncCustomerProfile(user);
      return { verified: true, user, profile };
    } else {
      await signOut(auth);
      return { 
        verified: false, 
        message: 'Your email is not verified yet. Please check your inbox and click the verification link.' 
      };
    }
  } catch (error) {
    console.error('Check Verification Error:', error.code, error.message);
    return { 
      verified: false, 
      message: getFirebaseErrorMessage(error.code, 'Unable to check verification status. Please check your password.'), 
      errorCode: error.code 
    };
  }
}

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
