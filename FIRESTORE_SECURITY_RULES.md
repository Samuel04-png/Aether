# 🔒 Firestore Security Rules for Collaboration System

## Recommended Security Rules

These security rules should be added to your Firebase project to properly secure the collaboration features.

### How to Apply
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click "Rules" tab
4. Copy and paste the rules below
5. Click "Publish"

---

## Complete Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    // Check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Check if user owns the resource
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Check if user is part of a project team
    function isProjectMember(projectData) {
      return isSignedIn() && 
        request.auth.uid in projectData.team.map(member => member.id);
    }
    
    // Check if user has a specific role in project
    function hasProjectRole(projectData, role) {
      let member = projectData.projectMembers
        .where('id', '==', request.auth.uid)[0];
      return member != null && member.projectRole == role;
    }
    
    // Check if user can edit project (member, admin, or owner)
    function canEditProject(projectData) {
      return isProjectMember(projectData) && 
        (hasProjectRole(projectData, 'member') ||
         hasProjectRole(projectData, 'admin') ||
         hasProjectRole(projectData, 'owner'));
    }
    
    // Check if user can manage project (admin or owner)
    function canManageProject(projectData) {
      return isProjectMember(projectData) && 
        (hasProjectRole(projectData, 'admin') ||
         hasProjectRole(projectData, 'owner'));
    }
    
    // ============================================
    // USER DATA RULES
    // ============================================
    
    match /users/{userId} {
      // Users can read and write their own data
      allow read, write: if isOwner(userId);
      
      // Public profile data (for invites, etc.)
      match /publicProfile/{document=**} {
        allow read: if isSignedIn();
        allow write: if isOwner(userId);
      }
      
      // ============================================
      // USER NOTIFICATIONS
      // ============================================
      
      match /notifications/{notificationId} {
        // Users can only read their own notifications
        allow read: if isOwner(userId);
        
        // System can create notifications for any user
        // Users can update their own notifications (mark as read)
        allow create: if isSignedIn();
        allow update, delete: if isOwner(userId);
      }
      
      // ============================================
      // USER PROJECTS
      // ============================================
      
      match /projects/{projectId} {
        // Allow read if user is a team member
        allow read: if isOwner(userId) || 
                      isProjectMember(resource.data);
        
        // Allow create if user owns the parent document
        allow create: if isOwner(userId);
        
        // Allow update if user can edit the project
        allow update: if isOwner(userId) || 
                        canEditProject(resource.data);
        
        // Only project owner can delete
        allow delete: if isOwner(userId);
      }
    }
    
    // ============================================
    // PROJECT INVITES
    // ============================================
    
    match /projectInvites/{inviteId} {
      // Users can read invites they sent or received
      allow read: if isSignedIn() && (
        request.auth.uid == resource.data.invitedBy ||
        request.auth.uid == resource.data.invitedUser
      );
      
      // Only authenticated users can create invites
      // (Additional validation: must be project member)
      allow create: if isSignedIn() && 
        request.auth.uid == request.resource.data.invitedBy;
      
      // Invited user can update (accept/decline)
      // Inviter can also update (cancel)
      allow update: if isSignedIn() && (
        request.auth.uid == resource.data.invitedUser ||
        request.auth.uid == resource.data.invitedBy
      );
      
      // Only inviter can delete
      allow delete: if isSignedIn() && 
        request.auth.uid == resource.data.invitedBy;
    }
    
    // ============================================
    // WORKSPACES
    // ============================================
    
    match /workspaces/{workspaceId} {
      // Members can read workspace
      allow read: if isSignedIn() && 
        request.auth.uid in resource.data.members;
      
      // Any authenticated user can create a workspace
      allow create: if isSignedIn() && 
        request.auth.uid == request.resource.data.ownerId;
      
      // Only owner can update or delete workspace
      allow update, delete: if isSignedIn() && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // ============================================
    // TEAM MEMBERS (Global pool)
    // ============================================
    
    match /teamMembers/{memberId} {
      // Anyone can read team members (for invites)
      allow read: if isSignedIn();
      
      // Users can create/update their own member profile
      allow create, update: if isOwner(memberId);
      
      // Users can delete their own profile
      allow delete: if isOwner(memberId);
    }
  }
}
```

---

## Security Rule Breakdown

### 1. **User Data (`/users/{userId}`)**

**Permissions:**
- ✅ Users can read/write their own data
- ❌ Users cannot access other users' data

**Use Case:**
- Stores user profile, preferences, settings

---

### 2. **Notifications (`/users/{userId}/notifications/{notificationId}`)**

**Permissions:**
- ✅ Users can read their own notifications
- ✅ System can create notifications for any user
- ✅ Users can update/delete their own notifications
- ❌ Users cannot read others' notifications

**Use Case:**
- Task assignments, mentions, invites, deadlines

---

### 3. **Projects (`/users/{userId}/projects/{projectId}`)**

**Permissions:**
- ✅ Owner can read/write/delete
- ✅ Team members can read
- ✅ Members/Admins can update
- ❌ Non-members cannot access

**Use Case:**
- Project data, tasks, files, chat

**Role-Based Access:**
- **Viewer**: Read only
- **Member**: Read + Update
- **Admin**: Read + Update + Manage team
- **Owner**: Full access

---

### 4. **Project Invites (`/projectInvites/{inviteId}`)**

**Permissions:**
- ✅ Inviter and invited user can read
- ✅ Authenticated users can create invites
- ✅ Invited user can update (accept/decline)
- ✅ Inviter can update (cancel) or delete
- ❌ Others cannot access

**Use Case:**
- Sending, accepting, declining project invitations

---

### 5. **Workspaces (`/workspaces/{workspaceId}`)**

**Permissions:**
- ✅ Members can read
- ✅ Anyone can create (as owner)
- ✅ Only owner can update/delete
- ❌ Non-members cannot access

**Use Case:**
- Multi-user workspace management

---

### 6. **Team Members (`/teamMembers/{memberId}`)**

**Permissions:**
- ✅ All authenticated users can read (for invites)
- ✅ Users can create/update their own profile
- ✅ Users can delete their own profile
- ❌ Users cannot modify others' profiles

**Use Case:**
- Global team member directory for invitations

---

## Testing Security Rules

### Using Firebase Emulator

```bash
# Install Firebase Tools
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize emulator
firebase init emulators

