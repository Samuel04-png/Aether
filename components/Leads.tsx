import React, { useMemo, useState } from 'react';
import Card from './shared/Card';
import { SparklesIcon, PlusIcon, CloseIcon, CsvIcon, CrmIcon } from './shared/Icons';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { generatePersonalizedLeadMessage } from '../services/geminiService';
import { Lead } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { NewLeadInput, useLeads } from '../hooks/useLeads';

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


const Leads: React.FC = () => {
    const { user } = useAuth();
    const { leads, loading, addLead, updateLeadStatus } = useLeads(user?.uid);
    const [activeLead, setActiveLead] = useState<Lead | null>(null); // For AI panel
    const [detailViewLead, setDetailViewLead] = useState<Lead | null>(null); // For detail modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [personalizedMessage, setPersonalizedMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [generationError, setGenerationError] = useState<string | null>(null);

    const handlePersonalizeClick = async (lead: Lead) => {
        setActiveLead(lead);
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
    
    const handleUpdateStatus = async (leadId: string, status: Lead['status']) => {
        await updateLeadStatus(leadId, status);
    };

    const filteredLeads = useMemo(() => leads.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    ), [leads, searchTerm]);

    return (
        <>
            {isAddModalOpen && <AddLeadModal onClose={() => setIsAddModalOpen(false)} onAddLead={addLead} />}
            {detailViewLead && <LeadDetailModal lead={detailViewLead} onClose={() => setDetailViewLead(null)} onUpdateStatus={handleUpdateStatus}/>}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
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
                                        <th className="p-3 text-sm font-semibold text-foreground"></th>
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
                                            <td className="p-3 text-right">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handlePersonalizeClick(lead); }}
                                                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    AI Personalize
                                                </button>
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
                            <h3 className="text-xl font-semibold text-foreground">Personalized Outreach</h3>
                        </div>
                        {activeLead ? (
                            <div className="animate-fade-in">
                                <h4 className="font-semibold text-foreground">To: {activeLead.name}</h4>
                                <p className="text-sm text-muted-foreground mb-4">From: {activeLead.company}</p>
                                
                                {isGenerating ? (
                                    <div className="min-h-[200px] flex items-center justify-center">
                                        <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    </div>
                                ) : (
                                    <textarea
                                        readOnly
                                        value={personalizedMessage}
                                        className="w-full h-48 bg-input text-foreground rounded-[var(--radius)] p-3 focus:outline-none resize-none border border-border"
                                    />
                                )}
                                {generationError && <p className="text-xs text-destructive mt-2">{generationError}</p>}
                                <button className="w-full mt-4 bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-[var(--radius)] hover:bg-primary/90 transition-colors shadow-sm">
                                    Send Message
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">Select a lead to generate a personalized message.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Leads;