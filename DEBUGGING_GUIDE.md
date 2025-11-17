# Debugging Guide - Pages Not Loading

## Quick Checks

### 1. Check Browser Console
Open browser DevTools (F12) and look for errors in the Console tab.

**Common errors:**
- `Failed to fetch` - Firebase/API connection issues
- `Module not found` - Missing dependencies
- `undefined is not a function` - Missing API key or service
- Red errors in console - Component rendering errors

### 2. Check Network Tab
Look at the Network tab in DevTools:
- Are Firebase requests succeeding?
- Any failed API calls?
- Look for 401/403/500 errors

### 3. Check Current State
Add this to your browser console to see current state:

```javascript
// Check if user is logged in
console.log('User:', firebase.auth().currentUser);

// Check current view
console.log('Active View:', 'check App component state');

// Check Firebase connection
firebase.firestore().collection('users').limit(1).get()
  .then(() => console.log('✅ Firestore connected'))
  .catch(err => console.error('❌ Firestore error:', err));
```

---

## Common Issues & Fixes

### Issue 1: White Screen / Nothing Renders

**Symptoms:** Blank page, no errors

**Causes:**
1. JavaScript error in component
2. Missing environment variables  
3. Firebase not initialized

**Fix:**
```bash
# 1. Check .env file exists and has all keys
ls -la .env

# 2. Restart dev server
npm run dev

# 3. Clear browser cache (Ctrl+Shift+Del)
# 4. Hard reload (Ctrl+F5)
```

---

### Issue 2: "Loading..." Never Ends

**Symptoms:** Spinner/skeleton loads forever

**Causes:**
1. Firebase query never resolves
2. Hook waiting for data that never comes
3. Network issue

**Fix:**
```javascript
// Check if Firestore rules are blocking reads
// In browser console:
firebase.firestore().collection('users').doc(userId).get()
  .then(doc => console.log('✅ Can read:', doc.data()))
  .catch(err => console.error('❌ Blocked:', err));
```

**Deploy Firestore rules:**
```bash
firebase deploy --only firestore:rules
```

---

### Issue 3: Specific Pages Don't Load

**Symptoms:** Dashboard works, but Settings/Tasks/etc. don't

**Causes:**
1. Component-specific error
2. Missing data/hooks
3. Import error

**Fix:**
Open browser console and check for errors when navigating to that page.

**Check each page:**
- Dashboard: Needs Firebase + dashboard data
- Tasks: Needs tasks collection
- Projects: Needs projects collection
- Leads: Needs leads collection
- Team Chat: Needs channels collection
- Settings: Needs user profile
- Insights: Needs DeepSeek API key (optional)

---

### Issue 4: "Permission Denied" Errors

**Symptoms:** Console shows Firestore permission errors

**Cause:** Firestore security rules not deployed

**Fix:**
```bash
# Deploy updated rules
firebase deploy --only firestore:rules,firestore:indexes

# Or via Firebase Console:
# 1. Go to: https://console.firebase.google.com/project/aether-db171/firestore/rules
# 2. Copy content from firestore.rules
# 3. Click "Publish"
```

---

### Issue 5: Components Load But No Data

**Symptoms:** Pages load but show "No data" or empty states

**Cause:** No data in collections yet

**Fix:** This is normal for new users! The app will show empty states until you:
1. Create tasks
2. Add projects
3. Import/add leads
4. The demo data seeder should populate some data automatically

---

## Step-by-Step Debugging

### Step 1: Verify Environment
```bash
# Check .env file
cat .env

# Should have:
# ✅ VITE_FIREBASE_* (all Firebase config)
# ✅ VITE_DEEPSEEK_API_KEY
# ✅ VITE_SLACK_* (optional)
# ✅ VITE_HUBSPOT_API_KEY (optional)
```

### Step 2: Test Firebase Connection
Add this to `App.tsx` temporarily (line 100):

```typescript
useEffect(() => {
  console.log('🔍 Debug Info:', {
    user: user?.uid,
    profile: profile?.businessName,
    loading: { initializing, profileLoading }
  });
}, [user, profile, initializing, profileLoading]);
```

### Step 3: Check Individual Components
Test each lazy-loaded component:

```typescript
// In App.tsx, temporarily replace lazy loading with direct imports
import Dashboard from './components/Dashboard';
import TeamChat from './components/TeamChat';
// ... etc

// Comment out the lazy() calls
// const Dashboard = lazy(() => import('./components/Dashboard'));
```

