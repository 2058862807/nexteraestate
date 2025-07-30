import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, CheckCircle, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskNudge {
  urgentTasks: string[];
  suggestions: string[];
  motivationalMessage: string;
  nextSteps: string[];
}

interface AIAssistantProps {
  userProgress: any;
  onTaskClick: (task: string) => void;
}

export default function AIAssistant({ userProgress, onTaskClick }: AIAssistantProps) {
  const [nudges, setNudges] = useState<TaskNudge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateNudges = async () => {
    setIsLoading(true);
    try {
      // Demo mode with realistic AI suggestions
      const demoNudges: TaskNudge = {
        urgentTasks: [
          "Complete your will's executor selection",
          "Upload important financial documents",
          "Add emergency contact information"
        ],
        suggestions: [
          "Consider adding beneficiary details for your retirement accounts",
          "Review your digital asset inventory",
          "Set up automatic document scanning reminders"
        ],
        motivationalMessage: "You're 75% complete with your estate planning! Just a few more steps to secure your family's future.",
        nextSteps: [
          "Finalize will witnessing requirements",
          "Configure your death switch timeline",
          "Invite family members to review documents"
        ]
      };

      // Simulate API delay for realism
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNudges(demoNudges);
    } catch (error) {
      toast({
        title: "Demo Mode Active",
        description: "Showing sample AI suggestions (API quota exceeded)",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateNudges();
  }, [userProgress]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-4 text-blue-600 animate-spin" />
          <p>AI Assistant is analyzing your progress...</p>
        </CardContent>
      </Card>
    );
  }

  if (!nudges) return null;

  return (
    <Card className="border-blue-200 bg-blue-50 overflow-x-hidden w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <MessageCircle className="h-6 w-6" />
          Your AI Estate Planning Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 overflow-x-hidden">
        
        {/* Motivational Message */}
        <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500 overflow-hidden">
          <p className="text-gray-700 font-medium break-words">{nudges.motivationalMessage}</p>
        </div>

        {/* Urgent Tasks */}
        {nudges.urgentTasks.length > 0 && (
          <div>
            <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Action Needed
            </h3>
            <div className="space-y-2">
              {nudges.urgentTasks.map((task, index) => (
                <div
                  key={index}
                  className="bg-red-50 border border-red-200 p-3 rounded-lg cursor-pointer hover:bg-red-100 transition-colors overflow-hidden"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-red-800 break-words flex-1 min-w-0 text-sm">{task}</div>
                    <ArrowRight className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {nudges.suggestions.length > 0 && (
          <div>
            <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {nudges.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-blue-50 border border-blue-200 p-3 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => onTaskClick(suggestion)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-blue-800 break-words flex-1 min-w-0 text-sm">{suggestion}</div>
                    <ArrowRight className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {nudges.nextSteps.length > 0 && (
          <div>
            <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Next Steps
            </h3>
            <div className="space-y-2">
              {nudges.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {index + 1}
                  </Badge>
                  <span className="text-green-800 flex-1">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={generateNudges}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Get Updated Suggestions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}