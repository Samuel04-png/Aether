# Firebase Setup - Quick Steps

## 🔴 MANUAL STEPS (Do these first in Firebase Console)

### 1. Create New Firebase Project
- Go to: https://console.firebase.google.com/
- Click "Add project"
- Name: `aether-app-new` (or any name you prefer)
- Continue → Disable Analytics (optional) → Create project

### 2. Enable Services
- **Authentication**: Build → Authentication → Get started → Enable Email/Password + Google
- **Firestore**: Build → Firestore Database → Create database → Test mode → Choose location → Enable
- **Storage**: Build → Storage → Get started → Test mode → Same location → Done

### 3. Get Config
- ⚙️ Settings → Project settings → Scroll to "Your apps"
- Click Web icon (`</>`) → Register app → Copy config values

---

## 🟢 AUTOMATED STEPS (I'll help with these)

After you complete the manual steps above, tell me:
1. Your new project ID
2. The config values (or I can help you create the .env file)

Then I'll:
- Initialize Firebase CLI
- Deploy security rules
- Test the setup

