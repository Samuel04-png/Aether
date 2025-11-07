# 🔥 Firebase Database Setup - CRITICAL FIX

## The Problem
Your Firebase project only has a custom database named `aetherdb`, but the Firebase Web SDK expects a default database named `(default)`. This is causing 400 errors and preventing data from being saved.

## ✅ Solution: Create Default Database

**You MUST create a default Firestore database in Firebase Console:**

### Step-by-Step Instructions:

1. **Go to Firebase Console:**
   - Open: https://console.firebase.google.com/project/aether-db171/firestore

2. **Create Default Database:**
   - If you see "Create database" button, click it
   - If you see your `aetherdb` database, look for a dropdown or option to create another database
   - Select **"Create database"** or **"Add database"**

3. **Configure the Database:**
   - **Database ID:** Leave as `(default)` (this is required!)
   - **Location:** Choose the same location as your `aetherdb` (e.g., `us-central1`)
   - **Security Rules:** Select **"Start in production mode"** (we already have rules deployed)
   - Click **"Enable"**

4. **Deploy Security Rules to Default Database:**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Update firebase.json (if needed):**
   The firebase.json should work for both databases, but make sure it doesn't specify a database name.

6. **Refresh Your App:**
   - Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
   - The 400 errors should stop
   - Data should now save correctly

## Why This Is Needed

- Firebase Web SDK **requires** a default database named `(default)`
- Custom databases like `aetherdb` are primarily for server-side SDKs
- You can have both databases in the same project
- The web app will automatically use the `(default)` database

## After Creating Default Database

Once you create the default database:
1. ✅ All 400 errors will stop
2. ✅ Data will save to Firestore
3. ✅ CRUD operations will work
4. ✅ Real-time listeners will work

## Verification

After creating the default database, check:
1. Firebase Console → Firestore → You should see TWO databases:
   - `(default)` ← This is what the web app uses
   - `aetherdb` ← Your existing database

2. In your browser console, you should see:
   - No more 400 errors
   - "Firebase initialized" log
   - Data appearing in Firestore when you create tasks/projects

## Important Notes

- The MongoDB connection string you saw is NOT for the web SDK
- The web SDK uses REST/WebSocket connections, not MongoDB protocol
- You must create the `(default)` database for the web app to work

---

**This is the ONLY way to fix the 400 errors and get data saving working!**

