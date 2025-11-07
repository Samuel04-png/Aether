# Firestore Security Rules - Complete Rules

This document contains the complete Firestore security rules that should be pasted into your Firebase Console for the **(default)** database.

## Quick Copy-Paste Rules

Copy the entire block below and paste it into Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function: Check if user owns the resource
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // User documents and all subcollections
    match /users/{userId} {
      // Users can read and write their own user document
      allow read, write: if isOwner(userId);
      
      // User subcollections - only owner can access
      match /profile/{profileId} {
        allow read, write: if isOwner(userId);
      }
      
      match /tasks/{taskId} {
        allow read, write: if isOwner(userId);
      }
      
      match /projects/{projectId} {
        allow read, write: if isOwner(userId);
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
    
    // Channels collection - member-based access
    match /channels/{channelId} {
      // Read: User must be a member of the channel
      allow read: if isSignedIn() && 
        request.auth.uid in resource.data.members;
      
      // Create: User must be authenticated and set themselves as creator
      allow create: if isSignedIn() && 
        request.auth.uid == request.resource.data.createdBy;
      
      // Update: Creator or any member can update
      allow update: if isSignedIn() && (
        request.auth.uid == resource.data.createdBy ||
        request.auth.uid in resource.data.members
      );
      
      // Delete: Only creator can delete
      allow delete: if isSignedIn() && 
        request.auth.uid == resource.data.createdBy;
      
      // Messages subcollection
      match /messages/{messageId} {
        // Read: User must be a member of the parent channel
        allow read: if isSignedIn() && 
          request.auth.uid in get(/databases/$(database)/documents/channels/$(channelId)).data.members;
        
        // Create: User must be authenticated and sender.id must match auth.uid
        allow create: if isSignedIn() && 
          request.auth.uid == request.resource.data.sender.id;
        
        // Update/Delete: Only sender can modify their own messages
        allow update, delete: if isSignedIn() && 
          request.auth.uid == resource.data.sender.id;
      }
    }
    
    // Project invites collection
    match /projectInvites/{inviteId} {
      // Read: Invited user or inviter can read
      allow read: if isSignedIn() && (
        request.auth.uid == resource.data.invitedBy ||
        request.auth.uid == resource.data.invitedUser
      );
      
      // Create: User must be authenticated and set themselves as inviter
      allow create: if isSignedIn() && 
        request.auth.uid == request.resource.data.invitedBy;
      
      // Update: Invited user or inviter can update (for accept/decline)
      allow update: if isSignedIn() && (
        request.auth.uid == resource.data.invitedUser ||
        request.auth.uid == resource.data.invitedBy
      );
      
      // Delete: Only inviter can delete
      allow delete: if isSignedIn() && 
        request.auth.uid == resource.data.invitedBy;
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
- **Subcollections**: `tasks`, `projects`, `leads`, `notifications`, `dashboard`, `teamMembers`, `profile`, `scheduledPosts`, `socialStats`
- **Security**: Owner-only access using `isOwner()` helper function

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

## Testing the Rules

After applying the rules, test the following:

1. **User Data Access**:
   - ✅ Users can create/read/update/delete their own tasks
   - ✅ Users can create/read/update/delete their own projects
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

