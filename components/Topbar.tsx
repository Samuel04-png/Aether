import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BellIcon, SearchIcon, PlusIcon, TasksIcon, ProjectsIcon, LeadsIcon, SparklesIcon } from './shared/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import lightLogo from '/aether-logo/Logo_lightmode_sidebar.png';
import darkLogo from '/aether-logo/Logo_darkmode_sidebar.png';

interface TopbarProps {
  onNewTask: () => void;
  onNewProject: () => void;
  onToggleNotifications: () => void;
  onSearch?: (query: string) => void;
  onCreateLead?: () => void;
  onOpenCopilot: () => void;
}

const Topbar: React.FC<TopbarProps> = ({
  onNewTask,
  onNewProject,
  onToggleNotifications,
  onSearch,
  onCreateLead,
  onOpenCopilot,
}) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.uid);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const logoSrc = theme === 'dark' ? darkLogo : lightLogo;
  const [isScrolled, setIsScrolled] = useState(false);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      onSearch?.(query);
    },
    [onSearch]
  );


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 z-40 px-6 pt-4"
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-6xl items-center gap-5 rounded-full border border-transparent px-6 py-3 backdrop-blur-xl transition-all duration-300',
          isScrolled
            ? 'bg-white/95 shadow-[0_22px_70px_-35px_rgba(76,125,240,0.5)] ring-1 ring-black/5 dark:bg-[#111522]/92 dark:ring-white/10'
            : 'bg-white/82 ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10'
        )}
      >
        <div className="flex flex-1 items-center gap-5">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="Aether" className="h-9 w-auto select-none" />
          </div>
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <SearchIcon className="h-[18px] w-[18px] text-slate-500 transition-colors dark:text-white/65" />
            </div>
            <Input
              type="text"
              placeholder="Search tasks, projects, leads..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={cn(
                'h-11 w-full rounded-full border border-black/10 bg-white/80 pl-12 pr-4 text-sm text-slate-700 placeholder:text-muted-foreground shadow-none outline-none transition-colors',
                'focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 dark:border-white/15 dark:bg-white/10 dark:text-white dark:placeholder:text-white/60'
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="hidden h-11 w-11 rounded-full border border-black/5 bg-white/30 text-muted-foreground transition-all duration-200 hover:scale-[1.04] hover:text-primary dark:border-white/15 dark:bg-white/10 dark:text-white/70 lg:flex"
                aria-label="Create"
              >
                <PlusIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-[14px] border-border/40 bg-card/95 backdrop-blur">
              <DropdownMenuItem onClick={onNewTask} className="gap-2 rounded-[10px]">
                <TasksIcon className="h-4 w-4 text-primary" />
                Create Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onNewProject} className="gap-2 rounded-[10px]">
                <ProjectsIcon className="h-4 w-4 text-secondary" />
                Create Project
              </DropdownMenuItem>
              {onCreateLead && (
                <DropdownMenuItem onClick={onCreateLead} className="gap-2 rounded-[10px]">
                  <LeadsIcon className="h-4 w-4 text-accent" />
                  Create Lead
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="relative h-11 w-11 rounded-full border border-black/5 bg-white/30 text-muted-foreground transition-all hover:text-primary dark:border-white/15 dark:bg-white/10 dark:text-white/70"
                  aria-label="Create"
                >
                  <PlusIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-[14px] border-border/40 bg-card/95 backdrop-blur">
                <DropdownMenuItem onClick={onNewTask} className="gap-2 rounded-[10px]">
                  <TasksIcon className="w-4 h-4 text-primary" />
                  Create Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onNewProject} className="gap-2 rounded-[10px]">
                  <ProjectsIcon className="w-4 h-4 text-secondary" />
                  Create Project
                </DropdownMenuItem>
                {onCreateLead && (
                  <DropdownMenuItem onClick={onCreateLead} className="gap-2 rounded-[10px]">
                    <LeadsIcon className="w-4 h-4 text-accent" />
                    Create Lead
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            className="relative h-11 w-11 rounded-full border border-black/5 bg-white/30 text-muted-foreground transition-all duration-200 hover:bg-white/80 hover:text-primary dark:border-white/15 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleNotifications}
            className="relative h-11 w-11 rounded-full border border-black/5 bg-white/30 text-muted-foreground transition-all duration-200 hover:bg-white/80 hover:text-primary dark:border-white/15 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20 dark:hover:text-white"
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onOpenCopilot}
            className="relative h-11 w-11 rounded-full border border-transparent bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 text-primary transition-all duration-200 hover:scale-[1.05] hover:shadow-[0_0_18px_rgba(76,125,240,0.35)]"
            aria-label="Open Copilot"
          >
            <SparklesIcon className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-11 rounded-full border border-black/5 bg-white/30 p-0 transition-all hover:bg-white/80 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20">
                <Avatar className="h-11 w-11">
                  {user?.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.displayName ?? 'User'} />
                  ) : (
                    <AvatarFallback className="text-xs font-semibold bg-primary/15 text-primary">
                      {(user?.displayName ?? 'A')[0].toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName ?? 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default Topbar;

