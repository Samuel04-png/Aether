/**
 * Smart Date Validation Utility
 * Validates dates and provides intelligent suggestions with explanations
 */

export interface DateValidationResult {
  isValid: boolean;
  reason?: string;
  suggestedDate?: string;
  explanation?: string;
  warnings?: string[];
}

/**
 * Validates a date and provides smart suggestions if unrealistic
 */
export function validateAndSuggestDate(
  dateStr: string,
  options: {
    minDate?: string;
    maxDate?: string;
    context?: 'deadline' | 'task' | 'meeting';
    projectDeadline?: string;
    allowPast?: boolean;
  } = {}
): DateValidationResult {
  const { minDate, maxDate, context = 'task', projectDeadline, allowPast = false } = options;

  if (!dateStr) {
    return {
      isValid: false,
      reason: 'Date is required',
    };
  }

  const inputDate = new Date(dateStr);
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMilliseconds(0);

  // Check if date is valid
  if (isNaN(inputDate.getTime())) {
    return {
      isValid: false,
      reason: 'Invalid date format',
    };
  }

  const warnings: string[] = [];
  let suggestedDate: string | undefined;
  let explanation: string | undefined;

  // Check if date is in the past (unless allowed)
  if (!allowPast && inputDate < now) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    suggestedDate = tomorrow.toISOString().split('T')[0];
    
    return {
      isValid: false,
      reason: 'Date cannot be in the past',
      suggestedDate,
      explanation: `I've suggested ${tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (tomorrow) as a more realistic date.`,
    };
  }

  // Check against project deadline
  if (projectDeadline && context === 'task') {
    const deadline = new Date(projectDeadline);
    if (inputDate > deadline) {
      const suggested = new Date(deadline);
      suggested.setDate(suggested.getDate() - 1); // One day before deadline
      
      return {
        isValid: false,
        reason: `Task date cannot exceed project deadline (${deadline.toLocaleDateString()})`,
        suggestedDate: suggested.toISOString().split('T')[0],
        explanation: `The project deadline is ${deadline.toLocaleDateString()}. I've suggested ${suggested.toLocaleDateString()} (one day before the deadline) to ensure the task can be completed on time.`,
      };
    }
  }

  // Check min date
  if (minDate) {
    const min = new Date(minDate);
    if (inputDate < min) {
      return {
        isValid: false,
        reason: `Date must be after ${min.toLocaleDateString()}`,
        suggestedDate: minDate.split('T')[0],
        explanation: `The minimum allowed date is ${min.toLocaleDateString()}.`,
      };
    }
  }

  // Check max date
  if (maxDate) {
    const max = new Date(maxDate);
    if (inputDate > max) {
      return {
        isValid: false,
        reason: `Date must be before ${max.toLocaleDateString()}`,
        suggestedDate: maxDate.split('T')[0],
        explanation: `The maximum allowed date is ${max.toLocaleDateString()}.`,
      };
    }
  }

  // Smart validation: Check if date is too far in the future
  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
  if (inputDate > tenYearsFromNow) {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    suggestedDate = oneYearFromNow.toISOString().split('T')[0];
    
    return {
      isValid: false,
      reason: 'Date is too far in the future (more than 10 years)',
      suggestedDate,
      explanation: `That date is more than 10 years away, which seems unrealistic. I've suggested ${oneYearFromNow.toLocaleDateString()} (one year from now) as a more reasonable deadline.`,
      warnings: ['Consider breaking this into smaller milestones'],
    };
  }

  // Check if date is very soon (less than 1 hour from now) for deadlines
  if (context === 'deadline' && !allowPast) {
    const oneHourFromNow = new Date(now);
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    
    if (inputDate < oneHourFromNow) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      suggestedDate = tomorrow.toISOString().split('T')[0];
      
      warnings.push('Deadline is very soon - consider giving more time');
      return {
        isValid: true,
        suggestedDate,
        explanation: `This deadline is less than an hour away. Consider ${tomorrow.toLocaleDateString()} to give adequate time for completion.`,
        warnings,
      };
    }
  }

  // Check if date is on a weekend (for business contexts)
  const dayOfWeek = inputDate.getDay();
  if (context === 'deadline' && (dayOfWeek === 0 || dayOfWeek === 6)) {
    const nextMonday = new Date(inputDate);
    const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
    suggestedDate = nextMonday.toISOString().split('T')[0];
    
    warnings.push('Deadline falls on a weekend');
    return {
      isValid: true,
      suggestedDate,
      explanation: `This deadline falls on a weekend. I've suggested ${nextMonday.toLocaleDateString()} (the following Monday) for better team availability.`,
      warnings,
    };
  }

  // Check if date is too close to today for complex tasks
  if (context === 'task') {
    const daysDifference = Math.ceil((inputDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDifference > 0 && daysDifference < 1) {
      warnings.push('Task deadline is today - ensure it\'s achievable');
    }
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Formats a date validation result into a user-friendly message
 */
export function formatValidationMessage(result: DateValidationResult): string {
  if (result.isValid && !result.warnings) {
    return '';
  }

  let message = '';
  
  if (!result.isValid && result.reason) {
    message = result.reason;
    if (result.explanation) {
      message += `\n\n${result.explanation}`;
    }
  } else if (result.warnings && result.warnings.length > 0) {
    message = result.warnings.join('. ');
    if (result.explanation) {
      message += `\n\n${result.explanation}`;
    }
  }

  return message;
}

