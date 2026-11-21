import { useState, useEffect } from 'react';
import { storageEvents, storageService } from '../services/storageService';
import { User } from '../types';

export function useStorage() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      setTick((prev) => prev + 1);
    };

    storageEvents.addEventListener('storage-updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      storageEvents.removeEventListener('storage-updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return storageService;
}

export function useCurrentUser(): [User, (user_id: string) => void] {
  const storage = useStorage();
  const currentUser = storage.getCurrentUser();
  const setCurrentUser = (userId: string) => {
    storage.setCurrentUser(userId);
  };
  return [currentUser, setCurrentUser];
}
