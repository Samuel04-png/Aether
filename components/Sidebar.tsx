import React from 'react';
import { NAV_ITEMS } from '../constants';
import { ViewType } from '../types';
import { LogoutIcon } from './shared/Icons';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, className, onNavigate }) => {
  const { user, signOutUser } = useAuth();

  return (
    <TooltipProvider delayDuration={300}>
      <motion.aside
        initial={slideLeft.initial}
        animate={slideLeft.animate}
        exit={slideLeft.exit}
        transition={transitions.smooth}
        className={cn(
          "w-64 bg-sidebar/98 backdrop-blur-xl flex-shrink-0 p-6 flex flex-col justify-between border-r border-border/60 shadow-2xl z-20",
          className,
        )}
      >
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.quick}
            className="flex items-center gap-3 px-4 py-6 mb-4 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Logo variant="compact" animated />
          </motion.div>
          
          <motion.nav
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="px-2"
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
                              "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl justify-start transition-all duration-200 relative group",
                              isActive
                                ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-lg shadow-primary/20 border-l-4 border-primary font-semibold"
                                : isInsights
                                  ? "hover:bg-accent/50 hover:shadow-md hover:translate-x-1 text-foreground/90 hover:text-foreground"
                                  : "hover:bg-accent/60 hover:shadow-md hover:translate-x-1 text-foreground/80 hover:text-foreground"
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
                            <span
                              className={cn(
                                "font-medium text-sm transition-all duration-200",
                                isActive && "font-semibold text-primary",
                                !isActive && isInsights && "text-foreground/90"
                              )}
                            >
                              {item.label}
                            </span>
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
          className="border-t border-border/60 pt-5 mt-6 space-y-3"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/60 justify-start transition-all duration-200"
              >
                <Avatar className="h-8 w-8">
                  {user?.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.displayName ?? 'Aether User'} />
                  ) : (
                    <AvatarFallback className="text-xs">
                      {(user?.displayName ?? 'A')[0].toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.displayName ?? 'Aether User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email ?? 'Signed in'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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