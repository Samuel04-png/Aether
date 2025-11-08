# Firestore Security Rules - Complete Rules

This document contains the complete Firestore security rules that should be pasted into your Firebase Console for the **(default)** database.

## Quick Copy-Paste Rules

Copy the entire block below and paste it into Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      
      match /profile/{profileId} {
        allow read, write: if isOwner(userId);
      }
      
      match /tasks/{taskId} {
        allow read, write: if isOwner(userId);
      }
      
      match /projects/{projectId} {
        function ownerId() {
          return resource.data.ownerId != null ? resource.data.ownerId : userId;
        }

        allow read: if isSignedIn() && (
          isOwner(userId) ||
          (resource.data.teamMemberIds != null && request.auth.uid in resource.data.teamMemberIds)
        );

        allow create: if isOwner(userId) &&
          request.resource.data.ownerId == request.auth.uid &&
          request.resource.data.teamMemberIds != null &&
          request.resource.data.teamMemberIds.size() > 0 &&
          request.auth.uid in request.resource.data.teamMemberIds;

        allow update: if
          request.resource.data.ownerId == ownerId() &&
          request.resource.data.teamMemberIds != null &&
          request.resource.data.teamMemberIds.size() > 0 &&
          ownerId() in request.resource.data.teamMemberIds &&
          (
            isOwner(userId) ||
            (
              resource.data.teamMemberIds != null &&
              request.auth.uid in resource.data.teamMemberIds &&
              request.resource.data.teamMemberIds == resource.data.teamMemberIds
            )
          );

        allow delete: if isOwner(userId);
      }
      
      match /leads/{leadId} {
        allow read, write: if isOwner(userId);
      }
      
      match /dashboard/{dashboardId} {
        allow read, write: if isOwner(userId);
      }
      
      match /teamMembers/{memberId} {
        allow read, write: if isOwner(userId);
      }
      
      match /notifications/{notificationId} {
        allow read, write: if isOwner(userId);
      }
      
      match /scheduledPosts/{postId} {
        allow read, write: if isOwner(userId);
      }
      
      match /socialStats/{statId} {
        allow read, write: if isOwner(userId);
      }
    }
    
    match /channels/{channelId} {
      allow read: if isSignedIn() &&
        request.auth.uid in resource.data.members;
      
      allow create: if isSignedIn() &&
        request.auth.uid == request.resource.data.createdBy;
      
      allow update: if isSignedIn() && (
        request.auth.uid == resource.data.createdBy ||
        request.auth.uid in resource.data.members
      );
      
      allow delete: if isSignedIn() &&
        request.auth.uid == resource.data.createdBy;
      
      match /messages/{messageId} {
        allow read: if isSignedIn() &&
          request.auth.uid in get(/databases/$(database)/documents/channels/$(channelId)).data.members;
        
        allow create: if isSignedIn() &&
          request.auth.uid == request.resource.data.sender.id;
        
        allow update, delete: if isSignedIn() &&
          request.auth.uid == resource.data.sender.id;
      }
    }
    
    match /projectInvites/{inviteId} {
      allow read: if isSignedIn() && (
        request.auth.uid == resource.data.invitedBy ||
        request.auth.uid == resource.data.invitedUser
      );
      
      allow create: if isSignedIn() &&
        request.auth.uid == request.resource.data.invitedBy;
      
      allow update: if isSignedIn() && (
        request.auth.uid == resource.data.invitedUser ||
        request.auth.uid == resource.data.invitedBy
      );
      
      allow delete: if isSignedIn() &&
        request.auth.uid == resource.data.invitedBy;
    }

    match /userDirectory/{directoryUserId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isOwner(directoryUserId);
    }
  }
}
```

## How to Apply Rules in Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: Click on your project (e.g., `aether-db171`)
3. **Navigate to Firestore Database**:
   - Click on **"Build"** in the left sidebar
   - Click on **"Firestore Database"**
4. **Go to Rules tab**:
   - Click on the **"Rules"** tab at the top
   - **Important**: Make sure you select the **(default)** database from the dropdown if you have multiple databases
5. **Paste the rules**:
   - Copy the complete rules block above
   - Paste it into the editor, replacing any existing rules
6. **Publish the rules**:
   - Click the **"Publish"** button
   - Wait for the confirmation message that rules have been deployed

## Security Rules Overview

### User Data (`/users/{userId}`)
- **Access**: Users can only read and write their own user document and all subcollections
- **Projects**: Project owners have full control; collaborators listed in `teamMemberIds` can read and update task data but cannot modify the member list
- **Subcollections**: `tasks`, `projects`, `leads`, `notifications`, `dashboard`, `teamMembers`, `profile`, `scheduledPosts`, `socialStats`
- **Security**: Owner-only access enforced via `isOwner()` helper with explicit project ownership checks

### Channels (`/channels/{channelId}`)
- **Read**: Only members of the channel can read
- **Create**: Authenticated users can create channels (must set themselves as creator)
- **Update**: Creator or any member can update channel
- **Delete**: Only creator can delete channel
- **Messages**: Only channel members can read messages; only sender can create/update/delete their own messages

### Project Invites (`/projectInvites/{inviteId}`)
- **Read**: Both invited user and inviter can read the invite
- **Create**: Authenticated users can create invites (must set themselves as inviter)
- **Update**: Invited user or inviter can update (for accept/decline actions)
- **Delete**: Only inviter can delete the invite

### User Directory (`/userDirectory/{userId}`)
- **Purpose**: Lightweight directory to power member search without exposing private user records
- **Read**: Any authenticated user can search directory entries
- **Write**: Only the owner of the entry can create/update/delete their directory profile

## Testing the Rules

After applying the rules, test the following:

1. **User Data Access**:
   - ✅ Users can create/read/update/delete their own tasks
   - ✅ Users can create/read/update/delete their own projects
   - ✅ Project collaborators listed in `teamMemberIds` can read projects and update task/status fields
   - ❌ Collaborators cannot change project membership unless they are the owner
   - ✅ Users can create/read/update/delete their own leads
   - ✅ Users can read/update/delete their own notifications
   - ❌ Users cannot access other users' data

2. **Channels**:
   - ✅ Authenticated users can create channels
   - ✅ Channel members can read and send messages
   - ✅ Only creator can delete channels
   - ❌ Non-members cannot read channel messages

3. **Project Invites**:
   - ✅ Users can create invites for projects
   - ✅ Invited users can read and respond to invites
   - ✅ Only inviter can delete invites
   - ❌ Other users cannot see invites they're not part of

4. **User Directory**:
   - ✅ Authenticated users can search directory entries
   - ❌ Anonymous users cannot read directory data

## Troubleshooting

### Rules Not Working?
1. **Check Database Selection**: Make sure you're editing rules for the **(default)** database
2. **Verify Rules Published**: Check that rules were successfully published (green checkmark)
3. **Check Authentication**: Ensure users are properly authenticated before accessing Firestore
4. **Check Browser Console**: Look for permission denied errors in the browser console

### Common Issues
- **Permission Denied**: User may not be authenticated or doesn't have access rights
- **Missing Fields**: Ensure data being created includes required fields (e.g., `createdBy`, `members`, `sender.id`)
- **Database Selection**: If you have multiple databases, make sure you're using the default one

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/)
- [Rules Playground](https://console.firebase.google.com/project/_/firestore/rules) - Test your rules before deploying

