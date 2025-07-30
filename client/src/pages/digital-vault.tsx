import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCapacitor } from "@/hooks/useCapacitor";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import VaultUploader from "@/components/vault-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Vault, 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  FileText, 
  PiggyBank, 
  Key, 
  Heart,
  File,
  Calendar,
  User,
  Camera,
  Smartphone
} from "lucide-react";

const categoryConfig = {
  legal: { icon: FileText, label: "Legal Documents", color: "bg-blue-100 text-blue-800" },
  financial: { icon: PiggyBank, label: "Financial", color: "bg-green-100 text-green-800" },
  digital_assets: { icon: Key, label: "Digital Assets", color: "bg-purple-100 text-purple-800" },
  personal: { icon: Heart, label: "Personal", color: "bg-pink-100 text-pink-800" },
  insurance: { icon: Shield, label: "Insurance", color: "bg-orange-100 text-orange-800" },
  property: { icon: File, label: "Property", color: "bg-gray-100 text-gray-800" },
};

export default function DigitalVault() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  const { isNative, takePicture, hapticFeedback } = useCapacitor();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/documents"],
    retry: false,
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return await apiRequest("DELETE", `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document.",
        variant: "destructive",
      });
    },
  });

  // Filter documents based on search and category
  const filteredDocuments = (documents as any)?.filter((doc: any) => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Calculate storage usage
  const totalStorage = 5 * 1024 * 1024 * 1024; // 5GB in bytes
  const usedStorage = (documents as any)?.reduce((sum: number, doc: any) => sum + doc.fileSize, 0) || 0;
  const storagePercentage = Math.round((usedStorage / totalStorage) * 100);

  // Group documents by category for summary
  const documentsByCategory = (documents as any)?.reduce((acc: any, doc: any) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {}) || {};

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteDocument = (documentId: number) => {
    if (confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      deleteDocumentMutation.mutate(documentId);
    }
  };

  const handleCameraScan = async () => {
    try {
      await hapticFeedback();
      const imageDataUrl = await takePicture();
      
      // Convert to file for upload
      const response = await fetch(imageDataUrl!);
      const blob = await response.blob();
      const file = new (File as any)([blob], `scanned_document_${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });
      
      // Create FormData and upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'legal');
      
      const uploadResponse = await apiRequest("POST", "/api/documents", formData);
      
      if (uploadResponse.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
        toast({
          title: "Document Scanned",
          description: "Your document has been successfully scanned and uploaded.",
        });
      }
    } catch (error) {
      console.error('Error scanning document:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to scan document. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Card className="trust-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Vault className="text-secondary h-6 w-6 mr-3" />
                  <h1 className="text-2xl font-bold text-neutral-800">Digital Vault</h1>
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
                  <span>{formatFileSize(usedStorage)} of 5 GB</span>
                </div>
                <Progress value={storagePercentage} className="h-2" />
              </div>

              {/* Category Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(categoryConfig).map(([category, config]) => {
                  const Icon = config.icon;
                  const count = documentsByCategory[category] || 0;
                  
                  return (
                    <div key={category} className="text-center p-3 bg-white rounded-lg border">
                      <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-lg font-bold text-neutral-800">{count}</div>
                      <div className="text-xs text-neutral-600">{config.label}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Upload Section */}
            <VaultUploader />

            {/* Mobile Camera Scan - Only show on mobile */}
            {isNative && (
              <Card className="trust-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Camera className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-800">Scan Document</h3>
                        <p className="text-sm text-neutral-600">Use your camera to scan and upload documents</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleCameraScan}
                      className="bg-primary text-white hover:bg-blue-700"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Scan Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search and Filter */}
            <Card className="trust-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.entries(categoryConfig).map(([category, config]) => (
                          <SelectItem key={category} value={category}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents List */}
            <Card className="trust-shadow">
              <CardHeader>
                <CardTitle>
                  Documents ({filteredDocuments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredDocuments.length > 0 ? (
                  <div className="divide-y divide-neutral-200">
                    {filteredDocuments.map((document: any) => {
                      const categoryConfig_ = categoryConfig[document.category as keyof typeof categoryConfig];
                      const Icon = categoryConfig_?.icon || File;
                      
                      return (
                        <div key={document.id} className="p-6 hover:bg-neutral-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-neutral-800">{document.originalName}</h3>
                                <div className="flex items-center space-x-4 text-sm text-neutral-600 mt-1">
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(document.uploadedAt)}
                                  </span>
                                  <span>{formatFileSize(document.fileSize)}</span>
                                  <Badge className={categoryConfig_?.color}>
                                    {categoryConfig_?.label}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeleteDocument(document.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Vault className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-800 mb-2">
                      {searchTerm || selectedCategory !== "all" ? "No documents found" : "No documents uploaded yet"}
                    </h3>
                    <p className="text-neutral-600">
                      {searchTerm || selectedCategory !== "all" 
                        ? "Try adjusting your search or filter criteria."
                        : "Upload your first document to get started with your digital vault."
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="trust-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Legal Document
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <PiggyBank className="h-4 w-4 mr-2" />
                  Add Financial Record
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Store Digital Asset
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Save Personal Item
                </Button>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="trust-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Security & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-secondary" />
                  <div>
                    <div className="font-medium text-neutral-800">End-to-End Encryption</div>
                    <div className="text-sm text-neutral-600">AES-256 encryption</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium text-neutral-800">Private Access</div>
                    <div className="text-sm text-neutral-600">Only you can access your files</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Vault className="h-5 w-5 text-accent" />
                  <div>
                    <div className="font-medium text-neutral-800">Secure Storage</div>
                    <div className="text-sm text-neutral-600">Bank-grade security</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage Plan */}
            <Card className="trust-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Storage Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Current Plan</span>
                    <span className="font-medium">Basic (5 GB)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Used</span>
                    <span className="font-medium">{formatFileSize(usedStorage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Available</span>
                    <span className="font-medium">{formatFileSize(totalStorage - usedStorage)}</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Upgrade Storage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
