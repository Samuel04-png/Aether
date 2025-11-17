/**
 * ⚡ Aether - AI-Powered Business Copilot
 * 
 * Developed by Byte&Berry
 * https://impeldown.dev
 * 
 * © 2024 All rights reserved
 */

import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Topbar from './components/Topbar';
import ByteBerryCopilot from './components/copilot/ByteBerryCopilot';
import Auth from './components/auth/Auth';
import Landing from './components/Landing';
import Onboarding from './components/onboarding/Onboarding';
import NotificationsDrawer from './components/NotificationsDrawer';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { ViewType } from './types';
import { useAuth } from './contexts/AuthContext';
import { useUserProfile } from './hooks/useUserProfile';
import { DEMO_DATA_REMOVAL_STEPS, removeDemoData, seedUserWorkspace } from './services/seedService';
import { Skeleton } from '@/components/ui/skeleton';
import { LogoSpinner } from '@/components/shared/Logo';
import Card from './components/shared/Card';
import { Button } from '@/components/ui/button';
import { SparklesIcon, TrashIcon } from './components/shared/Icons';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import MobileNavbar from './components/MobileNavbar';
import { useScreenSize } from './hooks/useScreenSize';

// Lazy load heavy components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const TeamChat = lazy(() => import('./components/TeamChat'));
const Insights = lazy(() => import('./components/Insights'));
const Tasks = lazy(() => import('./components/Tasks'));
const Projects = lazy(() => import('./components/Projects'));
const Settings = lazy(() => import('./components/Settings'));
const Leads = lazy(() => import('./components/Leads'));
const NotificationsPage = lazy(() => import('./components/NotificationsPage'));
const MeetingNotes = lazy(() => import('./components/MeetingNotes'));
const IntegrationTest = lazy(() => import('./components/IntegrationTest'));

