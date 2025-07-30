import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import AIAssistant from "@/components/ai-assistant";
import AIWillReviewerSimple from "@/components/ai-will-reviewer-simple";
import VoiceToWillSimple from "@/components/voice-to-will-simple";
import DocumentCategorizer from "@/components/document-categorizer";
import DeathSwitchDashboard from "@/components/death-switch-dashboard";
import { 
  Sparkles, 
  Shield, 
  Users, 
  Heart, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Vault,
  Key,
  PiggyBank,
  Bot,
  Mic,
  Settings,
  Award
} from "lucide-react";

export default function AIEnhancedDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Authentication disabled - open access mode
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     toast({
  //       title: "Unauthorized",
  //       description: "You are logged out. Logging in again...",
  //       variant: "destructive",
  //     });
  //     setTimeout(() => {
  //       window.location.href = "/api/login";
  //     }, 500);
  //     return;
  //   }
  // }, [isAuthenticated, isLoading, toast]);

  const { data: wills } = useQuery({
    queryKey: ["/api/wills"],
    retry: false,
  });

  const { data: documents } = useQuery({
    queryKey: ["/api/documents"],
    retry: false,
  });

  const { data: family } = useQuery({
    queryKey: ["/api/family"],
    retry: false,
  });

  const { data: deathSwitch } = useQuery({
    queryKey: ["/api/death-switch"],
    retry: false,
  });

  const { data: activity } = useQuery({
    queryKey: ["/api/activity"],
    retry: false,
  });

  // Removed authentication blocking
  // if (isLoading || !isAuthenticated) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
  //     </div>
  //   );
  // }

  // Calculate user progress for AI assistant
  const userProgress = {
    hasWill: Array.isArray(wills) && wills.length > 0,
    hasDocuments: Array.isArray(documents) && documents.length > 0,
    hasFamily: Array.isArray(family) && family.length > 0,
    hasDeathSwitch: Array.isArray(deathSwitch) && deathSwitch.length > 0,
    totalWills: Array.isArray(wills) ? wills.length : 0,
    totalDocuments: Array.isArray(documents) ? documents.length : 0,
    totalFamily: Array.isArray(family) ? family.length : 0,
    recentActivity: Array.isArray(activity) ? activity.slice(0, 5) : []
  };

  const completionScore = Math.round(
    ((userProgress.hasWill ? 25 : 0) +
     (userProgress.hasDocuments ? 25 : 0) +
     (userProgress.hasFamily ? 25 : 0) +
     (userProgress.hasDeathSwitch ? 25 : 0))
  );

  const handleTaskClick = (task: string) => {
    // Route to appropriate page based on task
    if (task.toLowerCase().includes('will')) {
      window.location.href = '/will-builder';
    } else if (task.toLowerCase().includes('document')) {
      window.location.href = '/vault';
    } else if (task.toLowerCase().includes('family')) {
      window.location.href = '/family';
    }
  };

  const handleWillImproved = (improvedWill: string) => {
    toast({
      title: "Will Enhanced",
      description: "Your will has been improved with AI suggestions",
    });
  };

  const handleVoiceWillGenerated = (willContent: string) => {
    toast({
      title: "Voice Will Generated",
      description: "Voice input converted to legal language",
    });
  };

  const handleDocumentCategorized = (doc: any) => {
    toast({
      title: "Document Categorized",
      description: `${doc.file.name} classified as ${doc.category}`,
    });
  };

  const userContext = {
    name: (user as any)?.firstName || 'User',
    state: 'TX', // Default state
    email: (user as any)?.email
  };

  const latestWill = Array.isArray(wills) && wills.length > 0 ? wills[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-x-hidden">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 max-w-7xl overflow-x-hidden">
        {/* AI-Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">AI-Powered Estate Planning</h1>
          </div>
          <p className="text-xl text-gray-600">
            Your intelligent assistant for comprehensive estate planning
          </p>
        </div>

        {/* Completion Overview */}
        <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Estate Planning Progress</h2>
                <p className="text-gray-600">AI is tracking your completion</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600">{completionScore}%</div>
                <Badge className={completionScore >= 75 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {completionScore >= 75 ? 'Nearly Complete' : 'In Progress'}
                </Badge>
              </div>
            </div>
            <Progress value={completionScore} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 max-w-full overflow-x-hidden">
              <div className="text-center">
                <CheckCircle className={`h-8 w-8 mx-auto mb-2 ${userProgress.hasWill ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="text-sm font-medium">Will Created</p>
              </div>
              <div className="text-center">
                <Upload className={`h-8 w-8 mx-auto mb-2 ${userProgress.hasDocuments ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="text-sm font-medium">Documents Stored</p>
              </div>
              <div className="text-center">
                <Users className={`h-8 w-8 mx-auto mb-2 ${userProgress.hasFamily ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="text-sm font-medium">Family Added</p>
              </div>
              <div className="text-center">
                <Shield className={`h-8 w-8 mx-auto mb-2 ${userProgress.hasDeathSwitch ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="text-sm font-medium">Death Switch Set</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8 overflow-x-hidden">
          {/* Left Column - AI Assistant */}
          <div className="lg:col-span-1 space-y-6">
            <AIAssistant 
              userProgress={userProgress}
              onTaskClick={handleTaskClick}
            />

            {/* Quick AI Actions */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Sparkles className="h-6 w-6" />
                  AI Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/will-builder'}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  AI Will Builder
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => document.getElementById('voice-to-will')?.scrollIntoView()}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Voice to Will
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => document.getElementById('document-categorizer')?.scrollIntoView()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Smart Upload
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - AI Features */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* AI Will Reviewer - Simple Interface */}
            <div id="will-reviewer" className="overflow-x-hidden max-w-full">
              <AIWillReviewerSimple />
            </div>

            {/* Voice to Will Generator - Simple Interface */}
            <div id="voice-to-will" className="overflow-x-hidden max-w-full">
              <VoiceToWillSimple />
            </div>

            {/* Document Categorizer */}
            <div id="document-categorizer">
              <DocumentCategorizer
                onDocumentCategorized={handleDocumentCategorized}
              />
            </div>

            {/* Estate Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Legal Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{userProgress.totalWills}</div>
                  <p className="text-sm text-gray-600">Active Wills</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    View All Documents
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Vault className="h-5 w-5 text-green-600" />
                    Digital Vault
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{userProgress.totalDocuments}</div>
                  <p className="text-sm text-gray-600">Stored Files</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Manage Vault
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* AI Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Award className="h-6 w-6" />
                    Legal Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 mb-4">
                    AI continuously monitors your documents for legal compliance and state-specific requirements.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Check Compliance
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Settings className="h-6 w-6" />
                    Smart Death Switch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-700 mb-4">
                    AI helps configure your death switch with optimal timing and notification settings.
                  </p>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Configure AI Assistant
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Recent AI Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-gray-600" />
              Recent AI Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userProgress.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {userProgress.recentActivity.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Bot className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-600">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>AI activity will appear here as you use the platform</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}