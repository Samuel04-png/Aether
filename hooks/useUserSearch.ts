import { useState, useCallback } from 'react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
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
      const directoryCollection = collection(db, 'userDirectory');
      const normalized = searchTerm.trim().toLowerCase();
      const terms = Array.from(
        new Set([
          normalized,
          ...normalized.split(/\s+/).filter(Boolean),
        ]),
      ).filter(Boolean);

      const resultMap = new Map<string, SearchableUser>();

      for (const term of terms) {
        try {
          const termQuery = query(
            directoryCollection,
            where('keywords', 'array-contains', term),
            limit(10),
          );

          const snapshot = await getDocs(termQuery);
          snapshot.docs.forEach((docSnapshot) => {
            const data = docSnapshot.data() as any;
            const id = docSnapshot.id;
            if (!id) return;
            resultMap.set(id, {
              id,
              email: data.email || '',
              displayName: data.displayName || data.email || '',
              photoURL: data.photoURL,
            });
          });
        } catch (innerError) {
          console.warn('User directory lookup failed for term', term, innerError);
        }
      }

      setSearchResults(Array.from(resultMap.values()).slice(0, 10));
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

