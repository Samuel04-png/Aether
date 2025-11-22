import React from 'react';
import { ViewType } from '../types';
import { DashboardIcon, TasksIcon, ChatIcon, SettingsIcon, MicIcon } from './shared/Icons';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MobileNavbarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Home', icon: DashboardIcon },
    { id: 'tasks' as ViewType, label: 'Tasks', icon: TasksIcon },
    { id: 'chat' as ViewType, label: 'Forum', icon: ChatIcon },
    { id: 'meetings' as ViewType, label: 'Meetings', icon: MicIcon },
    { id: 'settings' as ViewType, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-sidebar/98 to-sidebar/95 backdrop-blur-2xl border-t border-border/40 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] before:absolute before:inset-0 before:bg-gradient-to-t before:from-primary/5 before:via-transparent before:to-transparent before:pointer-events-none">
      <div className="relative flex items-center justify-around h-16 sm:h-20 px-2 sm:px-3 safe-area-inset-bottom">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1.5 flex-1 h-full rounded-2xl transition-all duration-300 group",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
              aria-label={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-b-full shadow-lg shadow-primary/50"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-300",
                isActive && "bg-primary/15 shadow-lg shadow-primary/20"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-[9px] sm:text-[10px] font-medium transition-all duration-300 truncate",
                isActive && "font-bold text-primary"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavbar;

