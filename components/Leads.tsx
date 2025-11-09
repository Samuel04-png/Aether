import React, { useEffect, useMemo, useState } from 'react';
import Card from './shared/Card';
import { SparklesIcon, PlusIcon, CloseIcon, CsvIcon, CrmIcon, TrashIcon } from './shared/Icons';
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <Card className="w-full max-w-lg animate-slide-in-up">
                <div className="flex justify-between items-start gap-3 mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">Message {lead.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Choose a channel and tailor the note before sending.</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Platform</label>
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
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Lead status</label>
                            <div className="py-2 px-3 border border-border rounded-[var(--radius)] bg-input text-sm text-muted-foreground capitalize">
                                {lead.status}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Message</label>
                        <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border min-h-[160px] resize-none"
                        />
                        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="text-xs font-semibold px-3 py-1 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                            onClick={() => applyTemplate('warm')}
                        >
                            Warm intro
                        </button>
                        <button
                            type="button"
                            className="text-xs font-semibold px-3 py-1 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                            onClick={() => applyTemplate('direct')}
                        >
                            Direct pitch
                        </button>
                        <button
                            type="button"
                            className="text-xs font-semibold px-3 py-1 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                            onClick={() => applyTemplate('follow-up')}
                        >
                            Follow-up
                        </button>
                    </div>
                    <div className="flex justify-end gap-3 border-t border-border pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-secondary text-secondary-foreground font-semibold py-2 px-4 rounded-[var(--radius)] hover:bg-secondary/80 transition-colors shadow-sm"
                            disabled={isSending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-[var(--radius)] hover:bg-primary/90 transition-colors shadow-sm disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                            disabled={isSending}
                        >
                            {isSending ? 'Sending…' : `Send via ${platform === 'email' ? 'Email' : platform === 'whatsapp' ? 'WhatsApp' : 'SMS'}`}
                        </button>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <Card className="w-full max-w-lg animate-slide-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-foreground">Edit Lead</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Company</label>
                            <input
                                type="text"
                                value={company}
                                onChange={(event) => setCompany(event.target.value)}
                                className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Source</label>
                            <input
                                type="text"
                                value={source}
                                onChange={(event) => setSource(event.target.value)}
                                className="w-full bg-input text-foreground rounded-[var(--radius)] py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Status</label>
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
                    <div className="flex justify-between items-center border-t border-border pt-4">
                        <button
                            type="button"
                            className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
                            onClick={onArchive}
                            disabled={isArchiving}
                        >
                            <TrashIcon className="w-4 h-4" />
                            {isArchiving ? 'Archiving…' : 'Archive lead'}
                        </button>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-secondary text-secondary-foreground font-semibold py-2 px-4 rounded-[var(--radius)] hover:bg-secondary/80 transition-colors shadow-sm"
                                disabled={isSaving || isArchiving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-[var(--radius)] hover:bg-primary/90 transition-colors shadow-sm disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                                disabled={isSaving || isArchiving}
                            >
                                {isSaving ? 'Saving…' : 'Save Changes'}
                            </button>
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

    const automationChannels = useMemo(
        () => [
            { id: 'sms' as const, label: 'SMS Replies', description: 'Send instant text responses with lead-specific merge tags.' },
            { id: 'voice' as const, label: 'Call Routing', description: 'Route missed calls to voicemail transcription and callback queue.' },
            { id: 'invoices' as const, label: 'Invoices & Quotes', description: 'Auto-generate branded invoices and sales quotations.' },
            { id: 'appointments' as const, label: 'Appointment Booking', description: 'Share scheduling links and coordinate follow-ups automatically.' },
        ],
        [],
    );

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
        try {
            await saveAutomationSettings({
                channels: {
                    ...automationSettings.channels,
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <Card className="xl:col-span-1 bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 shadow-md">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 mb-3">
                                        Pipeline Overview
                                    </Badge>
                                    <h2 className="text-xl font-semibold text-foreground">Lead Health</h2>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Respond rate and conversion metrics update in real time as you manage leads.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-primary">{pipelineStats.total}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Leads</p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                {[
                                    { label: 'New', count: pipelineStats.newCount, tone: 'text-primary' },
                                    { label: 'Contacted', count: pipelineStats.contactedCount, tone: 'text-blue-500' },
                                    { label: 'Qualified', count: pipelineStats.qualifiedCount, tone: 'text-emerald-500' },
                                ].map((stage) => {
                                    const percent = pipelineStats.total > 0 ? Math.round((stage.count / pipelineStats.total) * 100) : 0;
                                    return (
                                        <div key={stage.label}>
                                            <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase">
                                                <span>{stage.label}</span>
                                                <span>{stage.count} · {percent}%</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-background border border-border/50 overflow-hidden mt-1">
                                                <div
                                                    className={`h-full ${stage.tone} bg-current rounded-full transition-all`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <div className="rounded-xl bg-background/60 border border-border/60 p-3">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Response rate</p>
                                    <p className="text-xl font-semibold text-foreground">{pipelineStats.respondRate}%</p>
                                </div>
                                <div className="rounded-xl bg-background/60 border border-border/60 p-3">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Conversion</p>
                                    <p className="text-xl font-semibold text-foreground">{pipelineStats.conversionRate}%</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="xl:col-span-2 border-border/80 shadow-md">
                            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                                <div>
                                    <Badge variant={automationSettings.enabled ? 'default' : 'outline'} className="mb-2">
                                        {automationSettings.enabled ? 'Active automations' : 'Draft configuration'}
                                    </Badge>
                                    <h2 className="text-xl font-semibold text-foreground">Sales Automation Suite</h2>
                                    <p className="text-sm text-muted-foreground max-w-xl">
                                        Connect Aether’s AI concierge to reply to SMS, triage calls, prepare invoices & quotations, and slot demos automatically.
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {automationUpdatedAt && (
                                        <p className="text-xs text-muted-foreground">Updated {automationUpdatedAt}</p>
                                    )}
                                    <Button
                                        variant={automationSettings.enabled ? 'outline' : 'default'}
                                        onClick={handleAutomationToggle}
                                        disabled={automationLoading || automationSaving}
                                        className="min-w-[160px]"
                                    >
                                        {automationSettings.enabled ? 'Pause automations' : 'Enable automations'}
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {automationLoading ? (
                                    <div className="col-span-2 space-y-4">
                                        <div className="h-12 bg-muted rounded-xl animate-pulse" />
                                        <div className="h-12 bg-muted rounded-xl animate-pulse" />
                                        <div className="h-24 bg-muted rounded-xl animate-pulse" />
                                    </div>
                                ) : (
                                    <>
                                        <form className="space-y-4" onSubmit={handleAutomationSubmit}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Business phone</label>
                                                    <Input
                                                        value={automationForm.businessPhone}
                                                        onChange={(event) =>
                                                            setAutomationForm((prev) => ({ ...prev, businessPhone: event.target.value }))
                                                        }
                                                        placeholder="+1 (555) 000-1234"
                                                    />
                                                </div>
                                                <div>
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
                                                <div>
                                                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Calendar link</label>
                                                    <Input
                                                        value={automationForm.calendarLink}
                                                        onChange={(event) =>
                                                            setAutomationForm((prev) => ({ ...prev, calendarLink: event.target.value }))
                                                        }
                                                        placeholder="https://cal.com/your-team"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Office hours</label>
                                                    <Input
                                                        value={automationForm.officeHours}
                                                        onChange={(event) =>
                                                            setAutomationForm((prev) => ({ ...prev, officeHours: event.target.value }))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personalised playbook notes</label>
                                                <Textarea
                                                    value={automationForm.playbook}
                                                    onChange={(event) =>
                                                        setAutomationForm((prev) => ({ ...prev, playbook: event.target.value }))
                                                    }
                                                    placeholder="Add custom greetings, billing instructions, or internal routing notes..."
                                                    className="min-h-[120px]"
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <Button
                                                    type="submit"
                                                    disabled={automationSaving}
                                                >
                                                    {automationSaving ? 'Saving…' : 'Save automation settings'}
                                                </Button>
                                            </div>
                                        </form>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-3">
                                                {automationChannels.map((channel) => {
                                                    const active = automationSettings.channels?.[channel.id];
                                                    return (
                                                        <Button
                                                            key={channel.id}
                                                            type="button"
                                                            variant={active ? 'default' : 'outline'}
                                                            className="justify-start gap-3"
                                                            onClick={() => handleChannelToggle(channel.id)}
                                                            disabled={automationSaving}
                                                        >
                                                            <span className="text-left">
                                                                <span className="block text-sm font-semibold text-foreground">{channel.label}</span>
                                                                <span className="block text-xs text-foreground/70">{channel.description}</span>
                                                            </span>
                                                            <Badge variant={active ? 'outline' : 'secondary'} className="ml-auto">
                                                                {active ? 'Active' : 'Off'}
                                                            </Badge>
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                            <div className="rounded-xl border border-border/60 p-4 bg-muted/30 space-y-2">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Automation workflow</p>
                                                <ul className="space-y-2 text-sm text-muted-foreground">
                                                    <li>• Auto-reply to SMS with personalised responses and next steps.</li>
                                                    <li>• Route unanswered calls to voicemail summaries for reps.</li>
                                                    <li>• Draft invoices and quotes synced to your billing inbox.</li>
                                                    <li>• Offer appointment slots via your connected calendar.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Leads</h1>
                            <p className="text-muted-foreground mt-1">Manage and engage with your potential customers.</p>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <SearchInput 
                                placeholder="Filter leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                containerClassName="w-full md:w-64"
                            />
                            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shrink-0">
                                <PlusIcon /> Add Lead
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-border">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-foreground">Name</th>
                                        <th className="p-3 text-sm font-semibold text-foreground">Company</th>
                                        <th className="p-3 text-sm font-semibold text-foreground">Status</th>
                                        <th className="p-3 text-sm font-semibold text-foreground">Source</th>
                                        <th className="p-3 text-sm font-semibold text-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td className="p-3 text-muted-foreground" colSpan={5}>Loading leads...</td>
                                        </tr>
                                    ) : filteredLeads.length > 0 ? filteredLeads.map(lead => (
                                        <tr key={lead.id} className="hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setDetailViewLead(lead)}>
                                            <td className="p-3 font-medium text-foreground">{lead.name}</td>
                                            <td className="p-3 text-muted-foreground">{lead.company}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    lead.status === 'New' ? 'bg-primary/20 text-primary' :
                                                    lead.status === 'Contacted' ? 'bg-accent/20 text-accent-foreground' :
                                                    lead.status === 'Qualified' ? 'bg-chart-2/20 text-chart-2' :
                                                    'bg-destructive/20 text-destructive'
                                                }`}>{lead.status}</span>
                                            </td>
                                            <td className="p-3 text-muted-foreground">{lead.source}</td>
                                            <td className="p-3">
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleResearchLead(lead);
                                                        }}
                                                    >
                                                        Research
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMessageLead(lead);
                                                        }}
                                                    >
                                                        Message
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePersonalizeClick(lead);
                                                        }}
                                                    >
                                                        AI Personalize
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingLead(lead);
                                                            setEditError(null);
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td className="p-6 text-center text-muted-foreground" colSpan={5}>No leads found. Add your first lead to get started.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card className="sticky top-8">
                <div className="flex items-center gap-2 mb-4">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Lead Workspace</h3>
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
                                <h5 className="text-sm font-semibold text-foreground">Research Snapshot</h5>
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
                                    Send Message
                                </Button>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Choose Research or AI Personalize to get started with {activeLead.name}.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">Select a lead to run research or generate outreach copy.</p>
                    </div>
                )}
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Leads;