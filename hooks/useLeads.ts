import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  limit,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Lead } from '../types';

const LEADS_PAGE_SIZE = 20;

const normalizeTimestamp = (value: any): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if ((value as Timestamp)?.toDate) {
    return (value as Timestamp).toDate().toISOString();
  }
  return undefined;
};

const sanitizeLeadUpdates = (updates: Partial<Lead>): Partial<Lead> => {
  const allowedKeys: Array<keyof Lead> = ['name', 'company', 'email', 'source', 'status'];
  const cleaned: Partial<Lead> = {};
  allowedKeys.forEach((key) => {
    const value = updates[key];
    if (value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

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
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastDocState = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [, setLastDocInternal] = lastDocState;
  const lastDoc = lastDocState[0];

  useEffect(() => {
    if (!userId) {
      setLeads([]);
      setLoading(false);
      setHasMore(false);
      setLastDocInternal(null);
      return;
    }

    const leadsCollection = collection(db, 'users', userId, 'leads');
    const baseQuery = query(
      leadsCollection,
      where('archived', '!=', true),
      orderBy('archived'),
      orderBy('createdAt', 'desc'),
      limit(LEADS_PAGE_SIZE),
    );

    const unsubscribe = onSnapshot(
      baseQuery,
      (snapshot) => {
        const nextLeads: Lead[] = snapshot.docs.map((document) => {
          const data = document.data() as Omit<Lead, 'id'> & { id?: string };
          return {
            id: document.id,
            ...data,
            archived: data.archived ?? false,
            createdAt: normalizeTimestamp((data as any).createdAt),
          } as Lead;
        });
        setLastDocInternal(snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null);
        setHasMore(snapshot.size === LEADS_PAGE_SIZE);
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
        archived: false,
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
      await updateDoc(leadDoc, { archived: true, archivedAt: serverTimestamp() });
    },
    [userId],
  );

  const updateLead = useCallback(
    async (leadId: string, updates: Partial<Lead>) => {
      if (!userId) throw new Error('You must be signed in to update leads.');
      const payload = sanitizeLeadUpdates(updates);
      if (Object.keys(payload).length === 0) {
        return;
      }
      const leadDoc = doc(db, 'users', userId, 'leads', leadId);
      await updateDoc(leadDoc, payload);
    },
    [userId],
  );

  const loadMoreLeads = useCallback(async () => {
    if (!userId || !lastDoc) return;
    setIsLoadingMore(true);
    try {
      const leadsCollection = collection(db, 'users', userId, 'leads');
      const nextQuery = query(
        leadsCollection,
        where('archived', '!=', true),
        orderBy('archived'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(LEADS_PAGE_SIZE),
      );
      const snapshot = await getDocs(nextQuery);
      setLastDocInternal(snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null);
      setHasMore(snapshot.size === LEADS_PAGE_SIZE);
      if (!snapshot.empty) {
        setLeads((prev) => {
          const map = new Map(prev.map((lead) => [lead.id, lead]));
          snapshot.docs.forEach((document) => {
            const data = document.data() as Omit<Lead, 'id'> & { id?: string };
            map.set(document.id, {
              id: document.id,
              ...data,
              archived: data.archived ?? false,
              createdAt: normalizeTimestamp((data as any).createdAt),
            } as Lead);
          });
          const merged = Array.from(map.values());
          merged.sort((a: any, b: any) => {
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
          });
          return merged;
        });
      }
    } catch (err: any) {
      setError(err?.message ?? 'Unable to load more leads.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [userId, lastDoc]);

  return {
    leads,
    loading,
    isLoadingMore,
    hasMore,
    error,
    addLead,
    updateLeadStatus,
    updateLead,
    removeLead,
    loadMoreLeads,
  };
};

