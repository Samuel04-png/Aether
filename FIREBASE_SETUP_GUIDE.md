# Firebase Setup Guide - Step by Step

## ✅ Step 1: Create New Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `aether-app` (or your preferred name)
4. Click **"Continue"**
5. **Disable Google Analytics** (optional, or enable if you want it)
6. Click **"Create project"**
7. Wait for project creation, then click **"Continue"**

---

## ✅ Step 2: Enable Firebase Services

### A. Authentication
1. In Firebase Console, go to **Build** → **Authentication**
2. Click **"Get started"**
3. Enable these sign-in providers:
   - **Email/Password**: Click → Enable → Save
   - **Google**: Click → Enable → Add support email → Save

### B. Firestore Database
1. Go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll deploy proper rules later)
4. Choose a location (e.g., `us-central1` or closest to you)
5. Click **"Enable"**

### C. Storage
1. Go to **Build** → **Storage**
2. Click **"Get started"**
3. Select **"Start in test mode"**
4. Use the same location as Firestore
5. Click **"Done"**

### D. Hosting (Optional - Requires Blaze Plan)
1. Go to **Build** → **Hosting**
2. Click **"Get started"**
3. Follow the setup wizard (or skip for now)

---

## ✅ Step 3: Get Firebase Configuration

1. In Firebase Console, click the **⚙️ gear icon** → **Project settings**
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`)
4. Register your app:
   - **App nickname**: `Aether Web App`
   - **Firebase Hosting**: Not set up (or set up if using hosting)
   - Click **"Register app"**
5. **Copy the config object** - it will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};
```

6. **Copy these values** - you'll need them for the `.env` file

---

## ✅ Step 4: Update .env File

1. Open the `.env` file in the project root
2. Replace the placeholder values with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=AIza... (from config)
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. Save the file

---

## ✅ Step 5: Initialize Firebase CLI

After you've created the project and updated the `.env` file, run:

```bash
firebase init
```

**During initialization, select:**
- ✅ **Use an existing project** → Select your new project
- ✅ **Firestore**: Configure security rules and indexes files
- ✅ **Hosting**: Configure files for Firebase Hosting (optional)
- Firestore rules file: `firestore.rules` (already exists - select **No** to keep existing)
- Firestore indexes file: `firestore.indexes.json` (already exists - select **No** to keep existing)
- Public directory: `dist` (for Vite builds)
- Single-page app: **Yes**
- Set up automatic builds: **No** (or Yes if using GitHub)

---

## ✅ Step 6: Deploy Security Rules

After initialization, deploy the security rules:

```bash
firebase deploy --only firestore:rules
```

---

## ✅ Step 7: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Try creating an account
3. Check Firebase Console:
   - **Authentication** → **Users** (should show new users)
   - **Firestore Database** → **Data** (should show user documents)

---

## ✅ Step 8: Deploy to Firebase Hosting (Optional)

If you enabled hosting and billing:

1. Build your app:
   ```bash
   npm run build
   ```

2. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

Your app will be live at: `https://your-project-id.web.app`

---

## 🎉 Done!

Your Firebase setup is complete. All data will now persist in Firebase for each user.

