import React from 'react';
import { ViewType } from './types';
import { DashboardIcon, ChatIcon, SocialIcon, WebsiteIcon, TasksIcon, ProjectsIcon, LeadsIcon, SettingsIcon, BellIcon } from './components/shared/Icons';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'projects', label: 'Projects', icon: <ProjectsIcon /> },
  { id: 'tasks', label: 'Tasks', icon: <TasksIcon /> },
  { id: 'notifications', label: 'Notifications', icon: <BellIcon /> },
  { id: 'leads', label: 'Leads', icon: <LeadsIcon /> },
  { id: 'chat', label: 'Team Chat', icon: <ChatIcon /> },
  { id: 'social', label: 'Social Analytics', icon: <SocialIcon /> },
  { id: 'website', label: 'Website Audit', icon: <WebsiteIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];