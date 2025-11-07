import React, { useMemo, useState } from 'react';
import Card from './shared/Card';
import { SparklesIcon, CalendarIcon } from './shared/Icons';
import { generateSocialPost } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useSocialStats } from '../hooks/useSocialStats';
import { useScheduledPosts } from '../hooks/useScheduledPosts';
import { useToast } from '@/hooks/use-toast';

const SocialAnalytics: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { stats, loading: statsLoading } = useSocialStats(user?.uid);
    const { posts: scheduledPosts, loading: postsLoading, schedulePost } = useScheduledPosts(user?.uid);
    const [topic, setTopic] = useState('');
    const [platform, setPlatform] = useState('Twitter / X');
    const [tone, setTone] = useState('Professional');
    const [generatedPost, setGeneratedPost] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePost = async () => {
        if (!topic) return;
        setIsGenerating(true);
        setGeneratedPost('');
        try {
            const post = await generateSocialPost(topic, platform, tone);
            setGeneratedPost(post);
            toast({
                title: 'Post Generated',
                description: 'Your social media post has been generated successfully.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: error?.message ?? 'Failed to generate post. Please try again.',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSchedulePost = async () => {
        if (!generatedPost || !user) return;
        
        const savedPost = generatedPost;
        const savedPlatform = platform;
        const savedTopic = topic;
        const date = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        // Optimistic update
        setGeneratedPost('');
        setTopic('');
        
        schedulePost({
            content: savedPost,
            platform: savedPlatform,
            date,
        }).then(() => {
            toast({
                title: 'Post Scheduled',
                description: 'Your post has been scheduled successfully.',
            });
        }).catch((error: any) => {
            // Restore on error
            setGeneratedPost(savedPost);
            setTopic(savedTopic || '');
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.message ?? 'Failed to schedule post. Please try again.',
            });
        });
    };

    const socialStats = useMemo(() => stats, [stats]);

  return (
    <div className="space-y-8">
      {socialStats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            <Card className="p-6 text-muted-foreground">Loading analytics...</Card>
          ) : (
            socialStats.map(stat => (
              <Card key={stat.id}>
                <h3 className="text-lg font-medium text-foreground">{stat.platform}</h3>
                <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-chart-2' : 'text-destructive'}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">{stat.metric}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">AI Post Generator</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Topic</label>
                    <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 'New product launch'" className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Platform</label>
                    <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border">
                    <option>Twitter / X</option>
                    <option>LinkedIn</option>
                    <option>Instagram</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Tone</label>
                    <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border">
                    <option>Professional</option>
                    <option>Witty</option>
                    <option>Excited</option>
                    <option>Informative</option>
                    </select>
                </div>
                </div>

                <button onClick={handleGeneratePost} disabled={isGenerating || !topic} className="w-full bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-[var(--radius)] hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed shadow-sm">
                    {isGenerating ? (
                         <>
                            <svg className="animate-spin h-5 w-5" style={{ color: 'var(--foreground)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Generating...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            Generate Post
                        </>
                    )}
                </button>

                {generatedPost && (
                     <div className="mt-6 bg-card/50 p-4 rounded-[var(--radius)] border border-border">
                        <h4 className="font-semibold text-foreground mb-2">Generated Post:</h4>
                        <p className="text-foreground whitespace-pre-wrap">{generatedPost}</p>
                        <div className="flex gap-2 mt-4">
                            <button 
                                onClick={() => {
                                    toast({
                                        title: 'Connect Social Media',
                                        description: 'Please connect your social media account to post directly. Go to Settings to connect.',
                                    });
                                }}
                                className="bg-primary text-primary-foreground font-semibold py-1 px-3 rounded-[var(--radius)] text-sm hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                Post Now
                            </button>
                            <button onClick={handleSchedulePost} className="bg-secondary text-secondary-foreground font-semibold py-1 px-3 rounded-[var(--radius)] text-sm hover:bg-secondary/80 transition-colors">Schedule</button>
                        </div>
                    </div>
                )}
            </Card>
            <Card>
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon />
                  <h3 className="text-xl font-semibold text-foreground">Scheduled Posts</h3>
                </div>
                <div className="space-y-3">
                    {postsLoading ? (
                        <p className="text-muted-foreground text-sm">Loading scheduled posts...</p>
                    ) : scheduledPosts.length > 0 ? scheduledPosts.map(post => (
                        <div key={post.id} className="p-3 bg-card/50 rounded-[var(--radius)] border border-border">
                            <p className="text-sm text-foreground truncate">{post.content}</p>
                            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                <span>Platform: {post.platform}</span>
                                <span>Date: {new Date(post.date).toLocaleString()}</span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-muted-foreground text-sm text-center py-4">No posts scheduled.</p>
                    )}
                </div>
            </Card>
        </div>
    </div>
  );
};

export default SocialAnalytics;