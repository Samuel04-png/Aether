import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DateTimePickerProps {
  value?: string; // ISO string or date string
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: string; // ISO string
  maxDate?: string; // ISO string
  showTime?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  allowPast?: boolean; // Allow dates in the past
  onValidationChange?: (isValid: boolean, reason?: string) => void;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder,
  minDate,
  maxDate,
  showTime = false,
  disabled = false,
  className,
  error,
  required = false,
  allowPast = false,
  onValidationChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(value?.split('T')[0] || '');
  const [selectedTime, setSelectedTime] = useState<string>(value?.includes('T') ? value.split('T')[1].slice(0, 5) : '09:00');
  const [localError, setLocalError] = useState<string | undefined>(error);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const datePart = value.split('T')[0];
      const timePart = value.includes('T') ? value.split('T')[1].slice(0, 5) : '09:00';
      setSelectedDate(datePart);
      setSelectedTime(timePart);
    }
  }, [value]);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const formatDisplayValue = (dateStr: string, timeStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(`${dateStr}T${timeStr || '00:00'}`);
    if (isNaN(date.getTime())) return dateStr;
    
    const dateOptions: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    if (showTime && timeStr) {
      const formattedTime = date.toLocaleTimeString('en-US', { ...timeOptions, hour12: true });
      return `${formattedDate} at ${formattedTime}`;
    }
    return formattedDate;
  };

  const validateDate = (dateStr: string, timeStr: string, allowPastDates: boolean = allowPast): { isValid: boolean; reason?: string } => {
    if (!dateStr) {
      if (required) {
        return { isValid: false, reason: 'Date is required' };
      }
      return { isValid: true };
    }

    const fullDate = new Date(`${dateStr}T${timeStr || '00:00'}`);
    if (isNaN(fullDate.getTime())) {
      return { isValid: false, reason: 'Invalid date format' };
    }

    const now = new Date();
    now.setSeconds(0, 0);
    now.setMilliseconds(0);

    // Check if date is in the past (for deadlines) - only if allowPastDates is false
    if (!allowPastDates) {
      if (!showTime) {
        const dateOnly = new Date(dateStr);
        dateOnly.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dateOnly < today) {
          return { isValid: false, reason: 'Date cannot be in the past' };
        }
      } else if (fullDate < now) {
        return { isValid: false, reason: 'Date and time cannot be in the past' };
      }
    }

    // Check min date
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      const checkDate = new Date(dateStr);
      checkDate.setHours(0, 0, 0, 0);
      if (checkDate < min) {
        return { isValid: false, reason: `Date must be after ${min.toLocaleDateString()}` };
      }
    }

    // Check max date
    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(23, 59, 59, 999);
      if (fullDate > max) {
        return { isValid: false, reason: `Date must be before ${max.toLocaleDateString()}` };
      }
    }

    // Smart validation: Check if date is too far in the future (more than 10 years)
    const tenYearsFromNow = new Date();
    tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
    if (fullDate > tenYearsFromNow) {
      return { isValid: false, reason: 'Date is too far in the future (more than 10 years)' };
    }

    return { isValid: true };
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const validation = validateDate(newDate, selectedTime, allowPast);
    setLocalError(validation.reason);
    onValidationChange?.(validation.isValid, validation.reason);

    if (validation.isValid && newDate) {
      const newValue = showTime && selectedTime 
        ? `${newDate}T${selectedTime}:00` 
        : `${newDate}T00:00:00`;
      onChange(newValue);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setSelectedTime(newTime);
    const validation = validateDate(selectedDate, newTime, allowPast);
    setLocalError(validation.reason);
    onValidationChange?.(validation.isValid, validation.reason);

    if (validation.isValid && selectedDate) {
      const newValue = `${selectedDate}T${newTime}:00`;
      onChange(newValue);
    }
  };

  const handleClear = () => {
    setSelectedDate('');
    setSelectedTime('09:00');
    setLocalError(undefined);
    onChange('');
    onValidationChange?.(true);
  };

  const getSuggestedDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const quickSelectOptions = [
    { label: 'Today', days: 0 },
    { label: 'Tomorrow', days: 1 },
    { label: 'Next Week', days: 7 },
    { label: 'Next Month', days: 30 },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor="datetime-picker" className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
          {label}
        </Label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
              localError && 'border-destructive',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled}
            id="datetime-picker"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {value ? formatDisplayValue(selectedDate, selectedTime) : (placeholder || 'Pick a date')}
            {value && !disabled && (
              <X 
                className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" ref={popoverRef}>
          <div className="p-4 space-y-4">
            {/* Quick Select */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Quick Select</Label>
              <div className="grid grid-cols-2 gap-2">
                {quickSelectOptions.map((option) => (
                  <Button
                    key={option.label}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const suggestedDate = getSuggestedDate(option.days);
                      handleDateChange(suggestedDate);
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Input */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={minDate?.split('T')[0]}
                max={maxDate?.split('T')[0]}
                className="w-full"
              />
            </div>

            {/* Time Input */}
            {showTime && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Time
                </Label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {localError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-destructive bg-destructive/10 p-2 rounded-md"
                >
                  {localError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {localError && (
        <p className="text-xs text-destructive mt-1">{localError}</p>
      )}
    </div>
  );
};

