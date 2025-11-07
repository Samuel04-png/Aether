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
import { db } from '../services/firebase';
import { Lead } from '../types';

export interface NewLeadInput {
  name: string;
  company: string;
  email: string;
  source: string;
  status?: Lead['status'];
}

export const useLeads = (userId?: string) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLeads([]);
      setLoading(false);
      return;
    }

    const leadsCollection = collection(db, 'users', userId, 'leads');
    // Use onSnapshot without orderBy to avoid errors if createdAt doesn't exist
    const unsubscribe = onSnapshot(
      leadsCollection,
      (snapshot) => {
        const nextLeads: Lead[] = snapshot.docs.map((document) => {
          const data = document.data() as Omit<Lead, 'id'> & { id?: string };
          return {
            id: document.id,
            ...data,
          };
        });
        // Sort by createdAt if available, otherwise by id
        nextLeads.sort((a, b) => {
          if ((a as any).createdAt && (b as any).createdAt) {
            return new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime();
          }
          return 0;
        });
        setLeads(nextLeads);
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

  const addLead = useCallback(
    async (input: NewLeadInput) => {
      if (!userId) throw new Error('You must be signed in to add leads.');

      const leadsCollection = collection(db, 'users', userId, 'leads');
      const docRef = await addDoc(leadsCollection, {
        name: input.name,
        company: input.company,
        email: input.email,
        source: input.source,
        status: input.status ?? 'New',
        createdAt: serverTimestamp(),
      });
      await updateDoc(docRef, { id: docRef.id });
    },
    [userId],
  );

  const updateLeadStatus = useCallback(
    async (leadId: string, status: Lead['status']) => {
      if (!userId) throw new Error('You must be signed in to update leads.');
      const leadDoc = doc(db, 'users', userId, 'leads', leadId);
      await updateDoc(leadDoc, { status });
    },
    [userId],
  );

  const removeLead = useCallback(
    async (leadId: string) => {
      if (!userId) throw new Error('You must be signed in to remove leads.');
      const leadDoc = doc(db, 'users', userId, 'leads', leadId);
      await updateDoc(leadDoc, { archived: true });
    },
    [userId],
  );

  return {
    leads,
    loading,
    error,
    addLead,
    updateLeadStatus,
    removeLead,
  };
};

