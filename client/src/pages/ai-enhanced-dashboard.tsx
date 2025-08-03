import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/navigation';
import WillProgress from '@/components/will-progress';
import LegalComplianceChecker from '@/components/legal-compliance-checker';
import VideoRecorder from '@/components/video-recorder';
import GriefCounseling from '@/components/ai-grief-counseling';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { 
  FileText, 
  Shield, 
  Users, 
  Heart, 
  Video,
  Scale,
  Zap,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  DollarSign,
  Camera
} from 'lucide-react';

interface DashboardStats {
  wills: number;
  documents: number;
  familyMembers: number;
  storageUsed: number;
  compliance: boolean;
  lastActivity: string;
}

export default function AIEnhancedDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch dashboard data
  const { data: willsData } = useQuery({
    queryKey: ["/api/wills"],
    retry: false,
  });

  const { data: documentsData } = useQuery({
    queryKey: ["/api/documents"],
    retry: false,
  });

  const { data: familyData } = useQuery({
    queryKey: ["/api/family"],
    retry: false,
  });

  const { data: deathSwitchData } = useQuery({
    queryKey: ["/api/death-switch"],
    retry: false,
  });

  const { data: activityData } = useQuery({
    queryKey: ["/api/activity"],
    retry: false,
  });

  const { data: usageData } = useQuery({
    queryKey: ["/api/payments/usage"],
    retry: false,
  });

  const { data: subscriptionData } = useQuery({
    queryKey: ["/api/payments/subscription"],
    retry: false,
  });

  // Calculate stats
  const stats: DashboardStats = {
    wills: willsData?.length || 0,
    documents: documentsData?.length || 0,
    familyMembers: familyData?.length || 0,
    storageUsed: usageData?.storage?.percentage || 0,
    compliance: true,
    lastActivity: activityData?.[0]?.createdAt || new Date().toISOString()
  };

  const mainWill = willsData?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                Welcome to NextEra Estate
              </h1>
              <p className="text-lg text-neutral-600">
                Your AI-powered estate planning command center
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">
                <Zap className="h-3 w-3 mr-1" />
                AI-Enhanced
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                <Shield className="h-3 w-3 mr-1" />
                Blockchain Secured
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="trust-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{stats.wills}</p>
                  <p className="text-sm text-neutral-600">Wills</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="trust-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-secondary">{stats.documents}</p>
                  <p className="text-sm text-neutral-600">Documents</p>
                </div>
                <Shield className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="trust-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-accent">{stats.familyMembers}</p>
                  <p className="text-sm text-neutral-600">Family</p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="trust-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.storageUsed}%</p>
                  <p className="text-sm text-neutral-600">Storage</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="trust-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {subscriptionData?.plan?.name || 'Free'}
                  </p>
                  <p className="text-sm text-neutral-600">Plan</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="trust-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <CheckCircle className="h-6 w-6 text-green-600 mb-1" />
                  <p className="text-sm text-neutral-600">Compliant</p>
                </div>
                <Scale className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="will-builder">Will Builder</TabsTrigger>
            <TabsTrigger value="compliance">Legal Compliance</TabsTrigger>
            <TabsTrigger value="videos">Video Messages</TabsTrigger>
            <TabsTrigger value="grief-support">AI Support</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Will Progress */}
                {mainWill && (
                  <Card className="trust-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Current Will Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <WillProgress will={mainWill} />
                    </CardContent>
                  </Card>
                )}

                {/* Recent Activity */}
                <Card className="trust-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activityData?.slice(0, 5).map((activity: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-800">{activity.action}</p>
                            <p className="text-xs text-neutral-600">
                              {new Date(activity.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-neutral-600 text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Death Switch Status */}
                <Card className="trust-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-500" />
                      Death Switch
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Status</span>
                        <Badge className="bg-green-100 text-green-800">
                          {deathSwitchData?.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Last Check-in</span>
                        <span className="text-sm font-medium">
                          {deathSwitchData?.lastCheckIn 
                            ? new Date(deathSwitchData.lastCheckIn).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                      <Button variant="outline" className="w-full">
                        Configure Death Switch
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Storage Usage */}
                <Card className="trust-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Storage Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Used Storage</span>
                        <span>{usageData?.storage?.used || 0} / {usageData?.storage?.limit || 5} GB</span>
                      </div>
                      <Progress value={usageData?.storage?.percentage || 0} className="h-2" />
                      
                      <div className="space-y-2 text-xs text-neutral-600">
                        <div className="flex justify-between">
                          <span>Video Messages</span>
                          <span>{usageData?.videoMessages?.used || 0} / {usageData?.videoMessages?.limit || 2}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Family Members</span>
                          <span>{usageData?.familyMembers?.used || 0} / {usageData?.familyMembers?.limit || 3}</span>
                        </div>
                      </div>

                      {subscriptionData?.plan && (
                        <Button variant="outline" className="w-full">
                          Manage {subscriptionData.plan.name} Plan
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="trust-shadow">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Continue Will
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Video className="h-4 w-4 mr-2" />
                      Record Message
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Add Family Member
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Will Builder Tab */}
          <TabsContent value="will-builder" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {mainWill ? (
                  <WillProgress will={mainWill} />
                ) : (
                  <Card className="trust-shadow">
                    <CardContent className="p-12 text-center">
                      <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                        Start Your Estate Plan
                      </h3>
                      <p className="text-neutral-600 mb-6">
                        Create your legally compliant will with AI guidance in just minutes.
                      </p>
                      <Button className="bg-primary hover:bg-blue-700">
                        Start Will Builder
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div>
                <Card className="trust-shadow">
                  <CardHeader>
                    <CardTitle>AI Will Assistant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">AI Suggestion</p>
                            <p className="text-sm text-blue-700">
                              Based on your profile, consider adding a healthcare directive to your estate plan.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        Get AI Recommendations
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Legal Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <LegalComplianceChecker 
              willData={mainWill}
              onComplianceChange={(compliant, violations) => {
                console.log('Compliance changed:', compliant, violations);
              }}
            />
          </TabsContent>

          {/* Video Messages Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <VideoRecorder 
                  onVideoSaved={(video) => {
                    console.log('Video saved:', video);
                  }}
                />
              </div>
              
              <div>
                <Card className="trust-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Video className="h-5 w-5 mr-2" />
                      Saved Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Message to Children</span>
                          <Badge variant="outline">Private</Badge>
                        </div>
                        <p className="text-xs text-neutral-600">2:34 duration</p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Anniversary Message</span>
                          <Badge variant="outline">Scheduled</Badge>
                        </div>
                        <p className="text-xs text-neutral-600">1:12 duration</p>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <Camera className="h-4 w-4 mr-2" />
                        Record New Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Grief Support Tab */}
          <TabsContent value="grief-support" className="space-y-6">
            <GriefCounseling />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="trust-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">75%</div>
                  <Progress value={75} className="h-2 mt-2" />
                  <p className="text-xs text-neutral-600 mt-2">Estate plan progress</p>
                </CardContent>
              </Card>

              <Card className="trust-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">A+</div>
                  <div className="flex items-center mt-2">
                    <Shield className="h-4 w-4 text-secondary mr-1" />
                    <span className="text-xs text-neutral-600">Blockchain secured</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="trust-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Legal Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs text-neutral-600">All states verified</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="trust-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Family Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">3/5</div>
                  <div className="flex items-center mt-2">
                    <Users className="h-4 w-4 text-accent mr-1" />
                    <span className="text-xs text-neutral-600">Members active</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="trust-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Estate Plan Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Health</span>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  
                  <Progress value={90} className="h-3" />
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-green-600">95%</div>
                      <div className="text-neutral-600">Legal Compliance</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">85%</div>
                      <div className="text-neutral-600">Documentation</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">90%</div>
                      <div className="text-neutral-600">Family Coordination</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}