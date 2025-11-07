import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { ChatMessage, Lead, Notification, Project, Task, TeamMember } from '../types';

type KPI = {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
};

type MonthlySales = {
  id: string;
  month: string;
  sales: number;
};

type SocialStat = {
  id: string;
  platform: string;
  metric: string;
  value: string;
  change: string;
};

const defaultTeamMembers: TeamMember[] = [
  { id: 'member-1', name: 'Jane Doe', role: 'Project Manager', avatar: 'https://i.pravatar.cc/40?u=aether-user1' },
  { id: 'member-2', name: 'John Smith', role: 'Lead Developer', avatar: 'https://i.pravatar.cc/40?u=aether-user2' },
  { id: 'member-3', name: 'Emily White', role: 'UX/UI Designer', avatar: 'https://i.pravatar.cc/40?u=aether-user3' },
  { id: 'member-4', name: 'Michael Brown', role: 'Marketing Specialist', avatar: 'https://i.pravatar.cc/40?u=aether-user4' },
  { id: 'member-5', name: 'Sarah Green', role: 'Backend Developer', avatar: 'https://i.pravatar.cc/40?u=aether-user5' },
];

const defaultTasks: Task[] = [
  { id: 'task-1', title: 'Draft Q4 budget report', description: 'Finance team needs this by EOW.', status: 'todo', dueDate: '2024-11-15', assignee: defaultTeamMembers[0] },
  { id: 'task-2', title: 'Follow up with Innovate Inc.', description: 'Regarding partnership opportunities.', status: 'todo', dueDate: '2024-11-12', assignee: defaultTeamMembers[3] },
  { id: 'task-3', title: 'Develop new landing page mockups', description: 'Using Figma, focus on conversion.', status: 'inprogress', dueDate: '2024-11-20', assignee: defaultTeamMembers[2] },
  { id: 'task-4', title: 'Onboard new marketing hire', description: 'Welcome kit sent and initial meetings scheduled.', status: 'done' },
  { id: 'task-5', title: 'Fix login authentication bug', description: 'Users reporting issues with social login.', status: 'inprogress', dueDate: '2024-11-10', assignee: defaultTeamMembers[1] },
  { id: 'task-6', title: 'Plan social media campaign for Black Friday', description: 'Coordinate with marketing and design teams.', status: 'todo', dueDate: '2024-11-18', assignee: defaultTeamMembers[3] },
  { id: 'task-7', title: 'Deploy server updates', description: 'Staging server deployment complete.', status: 'done', assignee: defaultTeamMembers[4] },
];

const defaultLeads: Lead[] = [
  { id: 'lead-1', name: 'Alex Johnson', company: 'Innovate Corp', email: 'alex.j@innovate.com', status: 'New', source: 'Website' },
  { id: 'lead-2', name: 'Samantha Miller', company: 'Solutions Inc.', email: 's.miller@solutions.io', status: 'Contacted', source: 'LinkedIn' },
  { id: 'lead-3', name: 'David Chen', company: 'Data Dynamics', email: 'd.chen@datadynamics.co', status: 'Qualified', source: 'Referral' },
  { id: 'lead-4', name: 'Maria Garcia', company: 'Creative Minds', email: 'maria.g@creativeminds.art', status: 'New', source: 'HubSpot' },
  { id: 'lead-5', name: 'James Brown', company: 'Tech Forward', email: 'j.brown@techforward.com', status: 'Lost', source: 'Website' },
];

const defaultNotifications: Notification[] = [
  { id: 'notif-1', text: 'Your website audit for aether.co is complete.', category: 'system', time: '5 minutes ago', read: false },
  { id: 'notif-2', text: 'John Smith assigned you a new task: "Fix login authentication bug".', category: 'tasks', time: '1 hour ago', read: false },
  { id: 'notif-3', text: 'AI Insight: Your social media engagement is up 12% this week. Consider posting more video content.', category: 'ai', time: '3 hours ago', read: false },
  { id: 'notif-4', text: 'Emily White sent you a new message in #development.', category: 'messages', time: 'Yesterday', read: true },
  { id: 'notif-5', text: 'Task "Draft Q4 budget report" is due tomorrow.', category: 'tasks', time: 'Yesterday', read: false },
  { id: 'notif-6', text: 'Your HubSpot integration token has expired. Please reconnect.', category: 'system', time: '2 days ago', read: true },
];

const defaultProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Q4 Marketing Campaign',
    status: 'On Track',
    progress: 75,
    description: 'A comprehensive marketing campaign for the fourth quarter to boost holiday sales and brand visibility.',
    team: defaultTeamMembers.slice(0, 3),
    tasks: defaultTasks.filter((task) => ['task-6'].includes(task.id)),
    files: [
      { id: 'file-1', name: 'Project Brief.pdf', type: 'PDF', size: '1.2 MB', uploadedAt: '2024-10-15' },
    ],
    chat: [
      { id: 'chat-1', sender: defaultTeamMembers[0], content: "Let's finalize the campaign roadmap by Thursday.", timestamp: '10:30 AM' },
    ],
  },
  {
    id: 'project-2',
    name: 'New Website Launch',
    status: 'At Risk',
    progress: 40,
    description: 'Complete redesign and redevelopment of the main company website, moving to a new tech stack.',
    team: defaultTeamMembers.slice(1, 4),
    tasks: defaultTasks.filter((task) => ['task-3', 'task-5'].includes(task.id)),
    files: [
      { id: 'file-2', name: 'User Flow Diagram.png', type: 'Image', size: '850 KB', uploadedAt: '2024-10-16' },
      { id: 'file-3', name: 'Meeting Notes.docx', type: 'Document', size: '340 KB', uploadedAt: '2024-10-18' },
    ],
    chat: [
      { id: 'chat-2', sender: defaultTeamMembers[2], content: 'Home page wireframes are ready for review.', timestamp: '11:05 AM' },
      { id: 'chat-3', sender: defaultTeamMembers[1], content: 'API integration will be completed this week.', timestamp: '11:20 AM' },
    ],
  },
  {
    id: 'project-3',
    name: 'Mobile App Development',
    status: 'On Track',
    progress: 60,
    description: 'Building a native mobile application for both iOS and Android to supplement our web platform.',
    team: defaultTeamMembers,
    tasks: [],
    files: [],
    chat: [],
  },
  {
    id: 'project-4',
    name: '2025 Financial Audit',
    status: 'Not Started',
    progress: 0,
    description: 'Annual financial audit to ensure compliance and prepare for the next fiscal year.',
    team: [defaultTeamMembers[0]],
    tasks: defaultTasks.filter((task) => task.id === 'task-1'),
    files: [],
    chat: [],
  },
];

