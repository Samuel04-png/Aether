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

  // Calculate real data metrics
  const realDataMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Revenue: Sum of all sales data or latest month
    const totalRevenue = monthlySales.reduce((sum, item) => sum + item.sales, 0);
    const latestRevenue = monthlySales.length > 0 ? monthlySales[monthlySales.length - 1].sales : 0;
    const previousRevenue = monthlySales.length > 1 ? monthlySales[monthlySales.length - 2].sales : 0;
    const revenueChange = previousRevenue > 0 
      ? ((latestRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : '0';
    
    // New Leads: Count leads created this month
    const newLeadsThisMonth = leads.filter(lead => {
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
    }).length;
    
    // Previous month leads for comparison
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const newLeadsLastMonth = leads.filter(lead => {
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      return leadDate.getMonth() === lastMonth && leadDate.getFullYear() === lastMonthYear;
    }).length;
    const leadsChange = newLeadsLastMonth > 0
      ? ((newLeadsThisMonth - newLeadsLastMonth) / newLeadsLastMonth * 100).toFixed(1)
      : '0';
    
    // Tasks Completed: Count completed tasks this month
    const completedTasksThisMonth = tasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear;
    }).length;
    
    // Previous month completed tasks for comparison
    const completedTasksLastMonth = tasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate.getMonth() === lastMonth && completedDate.getFullYear() === lastMonthYear;
    }).length;
    const tasksChange = completedTasksLastMonth > 0
      ? ((completedTasksThisMonth - completedTasksLastMonth) / completedTasksLastMonth * 100).toFixed(1)
      : completedTasksThisMonth > 0 ? '100' : '0';
    
    // Website Traffic: Placeholder for now (would come from analytics)
    const websiteTraffic = 0; // TODO: Connect to analytics
    
    return {
      revenue: {
        value: latestRevenue > 0 ? `$${latestRevenue.toLocaleString()}` : totalRevenue > 0 ? `$${totalRevenue.toLocaleString()}` : '$0',
        change: revenueChange,
        changeType: parseFloat(revenueChange) >= 0 ? 'increase' as const : 'decrease' as const,
      },
      leads: {
        value: newLeadsThisMonth.toString(),
        change: leadsChange,
        changeType: parseFloat(leadsChange) >= 0 ? 'increase' as const : 'decrease' as const,
      },
      tasks: {
        value: completedTasksThisMonth.toString(),
        change: `${tasksChange}%`,
        changeType: parseFloat(tasksChange) >= 0 ? 'increase' as const : 'decrease' as const,
      },
      traffic: {
        value: websiteTraffic > 0 ? websiteTraffic.toLocaleString() : '0',
        change: '0%',
        changeType: 'increase' as const,
      },
    };
  }, [monthlySales, leads, tasks]);
  const salesData = useMemo(
    () => monthlySales.map((item) => ({ name: item.month, Sales: item.sales })),
    [monthlySales],
  );
  
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

  const revenueDelta = parseFloat(realDataMetrics.revenue.change);
  const leadsDelta = parseFloat(realDataMetrics.leads.change);
  const tasksDelta = parseFloat(realDataMetrics.tasks.change.replace('%', ''));

  const headerStats = [
    {
      label: 'Revenue run rate',
      value: realDataMetrics.revenue.value,
      trend: deriveTrend(revenueDelta),
      helper: formatDelta(revenueDelta),
    },
    {
      label: 'New leads this month',
      value: realDataMetrics.leads.value,
      trend: deriveTrend(leadsDelta),
      helper: formatDelta(leadsDelta),
    },
    {
      label: 'Tasks completed',
      value: realDataMetrics.tasks.value,
      trend: deriveTrend(tasksDelta),
      helper: formatDelta(tasksDelta),
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
          monthlySales: monthlySales,
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
  }, [user?.uid, profile, tasks, projects, leads, kpis, monthlySales]);

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
        <DialogContent className="sm:max-w-[500px]">
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
              <div className="grid grid-cols-2 gap-4">
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

      <PageContainer className="space-y-12 pb-24">
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
            className="grid grid-cols-1 gap-5 lg:grid-cols-3"
          >
          <motion.div variants={staggerItem}>
              <Card className="border-border/60 bg-card/85 backdrop-blur-sm transition-all duration-200 hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2">
                      <TasksIcon className="h-5 w-5 text-primary" />
                    </div>
                      <CardTitle className="text-lg text-foreground">My tasks</CardTitle>
                  </div>
                    <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary">
                      {incompleteTasks.length}
                    </Badge>
                </div>
                  <CardDescription>Prioritized work assigned to you.</CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : incompleteTasks.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {incompleteTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="rounded-lg border border-border bg-muted/40 p-3">
                          <p className="line-clamp-1 text-sm font-medium text-foreground">{task.title}</p>
                          <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{task.projectName}</span>
                          <Badge
                            variant={
                              task.status === 'todo'
                                ? 'secondary'
                                : task.status === 'inprogress'
                                ? 'default'
                                : 'outline'
                            }
                            className="text-xs"
                          >
                              {task.status === 'todo' ? 'To do' : task.status === 'inprogress' ? 'In progress' : 'Done'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {incompleteTasks.length > 5 && (
                        <p className="pt-2 text-center text-xs text-muted-foreground">
                        +{incompleteTasks.length - 5} more tasks
                      </p>
                    )}
                  </div>
                ) : (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-chart-2/10">
                        <CheckIcon className="h-8 w-8" style={{ color: 'var(--chart-2)' }} />
                    </div>
                    <p className="text-sm font-medium text-foreground">All caught up!</p>
                      <p className="mt-1 text-xs text-muted-foreground">No tasks assigned to you.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
              <Card className="transition-shadow duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-chart-3/10 p-2">
                      <ClockIcon className="h-5 w-5" style={{ color: 'var(--chart-3)' }} />
                    </div>
                    <CardTitle className="text-lg text-foreground">Deadlines</CardTitle>
                  </div>
                    <Badge
                      variant={upcomingDeadlines.length > 0 ? 'destructive' : 'secondary'}
                      className={upcomingDeadlines.length > 0 ? '' : 'border-chart-3/20 bg-chart-3/10 text-chart-3'}
                    >
                    {upcomingDeadlines.length}
                  </Badge>
                </div>
                  <CardDescription>Important due dates over the next 7 days.</CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : upcomingDeadlines.length > 0 ? (
                    <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {upcomingDeadlines.map((task) => (
                      <motion.div 
                        key={task.id} 
                        whileHover={{ scale: 1.02, x: 4 }}
                          className="cursor-pointer rounded-lg border border-destructive/30 bg-destructive/10 p-3 transition-all hover:border-destructive/40 hover:bg-destructive/15"
                      >
                          <p className="line-clamp-1 text-sm font-medium text-foreground">{task.title}</p>
                          <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{task.projectName}</span>
                            <span className="text-xs font-semibold text-destructive">
                              Due {new Date(task.dueDate!).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-chart-2/10">
                        <ClockIcon className="h-8 w-8" style={{ color: 'var(--chart-2)' }} />
                    </div>
                    <p className="text-sm font-medium text-foreground">No upcoming deadlines</p>
                      <p className="mt-1 text-xs text-muted-foreground">You're all set!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
              <Card className="transition-shadow duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2">
                      <EnvelopeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg text-foreground">Invitations</CardTitle>
                  </div>
                    <Badge
                      variant={pendingInvites.length > 0 ? 'default' : 'secondary'}
                      className={pendingInvites.length > 0 ? '' : 'border-primary/20 bg-primary/10 text-primary'}
                    >
                    {pendingInvites.length}
                  </Badge>
                </div>
                  <CardDescription>Collaboration requests awaiting your response.</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingInvites.length > 0 ? (
                    <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                    {pendingInvites.map((invite) => (
                      <motion.div 
                        key={invite.id} 
                        whileHover={{ scale: 1.02 }}
                          className="rounded-lg border border-accent/30 bg-accent/10 p-3 transition-all hover:border-accent/40 hover:bg-accent/20"
                        >
                          <p className="mb-1 text-sm font-medium text-foreground">{invite.projectName}</p>
                          <p className="mb-3 text-xs text-muted-foreground">From {invite.invitedByName}</p>
                        <div className="flex gap-2">
                            <Button size="sm" className="flex-1 text-xs shadow-sm" onClick={() => handleAcceptInvite(invite.id, invite.projectName)}>
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => handleDeclineInvite(invite.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <EnvelopeIcon className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No pending invites</p>
                      <p className="mt-1 text-xs text-muted-foreground">You're fully connected.</p>
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
            className="grid grid-cols-1 gap-5 lg:grid-cols-2"
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
                  <Skeleton className="h-[280px] w-full" />
                ) : productivityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                      Monthly sales
                  </CardTitle>
                </div>
                  <CardDescription>Month-over-month revenue performance.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[280px] w-full" />
                ) : salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={salesData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(var(--chart-1))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="oklch(var(--chart-6))" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
                        <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
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
                        <Bar dataKey="Sales" fill="url(#salesGradient)" radius={[12, 12, 0, 0]} name="Sales ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                        <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                      <p className="mb-1 text-sm font-medium text-foreground">No sales data yet</p>
                      <p className="text-xs text-muted-foreground">Upload data to visualise your revenue trajectory.</p>
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
                    <Button size="sm" onClick={() => setIsUploadModalOpen(true)} className="w-full sm:w-auto">
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