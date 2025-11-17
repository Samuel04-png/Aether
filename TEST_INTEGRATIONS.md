# Integration Testing Guide

## How to Test Each Integration

### 🔴 CRITICAL: Deploy Firestore Rules First!

Before testing anything, you **MUST** deploy the updated Firestore rules:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Or via Firebase Console:
1. Go to: https://console.firebase.google.com/project/aether-db171/firestore/rules
2. Copy content from `firestore.rules` file
3. Click "Publish"

**Without this step, you'll get "Permission Denied" errors!**

---

## ✅ 1. Slack Integration Test

### Location:
**Settings > Integrations > Slack Card**

### How to Test:

**Step 1: Navigate**
```
1. Sign in to Aether
2. Click "Settings" in sidebar
3. Click "Integrations" tab
4. Find "Slack" card
```

**Step 2: Test Connection**
```
1. If not connected, click "Connect"
2. You'll be redirected to Slack
3. Authorize the app
4. You'll be redirected back to Aether
5. Should show "Connected" badge
```

**Step 3: Test Functionality**
```
1. Click "Test" button
2. Should show "Connection Test Successful" toast
3. Your Slack workspace name should display
```

**Expected Results:**
- ✅ "Connected" badge shows
- ✅ Team name displays (e.g., "Connected to Your Workspace")
- ✅ Test button works
- ✅ Can disconnect and reconnect

**Known Issues:**
- If redirect URI doesn't match, you'll see an error
- Your production URI is set to: `https://aether-rho-woad.vercel.app/integrations/slack/callback`
- For local testing, add: `http://localhost:5173/integrations/slack/callback` to your Slack app

---

## ✅ 2. HubSpot Integration Test

### Location:
**Settings > Integrations > HubSpot Card**

### How to Test:

**Step 1: Test Connection**
```
1. Go to Settings > Integrations
2. Find "HubSpot" card
3. Click "Test" button
4. Should show "HubSpot Connected" toast
```

**Step 2: Import Contacts**
```
1. Click "Import Contacts" button
2. Wait for import (may take 10-30 seconds)
3. Should show "Import Successful" toast
4. Message will say: "Imported X of Y contacts from HubSpot"
```

**Step 3: Verify Import**
```
1. Navigate to "Leads" page
2. Look for leads with Source = "HubSpot"
3. Check that contact data is properly mapped:
   - Name (from firstname + lastname)
   - Email
   - Company
   - Phone (if available)
   - Status (mapped from lifecycle stage)
```

**Expected Results:**
- ✅ "Connected" badge shows on HubSpot card
- ✅ Import completes successfully
- ✅ Contacts appear in Leads page
- ✅ Data is properly mapped

**What Gets Imported:**
- ✅ Contacts with email addresses
- ❌ Contacts without email (skipped)
- ✅ Up to 100 contacts per import
- ✅ Lifecycle stages mapped to lead statuses

---

## ✅ 3. AI Meeting Notes Test

### Location:
**Sidebar > "Meeting Notes" (new menu item)**

### How to Test:

**Step 1: Navigate**
```
1. Look in sidebar for "Meeting Notes" menu item
2. Click it to open the Meeting Notes page
```

**Step 2: Upload Recording**
```
1. Click "Upload Recording" button
2. Fill in meeting details:
   - Title: "Q4 Planning Meeting"
   - Date: Today's date
   - Attendees: "John, Sarah, Mike"
   - Duration: "45 min"
3. Click "Click to upload audio"
4. Select an audio file (MP3, WAV, M4A, OGG)
5. Click "Generate Notes"
```

**Step 3: View Generated Notes**
```
1. Wait for processing (10-30 seconds)
2. Should show success toast
3. Meeting card appears on page
4. Click the card to view details
```

**Step 4: Test Features**
```
1. View AI-generated summary
2. Check key points
3. See action items
4. View full transcription
5. Click "Create Tasks" to convert action items to tasks
```

**Expected Results:**
- ✅ Upload modal opens
- ✅ File validation works (rejects non-audio files)
- ✅ AI processing completes
- ✅ Summary, key points, and action items generated
- ✅ Can create tasks from action items

**Note:** Currently uses mock transcription. For production:
- Integrate OpenAI Whisper API
- Or Google Speech-to-Text
- Or AssemblyAI
- Current implementation shows how it will work

---

## ✅ 4. CSV Lead Import Test

### Location:
**Leads Page > Add Lead > Upload CSV**

### How to Test:

**Step 1: Get Template**
```
1. Navigate to "Leads" page
2. Click "Add Lead" button (+ icon)
3. Choose "Upload CSV"
4. Click "Download Template"
5. Template CSV file downloads
```

**Step 2: Prepare Data**
```
1. Open template in Excel or text editor
2. Add your lead data:
   name,company,email,phone,source,status
   John Doe,Acme Corp,john@acme.com,555-0100,Website,New
   Jane Smith,TechStart,jane@tech.io,555-0101,Referral,Contacted
```

**Step 3: Upload CSV**
```
1. Click "Click to upload CSV"
2. Select your CSV file
3. Wait for validation
4. Review validation results:
   - Valid leads count (green)
   - Invalid leads count (red)
   - Click "View errors" to see specific issues
```

**Step 4: Import**
```
1. If validation passes, click "Import X Lead(s)" button
2. Wait for import
3. Should show "Import Successful" toast
4. Page refreshes with new leads
```

**Expected Results:**
- ✅ Template downloads correctly
- ✅ Validation shows real-time results
- ✅ Invalid rows show specific errors
- ✅ Valid leads import successfully
- ✅ Imported leads appear in list

---

## ✅ 5. AI Copilot CRUD Test

### Location:
**AI Copilot (Click sparkles icon in top-right)**

