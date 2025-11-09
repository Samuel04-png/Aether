import React, { useEffect, useMemo, useState } from 'react';
import Card from './shared/Card';
import {
    SparklesIcon,
    PlusIcon,
    CloseIcon,
    CsvIcon,
    CrmIcon,
    TrashIcon,
    CalendarIcon,
    EnvelopeIcon,
    MessageIcon,
    PhoneIcon,
    FileIcon,
    MoreIcon,
} from './shared/Icons';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { generatePersonalizedLeadMessage } from '../services/geminiService';
import { Lead } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { NewLeadInput, useLeads } from '../hooks/useLeads';
import { useSalesAutomation } from '../hooks/useSalesAutomation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AddLeadModal: React.FC<{ onClose: () => void; onAddLead: (lead: NewLeadInput) => Promise<void>; }> = ({ onClose, onAddLead }) => {
    const [view, setView] = useState<'options' | 'manual'>('options');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [source, setSource] = useState('Manual');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleAdd = async () => {
        if(!name || !company || !email) return;
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            await onAddLead({ name, company, email, source, status: 'New' });
            setName('');
            setCompany('');
            setEmail('');
            setSource('Manual');
            onClose();
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Unable to add lead. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <Card className="w-full max-w-lg animate-slide-in-up">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-foreground">Add New Lead</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><CloseIcon /></button>
                </div>
                
                {view === 'options' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onClick={() => setView('manual')} className="p-4 bg-card/50 rounded-[var(--radius)] text-center hover:bg-accent transition-colors border border-border">
                           <PlusIcon />
                           <p className="mt-2 font-semibold text-foreground">Add Manually</p>
                        </button>
                         <button className="p-4 bg-card/50 rounded-[var(--radius)] text-center hover:bg-accent transition-colors border border-border">
                           <CsvIcon />
                           <p className="mt-2 font-semibold text-foreground">Upload CSV</p>
                           <span className="text-xs text-muted-foreground">(Coming Soon)</span>
                        </button>
                         <button className="p-4 bg-card/50 rounded-[var(--radius)] text-center hover:bg-accent transition-colors border border-border">
                           <CrmIcon />
                           <p className="mt-2 font-semibold text-foreground">From CRM</p>
                           <span className="text-xs text-muted-foreground">(Coming Soon)</span>
                        </button>
                    </div>
                )}
                {view === 'manual' && (
                    <div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Company</label>
                                <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Innovate Corp" className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex.j@innovate.com" className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"/>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between items-center">
                            <button onClick={() => setView('options')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                            <button onClick={handleAdd} disabled={isSubmitting} className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-[var(--radius)] hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed">{isSubmitting ? 'Adding...' : 'Add Lead'}</button>
                        </div>
                        {errorMessage && <p className="text-sm text-destructive mt-3">{errorMessage}</p>}
                    </div>
                )}
            </Card>
        </div>
    );
};

