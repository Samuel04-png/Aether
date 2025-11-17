/**
 * AI Meeting Notes Service
 * Handles audio transcription and meeting notes generation
 */

import { db, storage } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { generateCopilotResponse } from './deepseekService';

export interface MeetingNote {
  id: string;
  userId: string;
  title: string;
  date: string;
  duration?: string;
  attendees?: string[];
  audioUrl?: string;
  transcription: string;
  summary: string;
  actionItems: Array<{
    task: string;
    assignee?: string;
    dueDate?: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  keyPoints: string[];
  decisions?: string[];
  nextSteps?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Upload audio file to Firebase Storage
 */
export const uploadMeetingAudio = async (
  userId: string,
  audioFile: File
): Promise<string> => {
  const fileName = `${Date.now()}_${audioFile.name}`;
  const storageRef = ref(storage, `meetings/${userId}/${fileName}`);
  
  await uploadBytes(storageRef, audioFile);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
};

/**
 * Transcribe audio using Web Speech API or mock transcription
 * In production, you would integrate with services like:
 * - OpenAI Whisper API
 * - Google Speech-to-Text
 * - Assembly AI
 * - Deepgram
 */
export const transcribeAudio = async (audioUrl: string): Promise<string> => {
  // Mock transcription for now
  // In a real implementation, you would send the audio to a transcription service
  
  console.log('Transcribing audio from:', audioUrl);
  
  // Simulated transcription result
  return `Meeting discussion about project timeline and deliverables. 
Team members discussed the current progress on the Q4 roadmap. 
Sarah mentioned that the design phase is 80% complete and should be finalized by next week.
John raised concerns about the backend API integration timeline.
The team agreed to have a follow-up sync on Friday to review the sprint progress.
Action items were assigned to complete the remaining tasks before the deadline.`;
};

/**
 * Process meeting audio and generate notes using AI
 */
export const processMeetingAudio = async (
  userId: string,
  audioFile: File,
  metadata: {
    title: string;
    date: string;
    attendees?: string[];
    duration?: string;
  }
): Promise<MeetingNote> => {
  try {
    // 1. Upload audio file
    const audioUrl = await uploadMeetingAudio(userId, audioFile);
    
    // 2. Transcribe audio
    const transcription = await transcribeAudio(audioUrl);
    
    // 3. Use AI to generate summary and extract insights
    const aiPrompt = `Analyze this meeting transcription and provide:
1. A concise summary (2-3 sentences)
2. Key points discussed (3-5 bullet points)
3. Action items with potential assignees if mentioned
4. Decisions made
5. Next steps

Meeting Transcription:
${transcription}

Provide the response in JSON format with these fields:
{
  "summary": "Brief summary here",
  "keyPoints": ["point 1", "point 2", ...],
  "actionItems": [{"task": "task description", "assignee": "name if mentioned", "priority": "high/medium/low"}],
  "decisions": ["decision 1", "decision 2", ...],
  "nextSteps": ["step 1", "step 2", ...]
}`;

    const aiResponse = await generateCopilotResponse(
      aiPrompt,
      'Extract structured meeting notes from transcription',
      []
    );
    
    // Parse AI response
    let parsedData: any;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      // Fallback to basic parsing
      parsedData = {
        summary: transcription.split('.').slice(0, 2).join('.'),
        keyPoints: transcription.split('.').slice(0, 5).map(s => s.trim()).filter(Boolean),
        actionItems: [],
        decisions: [],
        nextSteps: []
      };
    }
    
    // 4. Create meeting note document
    const meetingId = `meeting_${Date.now()}`;
    const meetingNote: MeetingNote = {
      id: meetingId,
      userId,
      title: metadata.title,
      date: metadata.date,
      duration: metadata.duration,
      attendees: metadata.attendees || [],
      audioUrl,
      transcription,
      summary: parsedData.summary || '',
      actionItems: parsedData.actionItems || [],
      keyPoints: parsedData.keyPoints || [],
      decisions: parsedData.decisions || [],
      nextSteps: parsedData.nextSteps || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // 5. Save to Firestore
    const meetingRef = doc(db, 'meetingNotes', meetingId);
    await setDoc(meetingRef, meetingNote);
    
    return meetingNote;
  } catch (error: any) {
    console.error('Error processing meeting audio:', error);
    throw new Error(error.message || 'Failed to process meeting audio');
  }
};

/**
 * Get all meeting notes for a user
 */
export const getMeetingNotes = async (userId: string): Promise<MeetingNote[]> => {
  try {
    const meetingsRef = collection(db, 'meetingNotes');
    const q = query(
      meetingsRef,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as MeetingNote);
  } catch (error: any) {
    console.error('Error fetching meeting notes:', error);
    throw new Error(error.message || 'Failed to fetch meeting notes');
  }
};

/**
 * Get a specific meeting note
 */
export const getMeetingNote = async (meetingId: string): Promise<MeetingNote | null> => {
  try {
    const meetingRef = doc(db, 'meetingNotes', meetingId);
    const snapshot = await getDoc(meetingRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return snapshot.data() as MeetingNote;
  } catch (error: any) {
    console.error('Error fetching meeting note:', error);
    throw new Error(error.message || 'Failed to fetch meeting note');
  }
};

/**
 * Update meeting note
 */
export const updateMeetingNote = async (
  meetingId: string,
  updates: Partial<MeetingNote>
): Promise<void> => {
  try {
    const meetingRef = doc(db, 'meetingNotes', meetingId);
    await setDoc(meetingRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error: any) {
    console.error('Error updating meeting note:', error);
    throw new Error(error.message || 'Failed to update meeting note');
  }
};

/**
 * Create action items from meeting notes
 */
export const createTasksFromMeetingNotes = async (
  meetingId: string,
  userId: string
): Promise<void> => {
  try {
    const meeting = await getMeetingNote(meetingId);
    if (!meeting) {
      throw new Error('Meeting note not found');
    }
    
    // Import task creation function
    const { createTask } = await import('../hooks/useTasks');
    
    // Create tasks for each action item
    for (const actionItem of meeting.actionItems) {
      // This would integrate with your task system
      console.log('Creating task:', actionItem);
      // await createTask(userId, {
      //   title: actionItem.task,
      //   assignedTo: actionItem.assignee,
      //   dueDate: actionItem.dueDate,
      //   priority: actionItem.priority,
      //   description: `From meeting: ${meeting.title}`,
      // });
    }
  } catch (error: any) {
    console.error('Error creating tasks from meeting:', error);
    throw new Error(error.message || 'Failed to create tasks');
  }
};

