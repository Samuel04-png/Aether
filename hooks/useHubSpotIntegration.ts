import { useState, useCallback } from 'react';
import {
  testHubSpotConnection,
  importHubSpotContacts,
  getHubSpotContacts,
  HubSpotImportResult,
} from '../services/hubspotService';

export const useHubSpotIntegration = (userId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  const testConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const isConnected = await testHubSpotConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      return isConnected;
    } catch (err: any) {
      setError(err.message || 'Failed to test connection');
      setConnectionStatus('disconnected');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const importContacts = useCallback(async (limit: number = 100): Promise<HubSpotImportResult> => {
    if (!userId) {
      throw new Error('User ID required');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await importHubSpotContacts(userId, limit);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to import contacts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchContacts = useCallback(async (limit: number = 100) => {
    setLoading(true);
    setError(null);

    try {
      const contacts = await getHubSpotContacts(limit);
      return contacts;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contacts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    connectionStatus,
    testConnection,
    importContacts,
    fetchContacts,
  };
};

