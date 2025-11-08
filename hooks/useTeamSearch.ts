import { useCallback, useState } from 'react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { TeamMember } from '../types';
import { db } from '../services/firebase';

export const useTeamSearch = () => {
  const [searchResults, setSearchResults] = useState<TeamMember[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
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

      const resultsMap = new Map<string, TeamMember>();

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
            const name = data.displayName || data.email || 'Unknown User';
            const email = data.email || '';
            const avatar = data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
            resultsMap.set(id, {
              id,
              name,
              email,
              role: data.role || 'Member',
              avatar,
            });
          });
        } catch (innerError) {
          console.warn('User directory search failed for term', term, innerError);
        }
      }

      setSearchResults(Array.from(resultsMap.values()).slice(0, 10));
    } catch (error: any) {
      console.error('Error searching users:', error);
      setError('Failed to search users. Please try again.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    searching,
    error,
    searchUsers,
    clearSearch,
  };
};

