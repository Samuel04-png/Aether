/**
 * ⚡ Aether - AI-Powered Business Copilot
 * 
 * Developed by Byte&Berry
 * https://impeldown.dev
 * 
 * © 2024 All rights reserved
 */

import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Auth from './components/auth/Auth';
import Landing from './components/Landing';
import Onboarding from './components/onboarding/Onboarding';
import NotificationsDrawer from './components/NotificationsDrawer';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { ViewType } from './types';
import { useAuth } from './contexts/AuthContext';
import { useUserProfile } from './hooks/useUserProfile';
import { seedUserWorkspace } from './services/seedService';
import { Skeleton } from '@/components/ui/skeleton';
import { LogoSpinner } from '@/components/shared/Logo';

// Lazy load heavy components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const TeamChat = lazy(() => import('./components/TeamChat'));
const SocialAnalytics = lazy(() => import('./components/SocialAnalytics'));
const WebsiteAudit = lazy(() => import('./components/WebsiteAudit'));
const Tasks = lazy(() => import('./components/Tasks'));
const Projects = lazy(() => import('./components/Projects'));
const Settings = lazy(() => import('./components/Settings'));
const Leads = lazy(() => import('./components/Leads'));
const NotificationsPage = lazy(() => import('./components/NotificationsPage'));

const App: React.FC = () => {
  // Developer: Byte&Berry | https://impeldown.dev
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSeedingWorkspace, setIsSeedingWorkspace] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showAuthMode, setShowAuthMode] = useState<'signin' | 'signup'>('signup');

  const { user, initializing } = useAuth();
  const { profile, loading: profileLoading, saveProfile } = useUserProfile(user?.uid);
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

    // Check if user already has data to avoid unnecessary seeding
    const checkAndSeed = async () => {
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./services/firebase');
        
        // Quick check: if profile exists, user likely has data already
        const profileDoc = await getDoc(doc(db, 'users', user.uid, 'profile', 'workspace'));
        
        // Only seed if this is a brand new user (no profile yet)
        if (!profileDoc.exists()) {
          // Seed in background - don't block UI
          seedUserWorkspace(user.uid).catch((error) => {
            if (error?.code !== 'unavailable' && !error?.message?.includes('offline')) {
              console.error('Failed to seed workspace', error);
            }
          });
        }
      } catch (error) {
        // If check fails, try seeding anyway (safe operation)
        seedUserWorkspace(user.uid).catch(() => {});
      }
    };

    checkAndSeed();
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

  // Lazy load components for better performance
  const renderContent = () => {
    const Component = (() => {
      switch (activeView) {
        case 'dashboard': return Dashboard;
        case 'chat': return TeamChat;
        case 'social': return SocialAnalytics;
        case 'website': return WebsiteAudit;
        case 'tasks': return Tasks;
        case 'projects': return Projects;
        case 'leads': return Leads;
        case 'notifications': return NotificationsPage;
        case 'settings': return Settings;
        default: return Dashboard;
      }
    })();

    return (
      <ErrorBoundary>
        <Suspense fallback={
          <div className="space-y-6 p-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        }>
          <Component />
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

  // Show onboarding only if profile exists and onboarding is not completed
  // If profile is null, user is new and will see onboarding after profile is created
  const shouldShowOnboarding = profile !== null && !profile.completedOnboarding;

  if (shouldShowOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} initialProfile={profile ?? undefined} />;
  }

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header activeView={activeView} onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background/40 backdrop-blur-2xl p-6 md:p-8 lg:p-10">
          <div className="animate-fade-in">
            {renderContent()}
          </div>
          {/* Watermark */}
          <div className="fixed bottom-2 right-4 text-[9px] text-muted-foreground/20 pointer-events-none select-none opacity-30 hover:opacity-60 transition-opacity">
            Byte&Berry
          </div>
        </main>
        <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        {/* Toasts (shadcn) */}
        <Toaster />
      </div>
    </div>
  );
};

export default App;