import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { 
  getMeetingNotes, 
  processMeetingAudio, 
  MeetingNote,
  createTasksFromMeetingNotes 
} from '../services/aiMeetingService';
import { SparklesIcon, UploadIcon, ClockIcon, UsersIcon } from './shared/Icons';
import { Skeleton } from '@/components/ui/skeleton';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { Mic, FileAudio, CheckCircle2, Calendar, Play } from 'lucide-react';
import { DateTimePicker } from '@/components/ui/datetime-picker';

const MeetingNotes: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [meetings, setMeetings] = useState<MeetingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingNote | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Upload form state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendees, setAttendees] = useState('');
  const [duration, setDuration] = useState('');

  // Load meetings
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadMeetings = async () => {
      try {
        const data = await getMeetingNotes(user.uid);
        setMeetings(data);
      } catch (error: any) {
        console.error('Error loading meetings:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load meeting notes',
        });
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, [user, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
        toast({
          variant: 'destructive',
          title: 'Invalid File',
          description: 'Please upload an audio file (MP3, WAV, M4A, or OGG)',
        });
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Audio file must be less than 50MB',
        });
        return;
      }

      setAudioFile(file);
    }
  };

  const handleUpload = async () => {
    if (!audioFile || !meetingTitle || !user?.uid) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please provide meeting title and audio file',
      });
      return;
    }

    try {
      setIsProcessing(true);

      const meetingNote = await processMeetingAudio(user.uid, audioFile, {
        title: meetingTitle,
        date: meetingDate,
        attendees: attendees.split(',').map(a => a.trim()).filter(Boolean),
        duration,
      });

      setMeetings(prev => [meetingNote, ...prev]);
      setIsUploadModalOpen(false);
      
      // Reset form
      setAudioFile(null);
      setMeetingTitle('');
      setMeetingDate(new Date().toISOString().split('T')[0]);
      setAttendees('');
      setDuration('');

      toast({
        title: 'Meeting Processed',
        description: 'AI has analyzed your meeting and generated notes',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Processing Failed',
        description: error.message || 'Failed to process meeting audio',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateTasks = async (meetingId: string) => {
    if (!user?.uid) return;

    try {
      await createTasksFromMeetingNotes(meetingId, user.uid);
      toast({
        title: 'Tasks Created',
        description: 'Action items have been converted to tasks',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create tasks',
      });
    }
  };

  return (
    <>
      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Meeting Recording</DialogTitle>
            <DialogDescription>
              Upload your meeting audio and let AI generate notes, action items, and summaries
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="meeting-title">Meeting Title *</Label>
              <Input
                id="meeting-title"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="e.g., Q4 Planning Meeting"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <DateTimePicker
                  value={meetingDate ? `${meetingDate}T00:00:00` : ''}
                  onChange={(value) => setMeetingDate(value.split('T')[0])}
                  label="Date"
                  placeholder="Select meeting date"
                  showTime={false}
                  allowPast={true}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 45 min"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="attendees">Attendees (comma-separated)</Label>
              <Input
                id="attendees"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="e.g., John, Sarah, Mike"
              />
            </div>

            <div>
              <Label>Audio File *</Label>
              <div className="mt-2 flex items-center justify-center border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                <label className="flex flex-col items-center cursor-pointer">
                  <FileAudio className="h-12 w-12 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground mb-1">
                    {audioFile ? audioFile.name : 'Click to upload audio'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    MP3, WAV, M4A, or OGG (max 50MB)
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!audioFile || !meetingTitle || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <SparklesIcon className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" />
                  Generate Notes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Details Modal */}
      <Dialog open={!!selectedMeeting} onOpenChange={(open) => !open && setSelectedMeeting(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMeeting?.title}</DialogTitle>
            <DialogDescription>
              {selectedMeeting?.date} {selectedMeeting?.duration && `• ${selectedMeeting.duration}`}
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground">{selectedMeeting.summary}</p>
              </div>

              {/* Key Points */}
              {selectedMeeting.keyPoints.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Key Points</h4>
                  <ul className="space-y-1">
                    {selectedMeeting.keyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {selectedMeeting.actionItems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-foreground">Action Items</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCreateTasks(selectedMeeting.id)}
                      className="text-xs"
                    >
                      Create Tasks
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {selectedMeeting.actionItems.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-foreground flex-1">{item.task}</p>
                          {item.priority && (
                            <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                              {item.priority}
                            </Badge>
                          )}
                        </div>
                        {item.assignee && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Assignee: {item.assignee}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decisions */}
              {selectedMeeting.decisions && selectedMeeting.decisions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Decisions Made</h4>
                  <ul className="space-y-1">
                    {selectedMeeting.decisions.map((decision, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {decision}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Transcription */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Full Transcription</h4>
                <div className="p-4 rounded-lg bg-muted/30 max-h-48 overflow-y-auto">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedMeeting.transcription}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Meeting Notes</h1>
            <p className="text-muted-foreground mt-1">
              Upload recordings and let AI generate smart meeting summaries
            </p>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
            <Mic className="h-4 w-4" />
            Upload Recording
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Mic className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Meeting Notes Yet</h3>
              <p className="text-muted-foreground mb-6">
                Upload your first meeting recording to get AI-powered notes and insights
              </p>
              <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
                <UploadIcon className="h-4 w-4" />
                Upload Recording
              </Button>
            </div>
          </Card>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {meetings.map((meeting) => (
              <motion.div key={meeting.id} variants={staggerItem}>
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{meeting.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(meeting.date).toLocaleDateString()}
                      </span>
                      {meeting.duration && (
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {meeting.duration}
                        </span>
                      )}
                      {meeting.attendees && meeting.attendees.length > 0 && (
                        <span className="flex items-center gap-1">
                          <UsersIcon className="h-3 w-3" />
                          {meeting.attendees.length}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {meeting.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {meeting.actionItems.length} action{meeting.actionItems.length !== 1 ? 's' : ''}
                      </Badge>
                      <Button size="sm" variant="ghost" className="text-xs">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default MeetingNotes;

