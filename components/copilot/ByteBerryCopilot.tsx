import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useProjects } from '@/hooks/useProjects';
import { useAssignedTasks } from '@/hooks/useAssignedTasks';
import { useToast } from '@/hooks/use-toast';
import { SparklesIcon, AttachmentIcon, SendIcon } from '../shared/Icons';
import MessageBubble from './MessageBubble';
import { useMood } from '../../hooks/useMood';
import { generateCopilotResponse } from '../../services/deepseekService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ByteBerryCopilotProps {
  userId?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ByteBerryCopilot: React.FC<ByteBerryCopilotProps> = ({ userId, isOpen: controlledIsOpen, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { emoji, mood, message: moodMessage } = useMood();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const { kpis, monthlySales } = useDashboard(userId);
  const { projects } = useProjects(userId);
  const { incompleteTasks, upcomingDeadlines } = useAssignedTasks(userId);

  const quickPrompts = useMemo(
    () => [
      {
        id: 'summary',
        label: 'Workspace summary',
        prompt:
          'Summarise the current workspace performance including revenue, lead velocity, and team momentum. Highlight the largest risk.',
      },
      {
        id: 'next-actions',
        label: 'Next best actions',
        prompt:
          'Recommend the top three actions across sales, marketing, and delivery that would create the biggest impact this week.',
      },
      {
        id: 'team-health',
        label: 'Team health',
        prompt:
          'Analyse team workload and deadlines. Are there any owners or upcoming dates that need attention?',
      },
    ],
    []
  );

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
        id: 'welcome',
        role: 'assistant',
          content: `Hi! I'm Byte&Berry Copilot. I can help you read your metrics, surface risks, and plan smarter next steps.

Ask me about revenue trends, project status, or anything else in your workspace.`,
        timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);
  
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInput('');
      setIsLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const buildContext = useCallback((): string => {
    const contextParts: string[] = [];

    if (user) {
      contextParts.push(`User: ${user.displayName || user.email}`);
    }

    if (kpis.length > 0) {
      contextParts.push('\nCurrent KPIs:');
      kpis.forEach((kpi) => {
        contextParts.push(`- ${kpi.title}: ${kpi.value} (${kpi.change} ${kpi.changeType})`);
      });
    }

    if (monthlySales.length > 0) {
      contextParts.push('\nMonthly sales (latest 6 months):');
      monthlySales.slice(-6).forEach((entry) => {
        contextParts.push(`- ${entry.month}: $${entry.sales.toLocaleString()}`);
      });
    }

    if (projects.length > 0) {
      contextParts.push(`\nActive projects (${projects.length} total):`);
      projects.slice(0, 5).forEach((project) => {
        contextParts.push(`- ${project.name}: ${project.status} (${project.progress}% complete)`);
      });
    }

    if (incompleteTasks.length > 0) {
      contextParts.push(`\nIncomplete tasks (${incompleteTasks.length}):`);
      incompleteTasks.slice(0, 5).forEach((task) => contextParts.push(`- ${task.title} (${task.status})`));
    }

    if (upcomingDeadlines.length > 0) {
      contextParts.push('\nUpcoming deadlines:');
      upcomingDeadlines.slice(0, 3).forEach((deadline) => contextParts.push(`- ${deadline.title}: ${deadline.dueDate}`));
    }

    return contextParts.join('\n');
  }, [user, kpis, monthlySales, projects, incompleteTasks, upcomingDeadlines]);

  const sendPrompt = useCallback(
    async (rawContent: string) => {
      const trimmed = rawContent.trim();
      if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
        content: trimmed,
      timestamp: new Date(),
    };

      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const context = buildContext();
      const conversationHistory = nextMessages
        .slice(-6)
        .map((msg) => ({ role: msg.role, content: msg.content }));

      const responseText = await generateCopilotResponse(
        trimmed,
        context,
        conversationHistory
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          responseText ||
          "I'm sorry—I'm having trouble reading that data right now. Could you try asking in a different way?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
        console.error('ByteBerry Copilot error:', error);
        console.error('Error details:', {
          message: error?.message,
          name: error?.name,
          stack: error?.stack,
          code: error?.code,
          status: error?.status,
        });
        
        let errorMessage = 'I hit a snag interpreting that. Give it another go in a moment, or try rephrasing!';
        let toastTitle = 'Copilot Error';
        
        // Check for specific error types
        if (error?.message?.includes('API key')) {
          errorMessage = '🔑 AI service is not configured. Please set VITE_DEEPSEEK_API_KEY in your .env file.';
          toastTitle = 'API Key Missing';
        } else if (error?.message?.includes('Rate limit')) {
          errorMessage = `⏱️ Rate limit exceeded. Please try again in a moment.

The DeepSeek API has rate limits to ensure fair usage. Please wait a moment and try again.`;
          toastTitle = 'Rate Limit Reached';
        } else if (error?.message) {
          errorMessage = `🤖 ${error.message}`;
        }
        
        setMessages((prev) => [
          ...prev,
          {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
            content: errorMessage,
        timestamp: new Date(),
          },
        ]);
      toast({
        variant: 'destructive',
          title: toastTitle,
          description: errorMessage.split('\n')[0], // First line only for toast
          duration: 8000, // Longer duration for quota error
      });
    } finally {
      setIsLoading(false);
    }
    },
    [messages, isLoading, buildContext, toast]
  );

  const handleSendMessage = useCallback(() => {
    void sendPrompt(input);
  }, [input, sendPrompt]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    void sendPrompt(prompt);
  };

  return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.96 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="pointer-events-auto fixed bottom-8 right-8 z-[120] w-full max-w-lg"
        >
          <Card className="overflow-hidden rounded-3xl border border-white/15 bg-white/95 shadow-[0_35px_90px_-45px_rgba(12,15,30,0.75)] backdrop-blur dark:bg-[#0f1422]/95 dark:text-white">
            <div className="flex items-start justify-between border-b border-white/20 bg-gradient-to-br from-primary/12 via-primary/6 to-transparent px-6 py-5">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <SparklesIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-base font-semibold tracking-tight text-foreground">Byte&Berry Copilot</p>
                    <p className="text-xs text-muted-foreground">{moodMessage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground/75">
                  <span className="rounded-full border border-border/60 px-2 py-0.5 capitalize">
                    <span className="mr-1">{emoji}</span>
                    {mood}
                  </span>
                  <span className="hidden sm:inline">Ask me anything about your business data.</span>
                </div>
              </div>
                  <Button
                size="icon"
                    variant="ghost"
                className="h-8 w-8 rounded-full hover:bg-white/60 dark:hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <span className="sr-only">Close copilot</span>
                ✕
                  </Button>
            </div>

            <div className="border-b border-white/15 px-6 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickPrompts.map((prompt) => (
                  <Button
                    key={prompt.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt(prompt.prompt)}
                    className="h-auto rounded-full border-border/60 bg-white/75 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary dark:bg-white/10 dark:text-white/70"
                  >
                    {prompt.label}
                  </Button>
                ))}
              </div>
                </div>

            <ScrollArea ref={scrollAreaRef} className="h-[340px] px-6 py-5">
                      <div className="space-y-4">
                <AnimatePresence initial={false}>
                        {messages.map((message) => (
                    <MessageBubble key={message.id} {...message} />
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-[12px] border border-border/50 bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
                  >
                    <SparklesIcon className="h-4 w-4 animate-spin text-primary/80" />
                    <span>Copilot is thinking…</span>
                  </motion.div>
                )}
                      </div>
                    </ScrollArea>

            <div className="border-t border-white/15 px-6 py-4">
              <div className="flex items-end gap-3">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-11 w-11 rounded-[12px] border border-border/60 text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  aria-label="Attach file"
                >
                  <AttachmentIcon className="h-5 w-5" />
                </Button>
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask the copilot anything about your business..."
                          disabled={isLoading}
                  className="flex-1 rounded-[12px] border border-border/60 bg-white/85 px-4 py-3 text-sm text-foreground shadow-inner focus-visible:ring-2 focus-visible:ring-primary/30 dark:bg-white/10 dark:text-white"
                        />
                        <Button
                  type="button"
                  disabled={!input.trim() || isLoading}
                          onClick={handleSendMessage}
                  className="h-11 rounded-[12px] bg-[linear-gradient(135deg,#4C7DF0_0%,#7A5CF0_80%)] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_-20px_rgba(76,125,240,0.8)] transition-transform hover:translate-y-[-1px] hover:shadow-[0_20px_38px_-18px_rgba(76,125,240,0.95)] disabled:opacity-70"
                        >
                  <SendIcon className="h-4 w-4" />
                        </Button>
                      </div>
              <p className="mt-2 text-[11px] text-muted-foreground/70">
                Press <span className="rounded-md border border-border/60 px-1.5 py-0.5 text-xs text-foreground">Enter</span> to send ·{' '}
                <span className="rounded-md border border-border/60 px-1.5 py-0.5 text-xs text-foreground">Shift + Enter</span> for a new line
              </p>
                    </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
  );
};

export default ByteBerryCopilot;

