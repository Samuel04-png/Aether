# API Keys and Configuration Guide

This guide explains which API keys you need to configure for Aether's features to work properly.

## Required API Keys

### 1. Firebase (Required for Core Functionality)
**Status:** ✅ Already configured in your project

Firebase handles authentication, database, and storage. Your credentials are already set up in the `.env` file.

### 2. DeepSeek AI API (Required for AI Features)
**Status:** ⚠️ Needs Configuration

**What it's used for:**
- AI Copilot chat and insights
- Meeting notes transcription and summarization
- Lead message generation
- Website audit analysis
- Task extraction from text
- AI-powered CRUD operations

**How to get it:**
1. Visit https://platform.deepseek.com
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

**How to configure:**
```bash
VITE_DEEPSEEK_API_KEY=sk-your-actual-api-key-here
```

**Pricing:**
- DeepSeek offers competitive pricing
- Pay-per-use model
- Free tier available for testing

---

## Optional API Keys (For Enhanced Features)

### 3. Slack Integration (Optional)
**Status:** ⚠️ Needs Configuration

**What it's used for:**
- Send notifications to Slack channels
- Receive Aether updates in Slack
- Two-way communication between Aether and Slack

**How to get it:**
1. Visit https://api.slack.com/apps
2. Click "Create New App" > "From scratch"
3. Name your app (e.g., "Aether Bot") and select your workspace
4. Go to "OAuth & Permissions"
5. Add the following Bot Token Scopes:
   - `channels:read`
   - `channels:write`
   - `chat:write`
   - `users:read`
   - `team:read`
   - `incoming-webhook`
6. Add Redirect URL: `http://localhost:5173/integrations/slack/callback` (update for production)
7. Install app to workspace
8. Copy the Client ID and Client Secret from "Basic Information"

**How to configure:**
```bash
VITE_SLACK_CLIENT_ID=your-slack-client-id
VITE_SLACK_CLIENT_SECRET=your-slack-client-secret
VITE_SLACK_REDIRECT_URI=http://localhost:5173/integrations/slack/callback
```

**Note:** Update the redirect URI for production deployment.

---

### 4. HubSpot Integration (Optional)
**Status:** Not yet configured

**What it's used for:**
- Import contacts from HubSpot CRM
- Sync lead data between Aether and HubSpot

**How to get it:**
1. Visit https://developers.hubspot.com/
2. Create a developer account
3. Create a new app
4. Get your API key from the app settings

**How to configure:**
```bash
VITE_HUBSPOT_API_KEY=eu1-8a8b-5d48-4971-82df-5492bd49e146

```

---

### 5. Salesforce Integration (Optional)
**Status:** Not yet configured

**What it's used for:**
- Import leads from Salesforce
- Sync customer data

**How to get it:**
1. Visit https://developer.salesforce.com/
2. Create a Connected App
3. Enable OAuth settings
4. Get Client ID and Client Secret

**How to configure:**
```bash
VITE_SALESFORCE_CLIENT_ID=your-salesforce-client-id
VITE_SALESFORCE_CLIENT_SECRET=your-salesforce-client-secret
```

---

### 6. Pipedrive Integration (Optional)
**Status:** Not yet configured

**What it's used for:**
- Sync contacts from Pipedrive CRM

**How to get it:**
1. Visit https://pipedrive.readme.io/docs/core-api-concepts-authentication
2. Log in to your Pipedrive account
3. Go to Settings > Personal > API
4. Generate a new API token

**How to configure:**
```bash
VITE_PIPEDRIVE_API_TOKEN=your-pipedrive-api-token
```

---

## Configuration Steps

### 1. Copy Environment Template
```bash
cp env.template .env
```

### 2. Add Your API Keys
Edit the `.env` file and replace the placeholder values with your actual API keys.

### 3. Restart Development Server
After updating `.env`, restart your development server:
```bash
npm run dev
```

---

## Feature Availability by API Key

| Feature | Required API Key(s) | Status |
|---------|-------------------|--------|
| Authentication | Firebase | ✅ Working |
| Database | Firebase | ✅ Working |
| File Storage | Firebase | ✅ Working |
| AI Copilot | DeepSeek | ⚠️ Needs Key |
| Meeting Notes | DeepSeek | ⚠️ Needs Key |
| AI CRUD Operations | DeepSeek | ⚠️ Needs Key |
| Lead Message Generation | DeepSeek | ⚠️ Needs Key |
| Slack Notifications | Slack | ⚠️ Optional |
| HubSpot Import | HubSpot | ⚠️ Optional |
| Salesforce Import | Salesforce | ⚠️ Optional |
| Pipedrive Import | Pipedrive | ⚠️ Optional |

---

## Security Best Practices

1. **Never commit `.env` file to Git**
   - The `.env` file is already in `.gitignore`
   - Always use environment variables for sensitive data

2. **Use different keys for development and production**
   - Create separate API keys for each environment
   - Restrict API key permissions to minimum required

3. **Rotate keys regularly**
   - Generate new API keys periodically
   - Revoke old keys after migration

4. **Monitor API usage**
   - Set up usage alerts in your API dashboards
   - Monitor for unusual activity

---

## Troubleshooting

### "API key not configured" Error
**Solution:** Ensure you've added the API key to `.env` file and restarted the development server.

### Slack OAuth Not Working
**Solution:** 
1. Check that redirect URI in Slack app matches your `.env` configuration
2. Ensure all required OAuth scopes are added
3. Verify Client ID and Secret are correct

### AI Features Not Responding
**Solution:**
1. Verify DeepSeek API key is valid
2. Check API quota/credits
3. Check browser console for specific error messages

---

## Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify all required API keys are configured
3. Ensure API keys have correct permissions
4. Check API service status pages

---

## Summary: Which Keys Do You NEED?

**To get started (minimum):**
- ✅ Firebase credentials (already configured)
- 🔑 **DeepSeek API Key** - Required for AI features

**For full functionality:**
- 🔑 DeepSeek API Key (AI features)
- 🔑 Slack credentials (notifications)
- 🔑 CRM API keys (optional - only if you need CRM imports)

**Priority:**
1. **High Priority:** DeepSeek API Key (enables core AI features)
2. **Medium Priority:** Slack Integration (enhances team communication)
3. **Low Priority:** CRM integrations (nice to have, but not essential)

