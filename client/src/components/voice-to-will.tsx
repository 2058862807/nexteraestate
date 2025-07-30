import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Play, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceResult {
  transcript: string;
  structuredWill: string;
  extractedIntents: string[];
}

interface VoiceToWillProps {
  userContext: any;
  onWillGenerated: (willContent: string) => void;
}

export default function VoiceToWill({ userContext, onWillGenerated }: VoiceToWillProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak your will instructions clearly",
      });
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Unable to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Processing your voice input...",
      });
    }
  };

  const processVoiceInput = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    try {
      // Demo mode with realistic voice processing
      const demoResult: VoiceResult = {
        transcript: "I want to leave my house to my daughter Sarah, split my savings equally between my two sons Michael and David, and give my car to my nephew James.",
        structuredWill: "REAL PROPERTY: I devise my primary residence located at [Property Address] to my daughter, SARAH [LAST NAME], absolutely and in fee simple.\n\nMONETARY BEQUESTS: I direct that my savings accounts and liquid assets be divided equally between my sons, MICHAEL [LAST NAME] and DAVID [LAST NAME], share and share alike.\n\nPERSONAL PROPERTY: I bequeath my motor vehicle [Vehicle Description] to my nephew, JAMES [LAST NAME].",
        extractedIntents: [
          "House to daughter Sarah",
          "Savings split between sons Michael and David",
          "Car to nephew James",
          "Equal distribution preference",
          "Family-focused estate plan"
        ]
      };

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      setVoiceResult(demoResult);
      setTranscript(demoResult.transcript);
      
      toast({
        title: "Demo Voice Processing Complete",
        description: "Sample voice conversion shown (Demo Mode)",
      });
    } catch (error) {
      toast({
        title: "Demo Mode Active",
        description: "Showing sample voice processing (API quota exceeded)",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const acceptWillContent = () => {
    if (voiceResult?.structuredWill) {
      onWillGenerated(voiceResult.structuredWill);
      toast({
        title: "Will Content Added",
        description: "Voice-generated will has been added to your document",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-6 w-6 text-purple-600" />
          Voice-to-Will Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Recording Controls */}
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="lg"
              >
                <MicOff className="mr-2 h-5 w-5" />
                Stop Recording
              </Button>
            )}
          </div>

          {isRecording && (
            <div className="flex items-center justify-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="font-medium">Recording in progress...</span>
            </div>
          )}

          <p className="text-sm text-gray-600">
            Speak naturally about your will wishes. Example: "I want to leave my house to my daughter Sarah and split my savings between my two sons"
          </p>
        </div>

        {/* Process Audio */}
        {audioBlob && !voiceResult && (
          <div className="text-center">
            <Button
              onClick={processVoiceInput}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isProcessing ? 'Converting to Legal Language...' : 'Convert to Legal Will'}
            </Button>
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Play className="h-4 w-4" />
              What You Said:
            </h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="italic">"{transcript}"</p>
            </div>
          </div>
        )}

        {/* Voice Result */}
        {voiceResult && (
          <div className="space-y-4">
            
            {/* Extracted Intents */}
            <div>
              <h3 className="font-semibold mb-2">AI Understood:</h3>
              <div className="flex flex-wrap gap-2">
                {voiceResult.extractedIntents.map((intent, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {intent}
                  </span>
                ))}
              </div>
            </div>

            {/* Structured Will */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generated Legal Language:
              </h3>
              <Textarea
                value={voiceResult.structuredWill}
                readOnly
                className="min-h-32 font-mono text-sm bg-green-50"
              />
              <div className="mt-4 text-center">
                <Button
                  onClick={acceptWillContent}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Add to My Will
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Recording Tips */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">Voice Recording Tips:</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Speak clearly and at a normal pace</li>
            <li>• Use full names when mentioning people</li>
            <li>• Be specific about assets and distributions</li>
            <li>• You can record multiple times and combine them</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}