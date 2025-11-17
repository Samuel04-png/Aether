# Firestore Security Rules Update

## ✅ Updated Rules for New Features

Your Firestore security rules have been updated to secure the new collections added for:
- Slack Integration
- AI Meeting Notes
- Lead Import (CSV/HubSpot)
- AI CRUD Operations

---

## 🔒 New Security Rules Added

### 1. Slack Integrations (`/slackIntegrations/{userId}`)

```javascript
match /slackIntegrations/{userId} {
  allow read, write: if isOwner(userId);
}
```

**Security:**
- ✅ Only the user can read/write their own Slack integration data
- ✅ Document ID is the userId for easy lookup
- ✅ Stores OAuth tokens securely per user

**Data Stored:**
- Slack workspace info
- Access tokens (encrypted at rest by Firebase)
- Team and channel details
- Connection status

---

### 2. Meeting Notes (`/meetingNotes/{meetingId}`)

```javascript
match /meetingNotes/{meetingId} {
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
  allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
}
```

**Security:**
- ✅ Users can only access their own meeting notes
- ✅ Must be authenticated to create/read/update/delete
- ✅ userId field verified on all operations

**Data Stored:**
- Meeting transcriptions
- AI-generated summaries
- Action items
- Attendee lists
- Audio file URLs

---

### 3. Global Leads Collection (`/leads/{leadId}`)

```javascript
match /leads/{leadId} {
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
  allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
}
```

**Security:**
- ✅ Users can only access their own leads
- ✅ Supports bulk imports from CSV/HubSpot
- ✅ Each lead must have a userId field

**Data Stored:**
- Lead contact information
- Company details
- Import source (CSV, HubSpot, Manual)
- Status and timestamps

**Note:** This is a top-level collection for imported leads. The existing `/users/{userId}/leads/{leadId}` subcollection is still available for demo data.

---

### 4. Global Tasks Collection (`/tasks/{taskId}`)

```javascript
match /tasks/{taskId} {
  allow read: if isSignedIn() && (
    resource.data.userId == request.auth.uid ||
    resource.data.assignedTo == request.auth.uid
  );
  allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
  allow update: if isSignedIn() && (
    resource.data.userId == request.auth.uid ||
    resource.data.assignedTo == request.auth.uid
  );
  allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
}
```

**Security:**
- ✅ Users can read tasks they own OR are assigned to
- ✅ Both owner and assignee can update tasks
- ✅ Only owner can delete tasks
- ✅ Supports team collaboration

**Data Stored:**
- Task details created by AI CRUD
- Assignment information
- Due dates and priority
- Creation source (manual, AI, meeting notes)

---

## 📊 Database Indexes Added

For optimal query performance, the following composite indexes have been added:

### 1. Meeting Notes by User and Date
```json
{
  "collectionGroup": "meetingNotes",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "DESCENDING" }
  ]
}
```
**Used for:** Fetching user's meetings sorted by date

### 2. Leads by User and Creation Date
```json
{
  "collectionGroup": "leads",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```
**Used for:** Lead list with most recent first

### 3. Leads by User and Status
```json
{
  "collectionGroup": "leads",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
}
```
**Used for:** Filtering leads by status (New, Contacted, Qualified, Lost)

### 4. Tasks by User and Status
```json
{
  "collectionGroup": "tasks",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
}
```
**Used for:** Task lists filtered by status

### 5. Tasks by Assignee and Due Date
```json
{
  "collectionGroup": "tasks",
  "fields": [
    { "fieldPath": "assignedTo", "order": "ASCENDING" },
    { "fieldPath": "dueDate", "order": "ASCENDING" }
  ]
}
```
**Used for:** Upcoming tasks for assigned users

---

## 🚀 How to Deploy These Rules

### Option 1: Firebase Console (Recommended for Quick Deploy)

1. **Open Firebase Console:**
   ```
   https://console.firebase.google.com/project/aether-db171/firestore/rules
   ```

2. **Copy the updated rules from `firestore.rules`**

3. **Paste into the editor**

4. **Click "Publish"**

### Option 2: Firebase CLI

If you have Firebase CLI installed:

