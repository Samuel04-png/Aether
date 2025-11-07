import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { ChatMessage, TeamMember } from '../types';
import { db } from '../services/firebase';

export interface NewMessageInput {
  content: string;
  sender: TeamMember;
  channelId?: string;
}

export const useChannelMessages = (userId?: string, channelId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId && channelId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !channelId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // Use global channels collection
    const messagesCollection = collection(db, 'channels', channelId, 'messages');
    const messagesQuery = query(messagesCollection, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        try {
          const messagesList = snapshot.docs
            .map((document) => {
              try {
                const data = document.data() as Omit<ChatMessage, 'id'> & { id?: string };
                return {
                  id: document.id,
                  content: data.content || '',
                  sender: data.sender || { id: 'unknown', name: 'Unknown User', role: 'Member', avatar: '' },
                  timestamp: data.timestamp || new Date().toLocaleTimeString(),
                  channelId: data.channelId || channelId || '',
                  createdAt: data.createdAt || new Date().toISOString(),
                };
              } catch (error) {
                console.error('Error parsing message:', error);
                return null;
              }
            })
            .filter((msg): msg is ChatMessage => msg !== null);
          
          setMessages(messagesList);
          setLoading(false);
          setError(null);
        } catch (error: any) {
          console.error('Error processing messages:', error);
          setError(error?.message || 'Failed to load messages');
          setLoading(false);
        }
      },
      (snapshotError) => {
        console.error('Error fetching messages:', snapshotError);
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId, channelId]);

  const sendMessage = useCallback(
    async (input: NewMessageInput) => {
      if (!userId) throw new Error('You must be signed in to send messages.');
      const targetChannelId = input.channelId || channelId;
      if (!targetChannelId) throw new Error('Channel ID is required.');
      
      if (!input.content || !input.content.trim()) {
        throw new Error('Message content is required.');
      }

      if (!input.sender || !input.sender.id) {
        throw new Error('Sender information is required.');
      }
      
      try {
        const messagesCollection = collection(db, 'channels', targetChannelId, 'messages');
        const docRef = await addDoc(messagesCollection, {
          sender: {
            id: input.sender.id,
            name: input.sender.name || 'Unknown User',
            role: input.sender.role || 'Member',
            avatar: input.sender.avatar || '',
            email: input.sender.email,
          },
          content: input.content.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          channelId: targetChannelId,
          createdAt: serverTimestamp(),
        });
        await updateDoc(docRef, { id: docRef.id });
      } catch (error: any) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    [userId, channelId],
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
};

