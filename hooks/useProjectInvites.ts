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
  getDoc,
} from 'firebase/firestore';
import { ProjectInvite, ProjectRole } from '../types';
import { db } from '../services/firebase';
import { notifyProjectInvite, notifyInviteAccepted } from '../services/notificationService';

export const useProjectInvites = (userId?: string) => {
  const [invites, setInvites] = useState<ProjectInvite[]>([]);
  const [sentInvites, setSentInvites] = useState<ProjectInvite[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  // Listen to invites received by the user
  useEffect(() => {
    if (!userId) {
      setInvites([]);
      setLoading(false);
      return;
    }

    const invitesCollection = collection(db, 'projectInvites');
    const invitesQuery = query(
      invitesCollection,
      where('invitedUser', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      invitesQuery,
      (snapshot) => {
        setInvites(
          snapshot.docs.map((document) => {
            const data = document.data() as Omit<ProjectInvite, 'id'>;
            return {
              id: document.id,
              ...data,
            };
          })
        );
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

  // Listen to invites sent by the user
  useEffect(() => {
    if (!userId) {
      setSentInvites([]);
      return;
    }

    const invitesCollection = collection(db, 'projectInvites');
    const sentInvitesQuery = query(
      invitesCollection,
      where('invitedBy', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      sentInvitesQuery,
      (snapshot) => {
        setSentInvites(
          snapshot.docs.map((document) => {
            const data = document.data() as Omit<ProjectInvite, 'id'>;
            return {
              id: document.id,
              ...data,
            };
          })
        );
      },
      (snapshotError) => {
        console.error('Error fetching sent invites:', snapshotError);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const sendInvite = useCallback(
    async (
      projectId: string,
      projectName: string,
      invitedUserEmail: string,
      role: ProjectRole = 'member',
      message?: string
    ) => {
      if (!userId) throw new Error('You must be signed in to send invites.');

      try {
        // Get current user details
        const currentUserDoc = await getDoc(doc(db, 'users', userId));
        const currentUserData = currentUserDoc.data();
        const currentUserName = currentUserData?.displayName || currentUserData?.email || 'Someone';
        const currentUserEmail = currentUserData?.email || '';

        // Find the invited user by email
        const usersCollection = collection(db, 'users');
        const userQuery = query(usersCollection, where('email', '==', invitedUserEmail));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          throw new Error('User not found with that email address.');
        }

        const invitedUserDoc = userSnapshot.docs[0];
        const invitedUserId = invitedUserDoc.id;

        // Check if an invite already exists
        const invitesCollection = collection(db, 'projectInvites');
        const existingInviteQuery = query(
          invitesCollection,
          where('projectId', '==', projectId),
          where('invitedUser', '==', invitedUserId),
          where('status', '==', 'pending')
        );
        const existingInviteSnapshot = await getDocs(existingInviteQuery);

        if (!existingInviteSnapshot.empty) {
          throw new Error('An invitation has already been sent to this user for this project.');
        }

        // Create the invite
        const inviteData: Omit<ProjectInvite, 'id'> = {
          projectId,
          projectName,
          invitedBy: userId,
          invitedByName: currentUserName,
          invitedByEmail: currentUserEmail,
          invitedUser: invitedUserId,
          invitedUserEmail,
          role,
          status: 'pending',
          createdAt: new Date().toISOString(),
          message,
        };

        const docRef = await addDoc(invitesCollection, {
          ...inviteData,
          createdAt: serverTimestamp(),
        });

        // Send notification to invited user
        await notifyProjectInvite(
          invitedUserId,
          currentUserName,
          projectName,
          projectId,
          docRef.id
        );

        return docRef.id;
      } catch (error: any) {
        console.error('Error sending invite:', error);
        throw error;
      }
    },
    [userId]
  );

  const acceptInvite = useCallback(
    async (inviteId: string) => {
      if (!userId) throw new Error('You must be signed in to accept invites.');

      try {
        const inviteDoc = doc(db, 'projectInvites', inviteId);
        const inviteSnapshot = await getDoc(inviteDoc);

        if (!inviteSnapshot.exists()) {
          throw new Error('Invite not found.');
        }

        const inviteData = inviteSnapshot.data() as ProjectInvite;

        // Update invite status
        await updateDoc(inviteDoc, {
          status: 'accepted',
          respondedAt: new Date().toISOString(),
        });

        // Get current user details
        const currentUserDoc = await getDoc(doc(db, 'users', userId));
        const currentUserData = currentUserDoc.data();
        const currentUserName = currentUserData?.displayName || currentUserData?.email || 'Someone';
        const currentUserAvatar = currentUserData?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}`;

        // Add user to project team
        const projectDoc = doc(db, 'users', inviteData.invitedBy, 'projects', inviteData.projectId);
        const projectSnapshot = await getDoc(projectDoc);

        if (projectSnapshot.exists()) {
          const projectData = projectSnapshot.data();
          const currentTeam = projectData.team || [];
          const currentProjectMembers = projectData.projectMembers || [];

          // Check if user is already in the team
          const isAlreadyMember = currentTeam.some((member: any) => member.id === userId);

          if (!isAlreadyMember) {
            const newMember = {
              id: userId,
              name: currentUserName,
              role: inviteData.role,
              avatar: currentUserAvatar,
              email: inviteData.invitedUserEmail,
            };

            const newProjectMember = {
              ...newMember,
              projectRole: inviteData.role,
              joinedAt: new Date().toISOString(),
            };

            await updateDoc(projectDoc, {
              team: [...currentTeam, newMember],
              projectMembers: [...currentProjectMembers, newProjectMember],
            });
          }
        }

        // Notify the person who sent the invite
        await notifyInviteAccepted(
          inviteData.invitedBy,
          currentUserName,
          inviteData.projectName,
          inviteData.projectId
        );
      } catch (error: any) {
        console.error('Error accepting invite:', error);
        throw error;
      }
    },
    [userId]
  );

  const declineInvite = useCallback(
    async (inviteId: string) => {
      if (!userId) throw new Error('You must be signed in to decline invites.');

      try {
        const inviteDoc = doc(db, 'projectInvites', inviteId);
        await updateDoc(inviteDoc, {
          status: 'declined',
          respondedAt: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('Error declining invite:', error);
        throw error;
      }
    },
    [userId]
  );

  const pendingInvites = invites.filter((invite) => invite.status === 'pending');

  return {
    invites,
    sentInvites,
    pendingInvites,
    loading,
    error,
    sendInvite,
    acceptInvite,
    declineInvite,
  };
};

