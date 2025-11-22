import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { SparklesIcon, TasksIcon, ClockIcon, EnvelopeIcon, CheckIcon } from './shared/Icons';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem, transitions } from '@/lib/motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { useAssignedTasks } from '../hooks/useAssignedTasks';
import { useProjectInvites } from '../hooks/useProjectInvites';
import { useNotifications } from '../hooks/useNotifications';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useLeads } from '../hooks/useLeads';
import { useUserProfile } from '../hooks/useUserProfile';
import { generateBusinessInsights } from '../services/deepseekService';
import { cn } from '@/lib/utils';
import { PageContainer, PageHeader, PageSection } from './layout/Page';

const Dashboard: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { kpis, monthlySales, loading, uploadDashboardData } = useDashboard(user?.uid);
  const { incompleteTasks, upcomingDeadlines, loading: tasksLoading } = useAssignedTasks(user?.uid);
  const { pendingInvites, acceptInvite, declineInvite } = useProjectInvites(user?.uid);
  const { unreadCount } = useNotifications(user?.uid);
  const { tasks, tasksByStatus } = useTasks(user?.uid);
  const { projects } = useProjects(user?.uid);
  const { leads, loading: leadsLoading } = useLeads(user?.uid);
  const { profile } = useUserProfile(user?.uid);
  const { toast } = useToast();

  // Calculate real data metrics from actual tracked data
  const realDataMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Active Projects: Count projects that are not completed
    const activeProjects = projects.filter(project => 
      project.status !== 'completed' && project.status !== 'cancelled'
    ).length;
    
    // Previous month active projects
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Get projects created this month vs last month for trend
    const projectsThisMonth = projects.filter(project => {
      if (!project.createdAt) return false;
      const projectDate = new Date(project.createdAt);
      return projectDate.getMonth() === currentMonth && projectDate.getFullYear() === currentYear;
    }).length;
    
    const projectsLastMonth = projects.filter(project => {
      if (!project.createdAt) return false;
      const projectDate = new Date(project.createdAt);
      return projectDate.getMonth() === lastMonth && projectDate.getFullYear() === lastMonthYear;
    }).length;
    
    const projectsChange = projectsLastMonth > 0
      ? ((projectsThisMonth - projectsLastMonth) / projectsLastMonth * 100).toFixed(1)
      : projectsThisMonth > 0 ? '100' : '0';
    
    // Open Leads: Count leads that are not converted or lost
    const openLeads = leads.filter(lead => 
      lead.status === 'new' || lead.status === 'contacted' || lead.status === 'qualified'
    ).length;
    
    // Leads created this month vs last month
    const leadsThisMonth = leads.filter(lead => {
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
    }).length;
    
    const leadsLastMonth = leads.filter(lead => {
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      return leadDate.getMonth() === lastMonth && leadDate.getFullYear() === lastMonthYear;
    }).length;
    
    const leadsChange = leadsLastMonth > 0
      ? ((leadsThisMonth - leadsLastMonth) / leadsLastMonth * 100).toFixed(1)
      : leadsThisMonth > 0 ? '100' : '0';
    
    // Tasks Completed This Week (7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tasksCompletedThisWeek = tasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= sevenDaysAgo;
    }).length;
    
    // Previous week completed tasks
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const tasksCompletedLastWeek = tasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= fourteenDaysAgo && completedDate < sevenDaysAgo;
    }).length;
    
    const tasksChange = tasksCompletedLastWeek > 0
      ? ((tasksCompletedThisWeek - tasksCompletedLastWeek) / tasksCompletedLastWeek * 100).toFixed(1)
      : tasksCompletedThisWeek > 0 ? '100' : '0';
    
    return {
      projects: {
        value: activeProjects.toString(),
        change: projectsChange,
        changeType: parseFloat(projectsChange) >= 0 ? 'increase' as const : 'decrease' as const,
      },
      leads: {
        value: openLeads.toString(),
        change: leadsChange,
        changeType: parseFloat(leadsChange) >= 0 ? 'increase' as const : 'decrease' as const,
      },
      tasks: {
        value: tasksCompletedThisWeek.toString(),
        change: tasksChange,
        changeType: parseFloat(tasksChange) >= 0 ? 'increase' as const : 'decrease' as const,
      },
    };
  }, [projects, leads, tasks]);
  // Project status distribution data
  const projectStatusData = useMemo(() => {
    const statusCounts = {
      'Planning': projects.filter(p => p.status === 'planning').length,
      'In Progress': projects.filter(p => p.status === 'inprogress').length,
      'Review': projects.filter(p => p.status === 'review').length,
      'Completed': projects.filter(p => p.status === 'completed').length,
    };
    
    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0) // Only show statuses with projects
      .map(([status, count]) => ({ status, count }));
  }, [projects]);
  
  const deriveTrend = (value: number) => {
    if (!Number.isFinite(value)) return 'steady' as const;
    if (value > 0) return 'up' as const;
    if (value < 0) return 'down' as const;
    return 'steady' as const;
  };

  const formatDelta = (value: number) => {
    if (!Number.isFinite(value)) {
      return 'No change vs last month';
    }
    if (value === 0) {
      return 'No change vs last month';
    }
    const prefix = value > 0 ? '+' : '-';
    const rounded = Math.abs(value).toFixed(1);
    return `${prefix}${rounded}% vs last month`;
  };

  const projectsDelta = parseFloat(realDataMetrics.projects.change);
  const leadsDelta = parseFloat(realDataMetrics.leads.change);
  const tasksDelta = parseFloat(realDataMetrics.tasks.change);

  const headerStats = [
    {
      label: 'Active projects',
      value: realDataMetrics.projects.value,
      trend: deriveTrend(projectsDelta),
      helper: projectsDelta === 0 ? 'No new projects this month' : formatDelta(projectsDelta),
    },
    {
      label: 'Open leads',
      value: realDataMetrics.leads.value,
      trend: deriveTrend(leadsDelta),
      helper: leadsDelta === 0 ? 'No new leads this month' : formatDelta(leadsDelta),
    },
    {
      label: 'Tasks completed this week',
      value: realDataMetrics.tasks.value,
      trend: deriveTrend(tasksDelta),
      helper: tasksDelta === 0 ? 'Same as last week' : `${tasksDelta > 0 ? '+' : ''}${tasksDelta}% vs last week`,
    },
  ];
  
  const [aiInsights, setAiInsights] = useState<Array<{ type: 'recommendation' | 'alert' | 'tip'; title: string; content: string }>>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Generate productivity/work tracking data for the last 7 days
  const productivityData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parsedTasks = tasks.map((task) => {
      const created = task.createdAt ? new Date(task.createdAt) : null;
      const completed = task.completedAt ? new Date(task.completedAt) : null;
      if (created) created.setSeconds(0, 0);
      if (completed) completed.setSeconds(0, 0);
      return {
        ...task,
        createdAtDate: created,
        completedAtDate: completed,
      };
    });

    const results = [];

    for (let offset = 6; offset >= 0; offset--) {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() - offset);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const completed = parsedTasks.filter(
        (task) => task.completedAtDate && task.completedAtDate >= dayStart && task.completedAtDate <= dayEnd,
      ).length;

      const created = parsedTasks.filter(
        (task) => task.createdAtDate && task.createdAtDate >= dayStart && task.createdAtDate <= dayEnd,
      ).length;

      const inProgress = parsedTasks.filter((task) => {
        const createdAt = task.createdAtDate;
        const completedAt = task.completedAtDate;
        if (!createdAt) return false;
        const started = createdAt <= dayEnd;
        const notCompletedYet = !completedAt || completedAt > dayEnd;
        return started && notCompletedYet;
      }).length;

      results.push({
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dayStart.toISOString().split('T')[0],
        completed,
        inProgress,
        created,
      });
    }

    return results;
  }, [tasks]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'kpi' | 'sales'>('kpi');
  
  // KPI type definitions
  const kpiTypes = [
    { value: 'revenue', label: 'Revenue', icon: '💰', placeholder: 'e.g., $125,430' },
    { value: 'leads', label: 'New Leads', icon: '👥', placeholder: 'e.g., 45' },
    { value: 'traffic', label: 'Website Traffic', icon: '🌐', placeholder: 'e.g., 12,543' },
    { value: 'tasks', label: 'Tasks Completed', icon: '✅', placeholder: 'e.g., 23' },
    { value: 'custom', label: 'Custom KPI', icon: '📊', placeholder: 'e.g., $125,430' },
  ];
  
  // KPI form fields
  const [kpiType, setKpiType] = useState('revenue');
  const [kpiTitle, setKpiTitle] = useState('');
  const [kpiValue, setKpiValue] = useState('');
  const [kpiChange, setKpiChange] = useState('');
  const [kpiChangeType, setKpiChangeType] = useState<'increase' | 'decrease'>('increase');
  
  // Sales form fields
  const [salesMonth, setSalesMonth] = useState('');
  const [salesAmount, setSalesAmount] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);

  // Update KPI title when type changes
  useEffect(() => {
    if (kpiType !== 'custom') {
      const selectedType = kpiTypes.find(t => t.value === kpiType);
      if (selectedType) {
        setKpiTitle(selectedType.label);
      }
    } else {
      setKpiTitle('');
    }
  }, [kpiType]);

  // Generate AI insights from user data
  useEffect(() => {
    if (!user?.uid || !profile) return;
    
    const loadInsights = async () => {
      setInsightsLoading(true);
      try {
        const insights = await generateBusinessInsights({
          businessName: profile.businessName,
          industry: profile.industry,
          goals: profile.goals,
          tasks: tasks,
          projects: projects,
          leads: leads,
          kpis: kpis,
          monthlySales: [], // Not tracking sales data
        });
        setAiInsights(insights);
      } catch (error) {
        console.error('Failed to generate insights:', error);
      } finally {
        setInsightsLoading(false);
      }
    };

    // Debounce insights generation
    const timer = setTimeout(loadInsights, 1000);
    return () => clearTimeout(timer);
  }, [user?.uid, profile, tasks, projects, leads, kpis]);

  const handleUploadData = async () => {
    if (!user?.uid) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be signed in to upload data.',
      });
      return;
    }

    setIsUploading(true);

    try {
      if (uploadType === 'kpi') {
        if (!kpiTitle.trim() || !kpiValue.trim() || !kpiChange.trim()) {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'All KPI fields are required.',
          });
          setIsUploading(false);
          return;
        }
        
        // Save form values before resetting
        const savedTitle = kpiTitle.trim();
        const savedValue = kpiValue.trim();
        const savedChange = kpiChange.trim();
        const savedChangeType = kpiChangeType;
        
        // Upload first, then close modal
        await uploadDashboardData('kpi', {
          title: savedTitle,
          value: savedValue,
          change: savedChange,
          changeType: savedChangeType,
        });
        
        // Reset form and close modal only after success
        setIsUploadModalOpen(false);
        setKpiType('revenue');
        setKpiTitle('');
        setKpiValue('');
        setKpiChange('');
        setKpiChangeType('increase');
        
        toast({
          title: 'Success',
          description: 'KPI data uploaded successfully.',
        });
      } else {
        if (!salesMonth.trim() || !salesAmount.trim()) {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'Month and sales amount are required.',
          });
          setIsUploading(false);
          return;
        }
        
        const salesAmountNum = parseFloat(salesAmount);
        if (isNaN(salesAmountNum) || salesAmountNum < 0) {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'Please enter a valid sales amount.',
          });
          setIsUploading(false);
          return;
        }
        
        // Upload first, then close modal
        await uploadDashboardData('sales', {
          month: salesMonth.trim(),
          sales: salesAmountNum,
        });
        
        // Reset form and close modal only after success
        setIsUploadModalOpen(false);
        setSalesMonth('');
        setSalesAmount('');
        
        toast({
          title: 'Success',
          description: 'Sales data uploaded successfully.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error?.message ?? `Failed to upload ${uploadType} data. Please try again.`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string, projectName: string) => {
    acceptInvite(inviteId).then(() => {
      toast({
        title: 'Invitation Accepted',
        description: `You've joined ${projectName}.`,
      });
    }).catch((error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message ?? 'Failed to accept invitation.',
      });
    });
  };

  const handleDeclineInvite = async (inviteId: string) => {
    declineInvite(inviteId).then(() => {
      toast({
        title: 'Invitation Declined',
        description: 'The invitation has been declined.',
      });
    }).catch((error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message ?? 'Failed to decline invitation.',
      });
    });
  };

  return (
    <>
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Business Data</DialogTitle>
            <DialogDescription>
              Add KPI metrics or sales data to track your business performance.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as 'kpi' | 'sales')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="kpi">KPI Data</TabsTrigger>
              <TabsTrigger value="sales">Sales Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="kpi" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="kpi-type">KPI Category</Label>
                <Select value={kpiType} onValueChange={setKpiType}>
                  <SelectTrigger id="kpi-type">
                    <SelectValue placeholder="Select a KPI type" />
                  </SelectTrigger>
                  <SelectContent>
                    {kpiTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {kpiType === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="kpi-title">Custom KPI Title</Label>
                <Input
                  id="kpi-title"
                      value={kpiTitle}
                      onChange={(e) => setKpiTitle(e.target.value)}
                    placeholder="e.g., Customer Satisfaction Score"
                    />
                  </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="kpi-value">Value</Label>
                <Input
                  id="kpi-value"
                      value={kpiValue}
                      onChange={(e) => setKpiValue(e.target.value)}
                  placeholder={kpiTypes.find(t => t.value === kpiType)?.placeholder || 'Enter value'}
                  type={kpiType === 'revenue' || kpiType === 'traffic' || kpiType === 'custom' ? 'text' : 'number'}
                    />
                  </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="kpi-change">Change</Label>
                <Input
                  id="kpi-change"
                      value={kpiChange}
                      onChange={(e) => setKpiChange(e.target.value)}
                      placeholder="e.g., +12%"
                    />
                  </div>
              <div className="space-y-2">
                <Label htmlFor="kpi-change-type">Change Type</Label>
                <Select value={kpiChangeType} onValueChange={(v) => setKpiChangeType(v as 'increase' | 'decrease')}>
                  <SelectTrigger id="kpi-change-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">Increase</SelectItem>
                    <SelectItem value="decrease">Decrease</SelectItem>
                  </SelectContent>
                </Select>
                </div>
                  </div>
            </TabsContent>
            
            <TabsContent value="sales" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="sales-month">Month</Label>
                <Input
                  id="sales-month"
                  value={salesMonth}
                  onChange={(e) => setSalesMonth(e.target.value)}
                  placeholder="e.g., January, Feb, Mar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales-amount">Sales Amount ($)</Label>
                <Input
                  id="sales-amount"
                  type="number"
                  value={salesAmount}
                  onChange={(e) => setSalesAmount(e.target.value)}
                  placeholder="e.g., 25000"
                />
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Or import from:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: 'Coming Soon', description: 'Excel/CSV upload feature coming soon!' })}>
                    📊 Upload Excel/CSV
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: 'Coming Soon', description: 'CRM integration coming soon!' })}>
                    🔗 Connect CRM
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: 'Coming Soon', description: 'HubSpot integration coming soon!' })}>
                    📈 Import from HubSpot
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
            </Button>
            <Button onClick={handleUploadData} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageContainer className="space-y-6 sm:space-y-8 md:space-y-12 pb-24">
        <PageHeader
          eyebrow="Executive summary"
          title="Mission Control"
          subtitle="Monitor revenue velocity, pipeline health, and team focus in real time."
          stats={headerStats}
        />

        <PageSection
          title="Team momentum"
          description="Stay ahead of blockers with a unified view across ownership, deadlines, and invites."
        >
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
            className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3"
          >
          <motion.div variants={staggerItem}>
              <Card className="group relative overflow-hidden border-border/60 bg-gradient-to-br from-primary/5 via-card/85 to-card/85 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-2.5 shadow-lg"
                      >
                      <TasksIcon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <div>
                        <CardTitle className="text-lg font-bold text-foreground">My Tasks</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">Active assignments</p>
                    </div>
                  </div>
                    <Badge variant="secondary" className="border-primary/30 bg-primary/20 text-primary font-bold text-base px-3 py-1 shadow-md">
                      {incompleteTasks.length}
                    </Badge>
                </div>
                  {incompleteTasks.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground">
                          {Math.round((tasks.filter(t => t.status === 'done').length / Math.max(tasks.length, 1)) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(tasks.filter(t => t.status === 'done').length / Math.max(tasks.length, 1)) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                        />
                      </div>
                    </div>
                  )}
              </CardHeader>
              <CardContent className="relative">
                {tasksLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ) : incompleteTasks.length > 0 ? (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {incompleteTasks.slice(0, 6).map((task, index) => (
                        <motion.div 
                          key={task.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.03, x: 8 }}
                          onClick={() => onNavigate && onNavigate('tasks')}
                          className="group/task cursor-pointer rounded-xl border border-border/50 bg-gradient-to-r from-card to-muted/30 p-3.5 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="line-clamp-2 text-sm font-semibold text-foreground group-hover/task:text-primary transition-colors">{task.title}</p>
                              <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                                  📁 {task.projectName}
                                </span>
                                {task.dueDate && (
                                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                                    ⏰ {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          <Badge
                            variant={task.status === 'todo' ? 'secondary' : 'default'}
                              className={cn(
                                "text-xs font-medium shadow-sm",
                                task.status === 'inprogress' && "bg-primary/90 text-primary-foreground"
                              )}
                          >
                              {task.status === 'todo' ? '📋 To do' : '🔄 In progress'}
                          </Badge>
                          </div>
                      </motion.div>
                    ))}
                    {incompleteTasks.length > 6 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onNavigate && onNavigate('tasks')}
                          className="w-full py-2.5 text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors rounded-lg hover:bg-primary/5"
                        >
                          View all {incompleteTasks.length} tasks →
                      </motion.button>
                    )}
                  </div>
                ) : (
                    <div className="py-10 text-center">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-2/20 to-chart-2/10 shadow-lg"
                      >
                        <CheckIcon className="h-10 w-10" style={{ color: 'var(--chart-2)' }} />
                    </motion.div>
                      <p className="text-base font-bold text-foreground mb-1">All Caught Up! 🎉</p>
                      <p className="text-sm text-muted-foreground">No pending tasks assigned</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="mt-4"
                        onClick={() => onNavigate && onNavigate('tasks')}
                      >
                        Create New Task
                      </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
              <Card className="group relative overflow-hidden border-border/60 bg-gradient-to-br from-destructive/5 via-card/85 to-card/85 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-destructive/10">
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10 p-2.5 shadow-lg"
                      >
                      <ClockIcon className="h-6 w-6 text-destructive" />
                    </motion.div>
                    <div>
                        <CardTitle className="text-lg font-bold text-foreground">Deadlines</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">Next 7 days</p>
                    </div>
                  </div>
                    <Badge
                      variant={upcomingDeadlines.length > 0 ? 'destructive' : 'secondary'}
                      className={cn(
                        "font-bold text-base px-3 py-1 shadow-md",
                        upcomingDeadlines.length === 0 && 'border-chart-3/30 bg-chart-3/20 text-chart-3'
                      )}
                    >
                    {upcomingDeadlines.length}
                  </Badge>
                </div>
                  {upcomingDeadlines.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-destructive font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                        Urgent attention needed
                      </span>
                    </div>
                  )}
              </CardHeader>
              <CardContent className="relative">
                {tasksLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ) : upcomingDeadlines.length > 0 ? (
                    <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1 custom-scrollbar">
                    {upcomingDeadlines.map((task, index) => {
                      const daysUntilDue = Math.ceil((new Date(task.dueDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      const isOverdue = daysUntilDue < 0;
                      const isUrgent = daysUntilDue <= 2 && daysUntilDue >= 0;
                      
                      return (
                      <motion.div 
                        key={task.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.03, x: 8 }}
                          onClick={() => onNavigate && onNavigate('tasks')}
                          className={cn(
                            "group/deadline cursor-pointer rounded-xl border p-3.5 shadow-sm transition-all hover:shadow-lg",
                            isOverdue && "border-red-500/40 bg-gradient-to-r from-red-500/15 to-red-500/5 hover:border-red-500/60 hover:shadow-red-500/10",
                            isUrgent && !isOverdue && "border-destructive/40 bg-gradient-to-r from-destructive/15 to-destructive/5 hover:border-destructive/60 hover:shadow-destructive/10",
                            !isOverdue && !isUrgent && "border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-amber-500/5 hover:border-amber-500/60 hover:shadow-amber-500/10"
                          )}
                      >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="line-clamp-2 text-sm font-semibold text-foreground">{task.title}</p>
                              <span className="mt-1.5 inline-block text-xs text-muted-foreground">📁 {task.projectName}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded-md",
                                isOverdue && "bg-red-500/20 text-red-600",
                                isUrgent && !isOverdue && "bg-destructive/20 text-destructive",
                                !isOverdue && !isUrgent && "bg-amber-500/20 text-amber-600"
                              )}>
                                {isOverdue ? `${Math.abs(daysUntilDue)}d overdue` : daysUntilDue === 0 ? 'Today!' : `${daysUntilDue}d left`}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(task.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                          </div>
                      </motion.div>
                      );
                    })}
                  </div>
                ) : (
                    <div className="py-10 text-center">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-2/20 to-chart-2/10 shadow-lg"
                      >
                        <ClockIcon className="h-10 w-10" style={{ color: 'var(--chart-2)' }} />
                    </motion.div>
                      <p className="text-base font-bold text-foreground mb-1">All Clear! ✨</p>
                      <p className="text-sm text-muted-foreground">No urgent deadlines ahead</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
              <Card className="group relative overflow-hidden border-border/60 bg-gradient-to-br from-purple-500/5 via-card/85 to-card/85 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 p-2.5 shadow-lg"
                      >
                      <EnvelopeIcon className="h-6 w-6 text-purple-500" />
                    </motion.div>
                    <div>
                        <CardTitle className="text-lg font-bold text-foreground">Invitations</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">Pending requests</p>
                    </div>
                  </div>
                    <Badge
                      variant={pendingInvites.length > 0 ? 'default' : 'secondary'}
                      className={cn(
                        "font-bold text-base px-3 py-1 shadow-md",
                        pendingInvites.length > 0 ? "bg-gradient-to-r from-purple-500 to-primary" : "border-purple-500/30 bg-purple-500/20 text-purple-600"
                      )}
                    >
                    {pendingInvites.length}
                  </Badge>
                </div>
                  {pendingInvites.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-1 text-purple-600 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                        Action required
                      </span>
                    </div>
                  )}
              </CardHeader>
              <CardContent className="relative">
                {pendingInvites.length > 0 ? (
                    <div className="max-h-72 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    {pendingInvites.map((invite, index) => (
                      <motion.div 
                        key={invite.id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                          className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-primary/10 p-4 shadow-sm transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
                        >
                          <div className="mb-3">
                            <p className="font-bold text-base text-foreground mb-1">{invite.projectName}</p>
                            <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                              👤 From <span className="font-semibold text-foreground">{invite.invitedByName}</span>
                            </p>
                          </div>
                        <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 text-xs font-semibold shadow-md bg-gradient-to-r from-purple-500 to-primary hover:from-purple-600 hover:to-primary/90" 
                              onClick={() => handleAcceptInvite(invite.id, invite.projectName)}
                            >
                              ✓ Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                              className="flex-1 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                            onClick={() => handleDeclineInvite(invite.id)}
                          >
                              ✕ Decline
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                    <div className="py-10 text-center">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 shadow-lg"
                      >
                        <EnvelopeIcon className="h-10 w-10 text-purple-500" />
                    </motion.div>
                      <p className="text-base font-bold text-foreground mb-1">All Connected! 🤝</p>
                      <p className="text-sm text-muted-foreground">No pending collaboration requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          </motion.div>
        </PageSection>

        <PageSection
          title="Performance analytics"
          description="Visualize directional trends across productivity and revenue."
          surface="minimal"
        >
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-2"
          >
          <motion.div variants={staggerItem}>
              <Card className="border-border/60 bg-card/85 backdrop-blur-sm shadow-md transition-shadow hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                      <div className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-1.5">
                      <TasksIcon className="h-4 w-4 text-emerald-500" />
                    </div>
                      Work productivity
                  </CardTitle>
                    <Badge variant="secondary" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
                      Last 7 days
                  </Badge>
                </div>
                  <CardDescription>Completed, in-progress, and newly created tasks each day.</CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <Skeleton className="h-[200px] sm:h-[280px] w-full" />
                ) : productivityData.length > 0 ? (
                  <div className="w-full h-[200px] sm:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productivityData}>
                      <defs>
                        <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(var(--chart-2))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="oklch(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="inProgressGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(var(--chart-3))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="oklch(var(--chart-3))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
                        <XAxis dataKey="day" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
                        <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                            borderRadius: '16px',
                            boxShadow: '0 18px 40px -24px rgba(11, 56, 255, 0.4)',
                        }}
                        labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                      />
                        <Legend wrapperStyle={{ color: 'var(--foreground)', paddingTop: '10px' }} iconType="circle" />
                        <Area type="monotone" dataKey="completed" stroke="oklch(var(--chart-2))" strokeWidth={2} fill="url(#completedGradient)" name="Completed" />
                        <Area type="monotone" dataKey="inProgress" stroke="oklch(var(--chart-3))" strokeWidth={2} fill="url(#inProgressGradient)" name="In progress" />
                    </AreaChart>
                  </ResponsiveContainer>
                  </div>
                ) : (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                        <TasksIcon className="h-8 w-8 text-emerald-500" />
                    </div>
                      <p className="mb-1 text-sm font-medium text-foreground">No tasks yet</p>
                      <p className="text-xs text-muted-foreground">Create tasks to track your productivity.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
              <Card className="border-border/60 bg-card/85 backdrop-blur-sm shadow-md transition-shadow hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                      <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-1.5">
                      <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                      Project status
                  </CardTitle>
                </div>
                  <CardDescription>Distribution of projects across different stages.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[200px] sm:h-[280px] w-full" />
                ) : projectStatusData.length > 0 ? (
                  <div className="w-full h-[200px] sm:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectStatusData}>
                      <defs>
                        <linearGradient id="projectGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(var(--chart-1))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="oklch(var(--chart-4))" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
                        <XAxis dataKey="status" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
                        <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                            borderRadius: '16px',
                            boxShadow: '0 18px 40px -24px rgba(11, 56, 255, 0.4)',
                        }}
                        labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                      />
                      <Legend wrapperStyle={{ color: 'var(--foreground)', paddingTop: '10px' }} />
                        <Bar dataKey="count" fill="url(#projectGradient)" radius={[12, 12, 0, 0]} name="Projects" />
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                ) : (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                        <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                      <p className="mb-1 text-sm font-medium text-foreground">No projects yet</p>
                      <p className="text-xs text-muted-foreground">Create projects to track your work pipeline.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          </motion.div>
        </PageSection>

        <PageSection
          title="Aether Copilot"
          description="AI intelligence distilled from your tasks, projects, and revenue streams."
          surface="none"
          padded={false}
        >
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={transitions.smooth}>
            <Card className="bg-gradient-to-br from-purple-500/10 via-primary/10 to-cyan-500/10 border-purple-500/30 shadow-md transition-shadow hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-primary/20 p-2">
                    <SparklesIcon className="h-5 w-5 text-purple-500" />
                  </div>
                  <CardTitle className="text-foreground">Aether Copilot insights</CardTitle>
                </div>
                <CardDescription>Personalised actions to keep momentum.</CardDescription>
              </CardHeader>
              <CardContent>
                {insightsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse rounded-xl border border-border/40 bg-muted/40 p-4">
                        <div className="mb-2 h-4 w-1/3 rounded bg-muted" />
                        <div className="h-3 w-full rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                ) : aiInsights.length > 0 ? (
                  <div className="space-y-4">
                    {aiInsights.map((insight, index) => {
                      const colorMap = {
                        recommendation: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-600',
                        alert: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600',
                        tip: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600',
                      };
                      const dotColors = {
                        recommendation: 'bg-blue-500',
                        alert: 'bg-amber-500',
                        tip: 'bg-emerald-500',
                      };
                      const colorClass = colorMap[insight.type] || colorMap.recommendation;
                      const dotColor = dotColors[insight.type] || dotColors.recommendation;
                      
                      return (
                        <div key={index} className={cn('rounded-xl border bg-gradient-to-r p-4 shadow-sm transition hover:shadow-md', colorClass)}>
                          <p className="mb-2 flex items-center gap-2 font-semibold">
                            <span className={cn('h-2 w-2 rounded-full', dotColor)}></span>
                            {insight.title}
                          </p>
                          <p className="text-sm text-foreground/80">{insight.content}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-muted/40 p-4 text-center">
                    <p className="mb-3 text-sm text-muted-foreground">
                      Upload your business data to unlock AI-powered insights tailored to your business.
                    </p>
                    <Button size="sm" onClick={() => setIsUploadModalOpen(true)} className="w-full sm:w-auto text-xs sm:text-sm">
                      Upload data now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
        </motion.div>
        </PageSection>
      </PageContainer>
    </>
  );
};

export default Dashboard;