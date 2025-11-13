import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task, TaskStatus } from '../types';
import { CheckIcon } from './shared/Icons';

interface TaskStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const TaskStatusDialog: React.FC<TaskStatusDialogProps> = ({
  open,
  onOpenChange,
  task,
  onStatusChange,
}) => {
  if (!task) return null;

  const statusOptions: { value: TaskStatus; label: string; color: string; description: string }[] = [
    {
      value: 'todo',
      label: 'To Do',
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      description: 'Task is pending and not yet started',
    },
    {
      value: 'inprogress',
      label: 'In Progress',
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      description: 'Task is currently being worked on',
    },
    {
      value: 'done',
      label: 'Done',
      color: 'bg-green-500/10 text-green-600 border-green-500/20',
      description: 'Task has been completed',
    },
  ];

  const handleStatusChange = (newStatus: TaskStatus) => {
    onStatusChange(task.id, newStatus);
    onOpenChange(false);
  };

  const currentStatus = task.status;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Task Status</DialogTitle>
          <DialogDescription>
            Update the status for: <span className="font-semibold text-foreground">{task.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {statusOptions.map((option) => {
            const isCurrentStatus = currentStatus === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  isCurrentStatus
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={option.color} variant="outline">
                        {option.label}
                      </Badge>
                      {isCurrentStatus && (
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          <CheckIcon className="h-3 w-3" />
                          Current
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskStatusDialog;

