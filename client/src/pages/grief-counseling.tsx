import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/navigation';
import GriefCounseling from '@/components/ai-grief-counseling';
import { 
  Heart, 
  Phone, 
  Users, 
  BookOpen, 
  Calendar,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';

export default function GriefCounselingPage() {
  const [activeSession, setActiveSession] = useState(false);

  const resources = [
    {
      title: "Understanding Grief",
      description: "Learn about the stages of grief and what to expect during your journey.",
      type: "article",
      duration: "10 min read",
      icon: BookOpen
    },
    {
      title: "Coping Strategies",
      description: "Practical techniques for managing difficult emotions and thoughts.",
      type: "guide",
      duration: "15 min read",
      icon: CheckCircle
    },
    {
      title: "Support Groups",
      description: "Connect with others who understand what you're going through.",
      type: "community",
      duration: "Ongoing",
      icon: Users
    },
    {
      title: "Professional Help",
      description: "Find qualified therapists and counselors in your area.",
      type: "directory",
      duration: "Immediate",
      icon: Phone
    }
  ];

  const crisisResources = [
    {
      name: "National Suicide Prevention Lifeline",
      number: "988",
      description: "Free, confidential crisis support 24/7",
      availability: "24/7"
    },
    {
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      description: "Free crisis counseling via text message",
      availability: "24/7"
    },
    {
      name: "GriefShare",
      number: "griefshare.org",
      description: "Grief recovery support groups nationwide",
      availability: "Local groups"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-red-500 mr-4" />
            <h1 className="text-4xl font-bold text-neutral-800">
              Grief Support & Counseling
            </h1>
          </div>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Compassionate AI-powered support combined with professional resources to help you through difficult times.
          </p>
          
          <div className="flex items-center justify-center space-x-4 mt-6">
            <Badge className="bg-green-100 text-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Confidential & Secure
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              <Clock className="h-3 w-3 mr-1" />
              Available 24/7
            </Badge>
            <Badge className="bg-purple-100 text-purple-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Professional Guidance
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="counseling" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="counseling">AI Counseling</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="crisis">Crisis Support</TabsTrigger>
          </TabsList>

          {/* AI Counseling Tab */}
          <TabsContent value="counseling" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <GriefCounseling />
              </div>
              
              <div className="space-y-6">
                {/* Session Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Status</span>
                      <Badge className={activeSession ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {activeSession ? "Active" : "Ready"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Privacy</span>
                      <Badge className="bg-blue-100 text-blue-800">Encrypted</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Availability</span>
                      <Badge className="bg-green-100 text-green-800">24/7</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* How It Works */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How It Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                        1
                      </div>
                      <p className="text-sm text-neutral-600">
                        Share your thoughts and feelings in a safe, private environment.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                        2
                      </div>
                      <p className="text-sm text-neutral-600">
                        Receive personalized support and coping strategies.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                        3
                      </div>
                      <p className="text-sm text-neutral-600">
                        Access professional resources when you need more support.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Crisis Line
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Find Support Group
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Therapy
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource, index) => {
                const IconComponent = resource.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <Badge variant="outline" className="text-xs mt-1">
                            {resource.duration}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-neutral-600 text-sm mb-4">
                        {resource.description}
                      </p>
                      <Button className="w-full" variant="outline">
                        Access Resource
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Additional Resources Section */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Support Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold text-neutral-800 mb-2">Licensed Therapists</h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      Connect with qualified mental health professionals in your area.
                    </p>
                    <Button variant="outline">Find Therapist</Button>
                  </div>
                  <div className="text-center">
                    <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="font-semibold text-neutral-800 mb-2">Grief Specialists</h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      Specialists who focus specifically on grief and loss therapy.
                    </p>
                    <Button variant="outline">Browse Specialists</Button>
                  </div>
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-semibold text-neutral-800 mb-2">Educational Resources</h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      Books, articles, and guides about coping with loss.
                    </p>
                    <Button variant="outline">View Library</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crisis Support Tab */}
          <TabsContent value="crisis" className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
              <div className="flex items-center mb-4">
                <Phone className="h-6 w-6 text-amber-600 mr-3" />
                <h2 className="text-xl font-bold text-amber-800">Immediate Help Available</h2>
              </div>
              <p className="text-amber-700 mb-4">
                If you're in crisis or having thoughts of self-harm, please reach out for immediate help. 
                You are not alone, and support is available 24/7.
              </p>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <Phone className="h-4 w-4 mr-2" />
                Call 988 Now
              </Button>
            </div>

            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
              {crisisResources.map((resource, index) => (
                <Card key={index} className="border-l-4 border-l-red-500">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{resource.name}</span>
                      <Badge className="bg-red-100 text-red-800">{resource.availability}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-primary">
                        {resource.number}
                      </div>
                      <p className="text-neutral-600">
                        {resource.description}
                      </p>
                      <Button className="w-full bg-red-500 hover:bg-red-600">
                        Get Help Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Warning Signs */}
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800">Warning Signs - Seek Immediate Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Emotional Signs:</h4>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>• Thoughts of suicide or self-harm</li>
                      <li>• Overwhelming hopelessness</li>
                      <li>• Intense emotional pain</li>
                      <li>• Feeling trapped or like a burden</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Behavioral Signs:</h4>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>• Giving away possessions</li>
                      <li>• Withdrawing from everyone</li>
                      <li>• Dramatic mood changes</li>
                      <li>• Increased substance use</li>
                    </ul>
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