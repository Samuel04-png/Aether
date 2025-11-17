import { useState, useEffect, useCallback } from 'react';
import {
  getSlackIntegration,
  saveSlackIntegration,
  disconnectSlack,
  sendSlackMessage,
  getSlackChannels,
  testSlackConnection,
  SlackIntegration,
} from '../services/slackService';

export const useSlackIntegration = (userId?: string) => {
  const [integration, setIntegration] = useState<SlackIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channels, setChannels] = useState<Array<{ id: string; name: string; is_private: boolean }>>([]);

  // Load integration data
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadIntegration = async () => {
      try {
        setLoading(true);
        const data = await getSlackIntegration(userId);
        setIntegration(data);
        setError(null);
      } catch (err: any) {
        console.error('Error loading Slack integration:', err);
        setError(err.message || 'Failed to load Slack integration');
      } finally {
        setLoading(false);
      }
    };

    loadIntegration();
  }, [userId]);

  // Load channels if integration is active
  useEffect(() => {
    if (!userId || !integration?.enabled) {
      setChannels([]);
      return;
    }

    const loadChannels = async () => {
      try {
        const channelList = await getSlackChannels(userId);
        setChannels(channelList);
      } catch (err: any) {
        console.error('Error loading Slack channels:', err);
      }
    };

    loadChannels();
  }, [userId, integration?.enabled]);

  const disconnect = useCallback(async () => {
    if (!userId) return;

    try {
      await disconnectSlack(userId);
      setIntegration(prev => prev ? { ...prev, enabled: false } : null);
      setChannels([]);
      setError(null);
    } catch (err: any) {
      console.error('Error disconnecting Slack:', err);
      setError(err.message || 'Failed to disconnect Slack');
      throw err;
    }
  }, [userId]);

  const sendMessage = useCallback(
    async (channel: string, text: string, threadTs?: string) => {
      if (!userId) throw new Error('User ID required');

      try {
        const result = await sendSlackMessage(userId, channel, text, threadTs);
        if (!result.ok) {
          throw new Error(result.error || 'Failed to send message');
        }
        return result;
      } catch (err: any) {
        console.error('Error sending Slack message:', err);
        throw err;
      }
    },
    [userId]
  );

  const testConnection = useCallback(async () => {
    if (!userId) return false;

    try {
      return await testSlackConnection(userId);
    } catch (err: any) {
      console.error('Error testing connection:', err);
      return false;
    }
  }, [userId]);

  const refreshIntegration = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await getSlackIntegration(userId);
      setIntegration(data);
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing integration:', err);
      setError(err.message || 'Failed to refresh integration');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    integration,
    loading,
    error,
    channels,
    isConnected: integration?.enabled || false,
    disconnect,
    sendMessage,
    testConnection,
    refreshIntegration,
  };
};