const LeadDetailModal: React.FC<{ lead: Lead; onClose: () => void; onUpdateStatus: (leadId: string, status: Lead['status']) => Promise<void>; }> = ({ lead, onClose, onUpdateStatus }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleStatusChange = async (nextStatus: Lead['status']) => {
        setIsUpdating(true);
        setErrorMessage(null);
        try {
            await onUpdateStatus(lead.id, nextStatus);
        } catch (error: any) {
            setErrorMessage(error?.message ?? 'Unable to update status.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <Card className="w-full max-w-2xl animate-slide-in-up">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-foreground">{lead.name}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><CloseIcon /></button>
                </div>
                <div className="space-y-4">
                    <p><strong className="text-foreground font-semibold">Company:</strong> <span className="text-muted-foreground">{lead.company}</span></p>
                    <p><strong className="text-foreground font-semibold">Email:</strong> <span className="text-muted-foreground">{lead.email}</span></p>
                    <p><strong className="text-foreground font-semibold">Source:</strong> <span className="text-muted-foreground">{lead.source}</span></p>
                    <div className="flex items-center gap-2">
                         <strong className="text-foreground font-semibold">Status:</strong>
                         <select 
                            value={lead.status}
                            onChange={(e) => handleStatusChange(e.target.value as Lead['status'])}
                            className="bg-input text-foreground rounded-[var(--radius)] py-1 px-2 focus:outline-none focus:ring-2 focus:ring-ring border border-border disabled:bg-muted disabled:cursor-not-allowed"
                            disabled={isUpdating}
                         >
                            <option>New</option>
                            <option>Contacted</option>
                            <option>Qualified</option>
                            <option>Lost</option>
                         </select>
                    </div>
                    {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                    <div className="border-t border-border pt-4">
                        <h4 className="font-semibold text-foreground">Interaction History</h4>
                        <p className="text-sm text-muted-foreground mt-2">No interactions logged yet.</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

type MessagePlatform = 'email' | 'whatsapp' | 'sms';

const MessageLeadModal: React.FC<{
    lead: Lead;
    onClose: () => void;
    onSend: (payload: { platform: MessagePlatform; message: string }) => Promise<void>;
}> = ({ lead, onClose, onSend }) => {
    const [platform, setPlatform] = useState<MessagePlatform>('email');
    const [message, setMessage] = useState(`Hi ${lead.name},

I’d love to connect about how we can help ${lead.company}. Are you available for a quick chat this week?`);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!message.trim()) {
            setError('Message cannot be empty.');
            return;
        }
        setError(null);
        setIsSending(true);
        try {
            await onSend({ platform, message });
            onClose();
        } catch (err: any) {
            setError(err?.message ?? 'Failed to queue message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const applyTemplate = (tone: 'warm' | 'direct' | 'follow-up') => {
        const firstName = lead.name.split(' ')[0] ?? lead.name;
        if (tone === 'warm') {
            setMessage(`Hi ${firstName},

I noticed ${lead.company} came in via ${lead.source}. I’d love to introduce what Aether can do for teams like yours. Do you have 15 minutes later this week?`);
        } else if (tone === 'direct') {
            setMessage(`Hello ${firstName},

Following up on your interest from ${lead.source}. We can help ${lead.company} move from ${lead.status.toLowerCase()} to signed in record time. When can we dive in?`);
        } else {
            setMessage(`Hi ${firstName},

Just checking in—wanted to share a quick win from a client similar to ${lead.company}. Let me know if you’d like a short walkthrough.`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4">
            <Card className="w-full max-w-2xl animate-slide-in-up shadow-2xl border border-border/70">
                <div className="flex justify-between items-start gap-3 mb-6">
                    <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Messaging Workspace</span>
                        <h3 className="text-2xl font-bold text-foreground mt-1">Message {lead.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Draft and schedule personalised outreach in one place.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Platform</label>
                            <select
                                value={platform}
                                onChange={(event) => setPlatform(event.target.value as MessagePlatform)}
                                className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                            >
                                <option value="email">Email</option>
                                <option value="whatsapp">WhatsApp Business (mock)</option>
                                <option value="sms">SMS (mock)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lead status</label>
                            <div className="py-2 px-3 border border-border rounded-[var(--radius)] bg-input text-sm text-muted-foreground capitalize">
                                {lead.status}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Message</label>
                        <Textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border min-h-[160px]"
                        />
                        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyTemplate('warm')}
                        >
                            Warm intro
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyTemplate('direct')}
                        >
                            Direct pitch
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyTemplate('follow-up')}
                        >
                            Follow-up
                        </Button>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-muted-foreground">
                            Message will be logged in the lead timeline once sent.
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSending}
                            >
                                {isSending ? 'Sending…' : `Send via ${platform === 'email' ? 'Email' : platform === 'whatsapp' ? 'WhatsApp' : 'SMS'}`}
                            </Button>
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const EditLeadModal: React.FC<{
    lead: Lead;
    onClose: () => void;
    onSave: (updates: { name: string; company: string; email: string; source: string; status: Lead['status'] }) => Promise<void>;
    onArchive: () => Promise<void>;
    isSaving: boolean;
    isArchiving: boolean;
    error: string | null;
}> = ({ lead, onClose, onSave, onArchive, isSaving, isArchiving, error }) => {
    const [name, setName] = useState(lead.name);
    const [company, setCompany] = useState(lead.company);
    const [email, setEmail] = useState(lead.email);
    const [source, setSource] = useState(lead.source);
    const [status, setStatus] = useState<Lead['status']>(lead.status);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await onSave({ name, company, email, source, status });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4">
            <Card className="w-full max-w-2xl animate-slide-in-up shadow-2xl border border-border/70">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Lead profile</span>
                        <h3 className="text-2xl font-bold text-foreground mt-1">Edit {lead.name}</h3>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full Name</label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Company</label>
                            <Input
                                type="text"
                                value={company}
                                onChange={(event) => setCompany(event.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source</label>
                            <Input
                                type="text"
                                value={source}
                                onChange={(event) => setSource(event.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</label>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value as Lead['status'])}
                            className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                        >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Lost">Lost</option>
                        </select>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            className="justify-start gap-2 text-destructive hover:text-destructive/80"
                            onClick={onArchive}
                            disabled={isArchiving}
                        >
                            <TrashIcon className="w-4 h-4" />
                            {isArchiving ? 'Archiving…' : 'Archive lead'}
                        </Button>
                        <div className="flex gap-3 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSaving || isArchiving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving || isArchiving}
                            >
                                {isSaving ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const Leads: React.FC = () => {
    const { user } = useAuth();
    const { leads, loading, addLead, updateLeadStatus, updateLead, removeLead } = useLeads(user?.uid);
    const { toast } = useToast();
    const { settings: automationSettings, loading: automationLoading, saving: automationSaving, saveSettings: saveAutomationSettings, toggleAutomation } = useSalesAutomation(user?.uid);
    const [activeLead, setActiveLead] = useState<Lead | null>(null); // For AI panel
    const [detailViewLead, setDetailViewLead] = useState<Lead | null>(null); // For detail modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [personalizedMessage, setPersonalizedMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [panelMode, setPanelMode] = useState<'personalize' | 'research' | null>(null);
    const [researchHighlights, setResearchHighlights] = useState<string[]>([]);
    const [messageLead, setMessageLead] = useState<Lead | null>(null);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    const [isSavingLead, setIsSavingLead] = useState(false);
    const [isArchivingLead, setIsArchivingLead] = useState(false);
    const [automationForm, setAutomationForm] = useState({
        businessPhone: '',
        invoiceEmail: '',
        calendarLink: '',
        officeHours: 'Mon–Fri · 9:00am – 5:00pm',
        playbook: '',
    });
    const [configTab, setConfigTab] = useState<'contact' | 'scheduling' | 'playbook'>('contact');
    const [showWorkflowSummary, setShowWorkflowSummary] = useState(false);

    useEffect(() => {
        setAutomationForm({
            businessPhone: automationSettings.businessPhone ?? '',
            invoiceEmail: automationSettings.invoiceEmail ?? '',
            calendarLink: automationSettings.calendarLink ?? '',
            officeHours: automationSettings.officeHours ?? 'Mon–Fri · 9:00am – 5:00pm',
            playbook: automationSettings.playbook ?? '',
        });
    }, [automationSettings]);

    const pipelineStats = useMemo(() => {
        const total = leads.length;
        const stats = {
            total,
            newCount: 0,
            contactedCount: 0,
            qualifiedCount: 0,
            lostCount: 0,
        };
        leads.forEach((lead) => {
            switch (lead.status) {
                case 'New':
                    stats.newCount += 1;
                    break;
                case 'Contacted':
                    stats.contactedCount += 1;
                    break;
                case 'Qualified':
                    stats.qualifiedCount += 1;
                    break;
                case 'Lost':
                    stats.lostCount += 1;
                    break;
                default:
                    break;
            }
        });
        const conversionRate = total > 0 ? Math.round((stats.qualifiedCount / total) * 100) : 0;
        const respondRate = total > 0 ? Math.round(((stats.contactedCount + stats.qualifiedCount) / total) * 100) : 0;
        return {
            ...stats,
            conversionRate,
            respondRate,
        };
    }, [leads]);

    const automationControls = useMemo(
        () => [
            {
                id: 'sms' as const,
                label: 'SMS replies',
                description: 'Instant text responses with personalised merge tags.',
                icon: MessageIcon,
                accent: 'text-primary',
                accentBg: 'bg-primary/10',
            },
            {
                id: 'voice' as const,
                label: 'Call routing',
                description: 'Smart voicemail transcription and callback queue.',
                icon: PhoneIcon,
                accent: 'text-orange-500',
                accentBg: 'bg-orange-500/10',
            },
            {
                id: 'invoices' as const,
                label: 'Invoices & quotes',
                description: 'Auto-generate branded billing documents.',
                icon: FileIcon,
                accent: 'text-emerald-500',
                accentBg: 'bg-emerald-500/10',
            },
            {
                id: 'appointments' as const,
                label: 'Appointment booking',
                description: 'Offer meeting slots and sync confirmed demos.',
                icon: CalendarIcon,
                accent: 'text-indigo-500',
                accentBg: 'bg-indigo-500/10',
            },
        ],
        [],
    );

    const statusSummary = useMemo(
        () => [
            { label: 'New', count: pipelineStats.newCount },
            { label: 'Contacted', count: pipelineStats.contactedCount },
            { label: 'Qualified', count: pipelineStats.qualifiedCount },
            { label: 'Lost', count: pipelineStats.lostCount },
        ],
        [pipelineStats],
    );

    const statusAccentColors: Record<Lead['status'], string> = {
        New: '#1a73e8',
        Contacted: '#f97316',
        Qualified: '#10b981',
        Lost: '#94a3b8',
    };

    const buildRingStyle = (color: string, value: number): React.CSSProperties => {
        const safeValue = Math.max(0, Math.min(100, Math.round(value)));
        return {
            background: `conic-gradient(${color} ${safeValue}%, rgba(148,163,184,0.2) ${safeValue}% 100%)`,
        };
    };

    const responseRatePercent = pipelineStats.respondRate ?? 0;
    const conversionRatePercent = pipelineStats.conversionRate ?? 0;
    const responseRingStyle = buildRingStyle('#1a73e8', responseRatePercent);
    const conversionRingStyle = buildRingStyle('#10b981', conversionRatePercent);
    const activeAutomationChannels = Object.entries(automationSettings.channels ?? {})
        .filter(([, enabled]) => Boolean(enabled))
        .map(([key]) => key.toUpperCase());
    const automationStatusLabel = automationSettings.enabled ? 'Running' : 'Paused';

    const pipelineStages = useMemo(
        () => [
            { label: 'New', count: pipelineStats.newCount, barGradient: 'from-primary/80 via-primary/60 to-primary/30', accent: 'text-primary' },
            { label: 'Contacted', count: pipelineStats.contactedCount, barGradient: 'from-orange-500/80 via-orange-400/60 to-orange-300/30', accent: 'text-orange-500' },
            { label: 'Qualified', count: pipelineStats.qualifiedCount, barGradient: 'from-emerald-500/80 via-emerald-400/60 to-emerald-300/30', accent: 'text-emerald-500' },
            { label: 'Lost', count: pipelineStats.lostCount, barGradient: 'from-slate-500/70 via-slate-400/50 to-slate-300/20', accent: 'text-slate-500' },
        ],
        [pipelineStats],
    );

    const emptyWorkspaceCopy = useMemo(
        () => ({
            title: 'No lead active',
            description: 'Pick a lead from the pipeline or create a new one to unlock personalized outreach, AI research, and messaging.',
        }),
        [],
    );

    const nextFollowUps = useMemo(() => {
        if (!leads.length) return [];
        const priorityOrder: Record<Lead['status'], number> = {
            New: 0,
            Contacted: 1,
            Qualified: 2,
            Lost: 3,
        };
        return [...leads]
            .filter((lead) => lead.status !== 'Lost')
            .sort((a, b) => priorityOrder[a.status] - priorityOrder[b.status])
            .slice(0, 4);
    }, [leads]);

    const handleAutomationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await saveAutomationSettings({
                ...automationForm,
            });
            toast({
                title: 'Sales automation updated',
                description: automationSettings.enabled
                    ? 'We refreshed your automation preferences.'
                    : 'Configuration saved. Enable automation when you are ready.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Unable to save',
                description: error?.message ?? 'Please try again soon.',
            });
        }
    };

    const handleChannelToggle = async (channel: keyof typeof automationSettings.channels) => {
        const current = automationSettings.channels?.[channel];
        const previousChannels = automationSettings.channels ?? {};
        try {
            await saveAutomationSettings({
                channels: {
                    ...previousChannels,
                    [channel]: !current,
                },
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Update failed',
                description: error?.message ?? 'Unable to update channel preference.',
            });
        }
    };

    const handleAutomationToggle = async () => {
        try {
            await toggleAutomation(!automationSettings.enabled);
            toast({
                title: !automationSettings.enabled ? 'Automation enabled' : 'Automation paused',
                description: !automationSettings.enabled
                    ? 'Your AI assistant will now reply, schedule, and prepare documents automatically.'
                    : 'Automation is paused. Manual follow-ups required.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Unable to update automation status',
                description: error?.message ?? 'Please try again shortly.',
            });
        }
    };

    const automationUpdatedAt = automationSettings.updatedAt
        ? new Date(automationSettings.updatedAt).toLocaleString()
        : null;

    const handlePersonalizeClick = async (lead: Lead) => {
        setActiveLead(lead);
        setPanelMode('personalize');
        setResearchHighlights([]);
        setIsGenerating(true);
        setPersonalizedMessage('');
        setGenerationError(null);
        try {
            const message = await generatePersonalizedLeadMessage(lead.name, lead.company, lead.source);
            setPersonalizedMessage(message);
        } catch (error) {
            setPersonalizedMessage("Error: Could not generate a personalized message.");
            setGenerationError('Failed to generate message.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const buildResearchHighlights = (lead: Lead): string[] => {
        const points: string[] = [];
        points.push(`${lead.name} connected via ${lead.source}. Current pipeline stage: ${lead.status}.`);
        points.push(`Suggested next step: ${lead.status === 'New' ? 'send a warm introduction email' : lead.status === 'Contacted' ? 'schedule a discovery call' : lead.status === 'Qualified' ? 'share pricing and proposal' : 'capture feedback and nurture for future reopen.'}`);
        points.push(`Mention a recent win or case study that aligns with ${lead.company}'s goals to build credibility.`);
        return points;
    };

    const handleResearchLead = (lead: Lead) => {
        setActiveLead(lead);
        setPanelMode('research');
        setIsGenerating(false);
        setGenerationError(null);
        setPersonalizedMessage('');
        setResearchHighlights(buildResearchHighlights(lead));
    };

    const handleUpdateStatus = async (leadId: string, status: Lead['status']) => {
        await updateLeadStatus(leadId, status);
    };

    const handleSendMessage = async (lead: Lead, payload: { platform: MessagePlatform; message: string }) => {
        const platformLabel = payload.platform === 'email' ? 'Email' : payload.platform === 'whatsapp' ? 'WhatsApp' : 'SMS';
        toast({
            title: `${platformLabel} queued`,
            description: `We’ve prepared your ${platformLabel.toLowerCase()} to ${lead.name}.`,
        });
    };

    const handleSaveLeadEdits = async (updates: { name: string; company: string; email: string; source: string; status: Lead['status'] }) => {
        if (!editingLead) return;
        const currentLead = editingLead;
        setEditError(null);
        setIsSavingLead(true);
        try {
            await updateLead(currentLead.id, updates);
            toast({
                title: 'Lead updated',
                description: `${updates.name} has been updated successfully.`,
            });
            setEditingLead(null);
            setActiveLead((prev) => (prev && prev.id === currentLead.id ? { ...prev, ...updates } : prev));
            setDetailViewLead((prev) => (prev && prev.id === currentLead.id ? { ...prev, ...updates } : prev));
        } catch (error: any) {
            setEditError(error?.message ?? 'Unable to update lead. Please try again.');
        } finally {
            setIsSavingLead(false);
        }
    };

    const handleArchiveLead = async () => {
        if (!editingLead) return;
        const currentLead = editingLead;
        setEditError(null);
        setIsArchivingLead(true);
        try {
            await removeLead(currentLead.id);
            toast({
                title: 'Lead archived',
                description: `${currentLead.name} has been archived and removed from your active list.`,
            });
            if (activeLead?.id === currentLead.id) {
                setActiveLead(null);
                setPanelMode(null);
                setPersonalizedMessage('');
                setResearchHighlights([]);
            }
            if (detailViewLead?.id === currentLead.id) {
                setDetailViewLead(null);
            }
            setEditingLead(null);
        } catch (error: any) {
            setEditError(error?.message ?? 'Unable to archive lead. Please try again.');
        } finally {
            setIsArchivingLead(false);
        }
    };

    const closeEditModal = () => {
        if (isSavingLead || isArchivingLead) return;
        setEditingLead(null);
        setEditError(null);
    };

    const filteredLeads = useMemo(() => leads.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    ), [leads, searchTerm]);

    return (
        <>
            {isAddModalOpen && <AddLeadModal onClose={() => setIsAddModalOpen(false)} onAddLead={addLead} />}
            {detailViewLead && <LeadDetailModal lead={detailViewLead} onClose={() => setDetailViewLead(null)} onUpdateStatus={handleUpdateStatus}/>}
            {messageLead && (
                <MessageLeadModal
                    lead={messageLead}
                    onClose={() => setMessageLead(null)}
                    onSend={(payload) => handleSendMessage(messageLead, payload)}
                />
            )}
            {editingLead && (
                <EditLeadModal
                    lead={editingLead}
                    onClose={closeEditModal}
                    onSave={handleSaveLeadEdits}
                    onArchive={handleArchiveLead}
                    isSaving={isSavingLead}
                    isArchiving={isArchivingLead}
                    error={editError}
                />
            )}
            <div className="space-y-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">Leads & Sales Automation</h1>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            Track every prospect, keep momentum with AI assistance, and orchestrate 8×8 automations without leaving Aether.
                        </p>
                    </div>
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                        <SearchInput
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            containerClassName="w-full sm:w-64"
                        />
                        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                            <PlusIcon className="h-4 w-4" /> Add lead
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <Card className="border border-border/60 shadow-sm">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Snapshot</p>
                                    <h2 className="text-xl font-semibold text-foreground">Pipeline at a glance</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        {
                                            label: 'Active leads',
                                            value: pipelineStats.total,
                                            caption: 'Total in funnel',
                                            highlight: 'border-primary/30 bg-primary/10 text-primary',
                                        },
                                        {
                                            label: 'New',
                                            value: pipelineStats.newCount,
                                            caption: 'Awaiting first touch',
                                            highlight: 'border-blue-500/20 bg-blue-500/10 text-blue-500',
                                        },
                                        {
                                            label: 'Contacted',
                                            value: pipelineStats.contactedCount,
                                            caption: 'In conversation',
                                            highlight: 'border-orange-500/20 bg-orange-500/10 text-orange-500',
                                        },
                                        {
                                            label: 'Qualified',
                                            value: pipelineStats.qualifiedCount,
                                            caption: 'Sales ready',
                                            highlight: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
                                        },
                                    ].map((metric) => (
                                        <div
                                            key={metric.label}
                                            className={`rounded-2xl border ${metric.highlight} p-4 transition`}
                                        >
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                                            <p className="mt-2 text-3xl font-semibold text-foreground">{metric.value}</p>
                                            <p className="text-xs text-muted-foreground">{metric.caption}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <Card className="border border-border/60 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Funnel</p>
                                    <h3 className="text-lg font-semibold text-foreground">Stage breakdown</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Conversion</p>
                                    <p className="text-lg font-semibold text-foreground">{conversionRatePercent}%</p>
                                </div>
                            </div>
                            <div className="mt-6 h-48 flex items-end gap-4">
                                {pipelineStages.map((stage) => {
                                    const percent = pipelineStats.total > 0 ? Math.round((stage.count / pipelineStats.total) * 100) : 0;
                                    const height = pipelineStats.total > 0 ? Math.max(12, percent) : 8;
                                    return (
                                        <div key={stage.label} className="flex-1 flex flex-col items-center gap-2">
                                            <span className="text-sm font-semibold text-foreground">{stage.count}</span>
                                            <div className="relative w-full max-w-[72px] flex-1 rounded-b-3xl border border-border/60 bg-muted/30 overflow-hidden">
                                                <div
                                                    className={`absolute inset-x-1 bottom-1 rounded-b-3xl bg-gradient-to-t ${stage.barGradient}`}
                                                    style={{ height: `${height}%` }}
                                                />
                                            </div>
                                            <span className="text-xs uppercase tracking-wide text-muted-foreground">{stage.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        <Card className="border border-border/60 shadow-sm">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Performance</p>
                                <h3 className="text-lg font-semibold text-foreground">Response & conversion</h3>
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-4">
                                {[
                                    {
                                        label: 'Response rate',
                                        value: `${responseRatePercent}%`,
                                        caption: 'Touches answered within SLA',
                                        style: responseRingStyle,
                                        accent: 'text-primary',
                                    },
                                    {
                                        label: 'Conversion rate',
                                        value: `${conversionRatePercent}%`,
                                        caption: 'Leads moved to Qualified',
                                        style: conversionRingStyle,
                                        accent: 'text-emerald-500',
                                    },
                                ].map((metric) => (
                                    <div key={metric.label} className="flex flex-col items-center gap-3">
                                        <div className="relative h-24 w-24 rounded-full bg-muted/40" style={metric.style}>
                                            <div className="absolute inset-2 rounded-full bg-card/90 shadow-inner flex items-center justify-center text-lg font-semibold text-foreground">
                                                {metric.value}
                                            </div>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className={`text-sm font-semibold ${metric.accent}`}>{metric.label}</p>
                                            <p className="text-xs text-muted-foreground">{metric.caption}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl overflow-hidden">
                            <div className="space-y-4 px-6 py-5">
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-2xl font-semibold text-foreground">Sales Automation Suite</h2>
                                        <p className="text-sm text-muted-foreground max-w-2xl">
                                            Activate 8×8-powered workflows to respond instantly, route calls intelligently, and keep billing steps handled before a rep steps in.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className={`rounded-full px-3 py-1 font-semibold ${automationSettings.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-600'}`}>
                                                {automationStatusLabel}
                                            </span>
                                            <span>{automationUpdatedAt ? `Updated ${automationUpdatedAt}` : 'Not yet configured'}</span>
                                            {activeAutomationChannels.length > 0 && (
                                                <span className="hidden sm:inline">· {activeAutomationChannels.join(', ')}</span>
                                            )}
                                        </div>
                                        <Button
                                            variant="default"
                                            onClick={handleAutomationToggle}
                                            disabled={automationLoading || automationSaving}
                                            className="min-w-[200px]"
                                        >
                                            {automationSettings.enabled ? 'Pause automations' : 'Enable automations'}
                                        </Button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowWorkflowSummary((prev) => !prev)}
                                        className="text-xs font-medium text-primary hover:text-primary/80 transition flex items-center gap-2 w-fit"
                                    >
                                        {showWorkflowSummary ? 'Hide workflow summary' : 'Show workflow summary'}
                                    </button>
                                    {showWorkflowSummary && (
                                        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2 text-sm text-muted-foreground">
                                            <p>• Auto-reply to SMS with personalised responses and route hot leads to reps.</p>
                                            <p>• Summarise missed calls and queue callbacks with voicemail transcription.</p>
                                            <p>• Draft invoices and quotes and email them from your billing inbox on approval.</p>
                                            <p>• Offer appointment slots via your connected calendar and sync confirmations.</p>
                                        </div>
                                    )}
                                </div>

                                {automationLoading ? (
                                    <div className="space-y-3">
                                        <div className="h-12 rounded-xl bg-muted animate-pulse" />
                                        <div className="h-12 rounded-xl bg-muted animate-pulse" />
                                        <div className="h-24 rounded-xl bg-muted animate-pulse" />
                                    </div>
                                ) : (
                                    <form onSubmit={handleAutomationSubmit} className="space-y-6">
                                        <Tabs value={configTab} onValueChange={(value) => setConfigTab(value as typeof configTab)} className="w-full">
                                            <TabsList className="grid grid-cols-3 w-full">
                                                <TabsTrigger value="contact">Contact</TabsTrigger>
                                                <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
                                                <TabsTrigger value="playbook">AI Playbook</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="contact" className="mt-4 space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Business phone</label>
                                                    <Input
                                                        value={automationForm.businessPhone}
                                                        onChange={(event) =>
                                                            setAutomationForm((prev) => ({ ...prev, businessPhone: event.target.value }))
                                                        }
                                                        placeholder="+1 (555) 000-1234"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invoice email</label>
                                                    <Input
                                                        type="email"
                                                        value={automationForm.invoiceEmail}
                                                        onChange={(event) =>
                                                            setAutomationForm((prev) => ({ ...prev, invoiceEmail: event.target.value }))
                                                        }
                                                        placeholder="billing@yourcompany.com"
                                                    />
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="scheduling" className="mt-4 space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Calendar link</label>
                                                    <Input
                                                        value={automationForm.calendarLink}
                                                        onChange={(event) =>
                                                            setAutomationForm((prev) => ({ ...prev, calendarLink: event.target.value }))
                                                        }
                                                        placeholder="https://cal.com/your-team"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Office hours</label>
                                                    <Input
                                                        value={automationForm.officeHours}
                                                        onChange={(event) =>
                                                            setAutomationForm((prev) => ({ ...prev, officeHours: event.target.value }))
                                                        }
                                                        placeholder="Mon–Fri · 9:00am – 5:00pm"
                                                    />
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="playbook" className="mt-4 space-y-2">
                                                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI playbook notes</label>
                                                <Textarea
                                                    value={automationForm.playbook}
                                                    onChange={(event) =>
                                                        setAutomationForm((prev) => ({ ...prev, playbook: event.target.value }))
                                                    }
                                                    placeholder="Add greetings, objection handling tips, or billing instructions for the AI assistant..."
                                                    className="min-h-[140px]"
                                                />
                                            </TabsContent>
                                        </Tabs>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-xs text-muted-foreground">
                                                Configuration saves instantly and applies across every connected channel.
                                            </p>
                                            <Button type="submit" disabled={automationSaving}>
                                                {automationSaving ? 'Saving…' : 'Save configuration'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </Card>

                        <Card className="border border-border/60 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Automation controls</p>
                                    <h3 className="text-lg font-semibold text-foreground">Quick configuration & overrides</h3>
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {automationControls.map((control) => {
                                    const Icon = control.icon;
                                    const active = Boolean(automationSettings.channels?.[control.id]);
                                    return (
                                        <button
                                            key={control.id}
                                            type="button"
                                            onClick={() => handleChannelToggle(control.id)}
                                            disabled={automationSaving}
                                            className={`group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                                                active
                                                    ? 'border-primary/40 bg-primary/5 shadow-sm'
                                                    : 'border-border/60 bg-card/80 hover:border-primary/40 hover:bg-primary/5/50'
                                            }`}
                                        >
                                            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${control.accentBg}`}>
                                                <Icon className={`h-5 w-5 ${control.accent}`} />
                                            </span>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-semibold text-foreground">{control.label}</p>
                                                <p className="text-xs text-muted-foreground">{control.description}</p>
                                            </div>
                                            <Badge variant={active ? 'default' : 'outline'} className="ml-auto">
                                                {active ? 'Active' : 'Off'}
                                            </Badge>
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border border-border/60 lg:sticky lg:top-8 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <SparklesIcon className="w-6 h-6 text-primary" />
                                <h3 className="text-xl font-semibold text-foreground">Lead workspace</h3>
                            </div>
                            {activeLead ? (
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <h4 className="font-semibold text-foreground">{activeLead.name}</h4>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                            {activeLead.company} • {activeLead.status}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            variant={panelMode === 'personalize' ? 'default' : 'outline'}
                                            onClick={() => handlePersonalizeClick(activeLead)}
                                            disabled={isGenerating}
                                        >
                                            AI Personalize
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={panelMode === 'research' ? 'default' : 'outline'}
                                            onClick={() => handleResearchLead(activeLead)}
                                        >
                                            Research
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setMessageLead(activeLead)}
                                        >
                                            Message
                                        </Button>
                                    </div>

                                    {panelMode === 'research' ? (
                                        <div className="space-y-3">
                                            <h5 className="text-sm font-semibold text-foreground">Research snapshot</h5>
                                            {researchHighlights.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {researchHighlights.map((item, index) => (
                                                        <li key={index} className="text-sm text-muted-foreground leading-snug">
                                                            • {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    Click “Research” to generate quick insights for this lead.
                                                </p>
                                            )}
                                            <div className="flex flex-col gap-2">
                                                <Button size="sm" onClick={() => handlePersonalizeClick(activeLead)}>
                                                    Generate outreach copy
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => setMessageLead(activeLead)}
                                                >
                                                    Open message composer
                                                </Button>
                                            </div>
                                        </div>
                                    ) : panelMode === 'personalize' ? (
                                        <>
                                            {isGenerating ? (
                                                <div className="min-h-[200px] flex items-center justify-center">
                                                    <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                </div>
                                            ) : (
                                                <Textarea
                                                    readOnly
                                                    value={personalizedMessage}
                                                    className="w-full h-48 bg-input text-foreground rounded-[var(--radius)] p-3 focus:outline-none resize-none border border-border"
                                                />
                                            )}
                                            {generationError && <p className="text-xs text-destructive">{generationError}</p>}
                                            <Button
                                                className="w-full"
                                                onClick={() => setMessageLead(activeLead)}
                                            >
                                                Send message
                                            </Button>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Select a workflow to start personalising outreach for {activeLead.name}.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/30 px-6 py-10 text-center">
                                    <FileIcon className="h-10 w-10 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <h4 className="text-base font-semibold text-foreground">{emptyWorkspaceCopy.title}</h4>
                                        <p className="text-sm text-muted-foreground">{emptyWorkspaceCopy.description}</p>
                                    </div>
                                    <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
                                        Add a lead
                                    </Button>
                                </div>
                            )}
                        </Card>

                        <Card className="border border-border/60 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Priority follow-ups</p>
                                    <h3 className="text-lg font-semibold text-foreground">Stay ahead of the queue</h3>
                                </div>
                                <Badge variant="outline" className="text-xs">Autoprioritised</Badge>
                            </div>
                            <div className="space-y-3">
                                {nextFollowUps.length > 0 ? (
                                    nextFollowUps.map((lead) => (
                                        <div key={lead.id} className="relative rounded-2xl border border-border/60 bg-card/70 p-4">
                                            <span
                                                className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
                                                style={{ backgroundColor: statusAccentColors[lead.status] }}
                                            />
                                            <div className="pl-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-foreground">{lead.name}</p>
                                                        <p className="text-xs text-muted-foreground">{lead.company}</p>
                                                    </div>
                                                    <Badge variant="outline" className="capitalize">
                                                        {lead.status}
                                                    </Badge>
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => handleResearchLead(lead)}>
                                                        Research
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handlePersonalizeClick(lead)}>
                                                        Personalize
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => setMessageLead(lead)}>
                                                        Message
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        All caught up—add new leads or nurture existing ones to populate this list.
                                    </p>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                <Card className="border border-border/60 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 px-4 py-4">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Lead pipeline</h3>
                            <p className="text-sm text-muted-foreground">Track every opportunity across the funnel.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {statusSummary.map((status) => (
                                <Badge key={status.label} variant="outline" className="px-3 py-1 text-xs font-medium">
                                    {status.label} · {status.count}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/40">
                                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="px-4 py-3 font-semibold text-foreground">Lead</th>
                                    <th className="px-4 py-3 font-semibold text-foreground">Company</th>
                                    <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                                    <th className="px-4 py-3 font-semibold text-foreground">Source</th>
                                    <th className="px-4 py-3 font-semibold text-right text-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                                            Loading leads...
                                        </td>
                                    </tr>
                                ) : filteredLeads.length > 0 ? (
                                    filteredLeads.map((lead) => (
                                        <tr
                                            key={lead.id}
                                            className="group cursor-pointer border-b border-border/60 transition hover:bg-muted/40"
                                            onClick={() => setDetailViewLead(lead)}
                                        >
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-foreground group-hover:text-primary transition">{lead.name}</p>
                                                <p className="text-xs text-muted-foreground">ID: {lead.id}</p>
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">{lead.company}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    lead.status === 'New' ? 'bg-primary/15 text-primary' :
                                                    lead.status === 'Contacted' ? 'bg-orange-500/15 text-orange-500' :
                                                    lead.status === 'Qualified' ? 'bg-emerald-500/15 text-emerald-500' :
                                                    'bg-slate-500/15 text-slate-500'
                                                }`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">{lead.source}</td>
                                            <td className="px-4 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={(event) => event.stopPropagation()}
                                                        >
                                                            <MoreIcon className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44" onClick={(event) => event.stopPropagation()}>
                                                        <DropdownMenuItem
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                handleResearchLead(lead);
                                                            }}
                                                        >
                                                            Generate research
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                handlePersonalizeClick(lead);
                                                            }}
                                                        >
                                                            AI personalize copy
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                setMessageLead(lead);
                                                            }}
                                                        >
                                                            Compose message
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                setEditingLead(lead);
                                                                setEditError(null);
                                                            }}
                                                        >
                                                            Edit lead
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-12" colSpan={5}>
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <FileIcon className="h-10 w-10" />
                                                <p>No leads found. Add your first lead to get started.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
        </div>
        </>
    );
};

export default Leads;