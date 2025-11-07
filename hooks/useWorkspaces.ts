import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Workspace } from '../types';
import { db } from '../services/firebase';

export const useWorkspaces = (userId?: string) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  // Listen to workspaces where user is owner or member
  useEffect(() => {
    if (!userId) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    const workspacesCollection = collection(db, 'workspaces');
    const workspacesQuery = query(
      workspacesCollection,
      where('members', 'array-contains', userId)
    );

    const unsubscribe = onSnapshot(
      workspacesQuery,
      (snapshot) => {
        const workspacesList = snapshot.docs.map((document) => {
          const data = document.data() as Omit<Workspace, 'id'>;
          return {
            id: document.id,
            ...data,
          };
        });
        
        setWorkspaces(workspacesList);
        
        // Set current workspace (default to first one or user's own workspace)
        if (workspacesList.length > 0 && !currentWorkspace) {
          const userWorkspace = workspacesList.find(w => w.ownerId === userId) || workspacesList[0];
          setCurrentWorkspace(userWorkspace);
        }
        
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const createWorkspace = useCallback(
    async (name: string, description?: string) => {
      if (!userId) throw new Error('You must be signed in to create a workspace.');

      try {
        const workspacesCollection = collection(db, 'workspaces');
        const workspaceData: Omit<Workspace, 'id'> = {
          name,
          description,
          ownerId: userId,
          members: [userId],
          createdAt: new Date().toISOString(),
        };

        const docRef = await addDoc(workspacesCollection, {
          ...workspaceData,
          createdAt: serverTimestamp(),
        });

        // Update user profile with workspace ID
        const userDoc = doc(db, 'users', userId);
        await updateDoc(userDoc, {
          workspaceId: docRef.id,
        });

        return docRef.id;
      } catch (error: any) {
        console.error('Error creating workspace:', error);
        throw error;
      }
    },
    [userId]
  );

  const updateWorkspace = useCallback(
    async (workspaceId: string, updates: Partial<Workspace>) => {
      if (!userId) throw new Error('You must be signed in to update workspaces.');

      try {
        const workspaceDoc = doc(db, 'workspaces', workspaceId);
        const workspaceSnapshot = await getDoc(workspaceDoc);

        if (!workspaceSnapshot.exists()) {
          throw new Error('Workspace not found.');
        }

        const workspaceData = workspaceSnapshot.data() as Workspace;

        if (workspaceData.ownerId !== userId) {
          throw new Error('Only the workspace owner can update workspace details.');
        }

        await updateDoc(workspaceDoc, updates);
      } catch (error: any) {
        console.error('Error updating workspace:', error);
        throw error;
      }
    },
    [userId]
  );

  const addMemberToWorkspace = useCallback(
    async (workspaceId: string, newMemberId: string) => {
      if (!userId) throw new Error('You must be signed in to add members.');

      try {
        const workspaceDoc = doc(db, 'workspaces', workspaceId);
        const workspaceSnapshot = await getDoc(workspaceDoc);

        if (!workspaceSnapshot.exists()) {
          throw new Error('Workspace not found.');
        }

        const workspaceData = workspaceSnapshot.data() as Workspace;

        if (workspaceData.ownerId !== userId) {
          throw new Error('Only the workspace owner can add members.');
        }

        const currentMembers = workspaceData.members || [];
        if (currentMembers.includes(newMemberId)) {
          throw new Error('User is already a member of this workspace.');
        }

        await updateDoc(workspaceDoc, {
          members: [...currentMembers, newMemberId],
        });
      } catch (error: any) {
        console.error('Error adding member:', error);
        throw error;
      }
    },
    [userId]
  );

  const removeMemberFromWorkspace = useCallback(
    async (workspaceId: string, memberId: string) => {
      if (!userId) throw new Error('You must be signed in to remove members.');

      try {
        const workspaceDoc = doc(db, 'workspaces', workspaceId);
        const workspaceSnapshot = await getDoc(workspaceDoc);

        if (!workspaceSnapshot.exists()) {
          throw new Error('Workspace not found.');
        }

        const workspaceData = workspaceSnapshot.data() as Workspace;

        if (workspaceData.ownerId !== userId) {
          throw new Error('Only the workspace owner can remove members.');
        }

        if (memberId === userId) {
          throw new Error('Workspace owner cannot be removed.');
        }

        const currentMembers = workspaceData.members || [];
        const updatedMembers = currentMembers.filter((id) => id !== memberId);

        await updateDoc(workspaceDoc, {
          members: updatedMembers,
        });
      } catch (error: any) {
        console.error('Error removing member:', error);
        throw error;
      }
    },
    [userId]
  );

  const switchWorkspace = useCallback((workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  }, [workspaces]);

  return {
    workspaces,
    currentWorkspace,
    loading,
    error,
    createWorkspace,
    updateWorkspace,
    addMemberToWorkspace,
    removeMemberFromWorkspace,
    switchWorkspace,
  };
};