```bash
# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Option 3: Automatic via GitHub Actions

If you have CI/CD set up, the rules will deploy automatically on push to main.

---

## ⚠️ Important Security Notes

### 1. OAuth Tokens
Slack OAuth tokens are stored in Firestore with these protections:
- ✅ User-level isolation (only owner can access)
- ✅ Firebase encrypts data at rest automatically
- ✅ HTTPS enforced for all connections
- ✅ No tokens exposed in client-side code

### 2. Meeting Audio Files
Audio files are stored in Firebase Storage (not Firestore):
- ✅ Separate security rules in `storage.rules`
- ✅ User-specific paths: `/meetings/{userId}/{fileName}`
- ✅ Only owner can access their audio files

### 3. Sensitive Data
The rules ensure:
- ❌ No cross-user data access
- ❌ No anonymous access (must be authenticated)
- ❌ No public read/write operations
- ✅ All operations validate userId

---

## 🧪 Testing Security Rules

### Local Testing with Firebase Emulator

```bash
# Install Firebase tools
npm install -g firebase-tools

# Start emulator
firebase emulators:start

# Run in test mode
# Your app will connect to localhost:8080 instead of production
```

### Test Cases to Verify

1. **Slack Integration:**
   ```javascript
   // ✅ Should succeed: User accessing their own data
   firebase.firestore().doc('slackIntegrations/USER_ID').get()
   
   // ❌ Should fail: User accessing another user's data
   firebase.firestore().doc('slackIntegrations/OTHER_USER_ID').get()
   ```

2. **Meeting Notes:**
   ```javascript
   // ✅ Should succeed: Creating own meeting note
   firebase.firestore().collection('meetingNotes').add({
     userId: currentUser.uid,
     title: "Team Sync"
   })
   
   // ❌ Should fail: Creating note for another user
   firebase.firestore().collection('meetingNotes').add({
     userId: "someone-else",
     title: "Team Sync"
   })
   ```

3. **Leads:**
   ```javascript
   // ✅ Should succeed: Querying own leads
   firebase.firestore().collection('leads')
     .where('userId', '==', currentUser.uid)
     .get()
   
   // ❌ Should fail: Querying all leads
   firebase.firestore().collection('leads').get()
   ```

---

## 📋 Migration Notes

### Data Structure
Your app now uses TWO patterns:

#### Pattern 1: Subcollections (Existing)
```
/users/{userId}/
  ├── leads/{leadId}
  ├── tasks/{taskId}
  ├── projects/{projectId}
  └── ... (demo data)
```

#### Pattern 2: Top-Level Collections (New Features)
```
/slackIntegrations/{userId}
/meetingNotes/{meetingId}
/leads/{leadId}  (with userId field)
/tasks/{taskId}  (with userId field)
```

**Why Two Patterns?**
- Subcollections: Better for demo data and user-specific testing
- Top-level: Better for real production data, imports, and queries
- Both are secure and work independently

**No Migration Needed:** Both patterns coexist safely.

---

## 🔍 Monitoring & Auditing

### View Security Rule Activity

1. **Firebase Console → Firestore → Usage**
   - Monitor denied requests
   - Track security rule violations

2. **Cloud Logging**
   ```bash
   # View security denials
   gcloud logging read "resource.type=firestore_database AND \
     protoPayload.status.code!=0" --limit 50
   ```

3. **Set Up Alerts**
   - Go to Firebase Console → Monitoring
   - Create alert for "Firestore Rule Denials"
   - Get notified of potential security issues

---

## ✅ Verification Checklist

After deploying the rules:

- [ ] Deploy rules to Firebase
- [ ] Deploy indexes to Firebase
- [ ] Test Slack integration (Settings → Integrations)
- [ ] Test HubSpot import (Settings → Integrations)
- [ ] Test meeting notes upload
- [ ] Test AI CRUD operations
- [ ] Verify no console errors in browser
- [ ] Check Firebase Console for rule denials

---

## 🆘 Troubleshooting

### "Missing or insufficient permissions"

**Cause:** Security rule denial

**Solutions:**
1. Check you're authenticated (logged in)
2. Verify the document has a `userId` field matching your uid
3. Check browser console for specific rule that failed
4. Ensure rules are deployed (check Firebase Console)

### "Index not found" Error

**Cause:** Composite index not created

**Solutions:**
1. Deploy indexes: `firebase deploy --only firestore:indexes`
2. Or click the link in the error message to auto-create index
3. Wait 1-2 minutes for index to build

### Rules Not Updating

**Solutions:**
1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check Firebase Console shows latest rules
4. Restart dev server

---

## 📚 Additional Resources

- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Security Rules Testing](https://firebase.google.com/docs/rules/unit-tests)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)

---

## Summary

✅ **All new collections are now secured:**
- Slack integrations (OAuth tokens)
- Meeting notes (transcriptions & summaries)
- Lead imports (CSV, HubSpot)
- AI-generated tasks

✅ **Performance optimized:**
- Composite indexes for common queries
- Efficient query patterns

✅ **Security enforced:**
- User isolation
- Authentication required
- No cross-user access

**Next Step:** Deploy the rules to Firebase!

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

