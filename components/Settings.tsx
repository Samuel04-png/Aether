import React, { useEffect, useMemo, useState } from 'react';
import Card from './shared/Card';
import { PlusIcon, CloseIcon, SparklesIcon } from './shared/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { TeamMember } from '../types';
import { storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type SettingsTab = 'profile' | 'team' | 'integrations' | 'billing';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Team Member');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { user } = useAuth();
  const { profile, loading: profileLoading, saveProfile } = useUserProfile(user?.uid);
  const { members, pendingMembers, acceptedMembers, loading: membersLoading, addMember, acceptMember, rejectMember } = useTeamMembers(user?.uid);

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
      await saveProfile({
        businessName,
        industry,
        goals,
        completedOnboarding: true,
      });
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
        await addMember({
          name: savedName,
          email: savedEmail,
          role: savedRole,
          description: savedDescription || undefined,
          status: 'pending',
        });
        
        setInviteName('');
        setInviteEmail('');
        setInviteDescription('');
        setInviteRole('Team Member');
        setIsInviteModalOpen(false);
        setInviteError(null);
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

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <Card className="w-full max-w-md animate-slide-in-up">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-foreground">Invite Team Member</h3>
                  <button 
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setInviteName('');
                      setInviteEmail('');
                      setInviteDescription('');
                      setInviteError(null);
                    }} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                  >
                    <CloseIcon />
                  </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Alex Johnson"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                        required
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                      <input
                        type="email"
                        placeholder="e.g., alex@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                        required
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                      <textarea
                        placeholder="Brief description of their role or responsibilities..."
                        value={inviteDescription}
                        onChange={(e) => setInviteDescription(e.target.value)}
                        className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border min-h-[80px] resize-none"
                        rows={3}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                      >
                          <option>Team Member</option>
                          <option>Consultant</option>
                          <option>Admin</option>
                      </select>
                  </div>
                  {inviteError && <p className="text-sm text-destructive mt-3">{inviteError}</p>}
                  <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsInviteModalOpen(false);
                          setInviteName('');
                          setInviteEmail('');
                          setInviteDescription('');
                          setInviteError(null);
                        }}
                        className="bg-secondary text-secondary-foreground font-semibold py-2 px-4 rounded-[var(--radius)] hover:bg-secondary/80 transition-colors shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isInviting || !inviteName.trim() || !inviteEmail.trim()}
                        className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-[var(--radius)] hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed shadow-sm"
                      >
                        {isInviting ? 'Sending...' : 'Send Invite'}
                      </button>
                  </div>
              </form>
          </Card>
      </div>
    );
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
                        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Manage</button>
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
                <h2 className="text-2xl font-bold text-foreground">Integrations</h2>
                <p className="text-muted-foreground -mt-4">Connect your tools to power Aether's AI insights.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Shopify</h3>
                            <button className="bg-chart-2/20 text-chart-2 font-semibold py-1 px-3 rounded-[var(--radius)] text-sm cursor-default">Connected</button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Sync your sales, product, and customer data for real-time analytics.</p>
                    </Card>
                    <Card>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">HubSpot</h3>
                            <button className="bg-primary text-primary-foreground font-semibold py-1 px-3 rounded-[var(--radius)] text-sm hover:bg-primary/90 transition-colors shadow-sm">Connect</button>
                        </div>
                         <p className="text-sm text-muted-foreground mt-2">Integrate your CRM to track leads and funnels directly within Aether.</p>
                    </Card>
                    <Card>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Google Analytics</h3>
                            <button className="bg-primary text-primary-foreground font-semibold py-1 px-3 rounded-[var(--radius)] text-sm hover:bg-primary/90 transition-colors shadow-sm">Connect</button>
                        </div>
                         <p className="text-sm text-muted-foreground mt-2">Get deeper insights into your website traffic and user behavior.</p>
                    </Card>
                     <Card>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Slack</h3>
                            <button className="bg-primary text-primary-foreground font-semibold py-1 px-3 rounded-[var(--radius)] text-sm hover:bg-primary/90 transition-colors shadow-sm">Connect</button>
                        </div>
                         <p className="text-sm text-muted-foreground mt-2">Receive important Aether notifications directly in your Slack channels.</p>
                    </Card>
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
    {isInviteModalOpen && <InviteMemberModal />}
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