import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup,
  getAdditionalUserInfo
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  anonymousUser: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInAnonymously: (displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; isNewUser?: boolean }>;
  linkWithGoogle: () => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [anonymousUser, setAnonymousUser] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setAnonymousUser(user.isAnonymous);

        if (user.isAnonymous) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
          }
        }
      } else {
        setUser(null);
        setAnonymousUser(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    setUser(result.user);
    setAnonymousUser(false);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(result.user, {
      displayName: displayName
    });


    await setDoc(doc(db, 'users', result.user.uid), {
      displayName,
      email,
      createdAt: new Date(),
      lastLogin: new Date()
    });

    setUser(result.user);
    setAnonymousUser(false);
  };

  const signInAnonymously = async (displayName: string) => {
    if (!displayName.trim() || displayName.trim().length < 2) {
      throw new Error('Nome é obrigatório e deve ter pelo menos 2 caracteres');
    }

    const result = await firebaseSignInAnonymously(auth);

    await updateProfile(result.user, {
      displayName: displayName.trim()
    });

    await result.user.reload();

    const updatedUser = auth.currentUser;
    setUser(updatedUser);
    setAnonymousUser(true);

    await setDoc(doc(db, 'users', result.user.uid), {
      displayName: displayName.trim(),
      isAnonymous: true,
      createdAt: new Date(),
      lastLogin: new Date()
    });

  };

  const updateUserProfile = async (displayName: string) => {
    if (!user) throw new Error('No user logged in');

    await updateProfile(user, {
      displayName: displayName.trim()
    });

    await user.reload();

    const updatedUser = auth.currentUser;
    setUser(updatedUser);

    await setDoc(doc(db, 'users', user.uid), {
      displayName: displayName.trim(),
      updatedAt: new Date()
    }, { merge: true });

  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setAnonymousUser(false);
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; isNewUser?: boolean }> => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const isNewUser = getAdditionalUserInfo(result)?.isNewUser || false;

      if (isNewUser) {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date(),
            lastLogin: new Date(),
            provider: 'google'
          });
        } catch (firestoreError) {
          console.error('Error creating user document:', firestoreError);
        }
      } else {

        try {
          await setDoc(doc(db, 'users', user.uid), {
            lastLogin: new Date()
          }, { merge: true });
        } catch (firestoreError) {
          console.error('Error updating user document:', firestoreError);
        }
      }

      setUser(user);
      setAnonymousUser(false);

      return { success: true, isNewUser };
    } catch (error: any) {
      console.error('Google sign-in error:', error);

      // Tratamento de erros específicos
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelado pelo usuário');
        throw new Error('Login cancelado pelo usuário');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup bloqueado. Permita popups para este site.');
        throw new Error('Popup bloqueado. Permita popups para este site.');
      } else if (error.code === 'permission-denied') {
        toast.error('Erro de permissão. Verifique as configurações do Firestore.');
        throw new Error('Erro de permissão no Firestore');
      } else {
        toast.error('Erro ao fazer login com Google, tente novamente.');
        throw new Error('Erro ao fazer login com Google');
      }
    }
  };

  const linkWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      if (!user) throw new Error('Nenhum usuário logado');

      const result = await linkWithPopup(user, provider);
      setUser(result.user);
      setAnonymousUser(false);

      await setDoc(doc(db, 'users', result.user.uid), {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        updatedAt: new Date(),
        lastLogin: new Date(),
        wasAnonymous: true
      }, { merge: true });

      return { success: true };
    } catch (error: any) {
      console.error('Google link error:', error);
      throw error;
    }
  };

  const value = {
    user,
    anonymousUser,
    loading,
    signIn,
    signUp,
    signInAnonymously,
    signInWithGoogle,
    linkWithGoogle,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);