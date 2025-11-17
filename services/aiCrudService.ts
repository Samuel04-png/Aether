/**
 * AI CRUD Service
 * Extends AI chat with safe CRUD operations for tasks, projects, and leads
 */

import { generateCopilotResponse } from './deepseekService';
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';

export interface AIAction {
  type: 'create' | 'update' | 'delete' | 'read' | 'none';
  entity: 'task' | 'project' | 'lead' | 'note' | 'none';
  data?: any;
  id?: string;
  confirmation?: string;
}

/**
 * Parse user intent and extract action details
 */
export const parseUserIntent = async (userMessage: string, context: string): Promise<AIAction> => {
  const prompt = `Analyze this user message and determine if they want to perform any action on tasks, projects, or leads.

User Message: "${userMessage}"

Context: ${context}

Respond ONLY with JSON in this exact format:
{
  "type": "create|update|delete|read|none",
  "entity": "task|project|lead|note|none",
  "data": { relevant extracted data if type is create/update },
  "id": "entity id if mentioned",
  "confirmation": "human-friendly confirmation message"
}

Examples:
- "Create a task to follow up with John tomorrow" -> { "type": "create", "entity": "task", "data": { "title": "Follow up with John", "dueDate": "tomorrow" }, "confirmation": "I'll create a task to follow up with John, due tomorrow. Should I proceed?" }
- "Mark the website redesign project as complete" -> { "type": "update", "entity": "project", "data": { "status": "complete" }, "confirmation": "I'll mark the website redesign project as complete. Confirm?" }
- "Delete the old lead from last month" -> { "type": "delete", "entity": "lead", "confirmation": "Are you sure you want to delete this lead? This cannot be undone." }
- "Show me my tasks for today" -> { "type": "read", "entity": "task", "data": { "filter": "today" }, "confirmation": "Here are your tasks for today" }
- "What's the weather like?" -> { "type": "none", "entity": "none", "confirmation": "I can help you with tasks, projects, and leads. Would you like to create or manage any of those?" }`;

  try {
    const response = await generateCopilotResponse(prompt, '', []);
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback
    return {
      type: 'none',
      entity: 'none',
      confirmation: 'I\'m not sure what action you want me to take. Could you rephrase that?'
    };
  } catch (error) {
    console.error('Error parsing intent:', error);
    return {
      type: 'none',
      entity: 'none',
      confirmation: 'I had trouble understanding that. Could you try again?'
    };
  }
};

/**
 * Create a new task via AI
 */
