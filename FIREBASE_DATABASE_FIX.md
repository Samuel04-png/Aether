# Firebase Database Fix Required

## Problem
Your Firebase project only has a custom database named `aetherdb`, but the Firebase Web SDK expects a default database named `(default)`. This is causing 400 errors when trying to read/write data.

## Solution: Create Default Database

You need to create a default Firestore database in your Firebase Console:

### Steps:
1. Go to https://console.firebase.google.com/project/aether-db171/firestore
2. If you see a message about creating a database, click **"Create database"**
3. Select **"Start in production mode"** (we already have security rules deployed)
4. Choose a location (same as your `aetherdb` database location, e.g., `us-central1`)
5. Click **"Enable"**

### Alternative: Use the Custom Database

If you want to keep using `aetherdb`, you need to:
1. Make sure your Firebase SDK version supports custom database names (v9.0.0+)
2. The code is already configured to try using `aetherdb` as a fallback

However, **the recommended approach is to create a default database** as the web SDK works best with it.

## After Creating Default Database

Once you create the default database:
1. Refresh your browser
2. The errors should stop
3. Data will start saving to Firestore

## Note

You can have both databases (`aetherdb` and `(default)`) in the same project. The web app will use `(default)` by default.

