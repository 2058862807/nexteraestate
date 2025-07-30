import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, Sparkles, ArrowRight } from 'lucide-react';

export default function AIWillBuilder() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    currentAddress: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Family & Relationships
    maritalStatus: '',
    spouseName: '',
    children: '',
    
    // Assets & Distribution
    realEstate: '',
    financialAssets: '',
    personalProperty: '',
    businessInterests: '',
    
    // Wishes & Instructions
    primaryWishes: '',
    specificBequests: '',
    executorPreference: '',
    guardianPreference: '',
    
    // Additional Instructions
    funeralWishes: '',
    specialInstructions: '',
    charitableDonations: ''
  });
  
  const [willGenerated, setWillGenerated] = useState(false);
  const [generatedWill, setGeneratedWill] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createWillMutation = useMutation({
    mutationFn: (data: any) => 
      fetch('/api/wills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wills'] });
    },
  });

  const generateAIWill = async () => {
    try {
      console.log('Generating AI will with comprehensive data:', formData);
      
      // Create comprehensive AI prompt
      const aiPrompt = `Create a comprehensive legal will for ${formData.fullName}.

PERSONAL DETAILS:
- Full Name: ${formData.fullName}
- Date of Birth: ${formData.dateOfBirth}
- Place of Birth: ${formData.placeOfBirth}
- Current Address: ${formData.currentAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}
- Marital Status: ${formData.maritalStatus}
- Spouse: ${formData.spouseName}

FAMILY:
${formData.children}

ASSETS:
Real Estate: ${formData.realEstate}
Financial Assets: ${formData.financialAssets}
Personal Property: ${formData.personalProperty}
Business Interests: ${formData.businessInterests}

PRIMARY WISHES:
${formData.primaryWishes}

SPECIFIC BEQUESTS:
${formData.specificBequests}

EXECUTOR PREFERENCE:
${formData.executorPreference}

GUARDIAN PREFERENCES:
${formData.guardianPreference}

FUNERAL WISHES:
${formData.funeralWishes}

CHARITABLE DONATIONS:
${formData.charitableDonations}

SPECIAL INSTRUCTIONS:
${formData.specialInstructions}

Please create a legally compliant will for ${formData.state} that incorporates all these details with proper legal language.`;

      const willData = {
        title: `Last Will and Testament of ${formData.fullName}`,
        state: formData.state,
        personalInfo: {
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          placeOfBirth: formData.placeOfBirth,
          currentAddress: formData.currentAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          maritalStatus: formData.maritalStatus,
          spouseName: formData.spouseName
        },
        executors: [],
        assets: [],
        status: "ai_generated",
        completionPercentage: 100,
        aiGenerated: true,
        originalDescription: formData.primaryWishes,
        aiPrompt: aiPrompt,
        userInput: formData,
        comprehensiveData: formData
      };

      console.log('Sending comprehensive will data:', willData);
      const result = await createWillMutation.mutateAsync(willData);
      console.log('AI will creation result:', result);
      
      setGeneratedWill(result.content || 'Will generated successfully');
      setWillGenerated(true);
      
      toast({
        title: "AI Will Generated Successfully!",
        description: `Comprehensive legal will for ${formData.fullName} has been created.`,
      });
    } catch (error) {
      console.error('AI will generation error:', error);
      toast({
        title: "Error", 
        description: "Failed to generate will. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (willGenerated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <Sparkles className="h-24 w-24 mx-auto mb-6 text-blue-600" />
                <h1 className="text-4xl font-bold text-blue-800 mb-4">AI-Generated Legal Will Complete!</h1>
                <p className="text-xl text-blue-700 mb-8">Your comprehensive will for {formData.fullName} has been created</p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-lg mb-8 max-h-96 overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Generated Will Preview:</h3>
                <pre className="whitespace-pre-wrap text-sm">{generatedWill}</pre>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => {
                    const element = document.createElement('a');
                    const fileBlob = new Blob([generatedWill], {type: 'text/plain'});
                    element.href = URL.createObjectURL(fileBlob);
                    element.download = `Will_${formData.fullName.replace(/\s+/g, '_')}.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-4"
                >
                  <Download className="mr-2 h-6 w-6" />
                  Download Will
                </Button>
                <Button 
                  onClick={() => setWillGenerated(false)}
                  variant="outline"
                  className="text-xl px-8 py-4"
                >
                  Create Another Will
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  variant="outline"
                  className="text-xl px-8 py-4"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">AI-Powered Will Builder</h1>
          <p className="text-2xl text-gray-600">Tell us about yourself and your wishes - our AI will create your legal will</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Sparkles className="mr-3 h-8 w-8 text-blue-600" />
              Step {step} of 4: {
                step === 1 ? 'Personal Information' :
                step === 2 ? 'Family & Relationships' :
                step === 3 ? 'Assets & Distribution' :
                'Final Wishes & Instructions'
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12 space-y-8">
            
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName" className="text-lg font-semibold">Full Legal Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      className="mt-2 text-lg p-4"
                      placeholder="e.g., John Michael Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-lg font-semibold">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      className="mt-2 text-lg p-4"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="placeOfBirth" className="text-lg font-semibold">Place of Birth</Label>
                    <Input
                      id="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={(e) => updateField('placeOfBirth', e.target.value)}
                      className="mt-2 text-lg p-4"
                      placeholder="e.g., Dallas, Texas"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentAddress" className="text-lg font-semibold">Current Address *</Label>
                    <Input
                      id="currentAddress"
                      value={formData.currentAddress}
                      onChange={(e) => updateField('currentAddress', e.target.value)}
                      className="mt-2 text-lg p-4"
                      placeholder="e.g., 123 Main Street"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city" className="text-lg font-semibold">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="mt-2 text-lg p-4"
                      placeholder="Dallas"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-lg font-semibold">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className="mt-2 text-lg p-4"
                      placeholder="TX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-lg font-semibold">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => updateField('zipCode', e.target.value)}
                      className="mt-2 text-lg p-4"
                      placeholder="75201"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Family & Relationships */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="maritalStatus" className="text-lg font-semibold">Marital Status *</Label>
                    <Input
                      id="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={(e) => updateField('maritalStatus', e.target.value)}
                      className="mt-2 text-lg p-4"
                      placeholder="e.g., Married, Single, Divorced, Widowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="spouseName" className="text-lg font-semibold">Spouse Name (if applicable)</Label>
                    <Input
                      id="spouseName"
                      value={formData.spouseName}
                      onChange={(e) => updateField('spouseName', e.target.value)}
                      className="mt-2 text-lg p-4"
                      placeholder="Full name of spouse"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="children" className="text-lg font-semibold">Children & Dependents</Label>
                  <Textarea
                    id="children"
                    value={formData.children}
                    onChange={(e) => updateField('children', e.target.value)}
                    className="mt-2 text-lg p-4 min-h-32"
                    placeholder="List all children and dependents with their full names, ages, and any special considerations. Example: 'Sarah Jane Smith, age 16; Michael Robert Smith, age 12'"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Assets & Distribution */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="realEstate" className="text-lg font-semibold">Real Estate</Label>
                  <Textarea
                    id="realEstate"
                    value={formData.realEstate}
                    onChange={(e) => updateField('realEstate', e.target.value)}
                    className="mt-2 text-lg p-4 min-h-24"
                    placeholder="Describe your real estate: primary residence, vacation homes, rental properties, land, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="financialAssets" className="text-lg font-semibold">Financial Assets</Label>
                  <Textarea
                    id="financialAssets"
                    value={formData.financialAssets}
                    onChange={(e) => updateField('financialAssets', e.target.value)}
                    className="mt-2 text-lg p-4 min-h-24"
                    placeholder="Bank accounts, investments, retirement accounts, stocks, bonds, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="personalProperty" className="text-lg font-semibold">Personal Property</Label>
                  <Textarea
                    id="personalProperty"
                    value={formData.personalProperty}
                    onChange={(e) => updateField('personalProperty', e.target.value)}
                    className="mt-2 text-lg p-4 min-h-24"
                    placeholder="Vehicles, jewelry, art, collectibles, furniture, electronics, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="businessInterests" className="text-lg font-semibold">Business Interests</Label>
                  <Textarea
                    id="businessInterests"
                    value={formData.businessInterests}
                    onChange={(e) => updateField('businessInterests', e.target.value)}
                    className="mt-2 text-lg p-4 min-h-24"
                    placeholder="Business ownership, partnerships, intellectual property, etc."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Final Wishes & Instructions */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="primaryWishes" className="text-lg font-semibold">Primary Distribution Wishes *</Label>
                  <Textarea
                    id="primaryWishes"
                    value={formData.primaryWishes}
                    onChange={(e) => updateField('primaryWishes', e.target.value)}
                    className="mt-2 text-lg p-4 min-h-32"
                    placeholder="Describe in natural language how you want your assets distributed. Example: 'I want everything to go to my spouse Sarah. If she dies before me, split everything equally between my children Michael and Jennifer.'"
                  />
                </div>
                
                <div>
                  <Label htmlFor="specificBequests" className="text-lg font-semibold">Specific Bequests</Label>
                  <Textarea
                    id="specificBequests"
                    value={formData.specificBequests}
                    onChange={(e) => updateField('specificBequests', e.target.value)}
                    className="mt-2 text-lg p-4 min-h-24"
                    placeholder="Specific items to specific people. Example: 'My grandmother's ring to my daughter Sarah, my car to my son Michael, $10,000 to my brother John.'"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="executorPreference" className="text-lg font-semibold">Executor Preference</Label>
                    <Textarea
                      id="executorPreference"
                      value={formData.executorPreference}
                      onChange={(e) => updateField('executorPreference', e.target.value)}
                      className="mt-2 text-lg p-4 min-h-24"
                      placeholder="Who should handle your estate? Include backup options."
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardianPreference" className="text-lg font-semibold">Guardian for Minor Children</Label>
                    <Textarea
                      id="guardianPreference"
                      value={formData.guardianPreference}
                      onChange={(e) => updateField('guardianPreference', e.target.value)}
                      className="mt-2 text-lg p-4 min-h-24"
                      placeholder="Who should care for your minor children if both parents die?"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="funeralWishes" className="text-lg font-semibold">Funeral & Burial Wishes</Label>
                  <Textarea
                    id="funeralWishes"
                    value={formData.funeralWishes}
                    onChange={(e) => updateField('funeralWishes', e.target.value)}
                    className="mt-2 text-lg p-4 min-h-24"
                    placeholder="Your preferences for funeral arrangements, burial, cremation, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="charitableDonations" className="text-lg font-semibold">Charitable Donations</Label>
                  <Textarea
                    id="charitableDonations"
                    value={formData.charitableDonations}
                    onChange={(e) => updateField('charitableDonations', e.target.value)}
                    className="mt-2 text-lg p-4 min-h-24"
                    placeholder="Any charitable organizations you'd like to include in your will."
                  />
                </div>
                
                <div>
                  <Label htmlFor="specialInstructions" className="text-lg font-semibold">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={(e) => updateField('specialInstructions', e.target.value)}
                    className="mt-2 text-lg p-4 min-h-24"
                    placeholder="Any other special instructions, conditions, or wishes."
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-8 border-t-2">
              {step > 1 && (
                <Button 
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="text-xl px-8 py-4"
                >
                  ← Previous
                </Button>
              )}
              
              <div className="flex-1"></div>
              
              {step < 4 ? (
                <Button 
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && (!formData.fullName || !formData.dateOfBirth || !formData.currentAddress || !formData.city || !formData.state)) ||
                    (step === 2 && !formData.maritalStatus)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-8 py-4"
                >
                  Next → 
                </Button>
              ) : (
                <Button 
                  onClick={generateAIWill}
                  disabled={!formData.primaryWishes || createWillMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white text-2xl px-12 py-6"
                >
                  <Sparkles className="mr-3 h-6 w-6" />
                  {createWillMutation.isPending ? 'Generating AI Will...' : 'Generate My AI Will'}
                </Button>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center space-x-4 pt-4">
              {[1, 2, 3, 4].map(num => (
                <div 
                  key={num}
                  className={`w-4 h-4 rounded-full ${
                    num <= step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}