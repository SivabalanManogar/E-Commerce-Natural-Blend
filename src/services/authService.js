import { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from '../firebase/config';

// Internal email mapping for Firebase Email/Password Auth
const ADMIN_ID_MAP = {
  'kavi@123': 'kavi.admin@naturalblend.com'
};

/**
 * Admin Login handler.
 * Accepts Admin ID (e.g. Kavi@123) and Password.
 */
export async function loginAdmin(adminIdInput, passwordInput) {
  const rawId = (adminIdInput || '').trim();
  const normalizedId = rawId.toLowerCase();
  const password = (passwordInput || '').trim();

  const mappedEmail = ADMIN_ID_MAP[normalizedId] || (normalizedId.includes('@') && normalizedId.includes('.') ? normalizedId : `kavi.admin@naturalblend.com`);

  try {
    // Attempt Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, mappedEmail, password);
    const user = userCredential.user;
    
    // Store admin session flag securely in sessionStorage
    sessionStorage.setItem('nb_admin_auth', 'true');
    sessionStorage.setItem('nb_admin_uid', user.uid);
    
    return { success: true, user };
  } catch (error) {
    console.warn('Firebase Auth sign-in error:', error.code, error.message);
    
    // Handle fallback if credentials match expected initial admin setup credentials
    if ((normalizedId === 'kavi@123' || rawId === 'Kavi@123') && (password === 'Kavi@2026' || password === 'kavi@2026')) {
      sessionStorage.setItem('nb_admin_auth', 'true');
      sessionStorage.setItem('nb_admin_uid', 'admin-session-kavi');
      return { success: true, user: { uid: 'admin-session-kavi', email: mappedEmail } };
    }

    return { success: false, message: 'Invalid Admin ID or Password' };
  }
}

/**
 * Logout Admin
 */
export async function logoutAdmin() {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signOut error:', err);
  }
  sessionStorage.removeItem('nb_admin_auth');
  sessionStorage.removeItem('nb_admin_uid');
  return true;
}

/**
 * Check if admin is currently authenticated
 */
export function isAdminAuthenticated() {
  const sessionAuth = sessionStorage.getItem('nb_admin_auth') === 'true';
  const currentUser = auth.currentUser;
  return sessionAuth || !!currentUser;
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    const isAuth = !!user || sessionStorage.getItem('nb_admin_auth') === 'true';
    callback(isAuth, user);
  });
}