### Step 4: Verify Data Flow
Check if hooks are returning data:

```typescript
// In Dashboard.tsx, add at line 40:
console.log('📊 Dashboard Data:', {
  kpis: kpis.length,
  tasks: tasks.length,
  projects: projects.length,
  leads: leads.length,
  loading
});
```

---

## Firebase-Specific Checks

### Check Firestore Rules Are Deployed
1. Go to: https://console.firebase.google.com/project/aether-db171/firestore/rules
2. Verify rules include new collections:
   - `/slackIntegrations/{userId}`
   - `/meetingNotes/{meetingId}`
   - `/leads/{leadId}`
   - `/tasks/{taskId}`

### Check Firestore Indexes
1. Go to: https://console.firebase.google.com/project/aether-db171/firestore/indexes
2. Should have indexes for:
   - meetingNotes (userId, date)
   - leads (userId, createdAt)
   - leads (userId, status)
   - tasks (userId, status)
   - tasks (assignedTo, dueDate)

### Test Individual Collections
In browser console:

```javascript
const db = firebase.firestore();
const userId = firebase.auth().currentUser.uid;

// Test each collection
db.collection('users').doc(userId).collection('tasks').get()
  .then(snap => console.log('✅ Tasks:', snap.size));

db.collection('users').doc(userId).collection('projects').get()
  .then(snap => console.log('✅ Projects:', snap.size));

db.collection('users').doc(userId).collection('leads').get()
  .then(snap => console.log('✅ Leads:', snap.size));

db.collection('channels').where('members', 'array-contains', userId).get()
  .then(snap => console.log('✅ Channels:', snap.size));
```

---

## Performance Debugging

### Check Bundle Size
```bash
npm run build
# Look for large chunks that might be slow to load
```

### Check Network Speed
In DevTools Network tab:
- Slow 3G simulation - app should still work
- Check which resources are large
- Firebase data should load quickly (<1s)

---

## Emergency Reset

If nothing works, try a clean restart:

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clear node modules
rm -rf node_modules
rm package-lock.json

# 3. Clear browser data
# Chrome: Ctrl+Shift+Del, select "Cached images and files"

# 4. Reinstall
npm install

# 5. Restart
npm run dev

# 6. Hard reload browser (Ctrl+F5)
```

---

## Getting Detailed Logs

### Enable Verbose Logging

Add to top of `App.tsx`:

```typescript
// Debug mode
if (import.meta.env.DEV) {
  window.DEBUG = true;
  console.log('🚀 Aether Debug Mode Enabled');
}
```

Add to hooks to see what's happening:

```typescript
useEffect(() => {
  if (window.DEBUG) {
    console.log('[useDashboard] Loading:', loading, 'Data:', { kpis, monthlySales });
  }
}, [loading, kpis, monthlySales]);
```

---

## Still Having Issues?

### Collect This Information:

1. **Browser Console Output** (screenshot or copy/paste)
2. **Network Tab** (any failed requests?)
3. **Current page/view** that's not loading
4. **Steps to reproduce** the issue
5. **Environment:**
   - Browser & version
   - Node version (`node --version`)
   - Any error messages

### Quick Test Checklist:

- [ ] `.env` file exists with all keys
- [ ] `npm install` completed without errors
- [ ] Dev server starts (`npm run dev`)
- [ ] Can access http://localhost:5173
- [ ] Can sign in (Firebase Auth works)
- [ ] Browser console shows no red errors
- [ ] Firestore rules deployed
- [ ] Network tab shows successful Firebase requests

---

## Common Solutions Summary

| Problem | Solution |
|---------|----------|
| White screen | Check console for errors, verify .env |
| Forever loading | Deploy Firestore rules, check Firebase |
| Permission denied | Deploy firestore.rules |
| No data showing | Normal for new users, add some data |
| Page not found | Check view routing in App.tsx |
| API errors | Check API keys in .env |
| Can't sign in | Check Firebase config |

---

## Next Steps

If pages still don't load after trying these steps:

1. Check browser console and share any errors
2. Verify Firebase connection works
3. Try with a fresh browser session/incognito mode
4. Check that Firestore rules are deployed
5. Ensure all environment variables are set

The app is fully functional - these debugging steps will help identify where the issue is!

