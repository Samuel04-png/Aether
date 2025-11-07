# 🚀 Collaboration Features - Quick Start Guide

## Getting Started with the New Collaboration System

### 📋 Table of Contents
1. [Dashboard Widgets](#dashboard-widgets)
2. [Inviting Team Members](#inviting-team-members)
3. [Managing Notifications](#managing-notifications)
4. [Working with Tasks](#working-with-tasks)
5. [Accepting Invitations](#accepting-invitations)

---

## Dashboard Widgets

### Your Personal Command Center

When you log in, your dashboard now shows three powerful widgets:

#### 🎯 **My Tasks**
- See all tasks assigned to you across all projects
- Shows project name, task status, and title
- Click the project name to navigate directly
- Maximum 5 tasks shown (with "+X more" indicator)

#### ⏰ **Upcoming Deadlines**  
- Displays tasks due within the next 7 days
- Sorted by due date (most urgent first)
- Red alert styling for visibility
- Shows project context

#### 📨 **Pending Invitations**
- Lists all project invites waiting for your response
- Shows who invited you and to which project
- Quick Accept/Decline buttons
- Real-time updates

---

## Inviting Team Members

### How to Invite Someone to Your Project

**Step 1**: Open a Project
- Click "Projects" in the sidebar
- Select the project you want to add members to

**Step 2**: Navigate to Team Tab
- Click the "Team" tab in the project view
- You'll see all current team members

**Step 3**: Click "Invite Member"
- Purple button in the top-right of the Team section
- Opens the invitation modal

**Step 4**: Fill Invite Form
```
Email: colleague@company.com
Role: Select from dropdown
  - Viewer: Can only view project
  - Member: Can view and edit
  - Admin: Can manage members
Message: (Optional) Add a personal note
```

**Step 5**: Send Invitation
- Click "Send Invitation"
- System sends notification to invited user
- You'll see success message

### What Happens Next?
- Invited user receives notification
- Appears in their Dashboard "Invitations" widget
- Shows in their Notifications page
- They can Accept or Decline

---

## Managing Notifications

### Three Ways to Access Notifications

#### 1️⃣ **Notifications Drawer** (Quick View)
- Click bell icon in header (top-right)
- See recent notifications
- Quick mark as read

#### 2️⃣ **Notifications Page** (Full View)
- Click "Notifications" in sidebar
- See all notifications with filtering
- More management options

#### 3️⃣ **Dashboard Widget** (Invite-Specific)
- See pending invites on dashboard
- Quick accept/decline

### Notification Types & Colors

| Type      | Icon | Color  | Meaning                    |
|-----------|------|--------|----------------------------|
| 👥 Invite  | 👥   | Purple | Project invitation         |
| ✓ Tasks   | ✓    | Blue   | Task assignment            |
| 💬 Messages| 💬   | Green  | New chat message           |
| @ Mention | @    | Yellow | Someone mentioned you      |
| 📎 File    | 📎   | Cyan   | File uploaded              |
| ⏰ Deadline| ⏰   | Red    | Deadline approaching       |

### Managing Notifications

**Mark as Read**:
- Click checkmark icon on individual notification
- Or click "Mark All Read" button

**Delete Notification**:
- Click trash icon on individual notification
- Or click "Clear All" button

**Filter Notifications**:
- Use category buttons: All, Invite, Tasks, Messages, etc.
- Toggle "Unread only" checkbox

---

## Working with Tasks

### View Your Tasks

**From Dashboard**:
- "My Tasks" widget shows up to 5 assigned tasks
- Click project name to go to task

**From Projects**:
- Open any project
- Click "Tasks" tab
- See Kanban board (To Do, In Progress, Done)

### Task Features

**Assign Tasks**:
- In project Tasks tab
- Drag task to column
- Use dropdown to assign to team member

**Add Tasks**:
- Click "+ Add Task" button in Tasks tab
- Fill in title, description, due date
- Task appears in assignee's Dashboard widget

**Track Deadlines**:
- Tasks due within 7 days show in "Deadlines" widget
- Red alert styling
- Sorted by due date

---

## Accepting Invitations

### When You're Invited to a Project

You'll receive a notification in **three places**:

1. **Notifications bell** (top-right) - Badge shows count
2. **Dashboard** - "Pending Invitations" widget
3. **Notifications Page** - Full details

### How to Accept

**Option 1: From Dashboard**
```
1. See invite in "Invitations" widget
2. Click green "Accept" button
3. You're added to project team
4. Can now access project
```

**Option 2: From Notifications Page**
```
1. Go to Notifications in sidebar
2. Find invite notification
3. Click "Accept" button
4. Notification marked as read
5. You're added to project
```

### What Happens When You Accept?

✅ You're added to project team  
✅ Project appears in your Projects list  
✅ Project owner receives confirmation notification  
✅ Invite notification marked as read  
✅ You can now view/edit project (based on role)  

### What Happens When You Decline?

❌ Invite status updated to "declined"  
❌ You won't be added to project  
❌ Notification marked as read  
❌ Project owner NOT notified (optional future feature)  

---

## Best Practices

### 👥 Team Collaboration

**✅ DO:**
- Send invites with personal messages
- Assign appropriate roles (don't make everyone admin)
- Use @mentions in chat to notify specific people
- Check your "My Tasks" widget daily
- Respond to invites promptly

**❌ DON'T:**
- Invite users without checking if they're already members
- Ignore deadline notifications
- Leave invites pending indefinitely

### 📊 Staying Organized

**Daily Routine:**
1. Check Dashboard widgets when you log in
2. Review "Upcoming Deadlines" first
3. Complete tasks from "My Tasks" 
4. Respond to pending invites
5. Check notifications bell for new alerts

**Weekly Routine:**
1. Review all projects you're part of
2. Update task statuses in Kanban boards
3. Clean up old notifications
4. Follow up on pending invites you sent

---

## Troubleshooting

### "I sent an invite but user didn't receive it"

**Possible causes:**
- Email doesn't match a registered user
- User already in project
- Check "Pending Invites" in your notifications

**Solution:**
- Verify email is correct
- Ask user to check their notifications
- User may need to sign up first

### "Can't see tasks assigned to me"

**Check:**
- Tasks tab in project
- Dashboard "My Tasks" widget
- Filter status in task board

**Solution:**
- Task might be marked as Done
- Assignee might have been changed
- Project might be archived

### "Notifications not updating"

**Try:**
- Refresh the page
- Check internet connection
- Log out and log back in

---

## Keyboard Shortcuts (Future Feature)

Coming soon:
- `N` - Open notifications
- `D` - Go to dashboard
- `P` - Go to projects
- `Esc` - Close modals

---

## Need Help?

### Resources:
- 📚 Full documentation: `COLLABORATION_FEATURES.md`
- 🐛 Report issues: GitHub Issues
- 💬 Contact: Byte&Berry at impeldown.dev

---

## Feature Roadmap

### ✅ Now Available:
- Project invitations
- Role-based access
- Real-time notifications
- Task assignment tracking
- Dashboard widgets

### 🔜 Coming Soon:
- Real-time chat
- File upload to Firebase Storage
- Email notifications
- @mention autocomplete
- Advanced search
- Mobile app

---

**Quick Tips:**
- 🎯 Check Dashboard daily for tasks and deadlines
- 📨 Respond to invites within 24 hours
- 🔔 Keep notifications badge under 10
- 👥 Assign appropriate roles when inviting
- ⏰ Set realistic deadlines for tasks

---

**Happy Collaborating! 🎉**

*Made with ❤️ by Byte&Berry*