### How to Test:

**Test 1: Create Task**
```
User: "Create a task to follow up with John tomorrow"
AI: "I'll create a task to follow up with John, due tomorrow. Should I proceed?"
User: "Yes"
AI: "✓ Task created successfully!"

Verify: Go to Tasks page, check for new task
```

**Test 2: Update Task**
```
User: "Mark the website redesign task as complete"
AI: "I'll mark the website redesign as done. Confirm?"
User: "Yes"
AI: "✓ Task updated successfully!"

Verify: Check Tasks page for status update
```

**Test 3: Create Lead**
```
User: "Add a lead named Sarah from TechCorp, email sarah@techcorp.com"
AI: "I'll create a lead for Sarah at TechCorp. Proceed?"
User: "Yes"
AI: "✓ Lead 'Sarah' created successfully!"

Verify: Go to Leads page, check for new lead
```

**Test 4: Delete with Confirmation**
```
User: "Delete that old task"
AI: "Are you sure you want to delete this task? This cannot be undone."
User: "Yes"
AI: "✓ Task deleted successfully!"
```

**Expected Results:**
- ✅ AI understands natural language commands
- ✅ Always asks for confirmation
- ✅ Shows success/error messages
- ✅ Changes reflected in database
- ✅ Can see updates on respective pages

---

## 🚫 Common Issues & Solutions

### Issue: "Permission Denied" in Console

**Cause:** Firestore rules not deployed

**Solution:**
```bash
firebase deploy --only firestore:rules
```

### Issue: "API key not configured"

**Cause:** Missing DeepSeek API key

**Solution:**
Check `.env` has:
```bash
VITE_DEEPSEEK_API_KEY=sk-de23790b0e094caab0424723dfa236ef
```

Restart dev server: `npm run dev`

### Issue: Slack OAuth Redirect Fails

**Cause:** Redirect URI mismatch

**Solution:**
In Slack app settings, add both:
- `http://localhost:5173/integrations/slack/callback` (local)
- `https://aether-rho-woad.vercel.app/integrations/slack/callback` (production)

### Issue: HubSpot Import Shows 0 Contacts

**Causes:**
1. No contacts in your HubSpot account
2. API key doesn't have read permissions
3. All contacts missing email addresses

**Solution:**
- Check HubSpot account has contacts
- Verify API key permissions
- Console will show "Skipped contact: No email address" for invalid ones

### Issue: AI Meeting Notes Not Showing

**Cause:** Not added to navigation yet

**Solution:** I'm adding it now! Should appear in sidebar as "Meeting Notes"

---

## Verification Checklist

After deploying Firestore rules, test each feature:

### Slack Integration:
- [ ] Navigate to Settings > Integrations
- [ ] See Slack card with status
- [ ] Click Test button works
- [ ] Can connect/disconnect

### HubSpot Integration:
- [ ] Navigate to Settings > Integrations
- [ ] See HubSpot card showing "Connected"
- [ ] Click Test button shows success
- [ ] Click Import Contacts imports data
- [ ] Leads appear in Leads page

### Meeting Notes:
- [ ] See "Meeting Notes" in sidebar
- [ ] Click to navigate to page
- [ ] Click "Upload Recording" opens modal
- [ ] Can upload audio file
- [ ] AI processes and generates notes
- [ ] Can view meeting details

### CSV Import:
- [ ] Go to Leads > Add Lead
- [ ] Choose "Upload CSV"
- [ ] Download template works
- [ ] Upload validates correctly
- [ ] Import saves to database

### AI CRUD:
- [ ] Open AI Copilot
- [ ] Try creating a task
- [ ] AI asks for confirmation
- [ ] Task appears in Tasks page
- [ ] Try other commands (update, delete, create lead)

---

## Debug Mode

Add this to browser console for detailed logs:

```javascript
// Enable debug mode
localStorage.setItem('debug', 'true');

// Reload page
location.reload();

// Now all hooks and services will log detailed info
```

---

## Quick Integration Status Check

Run this in browser console after signing in:

```javascript
// Check environment
console.log('Environment:', {
  hasFirebase: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasDeepSeek: !!import.meta.env.VITE_DEEPSEEK_API_KEY,
  hasSlack: !!import.meta.env.VITE_SLACK_CLIENT_ID,
  hasHubSpot: !!import.meta.env.VITE_HUBSPOT_API_KEY,
});

// Check Firebase connection
firebase.auth().currentUser 
  ? console.log('✅ Authenticated:', firebase.auth().currentUser.email)
  : console.log('❌ Not authenticated');

// Check Firestore access
firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
  .then(() => console.log('✅ Firestore: Can read'))
  .catch(err => console.error('❌ Firestore error:', err.code));
```

---

## Expected Behavior

### First Time User:
1. See landing page
2. Sign up
3. Complete onboarding
4. See demo data dialog
5. Dashboard loads with sample data

### Returning User:
1. Auto-login
2. Skip landing/onboarding
3. Dashboard loads immediately
4. All pages work

### Navigation:
- Click sidebar items → Pages load instantly
- Data loads in background
- Skeletons show while loading
- No white screens or freezes

---

## Success Indicators

When everything works, you should see:

- ✅ All sidebar menu items are clickable
- ✅ Pages load within 1-2 seconds
- ✅ Data displays correctly (or empty state if no data)
- ✅ No red errors in console
- ✅ Integrations show status (Connected/Not Connected)
- ✅ Can perform actions (create task, add lead, etc.)
- ✅ Toasts show for feedback
- ✅ Mobile view works on small screens

---

## Next Steps

I'm now adding Meeting Notes to the sidebar navigation so you can access it easily!

After that, test the checklist above to verify all integrations work.