const defaultDashboardKpis: KPI[] = [
  { id: 'kpi-1', title: 'Revenue', value: '$45,231.89', change: '+20.1%', changeType: 'increase' },
  { id: 'kpi-2', title: 'New Customers', value: '1,204', change: '+15.3%', changeType: 'increase' },
  { id: 'kpi-3', title: 'Tasks Completed', value: '89 / 112', change: '-2.8%', changeType: 'decrease' },
  { id: 'kpi-4', title: 'Website Traffic', value: '2.3M', change: '+5.9%', changeType: 'increase' },
];

const defaultMonthlySales: MonthlySales[] = [
  { id: 'sales-jan', month: 'Jan', sales: 4000 },
  { id: 'sales-feb', month: 'Feb', sales: 3000 },
  { id: 'sales-mar', month: 'Mar', sales: 5000 },
  { id: 'sales-apr', month: 'Apr', sales: 4500 },
  { id: 'sales-may', month: 'May', sales: 6000 },
  { id: 'sales-jun', month: 'Jun', sales: 5500 },
];

const defaultSocialStats: SocialStat[] = [
  { id: 'social-1', platform: 'Twitter / X', metric: 'Followers', value: '12.1k', change: '+5.1%' },
  { id: 'social-2', platform: 'Instagram', metric: 'Engagement', value: '3.4%', change: '-0.2%' },
  { id: 'social-3', platform: 'LinkedIn', metric: 'Impressions', value: '89k', change: '+12.8%' },
  { id: 'social-4', platform: 'Facebook', metric: 'Reach', value: '45k', change: '+2.3%' },
];

const defaultChannelMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: defaultTeamMembers[0],
    content: 'Hey team, the Q4 reports are due by EOD Friday. Let me know if you have any questions!',
    timestamp: '10:32 AM',
  },
  {
    id: 'msg-2',
    sender: defaultTeamMembers[1],
    content: "Thanks for the reminder, Jane. I'm about halfway through mine.",
    timestamp: '10:34 AM',
  },
];

const seedCollection = async <T extends { id: string }>(path: string[], items: T[]) => {
  const collectionRef = collection(db, ...path);
  const snapshot = await getDocs(collectionRef);
  if (!snapshot.empty) {
    return; // Already seeded
  }

  // Optimize: Use batch writes (max 500 operations per batch)
  const batchSize = 500;
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = writeBatch(db);
    const batchItems = items.slice(i, i + batchSize);
    
    batchItems.forEach((item) => {
      const { id, ...rest } = item;
      const docRef = doc(collectionRef, id);
      batch.set(docRef, { ...rest, id });
    });
    
    await batch.commit();
  }
};

const seedMessages = async (userId: string) => {
  const messagesPath = ['users', userId, 'channels', 'general', 'messages'];
  await seedCollection(messagesPath, defaultChannelMessages);
};

const seedDashboard = async (userId: string) => {
  const dashboardDoc = doc(db, 'users', userId, 'dashboard', 'overview');
  const snapshot = await getDoc(dashboardDoc);
  if (snapshot.exists()) {
    return;
  }

  await setDoc(dashboardDoc, {
    kpis: defaultDashboardKpis,
    monthlySales: defaultMonthlySales,
    updatedAt: serverTimestamp(),
  });
};

const seedSocialStats = async (userId: string) => {
  const socialDoc = doc(db, 'users', userId, 'analytics', 'social');
  const snapshot = await getDoc(socialDoc);
  if (snapshot.exists()) {
    return;
  }

  await setDoc(socialDoc, {
    stats: defaultSocialStats,
    updatedAt: serverTimestamp(),
  });
};

export const seedUserWorkspace = async (userId: string) => {
  try {
    const userDoc = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDoc);
    if (!userSnapshot.exists()) {
      await setDoc(userDoc, {
        createdAt: serverTimestamp(),
      });
    }

    // Optimize: Seed essential data first, then rest in parallel
    // Essential data (needed for immediate UI)
    await Promise.all([
      seedDashboard(userId),
      seedCollection(['users', userId, 'teamMembers'], defaultTeamMembers),
    ]);

    // Non-essential data (can load in background)
    Promise.all([
      seedCollection(['users', userId, 'tasks'], defaultTasks),
      seedCollection(['users', userId, 'leads'], defaultLeads),
      seedCollection(['users', userId, 'projects'], defaultProjects),
      seedCollection(['users', userId, 'notifications'], defaultNotifications),
      seedMessages(userId),
      seedSocialStats(userId),
    ]).catch((error) => {
      // Non-critical seeding errors - log but don't fail
      console.warn('Some workspace data failed to seed:', error);
    });
  } catch (error) {
    console.error('Error seeding workspace:', error);
    throw error;
  }
};

