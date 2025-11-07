import React, { FormEvent, useMemo, useState } from 'react';
import { SparklesIcon, PlusIcon, UsersIcon, ClockIcon } from './shared/Icons';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem, transitions } from '@/lib/motion';
import { useAuth } from '../contexts/AuthContext';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useChannelMessages } from '../hooks/useChannelMessages';
import { useChannels } from '../hooks/useChannels';
import { useTeamSearch } from '../hooks/useTeamSearch';
import { TeamMember, Channel } from '../types';
import { cn } from '@/lib/utils';

const TeamChat: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  // Modals
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isChannelSettingsOpen, setIsChannelSettingsOpen] = useState(false);
  
  // Create channel form
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [newChannelType, setNewChannelType] = useState<Channel['type']>('public');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const { searchResults, searching, searchUsers, clearSearch } = useTeamSearch();

  const { members } = useTeamMembers(user?.uid);
  const { 
    channels, 
    publicChannels, 
    privateChannels, 
    directChannels,
    loading: channelsLoading,
    createChannel,
    updateChannel,
    addMemberToChannel,
    removeMemberFromChannel,
    leaveChannel,
  } = useChannels(user?.uid);
  
  const { messages, loading: messagesLoading, sendMessage } = useChannelMessages(
    user?.uid, 
    selectedChannelId || undefined
  );

  const selectedChannel = useMemo(
    () => channels.find((ch) => ch.id === selectedChannelId) || null,
    [channels, selectedChannelId]
  );

  // Auto-select first channel if none selected
  React.useEffect(() => {
    if (!selectedChannelId && channels.length > 0) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  const currentUserMember: TeamMember = useMemo(
    () => ({
      id: user?.uid ?? 'anonymous',
      name: user?.displayName ?? user?.email ?? 'Anonymous User',
      role: 'Owner',
      avatar:
        user?.photoURL ??
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.displayName ?? user?.email ?? 'Aether User')}`,
      email: user?.email || undefined,
    }),
    [user]
  );

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!messageText.trim() || !selectedChannelId) {
      return;
    }
    
    const savedText = messageText.trim();
    setMessageText('');
    
    // Send in background
    sendMessage({
      content: savedText,
      sender: currentUserMember,
      channelId: selectedChannelId,
    }).then(() => {
      // Update last message time
      updateChannel(selectedChannelId, {
        lastMessageAt: new Date().toISOString(),
      }).catch(() => {
        // Silent fail for timestamp update
      });
    }).catch((error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message ?? 'Unable to send message.',
      });
      setMessageText(savedText); // Restore message on error
    });
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Channel name is required.',
      });
      return;
    }

    if (!user?.uid) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be signed in to create channels.',
      });
      return;
    }

    const savedName = newChannelName.trim();
    const savedDescription = newChannelDescription.trim();
    const savedType = newChannelType;
    const savedMembers = Array.isArray(selectedMembers) ? [...selectedMembers] : [];
    
    // Optimistically close modal and reset form
    setIsCreateChannelOpen(false);
    setNewChannelName('');
    setNewChannelDescription('');
    setNewChannelType('public');
    setSelectedMembers([]);
    setSearchTerm('');
    clearSearch();

    // Create in background with proper error handling
    try {
      const channelId = await createChannel(
        savedName,
        savedMembers,
        savedType,
        savedDescription
      );
      
      toast({
        title: 'Channel Created',
        description: `Channel "#${savedName}" has been created successfully.`,
      });
      
      // Select the new channel
      if (channelId) {
        setSelectedChannelId(channelId);
      }
    } catch (error: any) {
      // Restore form on error
      setNewChannelName(savedName);
      setNewChannelDescription(savedDescription);
      setNewChannelType(savedType);
      setSelectedMembers(savedMembers);
      setIsCreateChannelOpen(true);
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Failed to create channel. Please try again.',
      });
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      searchUsers(term);
    } else {
      clearSearch();
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleAddMemberToChannel = async (memberId: string) => {
    if (!selectedChannelId || !user?.uid) return;
    
    const member = Array.isArray(members) ? members.find(m => m?.id === memberId) : null;
    
    try {
      await addMemberToChannel(selectedChannelId, memberId);
      toast({
        title: 'Member Added',
        description: member ? `${member.name} has been added to the channel` : 'Member added',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message ?? 'Failed to add member',
      });
    }
  };

  const handleRemoveMemberFromChannel = async (memberId: string) => {
    if (!selectedChannelId) return;
    
    const member = members.find(m => m.id === memberId);
    removeMemberFromChannel(selectedChannelId, memberId).then(() => {
      toast({
        title: 'Member Removed',
        description: member ? `${member.name} has been removed from the channel` : 'Member removed',
      });
    }).catch((error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message ?? 'Failed to remove member',
      });
    });
  };

  const handleLeaveChannel = async () => {
    if (!selectedChannelId) return;
    
    const channelName = selectedChannel?.name || 'channel';
    leaveChannel(selectedChannelId).then(() => {
      toast({
        title: 'Channel Left',
        description: `You've left #${channelName}`,
      });
      setSelectedChannelId(null);
    }).catch((error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message ?? 'Failed to leave channel',
      });
    });
  };

  const channelMembers = useMemo(() => {
    if (!selectedChannel || !Array.isArray(selectedChannel.members)) return [];
    if (!Array.isArray(members)) return [];
    return members.filter((member) => member?.id && selectedChannel.members.includes(member.id));
  }, [selectedChannel, members]);

  return (
    <>
      <Dialog open={isCreateChannelOpen} onOpenChange={(open) => {
        setIsCreateChannelOpen(open);
        if (!open) {
          setNewChannelName('');
          setNewChannelDescription('');
          setNewChannelType('public');
          setSelectedMembers([]);
          setSearchTerm('');
          clearSearch();
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
            <DialogDescription>
              Create a new channel for your team. You can make it public or private.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel Name *</Label>
              <Input
                id="channel-name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g., project-alpha, design-team"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-description">Description (Optional)</Label>
              <Textarea
                id="channel-description"
                value={newChannelDescription}
                onChange={(e) => setNewChannelDescription(e.target.value)}
                placeholder="What's this channel about?"
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-type">Channel Type</Label>
              <Select value={newChannelType} onValueChange={(v) => setNewChannelType(v as Channel['type'])}>
                <SelectTrigger id="channel-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone in workspace can join</SelectItem>
                  <SelectItem value="private">Private - Invite only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Add Members</Label>
              <SearchInput
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name or email..."
              />

              {/* Search Results */}
              {searchTerm.trim() && (
                <div className="border border-border rounded-md max-h-[200px] overflow-y-auto">
                  {searching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="divide-y divide-border">
                      {searchResults.map((member) => (
              <button
                          key={member.id}
                          onClick={() => toggleMemberSelection(member.id)}
                          className={cn(
                            "w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors",
                            selectedMembers.includes(member.id) && "bg-muted"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>
                                {member.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                              <p className="text-sm font-medium text-foreground">{member.name}</p>
                              {member.email && (
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant={selectedMembers.includes(member.id) ? 'default' : 'outline'}>
                            {selectedMembers.includes(member.id) ? 'Selected' : 'Select'}
                          </Badge>
              </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No users found
                    </div>
                  )}
                </div>
              )}

              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="border border-border rounded-md p-3">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Selected Members ({selectedMembers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((memberId) => {
                      const member = searchResults.find((m) => m.id === memberId) || 
                                    members.find((m) => m.id === memberId);
                      if (!member) return null;
                      return (
                        <Badge key={memberId} variant="secondary" className="gap-1">
                  {member.name}
                          <button
                            onClick={() => toggleMemberSelection(memberId)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateChannelOpen(false)}
              className="border-border hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateChannel} 
              disabled={!newChannelName.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Create Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChannelSettingsOpen && !!selectedChannel} onOpenChange={setIsChannelSettingsOpen}>
        {selectedChannel && (
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Channel Settings</DialogTitle>
              <DialogDescription>
                Manage channel information and members for #{selectedChannel?.name || 'channel'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Channel Info */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">Channel Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <p className="text-foreground font-medium"># {selectedChannel?.name || 'Unnamed'}</p>
                  </div>
                  {selectedChannel?.description && (
                    <div>
                      <span className="text-sm text-muted-foreground">Description:</span>
                      <p className="text-foreground">{selectedChannel.description}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <Badge variant="secondary" className="ml-2 capitalize">
                      {selectedChannel?.type || 'public'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <p className="text-foreground">
                      {selectedChannel?.createdAt ? new Date(selectedChannel.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-foreground">
                    Members ({channelMembers?.length || 0})
                  </h4>
                  {selectedChannel && selectedChannel.createdBy === user?.uid && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border hover:bg-muted"
                      onClick={() => {
                        setIsChannelSettingsOpen(false);
                        setIsCreateChannelOpen(true);
                      }}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Members
                    </Button>
                  )}
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {channelMembers && channelMembers.length > 0 ? (
                    channelMembers.map((member) => {
                      if (!member || !member.id) return null;
                      return (
                        <Card key={member.id}>
                          <CardContent className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.avatar} alt={member.name || 'Member'} />
                                <AvatarFallback>
                                  {(member.name || 'M')[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-foreground">{member.name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">{member.email || member.role || ''}</p>
                              </div>
                              {selectedChannel && member.id === selectedChannel.createdBy && (
                                <Badge variant="default" className="ml-2 text-xs">
                                  Creator
                                </Badge>
                              )}
                            </div>
                            {selectedChannel && selectedChannel.createdBy === user?.uid && member.id !== user?.uid && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMemberFromChannel(member.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                Remove
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No members found
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedChannel && selectedChannel.createdBy !== user?.uid && (
                <div className="border-t border-border pt-4">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLeaveChannel}
                  >
                    Leave Channel
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Main Chat Interface */}
      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        exit={fadeInUp.exit}
        transition={transitions.quick}
        className="flex h-full gap-4"
      >
        {/* Channels Sidebar */}
        <Card className="w-full md:w-1/4 flex-shrink-0 flex flex-col max-h-full">
          <CardHeader className="flex-shrink-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Channels</CardTitle>
                <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    title="Create Channel"
                    className="hover:bg-muted text-foreground"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4 p-4 pt-0">
            {channelsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                {/* Public Channels */}
                {publicChannels.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Public</h3>
                    <ul className="space-y-1">
                      {publicChannels.map((channel) => (
                        <motion.li
                          key={channel.id}
                          variants={staggerItem}
                          whileHover={{ x: 4 }}
                          transition={transitions.quick}
                        >
                    <Button
                      variant={selectedChannelId === channel.id ? 'secondary' : 'ghost'}
                      className={cn(
                        "w-full justify-start text-foreground hover:bg-muted",
                        selectedChannelId === channel.id && "bg-secondary text-secondary-foreground"
                      )}
                      onClick={() => setSelectedChannelId(channel.id)}
                    >
                      <span className="mr-2">#</span>
                      <span className="flex-1 text-left truncate">{channel.name || 'Unnamed Channel'}</span>
                      {channel.lastMessageAt && (
                        <ClockIcon className="w-3 h-3 ml-2 text-muted-foreground flex-shrink-0" />
                      )}
                    </Button>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Private Channels */}
                {privateChannels.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Private</h3>
                    <ul className="space-y-1">
                      {privateChannels.map((channel) => (
                        <motion.li
                          key={channel.id}
                          variants={staggerItem}
                          whileHover={{ x: 4 }}
                          transition={transitions.quick}
                        >
                          <Button
                            variant={selectedChannelId === channel.id ? 'secondary' : 'ghost'}
                            className={cn(
                              "w-full justify-start text-foreground hover:bg-muted",
                              selectedChannelId === channel.id && "bg-secondary text-secondary-foreground"
                            )}
                            onClick={() => setSelectedChannelId(channel.id)}
                          >
                            <span className="mr-2">🔒</span>
                            <span className="flex-1 text-left truncate">{channel.name || 'Unnamed Channel'}</span>
                          </Button>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {channels.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-3">No channels yet</p>
                <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Create Your First Channel
                    </Button>
                  </DialogTrigger>
                </Dialog>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {selectedChannel ? (
            <>
              <Card className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <CardHeader className="flex-shrink-0 pb-4 border-b border-border">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl"># {selectedChannel?.name || 'Channel'}</CardTitle>
                        <Dialog open={isChannelSettingsOpen && !!selectedChannel} onOpenChange={setIsChannelSettingsOpen}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <UsersIcon className="h-5 w-5" />
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </div>
                      {selectedChannel?.description && (
                        <CardDescription className="mt-1">
                          {selectedChannel.description}
                        </CardDescription>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {channelMembers?.length || 0} {(channelMembers?.length || 0) === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 border-border hover:bg-muted">
                      <SparklesIcon className="h-4 w-4 text-primary" />
                      <span className="text-foreground">Summarize</span>
                    </Button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto py-4 min-h-0">
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages.length > 0 ? (
                    <motion.div
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className="space-y-6"
                    >
                      {messages.map((message) => {
                        if (!message || !message.sender) return null;
                        return (
                          <motion.div
                            key={message.id || `msg-${Date.now()}-${Math.random()}`}
                            variants={staggerItem}
                            initial="initial"
                            animate="animate"
                            className="flex items-start gap-3"
                          >
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={message.sender?.avatar} alt={message.sender?.name || 'User'} />
                              <AvatarFallback>
                                {(message.sender?.name || 'U')[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-foreground text-sm">
                                  {message.sender?.name || 'Unknown User'}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {message.timestamp || new Date().toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-foreground whitespace-pre-line break-words">
                                {message.content || ''}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <div className="text-center text-muted-foreground py-10">
                <SparklesIcon className="w-6 h-6 mx-auto text-primary mb-2" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
                </CardContent>

          {/* AI Suggestions */}
                <div className="py-2 px-6 border-t border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex gap-2 overflow-x-auto">
                {['Got it, thanks!', 'Will get it done.', 'Can we discuss later?'].map((suggestion) => (
                        <Button
                    key={suggestion}
                          variant="outline"
                          size="sm"
                    onClick={() => setMessageText(suggestion)}
                          className="whitespace-nowrap text-xs"
                  >
                          "{suggestion}"
                        </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Message Input */}
              <Card className="p-4 flex-shrink-0">
                <CardContent className="p-0">
          <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row gap-3">
                    <Input
              type="text"
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
                      placeholder={selectedChannel?.name ? `Message #${selectedChannel.name}...` : 'Type a message...'}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={!messageText.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Send
                    </Button>
          </form>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <CardContent className="text-center py-12">
                <UsersIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Welcome to Team Chat</h3>
                <p className="text-muted-foreground mb-4">Select a channel to start messaging</p>
                <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Create a Channel
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
        </Card>
          )}
      </div>
      </motion.div>
    </>
  );
};

export default TeamChat;