export const aiCreateTask = async (
  userId: string,
  taskData: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: 'high' | 'medium' | 'low';
    assignedTo?: string;
  }
): Promise<{ success: boolean; taskId?: string; error?: string }> => {
  try {
    const tasksRef = collection(db, 'tasks');
    const newTask = {
      ...taskData,
      userId,
      status: 'todo',
      createdAt: new Date().toISOString(),
      createdBy: 'ai',
    };
    
    const docRef = await addDoc(tasksRef, newTask);
    
    return { success: true, taskId: docRef.id };
  } catch (error: any) {
    console.error('Error creating task:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing task via AI
 */
export const aiUpdateTask = async (
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    status?: 'todo' | 'inprogress' | 'done';
    dueDate?: string;
    priority?: 'high' | 'medium' | 'low';
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: 'ai',
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating task:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a task via AI (with confirmation)
 */
export const aiDeleteTask = async (
  taskId: string,
  confirmed: boolean = false
): Promise<{ success: boolean; requiresConfirmation?: boolean; error?: string }> => {
  if (!confirmed) {
    return { success: false, requiresConfirmation: true };
  }
  
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a new lead via AI
 */
export const aiCreateLead = async (
  userId: string,
  leadData: {
    name: string;
    company: string;
    email: string;
    phone?: string;
    source?: string;
  }
): Promise<{ success: boolean; leadId?: string; error?: string }> => {
  try {
    const leadsRef = collection(db, 'leads');
    const newLead = {
      ...leadData,
      userId,
      status: 'New',
      createdAt: new Date().toISOString(),
      createdBy: 'ai',
    };
    
    const docRef = await addDoc(leadsRef, newLead);
    
    return { success: true, leadId: docRef.id };
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update a lead via AI
 */
export const aiUpdateLead = async (
  leadId: string,
  updates: {
    name?: string;
    company?: string;
    email?: string;
    status?: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const leadRef = doc(db, 'leads', leadId);
    await updateDoc(leadRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: 'ai',
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Execute AI action with safety checks
 */
export const executeAIAction = async (
  action: AIAction,
  userId: string,
  confirmed: boolean = false
): Promise<{ success: boolean; message: string; requiresConfirmation?: boolean }> => {
  // Safety check: Always require confirmation for destructive actions
  if (action.type === 'delete' && !confirmed) {
    return {
      success: false,
      message: action.confirmation || 'This action requires confirmation. Are you sure?',
      requiresConfirmation: true,
    };
  }

  try {
    switch (action.entity) {
      case 'task':
        if (action.type === 'create' && action.data) {
          const result = await aiCreateTask(userId, action.data);
          if (result.success) {
            return { success: true, message: '✓ Task created successfully!' };
          }
          return { success: false, message: result.error || 'Failed to create task' };
        } else if (action.type === 'update' && action.id && action.data) {
          const result = await aiUpdateTask(action.id, action.data);
          if (result.success) {
            return { success: true, message: '✓ Task updated successfully!' };
          }
          return { success: false, message: result.error || 'Failed to update task' };
        } else if (action.type === 'delete' && action.id) {
          const result = await aiDeleteTask(action.id, confirmed);
          if (result.success) {
            return { success: true, message: '✓ Task deleted successfully!' };
          }
          if (result.requiresConfirmation) {
            return { 
              success: false, 
              message: 'Are you sure you want to delete this task? Reply "yes" to confirm.',
              requiresConfirmation: true 
            };
          }
          return { success: false, message: result.error || 'Failed to delete task' };
        }
        break;

      case 'lead':
        if (action.type === 'create' && action.data) {
          const result = await aiCreateLead(userId, action.data);
          if (result.success) {
            return { success: true, message: `✓ Lead "${action.data.name}" created successfully!` };
          }
          return { success: false, message: result.error || 'Failed to create lead' };
        } else if (action.type === 'update' && action.id && action.data) {
          const result = await aiUpdateLead(action.id, action.data);
          if (result.success) {
            return { success: true, message: '✓ Lead updated successfully!' };
          }
          return { success: false, message: result.error || 'Failed to update lead' };
        }
        break;

      case 'project':
        // Similar implementation for projects
        return { success: false, message: 'Project CRUD operations coming soon!' };

      default:
        return { success: false, message: 'I can help you create, update, or delete tasks and leads. What would you like to do?' };
    }

    return { success: false, message: 'I couldn\'t perform that action. Please try rephrasing your request.' };
  } catch (error: any) {
    console.error('Error executing AI action:', error);
    return { success: false, message: 'An error occurred while performing that action.' };
  }
};

/**
 * Enhanced AI response with CRUD capabilities
 */
export const generateAICrudResponse = async (
  userMessage: string,
  context: string,
  userId: string,
  confirmationContext?: { action: AIAction; awaiting: boolean }
): Promise<{ 
  response: string; 
  action?: AIAction; 
  requiresConfirmation?: boolean 
}> => {
  // Check if user is confirming a previous action
  if (confirmationContext?.awaiting && confirmationContext.action) {
    const confirmation = userMessage.toLowerCase().trim();
    if (['yes', 'confirm', 'ok', 'sure', 'proceed', 'do it'].includes(confirmation)) {
      const result = await executeAIAction(confirmationContext.action, userId, true);
      return { response: result.message };
    } else if (['no', 'cancel', 'nevermind', 'stop'].includes(confirmation)) {
      return { response: 'Action cancelled. Is there anything else I can help you with?' };
    }
  }

  // Parse user intent
  const action = await parseUserIntent(userMessage, context);

  // If no action detected, provide regular response
  if (action.type === 'none') {
    const response = await generateCopilotResponse(userMessage, context, []);
    return { response };
  }

  // If action requires confirmation
  if (action.type === 'delete' || action.type === 'create' || action.type === 'update') {
    const result = await executeAIAction(action, userId, false);
    
    if (result.requiresConfirmation) {
      return {
        response: result.message,
        action,
        requiresConfirmation: true,
      };
    }

    return { response: result.message };
  }

  // For read operations, just provide the information
  const response = await generateCopilotResponse(userMessage, context, []);
  return { response };
};

