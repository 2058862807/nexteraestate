import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { 
  Heart, 
  Send, 
  Bot, 
  User, 
  Lightbulb,
  Phone,
  BookOpen,
  Users
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  emotion?: string;
  timestamp: Date;
  suggestedActions?: string[];
}

interface GriefCounselingProps {
  className?: string;
}

export default function GriefCounseling({ className = '' }: GriefCounselingProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello, I'm here to provide support during this difficult time. I'm a trained AI counselor specialized in grief and loss. How are you feeling today, and what would you like to talk about?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('POST', '/api/ai/grief-counseling', {
        message,
        sessionId
      });
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: data.response,
        emotion: data.emotion,
        suggestedActions: data.suggestedActions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment, or consider reaching out to a human counselor if you need immediate support.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      
      toast({
        title: "Connection Issue",
        description: "Unable to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    const messageToSend = inputMessage;
    setInputMessage('');

    await sendMessageMutation.mutateAsync(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'sadness': return 'bg-blue-100 text-blue-800';
      case 'anger': return 'bg-red-100 text-red-800';
      case 'anxiety': return 'bg-yellow-100 text-yellow-800';
      case 'mixed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const quickResponses = [
    "I'm feeling overwhelmed",
    "I miss them so much",
    "I don't know how to cope",
    "I feel guilty",
    "I can't sleep",
    "How do I tell the children?"
  ];

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            AI Grief Counseling
          </CardTitle>
          <div className="flex items-center space-x-4 text-sm text-neutral-600">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Available 24/7
            </Badge>
            <Badge variant="outline">
              Confidential & Secure
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto pr-4 max-h-96" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-white'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  <div className={`flex-1 max-w-[80%] ${
                    message.type === 'user' ? 'text-right' : ''
                  }`}>
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    <div className="flex items-center space-x-2 mt-2 text-xs text-neutral-500">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.emotion && (
                        <Badge className={`text-xs ${getEmotionColor(message.emotion)}`}>
                          {message.emotion}
                        </Badge>
                      )}
                    </div>

                    {/* Suggested Actions */}
                    {message.suggestedActions && message.suggestedActions.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-800">
                            Suggested Actions
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {message.suggestedActions.map((action, index) => (
                            <li key={index} className="text-sm text-blue-700">
                              • {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-neutral-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick responses */}
          <div className="flex flex-wrap gap-2">
            {quickResponses.map((response, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInputMessage(response)}
                className="text-xs"
                disabled={isTyping}
              >
                {response}
              </Button>
            ))}
          </div>

          <Separator />

          {/* Input area */}
          <div className="flex space-x-3">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-secondary hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Professional resources */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Phone className="h-4 w-4 text-amber-600 mr-2" />
              <span className="text-sm font-medium text-amber-800">
                Need Immediate Help?
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center text-amber-700">
                <Phone className="h-3 w-3 mr-1" />
                Crisis Line: 988
              </div>
              <div className="flex items-center text-amber-700">
                <Users className="h-3 w-3 mr-1" />
                Support Groups
              </div>
              <div className="flex items-center text-amber-700">
                <BookOpen className="h-3 w-3 mr-1" />
                Professional Therapy
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}