const App: React.FC = () => {
  // Developer: Byte&Berry | https://impeldown.dev
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSeedingWorkspace, setIsSeedingWorkspace] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showAuthMode, setShowAuthMode] = useState<'signin' | 'signup'>('signup');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showDemoDataDialog, setShowDemoDataDialog] = useState(false);
  const [isRemovingDemoData, setIsRemovingDemoData] = useState(false);
  const [demoRemovalError, setDemoRemovalError] = useState<string | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const createInitialDemoState = () =>
    DEMO_DATA_REMOVAL_STEPS.reduce<Record<string, 'pending' | 'running' | 'success' | 'error'>>(
      (acc, step) => {
        acc[step.id] = 'pending';
        return acc;
      },
      {},
    );
  const [demoRemovalStatuses, setDemoRemovalStatuses] = useState<Record<string, 'pending' | 'running' | 'success' | 'error'>>(
    () => createInitialDemoState(),
  );

  const { user, initializing } = useAuth();
  const { profile, loading: profileLoading, saveProfile } = useUserProfile(user?.uid);
  const { toast } = useToast();
  const { isDesktop, isMobile } = useScreenSize();
  const workspaceName = useMemo(() => {
    const name = profile?.businessName;
    if (!name) return undefined;
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }, [profile?.businessName]);
  // Developer signature
  React.useEffect(() => {
    console.log(
      '%c⚡ Aether ',
      'font-size: 20px; font-weight: bold; color: #3b82f6;',
    );
    console.log(
      '%cDeveloped by Byte&Berry',
      'font-size: 12px; color: #06b6d4;',
    );
    console.log(
      '%c🔗 https://impeldown.dev',
      'font-size: 11px; color: #778DA9;',
    );
  }, []);

  // Check if we should skip landing page (returning users who are already logged in)
  React.useEffect(() => {
    // Only check on initial load, not on every render
    if (user) {
      // If user is logged in, skip landing page
      setShowLanding(false);
    } else {
      const hasSeenLanding = sessionStorage.getItem('aether_landing_seen');
      if (hasSeenLanding === 'true') {
        setShowLanding(false);
      }
    }
  }, [user]);

  // Optimized: Non-blocking seeding - runs in background
  useEffect(() => {
    if (!user) {
      return;
    }

    // Seed workspace data for new users
    // The seedUserWorkspace function has internal checks to prevent duplicate seeding
    // It will only seed collections that are empty, so it's safe to call multiple times
    seedUserWorkspace(user.uid).catch((error) => {
      if (error?.code !== 'unavailable' && !error?.message?.includes('offline')) {
        console.error('Failed to seed workspace', error);
      }
    });
  }, [user]);

  const handleOnboardingComplete = async (data: { businessName: string; industry: string; goals: string[] }) => {
    if (!user) return;
    await saveProfile({
      businessName: data.businessName,
      industry: data.industry,
      goals: data.goals,
      completedOnboarding: true,
    });
  };

  useEffect(() => {
    if (!profile || !user) {
      return;
    }
    if (profile.demoDataAcknowledged) {
      setShowDemoDataDialog(false);
      return;
    }
    setShowDemoDataDialog(true);
  }, [profile, user]);

  const handleDismissDemoData = async () => {
    if (!user || !profile) {
      setShowDemoDataDialog(false);
      return;
    }
    try {
      await saveProfile({ ...profile, demoDataAcknowledged: true });
      setShowDemoDataDialog(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Unable to update workspace',
        description: error?.message ?? 'Please try again shortly.',
      });
    }
  };

  const handleRemoveDemoData = async () => {
    if (!user?.uid) return;
    setDemoRemovalError(null);
    setIsRemovingDemoData(true);
    setDemoRemovalStatuses(createInitialDemoState());
    try {
      await removeDemoData(user.uid, ({ step, status }) => {
        setDemoRemovalStatuses((prev) => ({
          ...prev,
          [step]: status,
        }));
      });
      toast({
        title: 'Demo data removed',
        description: 'Your workspace now only includes the data you add.',
      });
      setShowDemoDataDialog(false);
    } catch (error: any) {
      setDemoRemovalError(error?.message ?? 'Failed to remove demo data. Please try again.');
    } finally {
      setIsRemovingDemoData(false);
    }
  };

  const handleNewTask = () => {
    setActiveView('tasks');
  };

  const handleNewProject = () => {
    setActiveView('projects');
  };

  const handleCreateLead = () => {
    setActiveView('leads');
  };

  // Lazy load components for better performance
  const renderContent = () => {
    return (
      <ErrorBoundary>
        <Suspense fallback={
          <div className="space-y-6 p-6 animate-pulse">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96 w-full" />
            <p className="text-sm text-muted-foreground text-center mt-4">
              Loading {activeView}...
            </p>
          </div>
        }>
          {activeView === 'dashboard' && <Dashboard onNavigate={(view) => setActiveView(view as ViewType)} />}
          {activeView === 'chat' && <TeamChat />}
          {activeView === 'insights' && <Insights />}
          {activeView === 'tasks' && <Tasks />}
          {activeView === 'projects' && <Projects />}
          {activeView === 'leads' && <Leads />}
          {activeView === 'meetings' && <MeetingNotes />}
          {activeView === 'notifications' && <NotificationsPage />}
          {activeView === 'settings' && <Settings />}
          {activeView === 'integration-test' && <IntegrationTest />}
        </Suspense>
      </ErrorBoundary>
    );
  };

  // Optimized: Only wait for essential data (profile), not seeding
  const isLoading = useMemo(() => {
    if (initializing) return true;
    // Wait for profile loading to complete (even if null - means new user)
    if (user && profileLoading) return true;
    return false;
  }, [initializing, user, profileLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center p-2 mb-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <LogoSpinner />
          </motion.div>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-64 h-1.5 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground font-medium animate-pulse">
              Loading your workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Always show landing page first unless user has seen it this session
  if (showLanding && !user) {
    return (
      <Landing
        onGetStarted={() => {
          sessionStorage.setItem('aether_landing_seen', 'true');
          setShowLanding(false);
          setShowAuthMode('signup');
        }}
        onSignIn={() => {
          sessionStorage.setItem('aether_landing_seen', 'true');
          setShowLanding(false);
          setShowAuthMode('signin');
        }}
      />
    );
  }

  if (!user) {
    return <Auth initialMode={showAuthMode} onBackToLanding={() => setShowLanding(true)} />;
  }

  // Show onboarding for any user who hasn't completed it (including brand new users with no profile yet)
  const shouldShowOnboarding = user && !profile?.completedOnboarding;

  if (shouldShowOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} initialProfile={profile ?? undefined} />;
  }

  return (
    <div className="relative flex min-h-screen bg-background/95 font-sans text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
        <div className="absolute bottom-[-18rem] right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-purple-500/15 blur-[140px] dark:bg-purple-500/25" />
        <div className="absolute top-1/3 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[150px] dark:bg-cyan-500/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_40%)] dark:bg-[linear-gradient(135deg,rgba(15,20,40,0.45)_0%,rgba(15,20,40,0)_45%)]" />
      </div>
      {isDesktop && (
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          className="h-screen"
          companyName={workspaceName}
        />
      )}
      <div className="relative flex flex-1 flex-col overflow-x-hidden">
        {isDesktop ? (
          <Topbar
            onNewTask={handleNewTask}
            onNewProject={handleNewProject}
            onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
            onCreateLead={handleCreateLead}
            onOpenCopilot={() => setIsCopilotOpen(true)}
          />
        ) : (
          <Header
            activeView={activeView}
            onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
          />
        )}
        <main
          className={`relative flex-1 overflow-x-hidden overflow-y-auto bg-background/50 backdrop-blur-2xl p-4 pb-20 transition-all md:p-6 lg:p-10 lg:pb-10 ${
            isDesktop ? 'pt-10' : ''
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
          {/* Watermark */}
          <div className="pointer-events-none hidden select-none text-[9px] text-muted-foreground/20 opacity-30 transition-opacity hover:opacity-60 md:block md:fixed md:bottom-2 md:right-4">
            Byte&Berry
          </div>
        </main>
        {isMobile && (
          <MobileNavbar
            activeView={activeView}
            onNavigate={(view) => {
              setActiveView(view);
            }}
          />
        )}
        <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        <Toaster />
      </div>
      {user && (
        <ByteBerryCopilot
          isOpen={isCopilotOpen}
          onOpenChange={setIsCopilotOpen}
          userId={user.uid}
        />
      )}
      {!isDesktop && (
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetContent side="left" className="p-0 w-72 sm:max-w-sm">
            <SheetHeader className="px-6 pt-6 pb-4">
              <SheetTitle>Navigate</SheetTitle>
            </SheetHeader>
            <div className="border-t border-border/60">
              <Sidebar
                activeView={activeView}
                setActiveView={(view) => {
                  setActiveView(view);
                  setIsMobileNavOpen(false);
                }}
                className="w-full h-full bg-sidebar/95"
                companyName={workspaceName}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
      {showDemoDataDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/70 backdrop-blur">
          <Card className="w-full max-w-lg animate-slide-in-up">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2 rounded-full bg-primary/10">
                <SparklesIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Your workspace is preloaded with demo data</h3>
                <p className="text-sm text-muted-foreground">Clear it now or keep it while you explore Aether.</p>
              </div>
            </div>
            <div className="py-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                We’ve added sample tasks, projects, leads, and analytics so you can see the product in action. Remove them at any time—your profile and settings stay intact.
              </p>
              {(isRemovingDemoData || demoRemovalStatuses.profileUpdate === 'success') && (
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Removal progress</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {DEMO_DATA_REMOVAL_STEPS.map(({ id, label }) => {
                      const status = demoRemovalStatuses[id];
                      const statusColor =
                        status === 'success'
                          ? 'text-emerald-500'
                          : status === 'error'
                          ? 'text-destructive'
                          : status === 'running'
                          ? 'text-primary'
                          : 'text-muted-foreground';
                      return (
                        <div key={id} className="flex items-center justify-between text-sm">
                          <span className="text-foreground/90">{label}</span>
                          <span className={`text-xs font-medium uppercase ${statusColor}`}>
                            {status === 'pending' && 'Pending'}
                            {status === 'running' && 'Removing'}
                            {status === 'success' && 'Removed'}
                            {status === 'error' && 'Error'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {demoRemovalError && <p className="text-sm text-destructive">{demoRemovalError}</p>}
            </div>
            <div className="flex justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={handleDismissDemoData}
                disabled={isRemovingDemoData}
              >
                Keep demo data
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={handleRemoveDemoData}
                disabled={isRemovingDemoData}
              >
                <TrashIcon className="h-4 w-4" />
                {isRemovingDemoData ? 'Removing…' : 'Remove demo data now'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default App;