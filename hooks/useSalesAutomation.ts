import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { SalesAutomationSettings } from '../types';

const DEFAULT_SETTINGS: SalesAutomationSettings = {
  enabled: false,
  businessPhone: '',
  invoiceEmail: '',
  calendarLink: '',
  officeHours: 'Mon–Fri · 9:00am – 5:00pm',
  playbook: '',
  channels: {
    sms: true,
    voice: false,
    invoices: true,
    appointments: true,
  },
  updatedAt: undefined,
};

export const useSalesAutomation = (userId?: string) => {
  const [settings, setSettings] = useState<SalesAutomationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', userId, 'automation', 'sales');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as SalesAutomationSettings;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
            channels: {
              ...DEFAULT_SETTINGS.channels,
              ...(data.channels ?? {}),
            },
          });
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
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

  const mergeSave = useCallback(
    async (updates: Partial<SalesAutomationSettings>) => {
      if (!userId) {
        throw new Error('You must be signed in to update automation settings.');
      }
      setSaving(true);
      try {
        const docRef = doc(db, 'users', userId, 'automation', 'sales');
        const nextSettings: SalesAutomationSettings = {
          ...settings,
          ...updates,
          channels: {
            ...settings.channels,
            ...(updates.channels ?? {}),
          },
          updatedAt: new Date().toISOString(),
        };
        await setDoc(docRef, nextSettings, { merge: true });
        setSettings(nextSettings);
      } finally {
        setSaving(false);
      }
    },
    [settings, userId],
  );

  const saveSettings = useCallback(
    async (updates: Partial<SalesAutomationSettings>) => mergeSave(updates),
    [mergeSave],
  );

  const toggleAutomation = useCallback(
    async (enabled: boolean) => mergeSave({ enabled }),
    [mergeSave],
  );

  return {
    settings,
    loading,
    saving,
    error,
    saveSettings,
    toggleAutomation,
  };
};


