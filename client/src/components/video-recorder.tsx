import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { 
  Video, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Upload,
  Camera,
  Mic,
  MicOff,
  VideoOff
} from 'lucide-react';

interface VideoRecorderProps {
  onVideoSaved?: (video: any) => void;
  maxDuration?: number; // in seconds
}

export default function VideoRecorder({ onVideoSaved, maxDuration = 300 }: VideoRecorderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recipient, setRecipient] = useState('all');
  const [triggerEvent, setTriggerEvent] = useState('death');
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Recording your video message..."
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Failed",
        description: "Unable to access camera and microphone.",
        variant: "destructive"
      });
    }
  }, [maxDuration, toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  }, [isRecording]);

  // Pause/Resume recording
  const togglePause = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  }, [isPaused]);

  // Reset recording
  const resetRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    
    setRecordedBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
  }, [isRecording, stopRecording]);

  // Play recorded video
  const playRecording = useCallback(() => {
    if (recordedBlob && videoRef.current) {
      const url = URL.createObjectURL(recordedBlob);
      videoRef.current.src = url;
      videoRef.current.play();
      setIsPlaying(true);
      
      videoRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
    }
  }, [recordedBlob]);

  // Upload video mutation
  const uploadVideoMutation = useMutation({
    mutationFn: async () => {
      if (!recordedBlob || !title.trim()) {
        throw new Error('Video and title are required');
      }

      const formData = new FormData();
      formData.append('video', recordedBlob, `video_message_${Date.now()}.webm`);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('recipient', recipient);
      formData.append('triggerEvent', triggerEvent);

      return await apiRequest('POST', '/api/videos', formData);
    },
    onSuccess: (data) => {
      toast({
        title: "Video Saved",
        description: "Your video message has been saved successfully."
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      
      if (onVideoSaved) {
        onVideoSaved(data);
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setRecipient('all');
      setTriggerEvent('death');
      resetRecording();
    },
    onError: (error) => {
      console.error('Error uploading video:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to save video message. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Video Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="h-5 w-5 mr-2" />
            Record Video Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              autoPlay
              muted
              playsInline
            />
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">
                  {isPaused ? 'PAUSED' : 'RECORDING'}
                </span>
              </div>
            )}
            
            {/* Recording time */}
            {(isRecording || recordedBlob) && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded">
                {formatTime(recordingTime)} / {formatTime(maxDuration)}
              </div>
            )}
            
            {/* No video message */}
            {!isRecording && !recordedBlob && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Ready to record your video message</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-3">
            {!isRecording && !recordedBlob && (
              <Button onClick={startRecording} className="bg-red-500 hover:bg-red-600">
                <Video className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            )}
            
            {isRecording && (
              <>
                <Button onClick={togglePause} variant="outline">
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button onClick={stopRecording} className="bg-red-500 hover:bg-red-600">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
            
            {recordedBlob && !isRecording && (
              <>
                <Button onClick={playRecording} disabled={isPlaying}>
                  <Play className="h-4 w-4 mr-2" />
                  {isPlaying ? 'Playing...' : 'Preview'}
                </Button>
                <Button onClick={resetRecording} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Details Form */}
      {recordedBlob && (
        <Card>
          <CardHeader>
            <CardTitle>Video Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Message to my children"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of this video message..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Select value={recipient} onValueChange={setRecipient}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Family Members</SelectItem>
                  <SelectItem value="spouse">Spouse Only</SelectItem>
                  <SelectItem value="children">Children Only</SelectItem>
                  <SelectItem value="specific">Specific Person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trigger">When to Share</Label>
              <Select value={triggerEvent} onValueChange={setTriggerEvent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="death">After Death</SelectItem>
                  <SelectItem value="birthday">On Birthday</SelectItem>
                  <SelectItem value="anniversary">On Anniversary</SelectItem>
                  <SelectItem value="graduation">On Graduation</SelectItem>
                  <SelectItem value="wedding">On Wedding</SelectItem>
                  <SelectItem value="immediate">Share Immediately</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4 text-sm text-neutral-600">
              <Badge variant="outline">
                Duration: {formatTime(recordingTime)}
              </Badge>
              <Badge variant="outline">
                Size: {recordedBlob ? (recordedBlob.size / 1024 / 1024).toFixed(1) : 0} MB
              </Badge>
            </div>

            <Button
              onClick={() => uploadVideoMutation.mutate()}
              disabled={!title.trim() || uploadVideoMutation.isPending}
              className="w-full"
            >
              {uploadVideoMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Saving Video...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Save Video Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}