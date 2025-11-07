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
  where,
  getDocs,
} from 'firebase/firestore';
import { Channel, ChatMessage, TeamMember } from '../types';
import { db } from '../services/firebase';

export const useChannels = (userId?: string) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  // Listen to channels where user is a member
  useEffect(() => {
    if (!userId) {
      setChannels([]);
      setLoading(false);
      return;
    }

    const channelsCollection = collection(db, 'channels');
    const channelsQuery = query(
      channelsCollection,
      where('members', 'array-contains', userId)
    );

    const unsubscribe = onSnapshot(
      channelsQuery,
      (snapshot) => {
        const channelsList = snapshot.docs
          .map((document) => {
            try {
              const data = document.data() as Omit<Channel, 'id'>;
              // Filter out archived channels client-side (handle missing field gracefully)
              if (data.isArchived === true) {
                return null;
              }
              return {
                id: document.id,
                isArchived: false, // Default to false if not set
                ...data,
              };
            } catch (error) {
              console.error('Error parsing channel:', error);
              return null;
            }
          })
          .filter((ch): ch is Channel => ch !== null);
        
        // Sort by last message time (most recent first)
        channelsList.sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        });
        
        setChannels(channelsList);
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        console.error('Error fetching channels:', snapshotError);
        setError(snapshotError.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const createChannel = useCallback(
    async (
      name: string,
      members: string[],
      type: Channel['type'] = 'public',
      description?: string
    ) => {
      if (!userId) throw new Error('You must be signed in to create channels.');
      
      if (!name.trim()) {
        throw new Error('Channel name is required.');
      }

      try {
        const channelsCollection = collection(db, 'channels');
        
        // Ensure creator is in members list
        const allMembers = members.includes(userId) ? members : [userId, ...members];
        
        const channelData: any = {
          name: name.trim(),
          description: description?.trim() || '',
          type,
          members: allMembers,
          createdBy: userId,
          isArchived: false,
        };

        const docRef = await addDoc(channelsCollection, {
          ...channelData,
          createdAt: serverTimestamp(),
        });

        return docRef.id;
      } catch (error: any) {
        console.error('Error creating channel:', error);
        throw error;
      }
    },
    [userId]
  );

  const updateChannel = useCallback(
    async (channelId: string, updates: Partial<Channel>) => {
      if (!userId) throw new Error('You must be signed in to update channels.');

      try {
        const channelDoc = doc(db, 'channels', channelId);
        await updateDoc(channelDoc, updates);
      } catch (error: any) {
        console.error('Error updating channel:', error);
        throw error;
      }
    },
    [userId]
  );

  const addMemberToChannel = useCallback(
    async (channelId: string, memberId: string) => {
      if (!userId) throw new Error('You must be signed in to add members.');

      try {
        const channel = channels.find((ch) => ch.id === channelId);
        if (!channel) {
          throw new Error('Channel not found.');
        }

        if (channel.members.includes(memberId)) {
          throw new Error('User is already a member of this channel.');
        }

        const updatedMembers = [...channel.members, memberId];
        await updateChannel(channelId, { members: updatedMembers });
      } catch (error: any) {
        console.error('Error adding member:', error);
        throw error;
      }
    },
    [userId, channels, updateChannel]
  );

  const removeMemberFromChannel = useCallback(
    async (channelId: string, memberId: string) => {
      if (!userId) throw new Error('You must be signed in to remove members.');

      try {
        const channel = channels.find((ch) => ch.id === channelId);
        if (!channel) {
          throw new Error('Channel not found.');
        }

        if (channel.createdBy !== userId) {
          throw new Error('Only the channel creator can remove members.');
        }

        const updatedMembers = channel.members.filter((id) => id !== memberId);
        
        if (updatedMembers.length === 0) {
          throw new Error('Cannot remove all members from a channel.');
        }

        await updateChannel(channelId, { members: updatedMembers });
      } catch (error: any) {
        console.error('Error removing member:', error);
        throw error;
      }
    },
    [userId, channels, updateChannel]
  );

  const archiveChannel = useCallback(
    async (channelId: string) => {
      if (!userId) throw new Error('You must be signed in to archive channels.');

      try {
        const channel = channels.find((ch) => ch.id === channelId);
        if (!channel) {
          throw new Error('Channel not found.');
        }

        if (channel.createdBy !== userId) {
          throw new Error('Only the channel creator can archive the channel.');
        }

        await updateChannel(channelId, { isArchived: true });
      } catch (error: any) {
        console.error('Error archiving channel:', error);
        throw error;
      }
    },
    [userId, channels, updateChannel]
  );

  const leaveChannel = useCallback(
    async (channelId: string) => {
      if (!userId) throw new Error('You must be signed in to leave channels.');

      try {
        await removeMemberFromChannel(channelId, userId);
      } catch (error: any) {
        console.error('Error leaving channel:', error);
        throw error;
      }
    },
    [userId, removeMemberFromChannel]
  );

  const publicChannels = channels.filter((ch) => ch.type === 'public');
  const privateChannels = channels.filter((ch) => ch.type === 'private');
  const directChannels = channels.filter((ch) => ch.type === 'direct');

  return {
    channels,
    publicChannels,
    privateChannels,
    directChannels,
    loading,
    error,
    createChannel,
    updateChannel,
    addMemberToChannel,
    removeMemberFromChannel,
    archiveChannel,
    leaveChannel,
  };
};

