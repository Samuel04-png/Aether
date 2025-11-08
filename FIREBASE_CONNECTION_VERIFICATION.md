# Firebase Connection Verification Guide

This guide helps you verify that your Firebase connection is properly configured and working.

## Prerequisites Checklist

Before testing the connection, ensure you have:

- ✅ Created a Firebase project
- ✅ Created a **(default)** Firestore database (required for web SDK)
- ✅ Enabled Authentication (Email/Password and Google providers)
- ✅ Enabled Firestore Database
- ✅ Enabled Storage
- ✅ Created a `.env` file with all Firebase configuration values
- ✅ Pasted Firestore security rules in Firebase Console

## Step 1: Verify Environment Variables

1. **Check if `.env` file exists** in the project root directory
2. **Verify all required variables are set**:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id (optional)
   ```

3. **Get these values from Firebase Console**:
   - Go to Firebase Console → Project Settings
   - Scroll to "Your apps" section
   - Click on your web app (or create one)
   - Copy the configuration values

## Step 2: Verify Firebase Services

### Authentication
1. Go to Firebase Console → **Authentication**
2. Check that **Email/Password** provider is enabled
3. Check that **Google** provider is enabled
4. Verify you can see the "Users" tab

### Firestore Database
1. Go to Firebase Console → **Firestore Database**
2. **IMPORTANT**: Verify you have a database named **(default)**
   - If you don't see "(default)", you need to create it
   - Click "Create database" and leave the name as "(default)"
   - Select the same location as your project
3. Go to the **Rules** tab
4. Verify your security rules are deployed (you should see the rules you pasted)
5. Check that rules are published (green checkmark or "Published" status)

### Storage
1. Go to Firebase Console → **Storage**
2. Verify Storage is enabled
3. Check the default bucket is created
4. Verify security rules are set (if needed)

## Step 3: Test the Connection

### 3.1 Start the Development Server

```bash
npm run dev
```

### 3.2 Check Browser Console

Open your browser's developer console (F12) and look for:

**✅ Success Messages:**
```
✅ Firebase configuration loaded: { projectId: "...", ... }
📝 Database: Using default Firestore database named "(default)"
```

**❌ Error Messages to Watch For:**
- `Missing Firebase environment variables` - Check your `.env` file
- `Permission denied` - Check Firestore security rules
- `400 Bad Request` - Default database may not exist
- `Firebase: Error (auth/...)` - Authentication configuration issue

### 3.3 Test Authentication

1. **Try to sign up/sign in**:
   - Go to the app login page
   - Try creating an account with email/password
   - Or try signing in with Google

2. **Check Firebase Console**:
   - Go to Authentication → Users
   - Verify your new user appears in the list

3. **Expected Result**: ✅ User should be created and you should be signed in

### 3.4 Test Firestore Write Operation

1. **Create a task** (or any data):
   - After signing in, navigate to Tasks
   - Click "Add Task" or similar
   - Fill in the form and submit

2. **Check Firebase Console**:
   - Go to Firestore Database → Data
   - Navigate to `users/{your-user-id}/tasks`
   - Verify your task was created

3. **Expected Result**: ✅ Task should appear in Firestore

### 3.5 Test Firestore Read Operation

1. **Refresh the page**:
   - Your tasks should load automatically
   - Check if data appears in the UI

2. **Check Browser Console**:
   - Look for any permission denied errors
   - Data should load without errors

3. **Expected Result**: ✅ Tasks should load from Firestore

### 3.6 Test Channels (if applicable)

1. **Create a channel**:
   - Navigate to Team Chat
   - Create a new channel
   - Add members

2. **Send a message**:
   - Select a channel
   - Send a message

3. **Check Firebase Console**:
   - Go to Firestore Database → Data
   - Check `channels/{channel-id}` collection
   - Check `channels/{channel-id}/messages` subcollection

4. **Expected Result**: ✅ Channel and messages should be created

### 3.7 Test Team Member Search (optional but recommended)

1. **Trigger directory entry creation**:
   - Have a teammate sign in, or send them an invite so they appear in `userDirectory`
   - Check Firestore → `userDirectory/{uid}` to confirm the document exists

2. **Search from the app**:
   - Open any team-member search or invite modal
   - Type the teammate’s name or email

3. **Expected Result**: ✅ The teammate appears in search results without permission errors

## Step 4: Troubleshooting Common Issues

### Issue: "Missing Firebase environment variables"

**Solution:**
1. Create a `.env` file in the project root (if it doesn't exist)
2. Copy all variables from `env.template`
3. Fill in the actual values from Firebase Console
4. Restart the development server

### Issue: "Permission denied" errors

**Possible Causes:**
1. **Security rules not deployed**: Go to Firebase Console → Firestore → Rules and publish the rules
2. **Wrong database selected**: Make sure you're using the **(default)** database
3. **User not authenticated**: Make sure you're signed in
4. **Rules don't allow the operation**: Check the rules match your data structure

**Solution:**
1. Verify rules are published in Firebase Console
2. Check browser console for specific permission errors
3. Verify user is authenticated (`auth.currentUser` should not be null)
4. Review security rules to ensure they allow the operation

### Issue: "400 Bad Request" errors

**Possible Causes:**
1. Default database doesn't exist
2. Wrong database name
3. Database not properly initialized

**Solution:**
1. Go to Firebase Console → Firestore Database
2. Create a database named **(default)** if it doesn't exist
3. Select the same location as your project
4. Wait for database creation to complete
5. Refresh your app

### Issue: Authentication not working

**Possible Causes:**
1. Authentication providers not enabled
2. Wrong domain in authorized domains
3. API key issues

**Solution:**
1. Go to Firebase Console → Authentication → Sign-in method
2. Verify Email/Password and Google are enabled
3. Check Authorized domains include your domain
4. Verify API key is correct in `.env` file

### Issue: Data not saving

**Possible Causes:**
1. Security rules blocking writes
2. User not authenticated
3. Wrong collection path
4. Missing required fields

**Solution:**
1. Check browser console for specific errors
2. Verify user is authenticated
3. Check Firestore security rules allow the operation
4. Verify data structure matches what the code expects

## Step 5: Verify Security Rules

### Test Rules in Firebase Console

1. Go to Firebase Console → Firestore Database → Rules
2. Click on "Rules Playground" (if available)
3. Test different scenarios:
   - Read own user data
   - Write to own tasks
   - Read channels you're a member of
   - Create project invites

### Expected Rules Behavior

- ✅ Users can read/write their own data
- ✅ Users cannot read/write other users' data
- ✅ Channel members can read/send messages
- ✅ Non-members cannot access channels
- ✅ Project invite participants can read invites
- ✅ Only inviter can delete invites

## Step 6: Final Verification

### Complete Checklist

- [ ] `.env` file exists with all required variables
- [ ] Firebase project created and selected
- [ ] **(default)** Firestore database created
- [ ] Security rules deployed and published
- [ ] Authentication enabled (Email/Password, Google)
- [ ] Storage enabled
- [ ] Development server starts without errors
- [ ] Browser console shows Firebase initialization success
- [ ] Can sign up/sign in successfully
- [ ] Can create data (tasks, projects, etc.)
- [ ] Can read data (tasks load on page refresh)
- [ ] Can update data (edit tasks, etc.)
- [ ] Can delete data (delete tasks, etc.)
- [ ] Channels and messages work (if applicable)
- [ ] Project invites work (if applicable)

## Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## Getting Help

If you're still experiencing issues:

1. Check the browser console for specific error messages
2. Check Firebase Console for any service status issues
3. Verify all environment variables are correct
4. Verify security rules are properly deployed
5. Check that you're using the **(default)** database

## Success Indicators

You'll know everything is working when:

- ✅ No errors in browser console
- ✅ Can sign in/out successfully
- ✅ Can create, read, update, and delete data
- ✅ Data persists after page refresh
- ✅ Real-time updates work (if applicable)
- ✅ No permission denied errors

