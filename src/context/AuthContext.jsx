import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  onAuthStateChanged 
} from '../firebase/config';
import { 
  loginAdmin as apiLoginAdmin, 
  logoutAdmin as apiLogoutAdmin, 
  isAdminAuthenticated 
} from '../services/authService';
import { 
  syncCustomerProfile, 
  getCustomerProfile,
  logoutCustomer as apiLogoutCustomer 
} from '../services/customerAuthService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Customer State
  const [customerUser, setCustomerUser] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(true);

  // Admin State
  const [isAdmin, setIsAdmin] = useState(() => isAdminAuthenticated());
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !sessionStorage.getItem('nb_admin_auth')) {
        setCustomerUser(user);
        try {
          const profile = await syncCustomerProfile(user);
          setCustomerProfile(profile);
        } catch (err) {
          console.warn('Error fetching profile on auth change:', err);
        }
      } else {
        setCustomerUser(null);
        setCustomerProfile(null);
      }
      setCustomerLoading(false);
      setAdminLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshCustomerProfile = async () => {
    const currentUser = auth.currentUser || customerUser;
    if (currentUser && currentUser.uid) {
      setCustomerUser(currentUser);
      const prof = await getCustomerProfile(currentUser.uid);
      if (prof) setCustomerProfile(prof);
    }
  };

  const logoutCustomer = async () => {
    await apiLogoutCustomer();
    setCustomerUser(null);
    setCustomerProfile(null);
  };

  const loginAdmin = async (adminId, password) => {
    const result = await apiLoginAdmin(adminId, password);
    if (result.success) {
      setIsAdmin(true);
    }
    return result;
  };

  const logoutAdmin = async () => {
    await apiLogoutAdmin();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      customerUser,
      customerProfile,
      isCustomerLoggedIn: !!customerUser,
      customerLoading,
      refreshCustomerProfile,
      logoutCustomer,
      isAdmin,
      adminLoading,
      loginAdmin,
      logoutAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
