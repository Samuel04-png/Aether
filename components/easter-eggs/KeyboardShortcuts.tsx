import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Shortcut {
  key: string;
  description: string;
  category: 'navigation' | 'actions' | 'power';
}

const shortcuts: Shortcut[] = [
  // Navigation
  { key: 'G + D', description: 'Go to Dashboard', category: 'navigation' },
  { key: 'G + T', description: 'Go to Tasks', category: 'navigation' },
  { key: 'G + P', description: 'Go to Projects', category: 'navigation' },
  { key: 'G + C', description: 'Go to Chat', category: 'navigation' },
  { key: 'G + S', description: 'Go to Settings', category: 'navigation' },
  { key: 'G + L', description: 'Go to Leads', category: 'navigation' },
  
  // Actions
  { key: 'N', description: 'New Task (when in Tasks)', category: 'actions' },
  { key: 'N + P', description: 'New Project (when in Projects)', category: 'actions' },
  { key: 'N + L', description: 'New Lead (when in Leads)', category: 'actions' },
  { key: '/', description: 'Focus Search', category: 'actions' },
  { key: 'ESC', description: 'Close Modal/Dialog', category: 'actions' },
  
  // Power User
  { key: '?', description: 'Show Keyboard Shortcuts', category: 'power' },
  { key: 'K', description: 'Open Copilot', category: 'power' },
  { key: '⌘/Ctrl + K', description: 'Command Palette', category: 'power' },
  { key: '⌘/Ctrl + /', description: 'Toggle Theme', category: 'power' },
];

export const KeyboardShortcuts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts with ?
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsOpen(true);
        return;
      }

      // Close with ESC
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        return;
      }

      // Track key combinations
      const keys = new Set<string>();
      if (e.ctrlKey || e.metaKey) keys.add('Ctrl');
      if (e.shiftKey) keys.add('Shift');
      if (e.altKey) keys.add('Alt');
      keys.add(e.key.toUpperCase());
      setPressedKeys(keys);

      // Handle G + [key] navigation
      if (pressedKeys.has('G') && !e.repeat) {
        const targetKey = e.key.toUpperCase();
        const shortcuts: Record<string, () => void> = {
          'D': () => window.location.hash = '#dashboard',
          'T': () => window.location.hash = '#tasks',
          'P': () => window.location.hash = '#projects',
          'C': () => window.location.hash = '#chat',
          'S': () => window.location.hash = '#settings',
          'L': () => window.location.hash = '#leads',
        };
        if (shortcuts[targetKey]) {
          shortcuts[targetKey]();
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = () => {
      setTimeout(() => setPressedKeys(new Set()), 100);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, pressedKeys]);

  const shortcutsByCategory = {
    navigation: shortcuts.filter(s => s.category === 'navigation'),
    actions: shortcuts.filter(s => s.category === 'actions'),
    power: shortcuts.filter(s => s.category === 'power'),
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Keyboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Keyboard Shortcuts</DialogTitle>
                <DialogDescription>
                  Speed up your workflow with these keyboard shortcuts
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(shortcutsByCategory).map(([category, items]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {category === 'navigation' ? 'Navigation' : category === 'actions' ? 'Quick Actions' : 'Power User'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((shortcut, index) => (
                  <motion.div
                    key={shortcut.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
                  >
                    <span className="text-sm text-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.key.split(' + ').map((key, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span className="text-muted-foreground mx-1">+</span>}
                          <Badge variant="secondary" className="font-mono text-xs px-2 py-1">
                            {key}
                          </Badge>
                        </React.Fragment>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">?</kbd> anytime to see this menu
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

