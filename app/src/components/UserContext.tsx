import React, { createContext, useContext } from 'react';
import { usePersistentUser } from '../hooks/global';
import type { PersistentUser } from '../types/global';

interface UserContextType {
  user: PersistentUser;
  setUser: (user: PersistentUser) => void;
}

const UserContext = createContext<UserContextType>({
  user: {} as PersistentUser,
  setUser: () => { }
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser } = usePersistentUser();

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);