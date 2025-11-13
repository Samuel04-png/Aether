import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@/components/shared/Icons';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const formatTime = (timestamp: Date) =>
  timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content, timestamp }) => {
  const isUser = role === 'user';
  const timeLabel = formatTime(timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'flex max-w-[88%] flex-col gap-2 rounded-[12px] border p-4 shadow-sm backdrop-blur transition-colors',
          isUser
            ? 'border-primary/30 bg-[linear-gradient(135deg,rgba(76,125,240,0.22)_0%,rgba(122,92,240,0.24)_100%)] text-primary-foreground'
            : 'border-border/40 bg-card/80 text-foreground'
        )}
      >
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
          {isUser ? (
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-primary/90">You</span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-secondary/90">
              <SparklesIcon className="h-3.5 w-3.5" />
              Copilot
            </span>
          )}
          <span className="text-[11px] font-normal text-muted-foreground/80">{timeLabel}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/95 whitespace-pre-wrap">{content}</p>
      </div>
    </motion.div>
  );
};

export default MessageBubble;

