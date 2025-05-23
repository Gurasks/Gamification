import { useState, useEffect } from 'react';
import type { PersistentUser } from '../global-types';


export function usePersistentUser(defaultUser = {} as PersistentUser) {
  const [user, setUser] = useState<PersistentUser>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('persistentUser');
      if (stored) {
        try {
          return JSON.parse(stored) as PersistentUser;
        } catch {
          return defaultUser;
        }
      }
    }
    return defaultUser;
  });

  useEffect(() => {
    // Save to localStorage whenever user changes
    localStorage.setItem('persistentUser', JSON.stringify(user));
  }, [user]);

  return { user, setUser };
}