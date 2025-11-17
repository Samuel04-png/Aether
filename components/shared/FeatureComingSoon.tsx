import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Bot } from 'lucide-react';

interface FeatureComingSoonProps {
  title: string;
  description: string;
  estimatedRelease?: string;
  icon?: 'sparkles' | 'zap' | 'bot';
  className?: string;
}

export const FeatureComingSoon: React.FC<FeatureComingSoonProps> = ({
  title,
  description,
  estimatedRelease = "Soon",
  icon = 'sparkles',
  className = '',
}) => {
  const IconComponent = icon === 'zap' ? Zap : icon === 'bot' ? Bot : Sparkles;

  return (
    <Card className={`relative overflow-hidden border-dashed border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50/50 dark:border-white/10 dark:from-slate-900/50 dark:to-slate-800/50 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />
      
      <div className="relative space-y-4 p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 dark:from-indigo-500/20 dark:to-purple-500/20 dark:text-indigo-400">
          <IconComponent className="h-8 w-8" />
        </div>
        
        <div>
          <Badge className="mb-2 border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-200">
            {estimatedRelease}
          </Badge>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
        </div>
        
        <p className="mx-auto max-w-sm text-sm text-slate-600 dark:text-slate-300">
          {description}
        </p>
        
        <div className="mx-auto w-fit rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10">
          We're building this for you ✨
        </div>
      </div>
    </Card>
  );
};

export default FeatureComingSoon;

