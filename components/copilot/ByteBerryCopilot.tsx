import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useProjects } from '@/hooks/useProjects';
import { useAssignedTasks } from '@/hooks/useAssignedTasks';
import { useToast } from '@/hooks/use-toast';
import { SparklesIcon } from '../shared/Icons';
import { Send, Bot, User, X, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GoogleGenAI } from '@google/genai';

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
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get context data
  const { kpis, monthlySales } = useDashboard(user?.uid);
  const { projects } = useProjects(user?.uid);
  const { incompleteTasks, upcomingDeadlines } = useAssignedTasks(user?.uid);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm Byte&Berry Copilot, your AI assistant. I can help you with:
        
• Understanding your dashboard metrics and KPIs
• Analyzing your project progress
• Managing tasks and deadlines
• Providing business insights
• Answering questions about your data

What would you like to know?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);
  
  // Reset messages when copilot closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = (): string => {
    const contextParts: string[] = [];

    // User info
    if (user) {
      contextParts.push(`User: ${user.displayName || user.email}`);
    }

    // Dashboard KPIs
    if (kpis.length > 0) {
      contextParts.push('\nCurrent KPIs:');
      kpis.forEach((kpi) => {
        contextParts.push(`- ${kpi.title}: ${kpi.value} (${kpi.change} ${kpi.changeType})`);
      });
    }

    // Monthly sales
    if (monthlySales.length > 0) {
      contextParts.push('\nMonthly Sales Data:');
      monthlySales.slice(-6).forEach((sale) => {
        contextParts.push(`- ${sale.month}: $${sale.sales.toLocaleString()}`);
      });
    }

    // Projects
    if (projects.length > 0) {
      contextParts.push(`\nActive Projects: ${projects.length}`);
      projects.slice(0, 5).forEach((project) => {
        contextParts.push(`- ${project.name}: ${project.status} (${project.progress}% complete)`);
      });
    }

    // Tasks
    if (incompleteTasks.length > 0) {
      contextParts.push(`\nIncomplete Tasks: ${incompleteTasks.length}`);
      incompleteTasks.slice(0, 5).forEach((task) => {
        contextParts.push(`- ${task.title} (${task.status})`);
      });
    }

    // Upcoming deadlines
    if (upcomingDeadlines.length > 0) {
      contextParts.push(`\nUpcoming Deadlines: ${upcomingDeadlines.length}`);
      upcomingDeadlines.slice(0, 3).forEach((deadline) => {
        contextParts.push(`- ${deadline.title}: ${deadline.dueDate}`);
      });
    }

    return contextParts.join('\n');
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const ai = new GoogleGenAI({ apiKey });
      const context = buildContext();

      const prompt = `You are Byte&Berry Copilot, an AI assistant for the Aether business management platform. You help users understand their business data and provide actionable insights.

Context about the user's business:
${context}

User's question: ${userMessage.content}

Provide a helpful, concise response. If the user asks about specific data, reference the context above. Be friendly and professional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error?.message?.includes('API key')
          ? 'AI service is not configured. Please contact support.'
          : 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-[100] pointer-events-auto"
        >
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(true);
            }}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow gap-0 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
            type="button"
          >
            <SparklesIcon className="h-6 w-6" />
          </Button>
        </motion.div>
      )}

      {/* Copilot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-6 right-6 z-[100] w-full max-w-md pointer-events-auto",
              isMinimized ? "h-16" : "h-[600px]"
            )}
          >
            <Card className="h-full flex flex-col shadow-2xl border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <SparklesIcon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Byte&Berry Copilot</CardTitle>
                  <Badge variant="secondary" className="text-xs">AI</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? (
                      <Maximize2 className="h-4 w-4" />
                    ) : (
                      <Minimize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setIsOpen(false);
                      setIsMinimized(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex gap-3",
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                          >
                            {message.role === 'assistant' && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={cn(
                                "rounded-lg px-4 py-2 max-w-[80%]",
                                message.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground'
                              )}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            {message.role === 'user' && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={user?.photoURL || undefined} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex gap-3 justify-start">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-lg px-4 py-2">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about your business..."
                          disabled={isLoading}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!input.trim() || isLoading}
                          size="icon"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ByteBerryCopilot;

