import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from '../copilot/MessageBubble';
import { SparklesIcon, SendIcon, AttachmentIcon } from '../shared/Icons';
import { useMood } from '../../hooks/useMood';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { mood, emoji, message: moodMessage } = useMood();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef(false);

  const quickActions = useMemo(
    () => [
      {
        id: 'business-health',
        label: 'Analyze business health',
        description: 'Summarize KPIs & highlight risks',
        prompt:
          'Analyze the latest workspace metrics and provide a concise summary of wins, risks, and next steps I should focus on today.',
      },
      {
        id: 'marketing',
        label: 'Improve marketing',
        description: 'Boost campaign performance',
        prompt:
          'Review our marketing tasks and suggest a mini plan to improve reach and conversions over the next two weeks.',
      },
      {
        id: 'sprint-plan',
        label: 'Plan next sprint',
        description: 'Organize tasks by priority',
        prompt:
          'Help me plan the next sprint by grouping current tasks into priorities and recommending owners or due dates.',
      },
    ],
    []
  );

  // Initialize with a mood-aware greeting
  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      const greetingMap = {
        cheerful: "Hi there! 🎉 I can see you're doing amazing! How can I help you keep the momentum going?",
        focused: "Hello! 🚀 You're in the zone! What would you like to work on today?",
        stressed: "Hey 😰 I notice you have a lot on your plate. Let me help you prioritize and get things back on track.",
        idle: "Hi! 😌 Things are looking calm. Ready to start something new or review your progress?",
      };

      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: greetingMap[mood],
          timestamp: new Date(),
        },
        {
          id: '2',
          role: 'assistant',
          content: `I'm Byte&Berry Copilot, your AI assistant. I can help you with:

• Understanding your dashboard metrics and KPIs
• Analyzing your project progress
• Managing tasks and deadlines
• Providing business insights
• Answering questions about your data

What would you like to know?`,
          timestamp: new Date(),
        },
      ]);
      hasInitialized.current = true;
    }
  }, [isOpen, mood]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = useCallback(
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
        const {
          default: { GoogleGenAI },
        } = await import('@google/genai');
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

        if (!apiKey) {
          throw new Error('Gemini API key not configured');
        }

        const ai = new GoogleGenAI({ apiKey });

        const conversationHistory = nextMessages
          .slice(-6)
          .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n\n');

        const prompt = `You are Byte&Berry Copilot, an AI business assistant for Aether. You help users with their business operations, task management, and data insights.

User's current mood: ${mood} ${emoji}

Conversation so far:
${conversationHistory}

User: ${userMessage.content}

Provide a helpful, concise, and friendly response. Summarize in short paragraphs or bullet points when useful, and be natural yet professional.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.text,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error: any) {
        console.error('Copilot error:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "I'm sorry, I ran into an issue generating a response. Please try again in a moment or rephrase your question.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [emoji, isLoading, messages, mood]
  );

  const handleSend = useCallback(() => {
    void sendMessage(input);
  }, [input, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleQuickAction = useCallback(
    (prompt: string) => {
      void sendMessage(prompt);
    },
    [sendMessage]
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className={cn(
          'flex h-full w-full flex-col overflow-hidden border-l border-border/60 bg-card/95 p-0 text-foreground shadow-[0_20px_60px_-35px_rgba(76,125,240,0.55)]',
          'sm:max-w-[520px]'
        )}
      >
        <SheetHeader className="space-y-4 border-b border-border/60 px-6 py-5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base font-semibold tracking-tight">
                Byte&Berry Copilot
              </SheetTitle>
              <SheetDescription className="mt-1 text-xs text-muted-foreground/80">
                {moodMessage}
              </SheetDescription>
            </div>
            <div className="ml-auto hidden items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground/80 sm:flex">
              <span className="text-sm">{emoji}</span>
              <span className="capitalize">{mood}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.prompt)}
                className="h-auto rounded-full border-border/50 bg-card/60 px-4 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </SheetHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-6">
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
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 rounded-[12px] border border-border/50 bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
              >
                <SparklesIcon className="h-4 w-4 animate-spin text-primary/80" />
                <span>Copilot is thinking...</span>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border/60 bg-card/90 px-6 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-3">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-11 w-11 rounded-[12px] border border-border/60 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                aria-label="Attach file"
              >
                <AttachmentIcon className="h-5 w-5" />
              </Button>
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the copilot anything about your business..."
                className="min-h-[60px] flex-1 resize-none rounded-[12px] border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground shadow-inner focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-11 rounded-[12px] bg-[linear-gradient(135deg,#4C7DF0_0%,#7A5CF0_80%)] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_-22px_rgba(76,125,240,0.8)] transition-transform hover:translate-y-[-1px] hover:shadow-[0_20px_38px_-20px_rgba(76,125,240,0.95)] disabled:opacity-70"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground/70">
              <span>
                Press <span className="rounded-md border border-border/60 bg-card/60 px-1.5 py-0.5 text-xs text-foreground">Enter</span> to
                send · <span className="rounded-md border border-border/60 bg-card/60 px-1.5 py-0.5 text-xs text-foreground">Shift + Enter</span> for a new
                line
              </span>
              <span className="hidden sm:inline-flex">
                Powered by Gemini · {user?.displayName ?? 'Aether User'}
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CopilotDrawer;

