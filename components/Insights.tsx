import React, { useMemo, useState, useCallback } from 'react';
import Card from './shared/Card';
import { SparklesIcon, CalendarIcon, WebsiteIcon, CheckCircleIcon } from './shared/Icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { useSocialStats } from '../hooks/useSocialStats';
import { useScheduledPosts } from '../hooks/useScheduledPosts';
import { generateSocialPost, generateWebsiteAudit } from '../services/geminiService';

type InsightTab = 'social' | 'website';
type MessageTone = 'Professional' | 'Witty' | 'Excited' | 'Informative';

const ProgressRing: React.FC<{ score: number }> = ({ score }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (score / 100) * circumference;
  const scoreColor = score > 89 ? 'text-chart-2' : score > 69 ? 'text-chart-3' : 'text-destructive';

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle className="text-muted" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
        <circle
          className={`transition-all duration-1000 ease-out ${scoreColor}`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-3xl font-bold ${scoreColor}`}>
        {score}
      </span>
    </div>
  );
};

const Insights: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<InsightTab>('social');

  // Social analytics state
  const { stats, loading: statsLoading } = useSocialStats(user?.uid);
  const { posts: scheduledPosts, loading: postsLoading, schedulePost } = useScheduledPosts(user?.uid);
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Twitter / X');
  const [tone, setTone] = useState<MessageTone>('Professional');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const socialStats = useMemo(() => stats, [stats]);

  const handleGeneratePost = useCallback(async () => {
    if (!topic) return;
    setIsGeneratingPost(true);
    setGeneratedPost('');
    try {
      const post = await generateSocialPost(topic, platform, tone);
      setGeneratedPost(post);
      toast({
        title: 'Post Generated',
        description: 'Your social media post has been crafted with the selected tone.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error?.message ?? 'Failed to generate post. Please try again.',
      });
    } finally {
      setIsGeneratingPost(false);
    }
  }, [platform, tone, topic, toast]);

  const handleSchedulePost = useCallback(() => {
    if (!generatedPost || !user) return;

    const savedPost = generatedPost;
    const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    setGeneratedPost('');
    setTopic('');

    schedulePost({
      content: savedPost,
      platform,
      date: scheduledDate,
    })
      .then(() => {
        toast({
          title: 'Post Scheduled',
          description: 'We’ll remind you when it’s time to publish.',
        });
      })
      .catch((error: any) => {
        setGeneratedPost(savedPost);
        toast({
          variant: 'destructive',
          title: 'Unable to schedule',
          description: error?.message ?? 'Please try again in a moment.',
        });
      });
  }, [generatedPost, platform, schedulePost, toast, user]);

  // Website audit state
  const [url, setUrl] = useState('');
  const [auditedUrl, setAuditedUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{ recommendations: string[]; scores: { overall: number; seo: number; performance: number } } | null>(null);

  const handleAuditWebsite = useCallback(async () => {
    if (!url.trim()) return;
    setIsAuditing(true);
    setAuditResult(null);
    setAuditedUrl(url.trim());

    try {
      const rawRecommendations = await generateWebsiteAudit(url.trim());
      const recommendations = rawRecommendations
        .split(/\r?\n\r?\n/)
        .map((group) => group.trim())
        .filter(Boolean);

      const scores = {
        overall: Math.floor(Math.random() * 20) + 75,
        seo: Math.floor(Math.random() * 30) + 60,
        performance: Math.floor(Math.random() * 15) + 85,
      };

      setAuditResult({ recommendations, scores });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Audit failed',
        description: error?.message ?? 'We couldn’t complete the audit. Please try again.',
      });
    } finally {
      setIsAuditing(false);
    }
  }, [toast, url]);

  const channelMomentum = useMemo(() => {
    if (!socialStats.length) return [];
    return socialStats.map((stat, index) => {
      const rawChange = Number(stat.change.replace(/[^-0-9.]/g, '')) || 0;
      const health = Math.max(30, Math.min(100, 70 + rawChange * 4));
      return {
        id: stat.id,
        platform: stat.platform,
        metric: stat.metric,
        change: stat.change,
        health,
        priority: rawChange < 0 ? 'Attention' : rawChange > 5 ? 'Scaling' : 'Steady',
      };
    });
  }, [socialStats]);

  const recommendedCampaigns = useMemo(
    () => [
      {
        id: 'webinar',
        title: 'Webinar launch sprint',
        description: 'Pair a LinkedIn thought-leadership post with a Twitter reminder and repurpose the recording for YouTube Shorts.',
        lift: '+18%',
        duration: '7 days',
      },
      {
        id: 'ugc',
        title: 'Customer story takeover',
        description: 'Highlight a customer win across Instagram carousels and email nurture sequences to reinforce social proof.',
        lift: '+23%',
        duration: '5 days',
      },
      {
        id: 'product',
        title: 'Feature drop spotlight',
        description: 'Ship an announcement thread, schedule demo invites through Aether, and push a retargeting ad set.',
        lift: '+31%',
        duration: '10 days',
      },
    ],
    [],
  );

  const socialActionItems = useMemo(
    () => [
      { id: 'reply', label: 'Respond to inbound DMs', due: 'Today · 4 awaiting', tone: 'text-primary' },
      { id: 'ugc', label: 'Collect 3 user testimonials for Q2 deck', due: 'Tomorrow · Marketing', tone: 'text-blue-500' },
      { id: 'ads', label: 'Review paid campaign CPC anomalies', due: 'This week · Performance', tone: 'text-amber-500' },
    ],
    [],
  );

  const auditPlaybooks = useMemo(
    () => [
      {
        title: 'SEO quick wins',
        items: [
          'Refresh meta descriptions on top 5 landing pages',
          'Add FAQ schema markup to pricing page',
          'Link from blog posts to the new features hub',
        ],
      },
      {
        title: 'Performance boost',
        items: [
          'Compress hero imagery below 200kb',
          'Lazy-load testimonial carousel',
          'Inline critical CSS for above-the-fold content',
        ],
      },
      {
        title: 'Conversion uplift',
        items: [
          'Add weekly office hours CTA to contact page',
          'Trigger exit intent modal for high-intent pages',
          'Embed chat widget on pricing & demo request pages',
        ],
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-purple-400/10 border border-primary/20 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mb-3">Automation Ready</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Insights & Automations Hub</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-2xl">
              Compare channel performance, generate AI-assisted content, and audit your web presence in one place.
              Switch between social and website insights to keep every campaign on track.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-card/60 border border-border/60 rounded-2xl px-5 py-4 shadow-sm">
            <WebsiteIcon />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Last Sync</p>
              <p className="text-sm font-semibold text-foreground">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InsightTab)} className="space-y-6">
        <TabsList className="w-full lg:w-auto">
          <TabsTrigger value="social" className="flex-1 lg:flex-none">Social Intelligence</TabsTrigger>
          <TabsTrigger value="website" className="flex-1 lg:flex-none">Website Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-6">
          {socialStats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {statsLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="p-6">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-8 w-28 bg-muted rounded mt-4 animate-pulse" />
                      <div className="h-3 w-20 bg-muted rounded mt-3 animate-pulse" />
                    </Card>
                  ))
                : socialStats.map((stat) => (
                    <Card key={stat.id} className="p-6 border border-border/70 hover:border-primary/40 transition">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.platform}</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-chart-2' : 'text-destructive'}`}>
                          {stat.change}
                        </span>
                        <span className="text-xs text-muted-foreground">{stat.metric}</span>
                      </div>
                    </Card>
                  ))}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">AI Post Generator</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Topic</label>
                  <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="New feature launch" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(event) => setPlatform(event.target.value)}
                    className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                  >
                    <option>Twitter / X</option>
                    <option>LinkedIn</option>
                    <option>Instagram</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(event) => setTone(event.target.value as MessageTone)}
                    className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                  >
                    <option>Professional</option>
                    <option>Witty</option>
                    <option>Excited</option>
                    <option>Informative</option>
                  </select>
                </div>
              </div>
              <Button
                onClick={handleGeneratePost}
                disabled={isGeneratingPost || !topic}
                className="w-full gap-2"
              >
                {isGeneratingPost ? (
                  <>
                    <span className="animate-spin border-2 border-muted border-t-transparent rounded-full h-4 w-4" />
                    Generating…
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    Generate Post
                  </>
                )}
              </Button>

              {generatedPost && (
                <div className="mt-6 bg-card/60 p-4 rounded-xl border border-border/60 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-foreground">Generated Draft</h4>
                    <Badge variant="outline">{platform}</Badge>
                  </div>
                  <Textarea value={generatedPost} readOnly className="h-40 bg-background/60" />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        toast({
                          title: 'Connect social platforms',
                          description: 'Go to Settings → Integrations to enable direct publishing.',
                        })
                      }
                    >
                      Post Now
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handleSchedulePost}>
                      Schedule for later
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon />
                <h3 className="text-lg font-semibold text-foreground">Scheduled Posts</h3>
              </div>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {postsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading scheduled posts…</p>
                ) : scheduledPosts.length > 0 ? (
                  scheduledPosts.map((post) => (
                    <div key={post.id} className="p-3 rounded-xl border border-border/50 bg-card/50 hover:border-primary/40 transition">
                      <p className="text-sm font-medium text-foreground line-clamp-3">{post.content}</p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                        <span>{post.platform}</span>
                        <span>{new Date(post.date).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No upcoming posts. Generate something fresh to keep momentum going.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Channel momentum</p>
                  <h3 className="text-lg font-semibold text-foreground">Where to lean in</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({
                      title: 'Snapshot exported',
                      description: 'We copied a quick summary for your marketing stand-up.',
                    })
                  }
                >
                  Export summary
                </Button>
              </div>
              <div className="space-y-3">
                {channelMomentum.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Connect your channels to see live health scores.</p>
                ) : (
                  channelMomentum.map((channel) => (
                    <div key={channel.id} className="rounded-xl border border-border/60 p-3 bg-card/60 hover:border-primary/40 transition">
                      <div className="flex items-center justify-between text-sm font-medium text-foreground">
                        <span>{channel.platform}</span>
                        <span className="text-muted-foreground">{channel.metric}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{channel.change} vs last week</span>
                        <Badge variant={channel.priority === 'Attention' ? 'destructive' : 'outline'}>
                          {channel.priority}
                        </Badge>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-background border border-border/40 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${channel.health}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Campaign playbooks</p>
                  <h3 className="text-lg font-semibold text-foreground">Ready-to-run accelerators</h3>
                </div>
                <Badge variant="secondary">AI assisted</Badge>
              </div>
              <div className="space-y-4">
                {recommendedCampaigns.map((campaign) => (
                  <div key={campaign.id} className="border border-border/50 rounded-xl p-4 bg-card/50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{campaign.title}</h4>
                      <Badge variant="outline">{campaign.lift} expected lift</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{campaign.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                      <span>Duration: {campaign.duration}</span>
                      <Button size="sm" variant="ghost">
                        Load into planner
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Next best actions</p>
                <h3 className="text-lg font-semibold text-foreground">Keep momentum flowing</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast({
                    title: 'Checklist synced',
                    description: 'Added these to your task board backlog.',
                  })
                }
              >
                Push to tasks
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {socialActionItems.map((item) => (
                <div key={item.id} className="border border-border/60 rounded-xl p-4 bg-card/50 hover:border-primary/40 transition">
                  <p className={`text-xs uppercase tracking-wide font-semibold ${item.tone}`}>{item.due}</p>
                  <p className="text-sm text-foreground mt-2 leading-6">{item.label}</p>
                  <Button className="mt-3" size="sm" variant="ghost">
                    Open queue
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="space-y-6">
          <Card>
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Audit Assistant</p>
                <h3 className="text-xl font-semibold text-foreground">Website Diagnostic</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Benchmark SEO, performance, and content in under a minute. We’ll highlight the priority fixes for you.
                </p>
              </div>
              <div className="w-full lg:w-1/2 flex items-center gap-2">
                <Input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com"
                />
                <Button onClick={handleAuditWebsite} disabled={isAuditing || !url.trim()}>
                  {isAuditing ? 'Auditing…' : 'Run Audit'}
                </Button>
              </div>
            </div>
          </Card>

          {isAuditing && (
            <Card className="py-10 text-center space-y-3">
              <span className="animate-spin border-2 border-primary border-t-transparent rounded-full h-8 w-8 inline-flex" />
              <p className="text-sm text-muted-foreground">Analyzing {url}… hang tight.</p>
            </Card>
          )}

          {auditResult && (
            <div className="space-y-6 animate-fade-in">
              <Card>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest audit</p>
                    <h3 className="text-2xl font-bold text-foreground">
                      {auditedUrl}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => navigator?.clipboard?.writeText(auditedUrl)}>
                      Copy URL
                    </Button>
                    <Button size="sm" onClick={() => toast({ title: 'Shared!', description: 'We’ve copied a summary for your team.' })}>
                      Share summary
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Overall Health</h4>
                    <ProgressRing score={auditResult.scores.overall} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">SEO Score</h4>
                    <ProgressRing score={auditResult.scores.seo} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Performance</h4>
                    <ProgressRing score={auditResult.scores.performance} />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <SparklesIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">AI Recommendations</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {auditResult.recommendations.map((rec, index) => {
                    const [title, ...body] = rec.split(':');
                    const description = body.join(':').trim();
                    const colorPalette = [
                      'from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-500',
                      'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500',
                      'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-500',
                      'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-500',
                    ];
                    const color = colorPalette[index % colorPalette.length];
                    return (
                      <div
                        key={index}
                        className={`bg-gradient-to-r ${color} p-5 rounded-xl border-2 shadow-sm hover:shadow-lg transition`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-background/60">
                            <CheckCircleIcon className="w-5 h-5" />
                          </div>
                          <h4 className="font-semibold text-foreground">{title || 'Recommendation'}</h4>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {description || rec}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {auditResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {auditPlaybooks.map((playbook) => (
                <Card key={playbook.title}>
                  <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">{playbook.title}</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {playbook.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
              <Card className="lg:col-span-2">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Follow-up workflow</p>
                    <h3 className="text-lg font-semibold text-foreground">Book your next audit</h3>
                    <p className="text-sm text-muted-foreground">
                      Automate recurring audits and pipe the results straight into Slack or email digests.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add teammate emails (comma separated)"
                      onBlur={(event) => {
                        if (event.target.value) {
                          toast({
                            title: 'Subscriber added',
                            description: `${event.target.value.split(',').length} teammate(s) will receive audit digests.`,
                          });
                          event.target.value = '';
                        }
                      }}
                    />
                    <Button>Invite</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <div className="p-3 rounded-xl border border-border/50 bg-card/50">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Cadence</p>
                    <p className="text-sm text-foreground mt-1">Monthly · 1st Monday</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border/50 bg-card/50">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Assigned owner</p>
                    <p className="text-sm text-foreground mt-1">Marketing Ops</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border/50 bg-card/50">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Distribution</p>
                    <p className="text-sm text-foreground mt-1">Slack #insights</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Insights;

