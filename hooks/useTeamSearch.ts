import { useCallback, useState } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
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
      const usersCollection = collection(db, 'users');
      
      // Search by email (exact match or startsWith)
      const emailQuery = query(
        usersCollection,
        where('email', '>=', searchTerm.toLowerCase()),
        where('email', '<=', searchTerm.toLowerCase() + '\uf8ff'),
        limit(10)
      );

      const emailSnapshot = await getDocs(emailQuery);
      const emailResults = emailSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.displayName || data.email || 'Unknown User',
          email: data.email || '',
          role: data.role || 'Member',
          avatar: data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName || data.email || 'User')}`,
        };
      });

      // Search by displayName (case-insensitive contains)
      const nameQuery = query(
        usersCollection,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        limit(10)
      );

      const nameSnapshot = await getDocs(nameQuery);
      const nameResults = nameSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.displayName || data.email || 'Unknown User',
          email: data.email || '',
          role: data.role || 'Member',
          avatar: data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName || data.email || 'User')}`,
        };
      });

      // Combine and deduplicate results
      const allResults = [...emailResults, ...nameResults];
      const uniqueResults = Array.from(
        new Map(allResults.map((user) => [user.id, user])).values()
      );

      setSearchResults(uniqueResults);
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

