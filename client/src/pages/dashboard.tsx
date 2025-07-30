import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import WillProgress from "@/components/will-progress";
import { 
  FileSignature, 
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
  PiggyBank
} from "lucide-react";

export default function Dashboard() {
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

  const activeWill = Array.isArray(wills) ? wills[0] : null;
  const completionPercentage = activeWill?.completionPercentage || 0;
  const documentCount = Array.isArray(documents) ? documents.length : 0;
  const familyCount = Array.isArray(family) ? family.length : 0;

  // Calculate storage usage (mock calculation based on file sizes)
  const totalStorage = 5 * 1024 * 1024 * 1024; // 5GB in bytes
  const usedStorage = Array.isArray(documents) ? documents.reduce((sum: number, doc: any) => sum + doc.fileSize, 0) : 0;
  const storagePercentage = Math.round((usedStorage / totalStorage) * 100);

  // Group documents by category
  const documentsByCategory = Array.isArray(documents) ? documents.reduce((acc: any, doc: any) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {}) : {};

  const categoryIcons = {
    legal: FileText,
    financial: PiggyBank,
    digital_assets: Key,
    personal: Heart,
  };

  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-hidden overflow-y-auto">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 overflow-x-hidden">
        {/* Dashboard Header */}
        <div className="mb-8">
          <Card className="trust-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h1 className="text-2xl font-bold text-neutral-800 mb-2">
                    Welcome back, {(user as any)?.firstName || "User"}
                  </h1>
                  <p className="text-neutral-600">
                    Your estate plan is <span className="text-secondary font-medium">{completionPercentage}% complete</span>. 
                    Let's finish securing your family's future.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{documentCount}</div>
                    <div className="text-sm text-neutral-600">Documents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">{familyCount}</div>
                    <div className="text-sm text-neutral-600">Heirs Added</div>
                  </div>
                  <Button className="bg-primary text-white hover:bg-blue-700">
                    Continue Will
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Will Builder Section */}
            <Card className="trust-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <FileSignature className="text-primary h-6 w-6 mr-3" />
                    <h2 className="text-xl font-semibold text-neutral-800">Smart Will Builder</h2>
                  </div>
                  <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                    {activeWill?.status || 'Not Started'}
                  </span>
                </div>
                
                {activeWill ? (
                  <WillProgress will={activeWill} />
                ) : (
                  <div className="text-center py-8">
                    <FileSignature className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-800 mb-2">Create Your First Will</h3>
                    <p className="text-neutral-600 mb-4">
                      Start with our guided will builder to secure your family's future.
                    </p>
                    <Button className="bg-primary text-white hover:bg-blue-700">
                      Start Will Builder
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Digital Vault Section */}
            <Card className="trust-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Vault className="text-secondary h-6 w-6 mr-3" />
                    <h2 className="text-xl font-semibold text-neutral-800">Digital Vault</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="text-secondary h-4 w-4" />
                    <span className="text-sm text-neutral-600">256-bit Encrypted</span>
                  </div>
                </div>

                {/* Storage Usage */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-neutral-600 mb-2">
                    <span>Storage Used</span>
                    <span>{Math.round(usedStorage / (1024 * 1024))} MB of 5 GB</span>
                  </div>
                  <Progress value={storagePercentage} className="h-2" />
                </div>

                {/* Document Categories */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {Object.entries(categoryIcons).map(([category, Icon]) => (
                    <div key={category} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Icon className="text-primary h-5 w-5 mr-2" />
                          <span className="font-medium capitalize">
                            {category.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-sm text-neutral-500">
                          {documentsByCategory[category] || 0} files
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full border-2 border-dashed border-neutral-300">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Documents
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Family & Executors */}
            <Card className="trust-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-800">Family & Executors</h3>
                  <Button variant="ghost" size="sm" className="text-primary">
                    <Users className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                </div>

                {Array.isArray(family) && family.length > 0 ? (
                  <div className="space-y-3">
                    {family.slice(0, 3).map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary text-sm font-medium">
                              {member.firstName[0]}{member.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-neutral-800">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-neutral-600 capitalize">{member.role}</div>
                          </div>
                        </div>
                        {member.status === 'accepted' ? (
                          <CheckCircle className="h-5 w-5 text-secondary" />
                        ) : (
                          <Clock className="h-5 w-5 text-accent" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Users className="h-12 w-12 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-600 text-sm">No family members added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Death Switch Status */}
            <Card className="trust-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Heart className="text-secondary h-5 w-5 mr-3" />
                  <h3 className="text-lg font-semibold text-neutral-800">Active Monitoring</h3>
                </div>
                
                {deathSwitch && (deathSwitch as any).lastCheckIn ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Last Check-in</span>
                      <span className="font-medium text-neutral-800">
                        {new Date((deathSwitch as any).lastCheckIn).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Status</span>
                      <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-sm font-medium">
                        Active
                      </span>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Update Check-in Settings
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-600 text-sm">Death switch not configured</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security & Trust */}
            <Card className="trust-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Security & Trust</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Shield className="text-secondary h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium text-neutral-800">Bank-Grade Encryption</div>
                      <div className="text-sm text-neutral-600">AES-256 encryption</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <CheckCircle className="text-accent h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium text-neutral-800">SOC 2 Compliant</div>
                      <div className="text-sm text-neutral-600">Independently audited</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FileText className="text-primary h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium text-neutral-800">Legal Compliance</div>
                      <div className="text-sm text-neutral-600">All 50 states covered</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="trust-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h3>
                
                {Array.isArray(activity) && activity.length > 0 ? (
                  <div className="space-y-3">
                    {activity.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="flex items-start">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <div className="text-sm font-medium text-neutral-800">{item.description}</div>
                          <div className="text-xs text-neutral-600">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="h-12 w-12 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-600 text-sm">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Educational Banner */}
        <div className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Estate Planning Education Center</h3>
              <p className="text-neutral-600">Learn about estate planning best practices and legal requirements for your state.</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                View Guides
              </Button>
              <Button className="bg-primary text-white hover:bg-blue-700">
                Book Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Help */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button size="icon" className="bg-secondary text-white w-14 h-14 rounded-full shadow-lg hover:bg-green-700">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
