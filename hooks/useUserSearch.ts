import { useState, useCallback } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface SearchableUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export const useUserSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchableUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const usersCollection = collection(db, 'users');
      
      // Search by email (exact match or contains)
      const emailQuery = query(
        usersCollection,
        where('email', '>=', searchTerm.toLowerCase()),
        where('email', '<=', searchTerm.toLowerCase() + '\uf8ff'),
        limit(10)
      );

      // Search by displayName (contains)
      // Note: Firestore doesn't support case-insensitive search natively
      // This is a simple implementation - for production, consider using Algolia or similar
      const nameQuery = query(
        usersCollection,
        orderBy('displayName'),
        limit(10)
      );

      const [emailResults, nameResults] = await Promise.all([
        getDocs(emailQuery).catch(() => ({ docs: [] })),
        getDocs(nameQuery).catch(() => ({ docs: [] })),
      ]);

      const allResults = new Map<string, SearchableUser>();

      // Process email results
      emailResults.docs.forEach((doc) => {
        const data = doc.data();
        allResults.set(doc.id, {
          id: doc.id,
          email: data.email || '',
          displayName: data.displayName || data.email || '',
          photoURL: data.photoURL,
        });
      });

      // Process name results (filter client-side for contains)
      nameResults.docs.forEach((doc) => {
        const data = doc.data();
        const displayName = (data.displayName || '').toLowerCase();
        const email = (data.email || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        if (
          displayName.includes(searchLower) ||
          email.includes(searchLower)
        ) {
          allResults.set(doc.id, {
            id: doc.id,
            email: data.email || '',
            displayName: data.displayName || data.email || '',
            photoURL: data.photoURL,
          });
        }
      });

      setSearchResults(Array.from(allResults.values()).slice(0, 10));
    } catch (err: any) {
      console.error('Error searching users:', err);
      setError(err.message || 'Failed to search users');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchUsers,
    clearResults,
    searchResults,
    isSearching,
    error,
  };
};

