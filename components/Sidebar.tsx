import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from '../constants';
import { ViewType } from '../types';
import { LogoutIcon, ChevronLeftIcon } from './shared/Icons';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { slideLeft, staggerContainer, staggerItem, transitions } from '@/lib/motion';
import { cn } from '@/lib/utils';
import Logo from '@/components/shared/Logo';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  className?: string;
  onNavigate?: (view: ViewType) => void;
  companyName?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, className, onNavigate, companyName }) => {
  const { user, signOutUser } = useAuth();
  const displayCompanyName = (companyName ?? '').trim() || 'Aether Inc.';
  
  // Load collapsed state from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });

  // Persist collapsed state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', collapsed.toString());
    }
  }, [collapsed]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.aside
        initial={slideLeft.initial}
        animate={{ 
          ...slideLeft.animate,
          width: collapsed ? '4rem' : 'clamp(16rem, 20vw, 18rem)',
        }}
        exit={slideLeft.exit}
        transition={transitions.smooth}
        className={cn(
          "sticky top-0 h-screen bg-gradient-to-b from-sidebar/98 to-sidebar/95 backdrop-blur-2xl flex-shrink-0 p-3 sm:p-6 flex flex-col justify-between border-r border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-20 overflow-y-auto",
          "will-change-transform",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-transparent before:pointer-events-none",
          "max-w-full",
          collapsed && "px-2 sm:px-3",
          className,
        )}
        style={{
          isolation: 'isolate',
          transform: 'translateZ(0)',
        }}
      >
        <div>
          {/* Toggle Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapsed}
                className={cn(
                  "mb-4 hover:bg-primary/10 transition-all duration-300",
                  collapsed ? "w-full" : "ml-auto"
                )}
              >
                <motion.div
                  animate={{ rotate: collapsed ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronLeftIcon />
                </motion.div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.quick}
            className={cn(
              "relative flex items-center gap-3 mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:from-primary/15 hover:to-primary/8 hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden group",
              collapsed ? "px-2 py-3 justify-center" : "px-4 py-6"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Logo variant="compact" animated />
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col min-w-0 flex-1"
              >
                <span
                  className="text-xs sm:text-sm font-semibold text-foreground/95 tracking-tight truncate break-word"
                  title={displayCompanyName}
                >
                  {displayCompanyName}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground/80 truncate">Workspace</span>
              </motion.div>
            )}
          </motion.div>
          
          <motion.nav
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className={cn(collapsed ? "px-0" : "px-2")}
          >
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => {
                const isActive = activeView === item.id;
                const isInsights = item.id === 'insights';

                return (
                  <motion.li
                    key={item.id}
                    variants={staggerItem}
                    transition={transitions.quick}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Button
                            variant={isActive ? 'secondary' : 'ghost'}
                            size="default"
                          onClick={() => {
                            setActiveView(item.id);
                            onNavigate?.(item.id);
                          }}
                            className={cn(
                              "w-full flex items-center rounded-xl sm:rounded-2xl transition-all duration-300 relative group overflow-hidden",
                              collapsed ? "justify-center px-2 py-2.5 sm:py-3" : "gap-2 sm:gap-3 px-2 sm:px-4 py-2.5 sm:py-3 justify-start",
                              isActive
                                ? "bg-gradient-to-r from-primary/25 via-primary/15 to-primary/10 text-primary shadow-xl shadow-primary/25 border-l-[5px] border-primary font-bold scale-[1.02]"
                                : isInsights
                                  ? "hover:bg-gradient-to-r hover:from-accent/60 hover:to-accent/40 hover:shadow-lg hover:scale-[1.01] text-foreground/90 hover:text-foreground border-l-[5px] border-transparent hover:border-primary/30"
                                  : "hover:bg-gradient-to-r hover:from-accent/70 hover:to-accent/50 hover:shadow-lg hover:scale-[1.01] text-foreground/80 hover:text-foreground border-l-[5px] border-transparent hover:border-primary/30",
                              !collapsed && (isActive ? "" : "hover:translate-x-1")
                            )}
                          >
                            <span
                              className={cn(
                                "flex-shrink-0 transition-all duration-200",
                                isActive
                                  ? "text-primary scale-110"
                                  : isInsights
                                    ? "text-foreground/80 group-hover:text-primary group-hover:scale-105"
                                    : "text-muted-foreground group-hover:text-primary group-hover:scale-105"
                              )}
                            >
                              {item.icon}
                            </span>
                            {!collapsed && (
                              <span
                                className={cn(
                                  "font-medium text-xs sm:text-sm transition-all duration-200 truncate break-word",
                                  isActive && "font-semibold text-primary",
                                  !isActive && isInsights && "text-foreground/90"
                                )}
                              >
                                {item.label}
                              </span>
                            )}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="ml-2">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </motion.li>
                );
              })}
            </ul>
          </motion.nav>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, ...transitions.quick }}
          className="border-t border-border/40 pt-5 mt-6 space-y-3 relative before:absolute before:-top-px before:left-1/2 before:-translate-x-1/2 before:w-24 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/50 before:to-transparent"
        >
          {/* Testing Phase Badge */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center mb-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                Testing Phase
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="mb-3 flex justify-center">
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 font-medium px-3 py-1">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Testing Phase
              </Badge>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full flex items-center rounded-xl sm:rounded-2xl hover:bg-gradient-to-r hover:from-accent/70 hover:to-accent/50 hover:shadow-md transition-all duration-300 group overflow-hidden relative border border-transparent hover:border-border/40",
                  collapsed ? "justify-center p-2" : "gap-2 sm:gap-3 p-2 sm:p-3 justify-start"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                <Avatar className="h-9 w-9 ring-2 ring-border/50 group-hover:ring-primary/40 transition-all duration-300">
                  {user?.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.displayName ?? 'Aether User'} />
                  ) : (
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                      {(user?.displayName ?? 'A')[0].toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate break-word">
                      {user?.displayName ?? 'Aether User'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate break-word">
                      {user?.email ?? 'Signed in'}
                    </p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-2rem)]">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => signOutUser()}
              >
                <LogoutIcon className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default Sidebar;