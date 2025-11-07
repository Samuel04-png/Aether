import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { TeamMember } from '../types';
import { db } from '../services/firebase';

export interface NewTeamMemberInput {
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  description?: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

export const useTeamMembers = (userId?: string) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const membersCollection = collection(db, 'users', userId, 'teamMembers');
    const membersQuery = query(membersCollection, orderBy('name'));

    const unsubscribe = onSnapshot(
      membersQuery,
      (snapshot) => {
        setMembers(
          snapshot.docs.map((document) => {
            const data = document.data() as Omit<TeamMember, 'id'> & { id?: string };
            return {
              id: document.id,
              ...data,
            };
          }),
        );
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const addMember = useCallback(
    async (input: NewTeamMemberInput) => {
      if (!userId) throw new Error('You must be signed in to invite team members.');
      const membersCollection = collection(db, 'users', userId, 'teamMembers');
      const memberData: any = {
        name: input.name,
        role: input.role,
        avatar: input.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(input.name)}&background=random`,
        status: input.status || 'pending',
        createdAt: serverTimestamp(),
      };
      
      if (input.email) {
        memberData.email = input.email;
      }
      
      if (input.description) {
        memberData.description = input.description;
      }
      
      const docRef = await addDoc(membersCollection, memberData);
      await updateDoc(docRef, { id: docRef.id });
      return docRef.id;
    },
    [userId],
  );

  const updateMemberStatus = useCallback(
    async (memberId: string, status: 'pending' | 'accepted' | 'rejected') => {
      if (!userId) throw new Error('You must be signed in to update member status.');
      const memberDoc = doc(db, 'users', userId, 'teamMembers', memberId);
      await updateDoc(memberDoc, { 
        status,
        updatedAt: serverTimestamp(),
      });
    },
    [userId],
  );

  const acceptMember = useCallback(
    async (memberId: string) => {
      await updateMemberStatus(memberId, 'accepted');
    },
    [updateMemberStatus],
  );

  const rejectMember = useCallback(
    async (memberId: string) => {
      await updateMemberStatus(memberId, 'rejected');
    },
    [updateMemberStatus],
  );

  const pendingMembers = members.filter((m: any) => m.status === 'pending');
  const acceptedMembers = members.filter((m: any) => !m.status || m.status === 'accepted');

  return {
    members,
    pendingMembers,
    acceptedMembers,
    loading,
    error,
    addMember,
    updateMemberStatus,
    acceptMember,
    rejectMember,
  };
};

