import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Command {
  trigger: string;
  description: string;
  action: () => void;
}

export const useHiddenCommands = () => {
  const [commandBuffer, setCommandBuffer] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const newBuffer = (commandBuffer + e.key).slice(-20); // Keep last 20 chars
      setCommandBuffer(newBuffer);

      // Check for commands
      const commands: Command[] = [
        {
          trigger: 'aether',
          description: 'Shows Aether version info',
          action: () => {
            toast({
              title: '⚡ Aether v1.0',
              description: 'Developed by Byte&Berry | https://impeldown.dev',
              duration: 4000,
            });
          },
        },
        {
          trigger: 'help',
          description: 'Shows help message',
          action: () => {
            toast({
              title: '💡 Need Help?',
              description: 'Press ? to see keyboard shortcuts, or check the Settings page.',
              duration: 4000,
            });
          },
        },
        {
          trigger: 'clear',
          description: 'Clears console (if open)',
          action: () => {
            console.clear();
            toast({
              title: 'Console Cleared',
              description: 'Developer console has been cleared.',
            });
          },
        },
        {
          trigger: 'stats',
          description: 'Shows app statistics',
          action: () => {
            const stats = {
              user: user?.email || 'Guest',
              timestamp: new Date().toLocaleString(),
              userAgent: navigator.userAgent.substring(0, 50) + '...',
            };
            toast({
              title: '📊 App Statistics',
              description: `User: ${stats.user} | Time: ${stats.timestamp}`,
              duration: 5000,
            });
          },
        },
        {
          trigger: 'party',
          description: 'Starts a celebration',
          action: () => {
            // @ts-ignore
            import('canvas-confetti').then((confetti) => {
              const duration = 3000;
              const end = Date.now() + duration;
              const interval = setInterval(() => {
                if (Date.now() > end) {
                  clearInterval(interval);
                  return;
                }
                confetti.default({
                  particleCount: 5,
                  angle: 60,
                  spread: 55,
                  origin: { x: 0 },
                });
                confetti.default({
                  particleCount: 5,
                  angle: 120,
                  spread: 55,
                  origin: { x: 1 },
                });
              }, 25);
            });
            toast({
              title: '🎉 Party Time!',
              description: 'Enjoy the celebration!',
            });
          },
        },
      ];

      const matchedCommand = commands.find(cmd => newBuffer.toLowerCase().endsWith(cmd.trigger.toLowerCase()));
      if (matchedCommand) {
        matchedCommand.action();
        setCommandBuffer('');
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [commandBuffer, toast, user]);

  return null;
};

