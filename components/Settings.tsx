import React, { useEffect, useMemo, useState, useRef } from 'react';
import Card from './shared/Card';
import { PlusIcon, CloseIcon, SparklesIcon, TrashIcon, CheckCircleIcon } from './shared/Icons';
import { MessageSquare, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useUserSearch } from '../hooks/useUserSearch';
import { useChannels } from '../hooks/useChannels';
import { TeamMember } from '../types';
import { storage } from '../services/firebase';
import { notifyTeamMemberInvite } from '../services/notificationService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEMO_DATA_REMOVAL_STEPS, removeDemoData, seedUserWorkspace } from '../services/seedService';
import { useToast } from '@/hooks/use-toast';
import { useSlackIntegration } from '../hooks/useSlackIntegration';
import { getSlackOAuthUrl } from '../services/slackService';
import { useHubSpotIntegration } from '../hooks/useHubSpotIntegration';
import { Slack } from 'lucide-react';

type SettingsTab = 'profile' | 'team' | 'integrations' | 'billing';

// Slack Integration Card Component
const SlackIntegrationCard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { integration, loading, isConnected, disconnect, testConnection, refreshIntegration } = useSlackIntegration(user?.uid);
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnect = () => {
    if (!user?.uid) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to connect Slack.',
      });
      return;
    }

    const oauthUrl = getSlackOAuthUrl(user.uid);
    window.location.href = oauthUrl;
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      await disconnect();
      toast({
        title: 'Slack Disconnected',
        description: 'Your Slack integration has been disconnected.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to disconnect Slack',
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      const result = await testConnection();
      if (result) {
        toast({
          title: 'Connection Test Successful',
          description: 'Your Slack integration is working correctly.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Connection Test Failed',
          description: 'Unable to verify Slack connection. Please reconnect.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Connection Test Failed',
        description: 'An error occurred while testing the connection.',
      });
    } finally {
      setTesting(false);
    }
  };

  // Listen for OAuth callback
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('slack_success')) {
      toast({
        title: 'Slack Connected',
        description: 'Your Slack workspace has been connected successfully.',
      });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      // Refresh integration data
      refreshIntegration();
    } else if (params.has('slack_error')) {
      const error = params.get('slack_error');
      toast({
        variant: 'destructive',
        title: 'Slack Connection Failed',
        description: error || 'Failed to connect Slack workspace.',
      });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [toast, refreshIntegration]);

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Slack className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">Slack</h3>
              {isConnected && (
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                  Connected
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isConnected
                ? `Connected to ${integration?.teamName || 'Slack workspace'}`
                : 'Receive important Aether notifications directly in your Slack channels.'}
            </p>
            {isConnected && integration?.defaultChannel && (
              <p className="text-xs text-muted-foreground mt-1">
                Default channel: #{integration.defaultChannel}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleTest}
                disabled={testing || disconnecting}
                className="text-xs"
              >
                {testing ? 'Testing...' : 'Test'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDisconnect}
                disabled={testing || disconnecting}
                className="text-xs"
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={handleConnect}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
            >
              Connect
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

// HubSpot Integration Card Component
const HubSpotIntegrationCard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { loading, connectionStatus, testConnection, importContacts } = useHubSpotIntegration(user?.uid);
  const [isImporting, setIsImporting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      const isConnected = await testConnection();
      if (isConnected) {
        toast({
          title: 'HubSpot Connected',
          description: 'Successfully connected to your HubSpot account.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description: 'Unable to connect to HubSpot. Please check your API key.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: error.message || 'Failed to test HubSpot connection',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleImport = async () => {
    if (!user?.uid) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to import contacts.',
      });
      return;
    }

    try {
      setIsImporting(true);
      const result = await importContacts(100);
      
      if (result.success) {
        toast({
          title: 'Import Successful',
          description: `Imported ${result.imported} of ${result.total} contacts from HubSpot.`,
        });
        
        if (result.errors.length > 0) {
          console.warn('Import warnings:', result.errors);
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: result.errors[0] || 'Failed to import contacts',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Import Error',
        description: error.message || 'Failed to import contacts from HubSpot',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const isConfigured = !!import.meta.env.VITE_HUBSPOT_API_KEY;

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <svg className="h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.7 11.7a1.6 1.6 0 0 0-.6-.6l-2.7-1.5V7.3c0-1-.8-1.9-1.9-1.9h-.3V3.8c0-.4-.3-.7-.7-.7s-.7.3-.7.7v1.6h-.3c-1 0-1.9.8-1.9 1.9v2.3L6.9 11c-.2.1-.4.3-.6.6-.2.2-.2.5-.2.8v4.8c0 .6.5 1.1 1.1 1.1h10.6c.6 0 1.1-.5 1.1-1.1v-4.8c0-.3-.1-.6-.2-.8zm-7.5-4.4c0-.3.3-.6.6-.6h.4c.3 0 .6.3.6.6v1.9l-1.6-.9V7.3zm7.3 9.9H5.5v-4.5l5.2-2.9c.2-.1.5-.1.6 0l5.2 2.9v4.5z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">HubSpot</h3>
              {isConfigured && connectionStatus === 'connected' && (
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                  Connected
                </span>
              )}
              {!isConfigured && (
                <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-500">
                  Not Configured
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isConfigured 
                ? 'Import contacts and leads from your HubSpot CRM'
                : 'API key not configured. Add VITE_HUBSPOT_API_KEY to your .env file'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting || isImporting}
                className="text-xs"
              >
                {isTesting ? 'Testing...' : 'Test'}
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                disabled={isImporting || isTesting}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
              >
                {isImporting ? 'Importing...' : 'Import Contacts'}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled
              className="text-xs"
            >
              Configure API Key
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Team Member');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [isManageMemberModalOpen, setIsManageMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');

  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isRemoveDemoModalOpen, setIsRemoveDemoModalOpen] = useState(false);
  const [isRemovingDemoData, setIsRemovingDemoData] = useState(false);
  const [removalError, setRemovalError] = useState<string | null>(null);
  const [removalStatuses, setRemovalStatuses] = useState<Record<string, 'pending' | 'running' | 'success' | 'error'>>(() => {
    const initial: Record<string, 'pending' | 'running' | 'success' | 'error'> = {};
    DEMO_DATA_REMOVAL_STEPS.forEach(({ id }) => {
      initial[id] = 'pending';
    });
    return initial;
  });

  const resetRemovalStatuses = () => {
    const next: Record<string, 'pending' | 'running' | 'success' | 'error'> = {};
    DEMO_DATA_REMOVAL_STEPS.forEach(({ id }) => {
      next[id] = 'pending';
    });
    setRemovalStatuses(next);
  };

  const { user } = useAuth();
  const { profile, loading: profileLoading, saveProfile } = useUserProfile(user?.uid);
  const { members, pendingMembers, acceptedMembers, loading: membersLoading, addMember, acceptMember, rejectMember, deleteMember, updateMember } = useTeamMembers(user?.uid);
  const { searchUsers, clearResults, searchResults: globalSearchResults, isSearching: isSearchingGlobal } = useUserSearch();
  const { channels, createChannel } = useChannels(user?.uid);
  const { toast } = useToast();

  const goalOptions = useMemo(
    () => [
      'Increase Sales',
      'Improve Marketing',
      'Streamline Operations',
      'Manage Team',
      'Understand Finances',
      'Grow Online Presence',
    ],
    [],
  );

  useEffect(() => {
    if (!profile) {
      setBusinessName('');
      setIndustry('');
      setGoals([]);
      return;
    }

    setBusinessName(profile.businessName ?? '');
    setIndustry(profile.industry ?? '');
    setGoals(profile.goals ?? []);
  }, [profile]);

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((item) => item !== goal)
        : prev.length >= 3
        ? [...prev]
        : [...prev, goal],
    );
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileStatus(null);
    setProfileError(null);
    setIsSavingProfile(true);
    try {
      const payload: any = {
        businessName,
        industry,
        goals,
        completedOnboarding: true,
      };
      if (profile?.demoDataAcknowledged !== undefined) {
        payload.demoDataAcknowledged = profile.demoDataAcknowledged;
      }
      if (profile?.demoDataRemovedAt) {
        payload.demoDataRemovedAt = profile.demoDataRemovedAt;
      }
      await saveProfile(payload);
      setProfileStatus('Workspace preferences saved successfully.');
    } catch (error: any) {
      setProfileError(error?.message ?? 'Unable to save profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };


  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    setUploadError(null);

    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      // Update user profile
      await updateProfile(user, { photoURL });
      
      setProfileStatus('Profile photo updated successfully.');
    } catch (error: any) {
      setUploadError(error?.message ?? 'Failed to upload photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const InviteMemberModal = () => {
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteDescription, setInviteDescription] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [localSearchResults, setLocalSearchResults] = useState<typeof globalSearchResults>([]);
    const [isSearching, setIsSearching] = useState(false);
    const emailInputRef = React.useRef<HTMLInputElement>(null);
    const nameInputRef = React.useRef<HTMLInputElement>(null);
    const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Sync global search results to local state
    React.useEffect(() => {
      if (isSearchingGlobal) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
        setLocalSearchResults(globalSearchResults);
        if (globalSearchResults.length > 0) {
          setShowDropdown(true);
        }
      }
    }, [globalSearchResults, isSearchingGlobal]);

    // Cleanup on unmount or modal close
    React.useEffect(() => {
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, []);

    // Debounced search function
    const handleSearchUsers = async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setLocalSearchResults([]);
        setShowDropdown(false);
        return;
      }

      try {
        await searchUsers(searchTerm.trim());
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    const handleSelectUser = (user: { id: string; displayName?: string; email: string; photoURL?: string }) => {
      setInviteName(user.displayName || user.email);
      setInviteEmail(user.email);
      setSelectedUserId(user.id);
      setShowDropdown(false);
      setLocalSearchResults([]);
      // Focus next field after selection
      setTimeout(() => emailInputRef.current?.focus(), 100);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInviteEmail(value);
      
      // Clear previous search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Hide dropdown immediately while typing
      if (showDropdown) {
        setShowDropdown(false);
      }
      
      // Only search if user has stopped typing for 3 seconds
      if (value.trim().length > 2) {
        searchTimeoutRef.current = setTimeout(() => {
          handleSearchUsers(value);
        }, 3000); // 3 second delay - only search when user pauses
      } else {
        setLocalSearchResults([]);
      }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInviteName(value);
      
      // Clear previous search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Hide dropdown immediately while typing
      if (showDropdown) {
        setShowDropdown(false);
      }
      
      // Only search if user has stopped typing for 3 seconds
      if (value.trim().length > 2) {
        searchTimeoutRef.current = setTimeout(() => {
          handleSearchUsers(value);
        }, 3000); // 3 second delay - only search when user pauses
      } else {
        setLocalSearchResults([]);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission
        
        // Cancel pending search
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        
        // Get the search value from the input
        const searchValue = (e.target as HTMLInputElement).value;
        
        // Trigger search immediately on Enter
        if (searchValue.trim().length > 2) {
          handleSearchUsers(searchValue);
        }
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inviteName.trim() || !inviteEmail.trim()) {
        setInviteError('Please provide both name and email.');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail.trim())) {
        setInviteError('Please provide a valid email address.');
        return;
      }

      if (!user?.uid) {
        setInviteError('You must be signed in to invite members.');
        return;
      }

      setInviteError(null);
      setIsInviting(true);
      
      const savedName = inviteName.trim();
      const savedEmail = inviteEmail.trim();
      const savedDescription = inviteDescription.trim();
      const savedRole = inviteRole;
      
      try {
        // Create a team member invitation (pending status)
        const newMemberId = await addMember({
          name: savedName,
          email: savedEmail,
          role: savedRole,
          description: savedDescription || undefined,
          status: 'pending',
        });
        
        // Send notification to invited user if they exist in the user directory
        if (selectedUserId) {
          try {
            await notifyTeamMemberInvite(
              selectedUserId,
              user?.displayName || user?.email || 'Someone',
              user?.email || ''
            );
          } catch (notifyError) {
            console.warn('Failed to send notification to invited user:', notifyError);
            // Don't fail the entire invite if notification fails
          }
        }
        
        // Close modal and reset form
        setIsInviteModalOpen(false);
        setInviteRole('Team Member');
        toast({
          title: 'Invitation sent',
          description: `${savedName} has been invited to your team.`,
        });
      } catch (error: any) {
        setInviteName(savedName);
        setInviteEmail(savedEmail);
        setInviteDescription(savedDescription);
        setInviteRole(savedRole);
        setInviteError(error?.message ?? 'Unable to invite member. Please try again.');
      } finally {
        setIsInviting(false);
      }
    };

    const handleClose = () => {
      setIsInviteModalOpen(false);
      // Reset form state
      setInviteName('');
      setInviteEmail('');
      setInviteDescription('');
      setSelectedUserId(null);
      setShowDropdown(false);
      setInviteError(null);
      setLocalSearchResults([]);
      setIsSearching(false);
    };

    return (
      <Dialog open={isInviteModalOpen} onOpenChange={(open) => {
        if (!open) {
          handleClose();
        } else {
          setIsInviteModalOpen(true);
        }
      }}>
        <DialogContent className="max-w-lg border-slate-200 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Invite Team Member</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Search for existing users or enter details to invite a new team member.
              <br />
              <span className="text-xs text-muted-foreground mt-1 inline-block">
                💡 Tip: Press <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-muted rounded border border-border">Enter</kbd> to search instantly, or wait 3 seconds
              </span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Label htmlFor="invite-name">Full Name *</Label>
              <Input
                id="invite-name"
                ref={nameInputRef}
                type="text"
                placeholder="e.g., Alex Johnson"
                value={inviteName}
                onChange={handleNameChange}
                onKeyDown={handleKeyPress}
                required
                autoComplete="off"
              />
              {isSearching && (
                <div className="absolute right-3 top-9 flex items-center gap-1">
                  <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                  <p className="text-xs text-muted-foreground">Searching...</p>
                </div>
              )}
                      {showDropdown && localSearchResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-[var(--radius)] shadow-lg max-h-60 overflow-y-auto">
                          {localSearchResults.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => handleSelectUser(user)}
                              className="w-full text-left px-4 py-2 hover:bg-muted/50 flex items-center gap-3 transition-colors"
                            >
                              {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || user.email} className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-primary">
                                    {(user.displayName || user.email)[0].toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-foreground">{user.displayName || user.email}</p>
                                {user.email && (
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
            </div>
            
            <div className="relative">
              <Label htmlFor="invite-email">Email *</Label>
              <Input
                id="invite-email"
                ref={emailInputRef}
                type="email"
                placeholder="e.g., alex@example.com"
                value={inviteEmail}
                onChange={handleEmailChange}
                onKeyDown={handleKeyPress}
                onBlur={() => {
                  // Delay hiding dropdown to allow clicks
                  setTimeout(() => setShowDropdown(false), 300);
                }}
                required
                autoComplete="off"
              />
              {isSearching && (
                <div className="absolute right-3 top-9 flex items-center gap-1">
                  <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                  <p className="text-xs text-muted-foreground">Searching...</p>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="invite-description">Description (Optional)</Label>
              <Textarea
                id="invite-description"
                placeholder="Brief description of their role or responsibilities..."
                value={inviteDescription}
                onChange={(e) => setInviteDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="invite-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team Member">Team Member</SelectItem>
                  <SelectItem value="Consultant">Consultant</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {inviteError && (
              <p className="text-sm text-destructive">{inviteError}</p>
            )}
          </form>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isInviting || !inviteName.trim() || !inviteEmail.trim()}
              onClick={handleSubmit}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            >
              {isInviting ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Manage Member Modal Component
  const ManageMemberModal = () => {
    if (!selectedMember) return null;
    
    const handleRemoveMember = async () => {
      if (!selectedMember?.id || !deleteMember) return;
      
      try {
        await deleteMember(selectedMember.id);
        toast({
          title: 'Member Removed',
          description: `${selectedMember.name} has been removed from your team.`,
        });
        setIsManageMemberModalOpen(false);
        setSelectedMember(null);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error?.message ?? 'Failed to remove team member',
        });
      }
    };
    
    const handleSendDirectMessage = async () => {
      if (!selectedMember?.id || !user?.uid || !channels || !createChannel) return;
      
      try {
        // Check if a DM channel already exists between these two users
        const existingDM = channels.find(channel => 
          channel.type === 'direct' &&
          channel.members.length === 2 &&
          channel.members.includes(user.uid) &&
          channel.members.includes(selectedMember.id)
        );
        
        if (existingDM) {
          // Navigate to existing DM
          toast({
            title: 'Channel Ready',
            description: `You can message ${selectedMember.name} in Team Chat.`,
          });
          setIsManageMemberModalOpen(false);
          // Navigate to Team Chat view to see the channel
        } else {
          // Create new DM channel
          await createChannel(
            `dm-${user.uid}-${selectedMember.id}`,
            [user.uid, selectedMember.id],
            'direct',
            `Direct message with ${selectedMember.name}`
          );
          
          toast({
            title: 'Channel Created',
            description: `You can now message ${selectedMember.name} in Team Chat.`,
          });
          setIsManageMemberModalOpen(false);
          // Navigate to Team Chat view to see the new channel
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error?.message ?? 'Failed to create direct message',
        });
      }
    };
    
    const handleChangeRole = () => {
      setNewRole(selectedMember.role);
      setIsChangeRoleDialogOpen(true);
    };
    
    
    return (
      <Dialog open={isManageMemberModalOpen} onOpenChange={(open) => {
        setIsManageMemberModalOpen(open);
        if (!open) setSelectedMember(null);
      }}>
        <DialogContent className="max-w-md border-slate-200 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
          <DialogHeader>
            <DialogTitle className="text-2xl">Manage Team Member</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              View details and manage {selectedMember.name}'s access
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Member Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-white/10">
              <img 
                src={selectedMember.avatar} 
                alt={selectedMember.name} 
                className="w-16 h-16 rounded-full ring-2 ring-slate-200 dark:ring-white/10" 
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{selectedMember.name}</h3>
                {(selectedMember as any).email && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">{(selectedMember as any).email}</p>
                )}
                <Badge variant="secondary" className="mt-2">
                  {selectedMember.role}
                </Badge>
              </div>
            </div>

            {/* Member Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Actions</h4>
              
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-slate-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
                onClick={handleSendDirectMessage}
              >
                <MessageSquare className="h-4 w-4" />
                Send Direct Message
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-slate-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
                onClick={handleChangeRole}
              >
                <Shield className="h-4 w-4" />
                Change Role
              </Button>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-slate-200 dark:border-white/10 pt-4">
              <h4 className="text-sm font-medium text-destructive mb-3">Danger Zone</h4>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleRemoveMember}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Remove from Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Change Role Dialog Component
  const ChangeRoleDialog = () => {
    if (!selectedMember) return null;
    
    return (
      <Dialog open={isChangeRoleDialogOpen} onOpenChange={setIsChangeRoleDialogOpen}>
        <DialogContent className="max-w-sm border-slate-200 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Update {selectedMember.name}'s role in your team
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="role-select">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger id="role-select" className="mt-1">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team Member">Team Member</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Consultant">Consultant</SelectItem>
                  <SelectItem value="Developer">Developer</SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Analyst">Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangeRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleSaveRole();
              }}
              disabled={!newRole.trim() || newRole === selectedMember.role}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const handleSaveRole = async () => {
    if (!selectedMember?.id || !newRole.trim() || !updateMember) return;
    
    try {
      await updateMember(selectedMember.id, { role: newRole });
      toast({
        title: 'Role Updated',
        description: `${selectedMember.name}'s role has been changed to ${newRole}`,
      });
      setIsChangeRoleDialogOpen(false);
      // Update the local selected member
      setSelectedMember({ ...selectedMember, role: newRole });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message ?? 'Failed to update role',
      });
    }
  };


  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
               <div className="flex items-center gap-2">
                 <span className="text-sm text-muted-foreground">Theme:</span>
                 <ThemeToggle />
               </div>
             </div>
             {profileLoading && <p className="text-sm text-muted-foreground">Loading workspace details...</p>}
             <Card>
                <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-3">User Information</h3>
                <div className="flex flex-col md:flex-row gap-6">
                   <div className="flex flex-col items-center space-y-3">
                      <img
                        src={user?.photoURL ?? 'https://i.pravatar.cc/150?u=aether-user1'}
                        alt="Profile"
                        className="w-32 h-32 rounded-full ring-4 ring-primary/30"
                      />
                      <label className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-[var(--radius)] hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-sm hover:scale-105 inline-block">
                        {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={isUploadingPhoto}
                          className="hidden"
                        />
                      </label>
                      {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
                   </div>
                   <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className="block text-sm font-medium text-foreground">Full Name</label>
                         <input
                           type="text"
                           value={user?.displayName ?? ''}
                           readOnly
                           className="mt-1 w-full bg-input text-foreground placeholder-muted-foreground rounded-[var(--radius)] py-2 px-4 focus:outline-none focus:ring-2 focus:ring-ring border border-border opacity-70"
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-foreground">Email Address</label>
                         <input
                           type="email"
                           value={user?.email ?? ''}
                           readOnly
                           className="mt-1 w-full bg-input text-foreground placeholder-muted-foreground rounded-[var(--radius)] py-2 px-4 focus:outline-none focus:ring-2 focus:ring-ring border border-border opacity-70"
                         />
                      </div>
                   </div>
                </div>
             </Card>
             <Card>
                <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-3">Business Profile</h3>
                <div className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-foreground">Business Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(event) => setBusinessName(event.target.value)}
                        placeholder="e.g., Aether Inc."
                        className="mt-1 w-full bg-input text-foreground placeholder-muted-foreground rounded-[var(--radius)] py-2 px-4 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground">Industry</label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(event) => setIndustry(event.target.value)}
                        placeholder="e.g., SaaS, Marketing Agency"
                        className="mt-1 w-full bg-input text-foreground placeholder-muted-foreground rounded-[var(--radius)] py-2 px-4 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground">Focus Areas</label>
                      <div className="grid grid-cols-2 gap-2">
                        {goalOptions.map((goal) => {
                          const isSelected = goals.includes(goal);
                          return (
                            <button
                              key={goal}
                              type="button"
                              onClick={() => toggleGoal(goal)}
                              className={`text-sm p-2 rounded-[var(--radius)] border transition-colors ${
                                isSelected ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border hover:border-primary text-foreground'
                              }`}
                            >
                              {goal}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Select up to three priorities.</p>
                    </div>
                </div>
             </Card>
             {profileError && <p className="text-sm text-destructive">{profileError}</p>}
             {profileStatus && <p className="text-sm text-chart-2">{profileStatus}</p>}
             <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading || isSavingProfile}
                  className="bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-[var(--radius)] hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed shadow-sm"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Preferences'}
                </button>
             </div>
             <Card>
               <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                 <div>
                   <h3 className="text-lg font-semibold text-foreground">Demo Data Controls</h3>
                   <p className="text-sm text-muted-foreground">
                     Manage sample workspace data to test features or start fresh.
                   </p>
                 </div>
                 {profile?.demoDataRemovedAt && (
                   <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                     <CheckCircleIcon className="w-4 h-4" />
                     Cleared
                   </span>
                 )}
               </div>
               <div className="space-y-4">
                 <div className="text-sm text-muted-foreground leading-relaxed">
                   <p>
                     Removing demo data wipes seeded tasks, projects, leads, notifications, analytics, channels, and team members.
                     Your account, profile, and settings remain untouched.
                   </p>
                   {profile?.demoDataRemovedAt && (
                     <p className="text-xs text-muted-foreground/80 mt-2">
                       Last cleared: {new Date(profile.demoDataRemovedAt).toLocaleString()}
                     </p>
                   )}
                 </div>
                 <div className="flex items-center justify-between gap-4">
                   <div className="text-xs uppercase tracking-wide text-muted-foreground">
                     Status: {profile?.demoDataRemovedAt ? 'No demo data present' : 'Demo data active'}
                   </div>
                   <div className="flex gap-2">
                     {profile?.demoDataRemovedAt && (
                       <Button
                         variant="outline"
                         size="sm"
                         className="gap-2"
                         onClick={async () => {
                           if (!user?.uid) return;
                           try {
                             setIsRemovingDemoData(true);
                             setRemovalError(null);
                             await seedUserWorkspace(user.uid);
                             // Update profile to clear the removed flag
                             await saveProfile({
                               ...profile,
                               demoDataRemovedAt: undefined,
                             });
                             toast({
                               title: 'Demo data added',
                               description: 'Sample workspace data has been restored.',
                             });
                           } catch (error: any) {
                             setRemovalError(error?.message ?? 'Failed to add demo data. Please try again.');
                           } finally {
                             setIsRemovingDemoData(false);
                           }
                         }}
                         disabled={isRemovingDemoData}
                       >
                         <PlusIcon className="h-4 w-4" />
                         Add demo data
                       </Button>
                     )}
                     <Button
                       variant={profile?.demoDataRemovedAt ? "outline" : "destructive"}
                       size="sm"
                       className="gap-2"
                       onClick={() => {
                         setRemovalError(null);
                         resetRemovalStatuses();
                         setIsRemoveDemoModalOpen(true);
                       }}
                       disabled={isRemovingDemoData}
                     >
                       <TrashIcon className="h-4 w-4" />
                       {profile?.demoDataRemovedAt ? 'Remove again' : 'Remove demo data'}
                     </Button>
                   </div>
                 </div>
                 {removalError && (
                   <p className="text-sm text-destructive">{removalError}</p>
                 )}
               </div>
             </Card>
          </div>
        );
      case 'team':
        return (
           <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Team Members</h2>
                <button onClick={() => setIsInviteModalOpen(true)} className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-[var(--radius)] hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"><PlusIcon /> Invite Member</button>
             </div>
             
             {/* Pending Invites */}
             {pendingMembers && pendingMembers.length > 0 && (
               <Card>
                 <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-3">Pending Invites</h3>
                 <div className="space-y-2">
                   {pendingMembers.map((member: any) => (
                     <div key={member.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-[var(--radius)] transition-colors border border-border/50">
                       <div className="flex items-center gap-4">
                         <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                         <div>
                           <p className="font-semibold text-foreground">{member.name}</p>
                           {member.email && <p className="text-sm text-muted-foreground">{member.email}</p>}
                           {member.description && <p className="text-xs text-muted-foreground mt-1">{member.description}</p>}
                           <p className="text-sm text-muted-foreground">{member.role}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <button
                           onClick={async () => {
                             try {
                               await acceptMember(member.id);
                             } catch (error: any) {
                               setInviteError(error?.message ?? 'Failed to accept invite');
                             }
                           }}
                           className="bg-chart-2 text-primary-foreground font-semibold py-1.5 px-3 rounded-[var(--radius)] hover:bg-chart-2/90 transition-colors text-sm"
                         >
                           Accept
                         </button>
                         <button
                           onClick={async () => {
                             try {
                               await rejectMember(member.id);
                             } catch (error: any) {
                               setInviteError(error?.message ?? 'Failed to reject invite');
                             }
                           }}
                           className="bg-destructive/20 text-destructive font-semibold py-1.5 px-3 rounded-[var(--radius)] hover:bg-destructive/30 transition-colors text-sm"
                         >
                           Reject
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </Card>
             )}
             
             {/* Accepted Members */}
             <Card>
                <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-3">Team Members</h3>
                <div className="space-y-2">
                {membersLoading ? (
                  <p className="text-sm text-muted-foreground">Loading team members...</p>
                ) : acceptedMembers.length > 0 ? (
                  acceptedMembers.map((member: TeamMember) => (
                    <div key={member.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-[var(--radius)] transition-colors">
                        <div className="flex items-center gap-4">
                            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <p className="font-semibold text-foreground">{member.name}</p>
                                {(member as any).email && <p className="text-sm text-muted-foreground">{(member as any).email}</p>}
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsManageMemberModalOpen(true);
                          }}
                          className="text-sm"
                        >
                          Manage
                        </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <SparklesIcon className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p>No team members yet. Invite your first teammate to collaborate.</p>
                  </div>
                )}
                </div>
             </Card>
           </div>
        );
      case 'integrations':
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Integrations</h2>
                    <p className="text-muted-foreground mt-1">Connect your tools to power Aether's AI insights.</p>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Open a test dialog or navigate to integration test page
                      toast({
                        title: 'Testing Integrations',
                        description: 'Use the Test buttons below to verify each integration',
                      });
                    }}
                    className="gap-2"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    Test All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Shopify</h3>
                            <button className="bg-chart-2/20 text-chart-2 font-semibold py-1 px-3 rounded-[var(--radius)] text-sm cursor-default">Connected</button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Sync your sales, product, and customer data for real-time analytics.</p>
                    </Card>
                    <HubSpotIntegrationCard />
                    <Card>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Google Analytics</h3>
                            <button className="bg-primary text-primary-foreground font-semibold py-1 px-3 rounded-[var(--radius)] text-sm hover:bg-primary/90 transition-colors shadow-sm">Connect</button>
                        </div>
                         <p className="text-sm text-muted-foreground mt-2">Get deeper insights into your website traffic and user behavior.</p>
                    </Card>
                     <SlackIntegrationCard />
                </div>
            </div>
        );
      case 'billing':
        return (
           <div className="space-y-6 animate-fade-in">
             <h2 className="text-2xl font-bold text-foreground">Billing &amp; Subscription</h2>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-3">Payment History</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 hover:bg-muted/50 rounded-[var(--radius)] transition-colors">
                                <p className="font-medium text-foreground">Invoice #2024-10</p>
                                <p className="text-sm text-muted-foreground">October 1, 2024</p>
                                <p className="font-semibold text-foreground">$29.99</p>
                                <button className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors">Download</button>
                            </div>
                             <div className="flex justify-between items-center p-3 hover:bg-muted/50 rounded-[var(--radius)] transition-colors">
                                <p className="font-medium text-foreground">Invoice #2024-09</p>
                                <p className="text-sm text-muted-foreground">September 1, 2024</p>
                                <p className="font-semibold text-foreground">$29.99</p>
                                <button className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors">Download</button>
                            </div>
                        </div>
                    </Card>
                </div>
                <div>
                     <Card>
                        <h3 className="text-lg font-semibold text-foreground mb-4">Current Plan</h3>
                        <p className="text-4xl font-bold text-primary">Pro</p>
                        <p className="text-muted-foreground mt-1">$29.99 / month</p>
                        <p className="text-sm text-foreground mt-4">Your plan renews on November 1, 2024.</p>
                        <button className="w-full mt-4 bg-secondary text-secondary-foreground font-semibold py-2 px-4 rounded-[var(--radius)] hover:bg-secondary/80 transition-colors shadow-sm">Manage Subscription</button>
                    </Card>
                </div>
             </div>
           </div>
        );
      default:
        return null;
    }
  }

  return (
    <>
      {isRemoveDemoModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <Card className="w-full max-w-lg animate-slide-in-up space-y-6 bg-card border-border shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2 rounded-full bg-primary/10">
                <SparklesIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Remove demo data</h3>
                <p className="text-sm text-muted-foreground">
                  This action deletes all seeded records while keeping your profile and settings intact.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4 max-h-64 overflow-y-auto space-y-2">
              {DEMO_DATA_REMOVAL_STEPS.map(({ id, label }) => {
                const status = removalStatuses[id];
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
            {removalError && <p className="text-sm text-destructive">{removalError}</p>}
            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (isRemovingDemoData) return;
                  setIsRemoveDemoModalOpen(false);
                }}
                disabled={isRemovingDemoData}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                disabled={isRemovingDemoData || !user?.uid}
                onClick={async () => {
                  if (!user?.uid) return;
                  setRemovalError(null);
                  resetRemovalStatuses();
                  setIsRemovingDemoData(true);
                  try {
                    await removeDemoData(user.uid, ({ step, status }) => {
                      setRemovalStatuses((prev) => ({
                        ...prev,
                        [step]: status,
                      }));
                    });
                    setIsRemoveDemoModalOpen(false);
                    toast({
                      title: 'Demo data removed',
                      description: 'Your workspace is now clean and ready for production data.',
                    });
                  } catch (error: any) {
                    setRemovalError(error?.message ?? 'Failed to remove demo data. Please retry.');
                  } finally {
                    setIsRemovingDemoData(false);
                  }
                }}
              >
                <TrashIcon className="h-4 w-4" />
                {isRemovingDemoData ? 'Removing…' : 'Remove demo data'}
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {isInviteModalOpen && <InviteMemberModal />}
      {isManageMemberModalOpen && <ManageMemberModal />}
      {isChangeRoleDialogOpen && <ChangeRoleDialog />}
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <Card className="p-2 sticky top-8">
            <nav className="space-y-1">
              <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-4 py-2 rounded-[var(--radius)] font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted/50'}`}>Profile</button>
              <button onClick={() => setActiveTab('team')} className={`w-full text-left px-4 py-2 rounded-[var(--radius)] font-medium transition-colors ${activeTab === 'team' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted/50'}`}>Team Members</button>
              <button onClick={() => setActiveTab('integrations')} className={`w-full text-left px-4 py-2 rounded-[var(--radius)] font-medium transition-colors ${activeTab === 'integrations' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted/50'}`}>Integrations</button>
              <button onClick={() => setActiveTab('billing')} className={`w-full text-left px-4 py-2 rounded-[var(--radius)] font-medium transition-colors ${activeTab === 'billing' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted/50'}`}>Billing</button>
            </nav>
          </Card>
        </aside>
        <main className="w-full md:w-3/4">
          {renderContent()}
        </main>
      </div>
    </>
  );
};

export default Settings;