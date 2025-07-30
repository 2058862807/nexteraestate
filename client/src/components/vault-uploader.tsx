import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, X, File, FileText, PiggyBank, Key, Heart, Shield } from "lucide-react";

const categoryOptions = [
  { value: "legal", label: "Legal Documents", icon: FileText, description: "Wills, trusts, powers of attorney" },
  { value: "financial", label: "Financial", icon: PiggyBank, description: "Bank statements, investment records" },
  { value: "digital_assets", label: "Digital Assets", icon: Key, description: "Passwords, crypto wallets, social media" },
  { value: "personal", label: "Personal", icon: Heart, description: "Photos, videos, personal letters" },
  { value: "insurance", label: "Insurance", icon: Shield, description: "Policy documents, claims" },
  { value: "property", label: "Property", icon: File, description: "Deeds, titles, leases" },
];

export default function VaultUploader() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; category: string; tags: string[] }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("category", data.category);
      formData.append("tags", JSON.stringify(data.tags));

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document uploaded successfully!",
      });
      setSelectedFiles([]);
      setSelectedCategory("");
      setTags("");
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !selectedCategory) {
      toast({
        title: "Missing Information",
        description: "Please select files and a category before uploading.",
        variant: "destructive",
      });
      return;
    }

    const tagArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);

    for (const file of selectedFiles) {
      await uploadMutation.mutateAsync({
        file,
        category: selectedCategory,
        tags: tagArray,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const selectedCategoryConfig = categoryOptions.find(cat => cat.value === selectedCategory);

  return (
    <Card className="trust-shadow">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-neutral-300 hover:border-neutral-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            Drop files here or click to browse
          </h3>
          <p className="text-neutral-600 mb-4">
            Supports PDF, DOC, DOCX, JPG, PNG files up to 10MB each
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
          />
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Selected Files ({selectedFiles.length})</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium text-neutral-800">{file.name}</div>
                      <div className="text-sm text-neutral-600">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Document Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((category) => {
                const Icon = category.icon;
                return (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {selectedCategoryConfig && (
            <p className="text-sm text-neutral-600">{selectedCategoryConfig.description}</p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (optional)</Label>
          <Input
            id="tags"
            placeholder="Enter tags separated by commas (e.g., important, 2023, insurance)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <p className="text-xs text-neutral-600">
            Tags help you organize and find documents more easily
          </p>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || !selectedCategory || uploadMutation.isPending}
          className="w-full bg-primary text-white hover:bg-blue-700"
        >
          {uploadMutation.isPending ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {selectedFiles.length} {selectedFiles.length === 1 ? "Document" : "Documents"}
            </>
          )}
        </Button>

        {/* Security Notice */}
        <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-secondary mt-0.5" />
            <div>
              <h4 className="font-medium text-neutral-800 mb-1">Secure Upload</h4>
              <p className="text-sm text-neutral-600">
                All documents are encrypted with AES-256 encryption before storage. 
                Only you can access your files.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
