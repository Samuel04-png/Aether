import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { SparklesIcon, PlusIcon, TasksIcon, ClockIcon, EnvelopeIcon, CheckIcon } from './shared/Icons';
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
import { fadeInUp, staggerContainer, staggerItem, hoverScale, transitions } from '@/lib/motion';
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
import { generateBusinessInsights } from '../services/geminiService';
import { cn } from '@/lib/utils';

const KpiCard: React.FC<{ title: string; value: string; change: string; changeType: 'increase' | 'decrease' }> = React.memo(({ title, value, change, changeType }) => {
  const isIncrease = changeType === 'increase';
  return (
    <motion.div
      variants={staggerItem}
      whileHover={hoverScale}
      className="h-full"
    >
      <Card className="h-full border-border/60 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-foreground mb-3 tracking-tight">{value}</p>
          <div className="flex items-center gap-2">
            <Badge variant={isIncrease ? 'default' : 'destructive'} className="text-xs font-medium px-2 py-0.5">
              {change}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">vs last month</span>
          </div>
        </CardContent>
    </Card>
    </motion.div>
  );
});
KpiCard.displayName = 'KpiCard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { kpis, monthlySales, loading, uploadDashboardData } = useDashboard(user?.uid);
  const { incompleteTasks, upcomingDeadlines, loading: tasksLoading } = useAssignedTasks(user?.uid);
  const { pendingInvites, acceptInvite, declineInvite } = useProjectInvites(user?.uid);
  const { unreadCount } = useNotifications(user?.uid);
  const { tasks, tasksByStatus } = useTasks(user?.uid);
  const { projects } = useProjects(user?.uid);
  const { leads } = useLeads(user?.uid);
  const { profile } = useUserProfile(user?.uid);
  const { toast } = useToast();
  const salesData = useMemo(
    () => monthlySales.map((item) => ({ name: item.month, Sales: item.sales })),
    [monthlySales],
  );
  
  const [aiInsights, setAiInsights] = useState<Array<{ type: 'recommendation' | 'alert' | 'tip'; title: string; content: string }>>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Generate productivity/work tracking data for the last 7 days
  const productivityData = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Count tasks completed on this day (simplified - using created date as proxy)
      // In a real app, you'd track completion dates
      const tasksOnDay = tasks.filter(task => {
        if (task.status === 'done' && task.createdAt) {
          const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
          return taskDate <= dateStr;
        }
        return false;
      }).length;
      
      // Estimate daily completion (distribute completed tasks across last 7 days)
      const totalDone = tasksByStatus.done.length;
      const estimatedDaily = Math.floor(totalDone / 7) + (i < totalDone % 7 ? 1 : 0);
      
      days.push({
        day: dayName,
        date: dateStr,
        completed: estimatedDaily,
        inProgress: Math.floor(tasksByStatus.inprogress.length / 7),
        created: Math.floor(tasksByStatus.todo.length / 7) + estimatedDaily,
      });
    }
    
    return days;
  }, [tasks, tasksByStatus]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'kpi' | 'sales'>('kpi');
  
  // KPI form fields
  const [kpiTitle, setKpiTitle] = useState('');
  const [kpiValue, setKpiValue] = useState('');
  const [kpiChange, setKpiChange] = useState('');
  const [kpiChangeType, setKpiChangeType] = useState<'increase' | 'decrease'>('increase');
  
  // Sales form fields
  const [salesMonth, setSalesMonth] = useState('');
  const [salesAmount, setSalesAmount] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);

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
                <Label htmlFor="kpi-title">KPI Title</Label>
                <Input
                  id="kpi-title"
                      value={kpiTitle}
                      onChange={(e) => setKpiTitle(e.target.value)}
                      placeholder="e.g., Total Revenue"
                    />
                  </div>
              <div className="space-y-2">
                <Label htmlFor="kpi-value">Value</Label>
                <Input
                  id="kpi-value"
                      value={kpiValue}
                      onChange={(e) => setKpiValue(e.target.value)}
                      placeholder="e.g., $125,430"
                    />
                  </div>
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

      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        exit={fadeInUp.exit}
        transition={transitions.quick}
        className="space-y-8"
      >
        <div className="flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={transitions.quick}
            className="text-4xl font-bold text-foreground tracking-tight"
          >
            Dashboard
          </motion.h1>
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Upload Data
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
        
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
        {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-full">
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-32 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
          </Card>
            ))
        ) : kpis.length > 0 ? (
          kpis.map((kpi) => (
            <KpiCard key={kpi.id} title={kpi.title} value={kpi.value} change={kpi.change} changeType={kpi.changeType} />
          ))
        ) : (
            <Card className="sm:col-span-2 lg:col-span-4 border-2 border-dashed border-border/50 bg-muted/30">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <PlusIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-1">No KPIs yet</p>
                    <p className="text-sm text-muted-foreground">Add business data to see KPIs here</p>
                  </div>
                  <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Upload Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

          {/* Personal Productivity Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Tasks Assigned to Me */}
          <motion.div variants={staggerItem}>
            <Card className="hover:shadow-xl transition-all duration-200 border-border/60 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TasksIcon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg text-foreground">My Tasks</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{incompleteTasks.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : incompleteTasks.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {incompleteTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="p-3 bg-muted/50 rounded-lg border border-border">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{task.title}</p>
                        <div className="flex justify-between items-center mt-2">
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
                            {task.status === 'todo' ? 'To Do' : task.status === 'inprogress' ? 'In Progress' : 'Done'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {incompleteTasks.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        +{incompleteTasks.length - 5} more tasks
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-chart-2/10 flex items-center justify-center">
                      <CheckIcon className="w-8 h-8" style={{ color: 'var(--chart-2)' }} />
                    </div>
                    <p className="text-sm font-medium text-foreground">All caught up!</p>
                    <p className="text-xs text-muted-foreground mt-1">No tasks assigned to you</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div variants={staggerItem}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-chart-3/10">
                      <ClockIcon className="h-5 w-5" style={{ color: 'var(--chart-3)' }} />
                    </div>
                    <CardTitle className="text-lg text-foreground">Deadlines</CardTitle>
                  </div>
                  <Badge variant={upcomingDeadlines.length > 0 ? 'destructive' : 'secondary'} className={upcomingDeadlines.length > 0 ? '' : 'bg-chart-3/10 text-chart-3 border-chart-3/20'}>
                    {upcomingDeadlines.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : upcomingDeadlines.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {upcomingDeadlines.map((task) => (
                      <motion.div 
                        key={task.id} 
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg hover:bg-destructive/15 hover:border-destructive/40 transition-all cursor-pointer"
                      >
                        <p className="text-sm font-medium text-foreground line-clamp-1">{task.title}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">{task.projectName}</span>
                          <span className="text-xs text-destructive font-semibold">
                            Due: {new Date(task.dueDate!).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-chart-2/10 flex items-center justify-center">
                      <ClockIcon className="w-8 h-8" style={{ color: 'var(--chart-2)' }} />
                    </div>
                    <p className="text-sm font-medium text-foreground">No upcoming deadlines</p>
                    <p className="text-xs text-muted-foreground mt-1">You're all set!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Invites */}
          <motion.div variants={staggerItem}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <EnvelopeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg text-foreground">Invitations</CardTitle>
                  </div>
                  <Badge variant={pendingInvites.length > 0 ? 'default' : 'secondary'} className={pendingInvites.length > 0 ? '' : 'bg-primary/10 text-primary border-primary/20'}>
                    {pendingInvites.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {pendingInvites.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {pendingInvites.map((invite) => (
                      <motion.div 
                        key={invite.id} 
                        whileHover={{ scale: 1.02 }}
                        className="p-3 bg-accent/10 border border-accent/30 rounded-lg hover:bg-accent/15 hover:border-accent/40 transition-all"
                      >
                        <p className="text-sm font-medium text-foreground mb-1">{invite.projectName}</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          From: {invite.invitedByName}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 text-xs shadow-sm"
                            onClick={() => handleAcceptInvite(invite.id, invite.projectName)}
                          >
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
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <EnvelopeIcon className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No pending invites</p>
                    <p className="text-xs text-muted-foreground mt-1">You're up to date</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
      </div>

        {/* Productivity & Sales Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Productivity Tracking Chart */}
          <motion.div variants={staggerItem}>
            <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                      <TasksIcon className="h-4 w-4 text-emerald-500" />
                    </div>
                    Work Productivity
                  </CardTitle>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Last 7 Days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <Skeleton className="h-[280px] w-full" />
                ) : productivityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={productivityData}>
                      <defs>
                        <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(var(--chart-2))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="oklch(var(--chart-2))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="inProgressGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(var(--chart-3))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="oklch(var(--chart-3))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                        axisLine={{ stroke: 'var(--border)' }}
                      />
                      <YAxis 
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                        axisLine={{ stroke: 'var(--border)' }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                      />
                      <Legend 
                        wrapperStyle={{ color: 'var(--foreground)', paddingTop: '10px' }}
                        iconType="circle"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="oklch(var(--chart-2))" 
                        strokeWidth={2}
                        fill="url(#completedGradient)"
                        name="Completed"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="inProgress" 
                        stroke="oklch(var(--chart-3))" 
                        strokeWidth={2}
                        fill="url(#inProgressGradient)"
                        name="In Progress"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <TasksIcon className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">No tasks yet</p>
                    <p className="text-xs text-muted-foreground">Create tasks to track your productivity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Sales Chart */}
          <motion.div variants={staggerItem}>
            <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                      <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    Monthly Sales
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[280px] w-full" />
                ) : salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={salesData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(var(--chart-1))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="oklch(var(--chart-6))" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                        axisLine={{ stroke: 'var(--border)' }}
                      />
                      <YAxis 
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                        axisLine={{ stroke: 'var(--border)' }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                      />
                      <Legend wrapperStyle={{ color: 'var(--foreground)', paddingTop: '10px' }} />
                      <Bar 
                        dataKey="Sales" 
                        fill="url(#salesGradient)" 
                        radius={[8, 8, 0, 0]}
                        name="Sales ($)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">No sales data yet</p>
                    <p className="text-xs text-muted-foreground">Upload data to see your sales chart</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Insights Card - Full Width */}
        <motion.div variants={staggerItem}>
            <Card className="hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-purple-500/10 via-primary/10 to-cyan-500/10 border-purple-500/30 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-primary/20">
                    <SparklesIcon className="h-5 w-5 text-purple-500" />
                  </div>
                  <CardTitle className="text-foreground">Aether Copilot Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {insightsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-muted/50 p-4 rounded-xl border border-border animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-full"></div>
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
                        <div key={index} className={`bg-gradient-to-r ${colorClass} p-4 rounded-xl border`}>
                          <p className={`font-semibold mb-2 flex items-center gap-2`}>
                            <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                            {insight.title}
                          </p>
                          <p className="text-sm text-foreground/80">
                            {insight.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-muted/50 p-4 rounded-lg text-center border border-border">
                    <p className="text-muted-foreground text-sm mb-3">
                      Upload your business data to unlock AI-powered insights and recommendations tailored to your business.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="w-full"
                    >
                      Upload Data Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Dashboard;