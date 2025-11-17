/**
 * Slack Integration Service
 * Handles OAuth, token storage, and message sending/receiving
 */

import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

export interface SlackToken {
  access_token: string;
  token_type: string;
  scope: string;
  bot_user_id?: string;
  app_id?: string;
  team: {
    name: string;
    id: string;
  };
  enterprise?: {
    name: string;
    id: string;
  };
  authed_user?: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
  is_enterprise_install?: boolean;
  webhook?: {
    channel: string;
    channel_id: string;
    configuration_url: string;
    url: string;
  };
}

export interface SlackIntegration {
  userId: string;
  workspaceId?: string;
  enabled: boolean;
  teamName: string;
  teamId: string;
  accessToken: string;
  botUserId?: string;
  webhookUrl?: string;
  defaultChannel?: string;
  connectedAt: string;
  updatedAt: string;
}

export interface SlackMessage {
  id: string;
  channel: string;
  text: string;
  user?: string;
  timestamp: string;
  threadTs?: string;
}

// OAuth Configuration (you'll need to set these in your Slack App)
const SLACK_CLIENT_ID = import.meta.env.VITE_SLACK_CLIENT_ID || '';
const SLACK_CLIENT_SECRET = import.meta.env.VITE_SLACK_CLIENT_SECRET || '';
const SLACK_REDIRECT_URI = import.meta.env.VITE_SLACK_REDIRECT_URI || `${window.location.origin}/integrations/slack/callback`;

/**
 * Get the Slack OAuth URL to initiate the authorization flow
 */
export const getSlackOAuthUrl = (userId: string): string => {
  const scopes = [
    'channels:read',
    'channels:write',
    'chat:write',
    'users:read',
    'team:read',
    'incoming-webhook',
  ].join(',');

  const state = btoa(JSON.stringify({ userId, timestamp: Date.now() }));

  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID,
    scope: scopes,
    redirect_uri: SLACK_REDIRECT_URI,
    state,
  });

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
};

/**
 * Exchange OAuth code for access token
 */
export const exchangeSlackCode = async (code: string): Promise<SlackToken> => {
  if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
    throw new Error('Slack OAuth credentials not configured. Please set VITE_SLACK_CLIENT_ID and VITE_SLACK_CLIENT_SECRET in your .env file.');
  }

  const params = new URLSearchParams({
    code,
    client_id: SLACK_CLIENT_ID,
    client_secret: SLACK_CLIENT_SECRET,
    redirect_uri: SLACK_REDIRECT_URI,
  });

  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error || 'Failed to exchange Slack OAuth code');
  }

  return data as SlackToken;
};

/**
 * Save Slack integration to Firestore
 */
export const saveSlackIntegration = async (
  userId: string,
  tokenData: SlackToken
): Promise<void> => {
  const integrationRef = doc(db, 'slackIntegrations', userId);
  
  const integration: SlackIntegration = {
    userId,
    enabled: true,
    teamName: tokenData.team.name,
    teamId: tokenData.team.id,
    accessToken: tokenData.access_token,
    botUserId: tokenData.bot_user_id,
    webhookUrl: tokenData.webhook?.url,
    defaultChannel: tokenData.webhook?.channel,
    connectedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(integrationRef, integration, { merge: true });
};

/**
 * Get Slack integration for a user
 */
export const getSlackIntegration = async (
  userId: string
): Promise<SlackIntegration | null> => {
  const integrationRef = doc(db, 'slackIntegrations', userId);
  const snapshot = await getDoc(integrationRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as SlackIntegration;
};

/**
 * Disconnect Slack integration
 */
export const disconnectSlack = async (userId: string): Promise<void> => {
  const integrationRef = doc(db, 'slackIntegrations', userId);
  await updateDoc(integrationRef, {
    enabled: false,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Send a message to Slack
 */
export const sendSlackMessage = async (
  userId: string,
  channel: string,
  text: string,
  threadTs?: string
): Promise<{ ok: boolean; message?: any; error?: string }> => {
  const integration = await getSlackIntegration(userId);

  if (!integration || !integration.enabled) {
    throw new Error('Slack integration not connected');
  }

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${integration.accessToken}`,
    },
    body: JSON.stringify({
      channel,
      text,
      thread_ts: threadTs,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    return { ok: false, error: data.error || 'Failed to send message' };
  }

  return { ok: true, message: data };
};

/**
 * Get Slack channels
 */
export const getSlackChannels = async (
  userId: string
): Promise<Array<{ id: string; name: string; is_private: boolean }>> => {
  const integration = await getSlackIntegration(userId);

  if (!integration || !integration.enabled) {
    throw new Error('Slack integration not connected');
  }

  const response = await fetch('https://slack.com/api/conversations.list', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${integration.accessToken}`,
    },
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error || 'Failed to fetch channels');
  }

  return data.channels || [];
};

/**
 * Send a notification to Slack (using webhook if available)
 */
export const sendSlackNotification = async (
  userId: string,
  message: string
): Promise<void> => {
  const integration = await getSlackIntegration(userId);

  if (!integration || !integration.enabled) {
    throw new Error('Slack integration not connected');
  }

  if (integration.webhookUrl) {
    // Use webhook for simple notifications
    await fetch(integration.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
      }),
    });
  } else if (integration.defaultChannel) {
    // Fall back to API if no webhook
    await sendSlackMessage(userId, integration.defaultChannel, message);
  } else {
    throw new Error('No webhook URL or default channel configured');
  }
};

/**
 * Test Slack connection
 */
export const testSlackConnection = async (userId: string): Promise<boolean> => {
  try {
    const integration = await getSlackIntegration(userId);

    if (!integration || !integration.enabled) {
      return false;
    }

    const response = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integration.accessToken}`,
      },
    });

    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error('Error testing Slack connection:', error);
    return false;
  }
};