# Start emulator
firebase emulators:start
```

### Test Cases

#### ✅ **Should Pass:**

1. **User reads own notifications**
```javascript
// User: user1@example.com
firestore.collection('users/user1/notifications').get()
// ✅ PASS
```

2. **Team member reads project**
```javascript
// User: member@example.com is in project team
firestore.collection('users/owner/projects/project1').get()
// ✅ PASS
```

3. **User accepts invite**
```javascript
// User: invited@example.com
firestore.doc('projectInvites/invite1').update({status: 'accepted'})
// ✅ PASS
```

#### ❌ **Should Fail:**

1. **User reads another user's notifications**
```javascript
// User: user1@example.com
firestore.collection('users/user2/notifications').get()
// ❌ FAIL: Permission denied
```

2. **Non-member reads project**
```javascript
// User: outsider@example.com (not in team)
firestore.collection('users/owner/projects/project1').get()
// ❌ FAIL: Permission denied
```

3. **User updates another's invite**
```javascript
// User: random@example.com
firestore.doc('projectInvites/invite1').update({status: 'accepted'})
// ❌ FAIL: Permission denied
```

---

## Advanced Security

### Rate Limiting

Add Cloud Functions to prevent abuse:

```javascript
// functions/index.js
exports.checkInviteRateLimit = functions.firestore
  .document('projectInvites/{inviteId}')
  .onCreate(async (snap, context) => {
    const invite = snap.data();
    const userId = invite.invitedBy;
    
    // Check invites sent in last hour
    const recentInvites = await admin.firestore()
      .collection('projectInvites')
      .where('invitedBy', '==', userId)
      .where('createdAt', '>', Date.now() - 3600000)
      .get();
    
    if (recentInvites.size > 10) {
      // Too many invites - delete this one
      await snap.ref.delete();
      throw new Error('Rate limit exceeded');
    }
  });
```

### Email Verification

Require verified emails before sending invites:

```javascript
function canSendInvite() {
  return isSignedIn() && 
    request.auth.token.email_verified == true;
}
```

### Workspace Quotas

Limit number of projects per workspace:

```javascript
function withinProjectLimit(workspaceId) {
  let workspace = get(/databases/$(database)/documents/workspaces/$(workspaceId));
  let projectCount = workspace.data.projectCount;
  return projectCount < 50; // Max 50 projects per workspace
}
```

---

## Common Pitfalls

### ❌ **Don't:**

1. **Allow unrestricted reads**
```javascript
// BAD - Anyone can read all projects
allow read: if true;
```

2. **Use client-side role checks only**
```javascript
// BAD - Client can lie about their role
allow write: if request.resource.data.role == 'admin';
```

3. **Forget to validate data types**
```javascript
// BAD - No validation of data structure
allow create: if isSignedIn();
```

### ✅ **Do:**

1. **Always check authentication**
```javascript
allow read: if isSignedIn();
```

2. **Validate data structure**
```javascript
allow create: if isSignedIn() &&
  request.resource.data.keys().hasAll(['name', 'status', 'createdAt']);
```

3. **Use helper functions**
```javascript
function isProjectMember(projectData) {
  return request.auth.uid in projectData.team.map(m => m.id);
}
```

---

## Monitoring Security

### Enable Firestore Audit Logs

1. Go to Cloud Console
2. Navigate to IAM & Admin > Audit Logs
3. Enable "Cloud Firestore API"
4. Select:
   - ✅ Admin Read
   - ✅ Data Read
   - ✅ Data Write

### Monitor Rule Violations

```javascript
// Set up Cloud Monitoring alert
// Alert when: Firestore Rule Evaluations > 1000 errors/hour
```

### Review Access Patterns

```bash
# Check Firestore metrics
gcloud logging read "resource.type=firestore_database" --limit 100
```

---

## Deployment Checklist

Before going to production:

- [ ] Security rules tested with emulator
- [ ] All test cases pass (positive and negative)
- [ ] Rate limiting implemented
- [ ] Email verification enabled
- [ ] Audit logs enabled
- [ ] Monitoring alerts set up
- [ ] Backup rules saved
- [ ] Documentation updated
- [ ] Team trained on security policies

---

## Resources

- 📚 [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- 🧪 [Rules Playground](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- 🎓 [Security Best Practices](https://firebase.google.com/docs/firestore/security/rules-conditions)
- 🔍 [Common Security Patterns](https://firebase.google.com/docs/firestore/security/rules-structure)

---

**Security First! 🔒**

*These rules provide a solid foundation for your collaboration system while maintaining data privacy and integrity.*

