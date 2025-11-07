import React from 'react';
import { NAV_ITEMS } from '../constants';
import { ViewType } from '../types';
import { BellIcon } from './shared/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { fadeInDown, transitions } from '@/lib/motion';
import useParticles from '../hooks/useParticles';
import { SparklesIcon as ParticlesToggleIcon } from './shared/Icons';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import ByteBerryCopilot from './copilot/ByteBerryCopilot';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface HeaderProps {
    activeView: ViewType;
    onToggleNotifications: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onToggleNotifications }) => {
    const currentView = NAV_ITEMS.find(item => item.id === activeView);
    const { user } = useAuth();
    const { unreadCount } = useNotifications(user?.uid);
    const { enabled: particlesEnabled, setEnabled: setParticlesEnabled } = useParticles();
    const [copilotOpen, setCopilotOpen] = useState(false);

    return (
        <TooltipProvider>
            <motion.header
                initial={fadeInDown.initial}
                animate={fadeInDown.animate}
                exit={fadeInDown.exit}
                transition={transitions.quick}
                className="bg-card/90 backdrop-blur-xl p-4 flex items-center justify-between border-b border-border/60 h-16 flex-shrink-0 shadow-md z-10"
            >
                <motion.h2
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={transitions.quick}
                    className="text-2xl font-bold gradient-text"
                >
                    {currentView?.label || 'Dashboard'}
                </motion.h2>
                
                <div className="flex items-center gap-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SearchInput 
                                placeholder="Search..."
                                className="w-64"
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Search across projects, tasks, and more</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={onToggleNotifications} 
                                className="relative h-9 w-9"
                            >
                                <BellIcon className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold pointer-events-none"
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </Badge>
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Notifications {unreadCount > 0 && `(${unreadCount} unread)`}</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    console.log('Copilot button clicked, setting copilotOpen to true');
                                    setCopilotOpen(true);
                                }}
                                className="h-9 w-9"
                            >
                                <ParticlesToggleIcon 
                                    className="h-5 w-5 text-primary transition-colors hover:text-primary/80" 
                                />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Open Byte&Berry Copilot</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-border hover:ring-primary transition-all">
                                {user?.photoURL ? (
                                    <AvatarImage src={user.photoURL} alt={user.displayName ?? 'Aether User'} />
                                ) : (
                                    <AvatarFallback className="text-xs">
                                        {(user?.displayName ?? 'A')[0].toUpperCase()}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{user?.displayName ?? 'Aether User'}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </motion.header>
            
            {/* Byte&Berry Copilot - Global */}
            <ByteBerryCopilot 
                userId={user?.uid} 
                isOpen={copilotOpen}
                onOpenChange={setCopilotOpen}
            />
        </TooltipProvider>
    );
};

export default Header;