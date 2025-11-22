import React from 'react';
import { motion } from 'framer-motion';
import { transitions } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className, padded = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
      className={cn(
        'relative mx-auto w-full max-w-7xl',
        padded && 'px-2 sm:px-4 md:px-6',
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

interface PageHeaderStat {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'steady';
  helper?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  stats?: PageHeaderStat[];
  illustration?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  actions,
  stats,
  illustration,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.quick}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/40 bg-gradient-to-br from-white/80 via-white/55 to-white/30 p-4 sm:p-6 md:p-10 shadow-[0_25px_60px_-35px_rgba(15,114,255,0.55)] backdrop-blur-3xl dark:from-white/10 dark:via-white/5 dark:to-white/0"
    >
      <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
      <div className="pointer-events-none absolute -bottom-28 -right-12 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-500/20" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/80 dark:bg-white/10 dark:text-white/70">
              {eyebrow}
            </span>
          )}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm md:text-4xl lg:text-[2.65rem] lg:leading-[1.05] break-words">
              {title}
            </h1>
            {subtitle && (
              <p className="max-w-2xl text-sm sm:text-base text-muted-foreground md:text-lg break-words">
                {subtitle}
              </p>
            )}
          </div>
          {stats && stats.length > 0 && (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {stat.label}
                  </p>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-2xl font-semibold text-foreground">
                      {stat.value}
                    </span>
                    {stat.trend && (
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                          stat.trend === 'up' && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
                          stat.trend === 'down' && 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
                          stat.trend === 'steady' && 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
                        )}
                      >
                        {stat.trend === 'up' && '▲'}
                        {stat.trend === 'down' && '▼'}
                        {stat.trend === 'steady' && '■'}
                      </span>
                    )}
                  </div>
                  {stat.helper && (
                    <p className="mt-2 text-xs text-muted-foreground/80">
                      {stat.helper}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {(actions || illustration) && (
          <div className="flex flex-col items-start justify-end gap-4 lg:items-end">
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            {illustration && (
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/25 to-cyan-400/20 blur-2xl" />
                <div className="relative">
                  {illustration}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
};

interface PageSectionProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  surface?: 'elevated' | 'minimal' | 'none';
  padded?: boolean;
}

const surfaceStyles: Record<NonNullable<PageSectionProps['surface']>, string> = {
  elevated: 'rounded-3xl border border-border/40 bg-white/70 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5',
  minimal: 'rounded-3xl border border-border/20 bg-white/40 shadow-sm backdrop-blur-lg dark:border-white/5 dark:bg-white/10',
  none: '',
};

export const PageSection: React.FC<PageSectionProps> = ({ title, description, action, children, className, surface = 'elevated', padded = true }) => {
  const header = (title || description || action) && (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        {title && <h2 className="text-lg sm:text-xl font-semibold text-foreground md:text-2xl break-words">{title}</h2>}
        {description && <p className="text-xs sm:text-sm text-muted-foreground break-words">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );

  if (surface === 'none') {
    return (
      <section className={cn('space-y-6', className)}>
        {header}
        {children}
      </section>
    );
  }

  return (
    <section className={cn('space-y-6', className)}>
      {header}
      <div className={cn(surfaceStyles[surface], padded ? 'p-3 sm:p-4 md:p-6' : undefined)}>
        {children}
      </div>
    </section>
  );
};
