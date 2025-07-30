import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { FileText, Download } from 'lucide-react';

export default function SimpleWill() {
  const [currentStep, setCurrentStep] = useState(1);
  const [willData, setWillData] = useState({
    name: '',
    state: '',
    wishes: '',
    template: ''
  });
  const [willGenerated, setWillGenerated] = useState(false);
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

  const generateWill = async () => {
    try {
      const finalWillData = {
        title: `Last Will and Testament of ${willData.name}`,
        state: willData.state,
        personalInfo: {
          fullName: willData.name,
          state: willData.state,
          city: 'Not specified',
          maritalStatus: 'single'
        },
        executors: [],
        assets: [],
        status: "ai_generated",
        completionPercentage: 100,
        aiGenerated: true,
        originalDescription: willData.wishes || willData.template,
      };

      await createWillMutation.mutateAsync(finalWillData);
      setWillGenerated(true);
      
      toast({
        title: "Will Created Successfully!",
        description: "Your legal will has been generated and saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create will. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Step 1: Select Template
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">Create Your Legal Will</h1>
            <p className="text-2xl text-gray-600">Choose your situation to get started</p>
          </div>

          <div className="space-y-6">
            {[
              {
                title: "Married with Children",
                description: "Everything to spouse, then to children",
                template: "Everything goes to my spouse. If spouse dies first, children inherit equally.",
                color: "bg-green-100 border-green-300 hover:bg-green-200"
              },
              {
                title: "Single Parent",
                description: "Split assets among children",
                template: "Split everything equally among my children.",
                color: "bg-blue-100 border-blue-300 hover:bg-blue-200"
              },
              {
                title: "Everything to One Person",
                description: "Primary beneficiary with backup",
                template: "Everything goes to one person. If they die first, backup person inherits.",
                color: "bg-purple-100 border-purple-300 hover:bg-purple-200"
              },
              {
                title: "Custom Distribution",
                description: "Specific items to specific people",
                template: "Specific assets go to specific people as I will describe.",
                color: "bg-orange-100 border-orange-300 hover:bg-orange-200"
              }
            ].map((template, index) => (
              <button
                key={index}
                className={`w-full p-8 border-4 rounded-2xl text-left transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl ${template.color}`}
                onClick={() => {
                  setWillData(prev => ({ ...prev, template: template.template }));
                  setCurrentStep(2);
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{template.title}</h3>
                    <p className="text-lg opacity-80">{template.description}</p>
                  </div>
                  <div className="text-4xl">→</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Enter Details (Letter by Letter Interface)
  if (currentStep === 2) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const numbers = '0123456789'.split('');
    const symbols = [' ', '.', ',', '-', "'"];
    const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Enter Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Name Entry */}
              <div>
                <label className="text-lg font-bold mb-4 block">Your Full Legal Name:</label>
                <div className="bg-gray-100 p-4 rounded-lg mb-4 min-h-[60px] flex items-center">
                  <span className="text-xl">{willData.name || 'Click letters below to spell your name'}</span>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-9 gap-2">
                    {alphabet.map(letter => (
                      <button
                        key={letter}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-bold text-lg"
                        onClick={() => setWillData(prev => ({ ...prev, name: prev.name + letter }))}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-8 gap-2">
                    {numbers.concat(symbols).map((char, index) => (
                      <button
                        key={`${char}-${index}`}
                        className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded font-bold text-lg"
                        onClick={() => setWillData(prev => ({ ...prev, name: prev.name + char }))}
                      >
                        {char === ' ' ? 'SPACE' : char}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded font-bold"
                      onClick={() => setWillData(prev => ({ ...prev, name: prev.name.slice(0, -1) }))}
                    >
                      DELETE LAST LETTER
                    </button>
                    <button
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-bold"
                      onClick={() => setWillData(prev => ({ ...prev, name: '' }))}
                    >
                      CLEAR ALL
                    </button>
                  </div>
                </div>
              </div>

              {/* State Selection */}
              <div>
                <label className="text-lg font-bold mb-4 block">Your State:</label>
                <div className="bg-gray-100 p-4 rounded-lg mb-4 min-h-[60px] flex items-center">
                  <span className="text-xl">{willData.state || 'Click your state below'}</span>
                </div>
                
                <div className="grid grid-cols-10 gap-2">
                  {states.map(state => (
                    <button
                      key={state}
                      className={`p-3 rounded font-bold ${willData.state === state ? 'bg-green-500 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
                      onClick={() => setWillData(prev => ({ ...prev, state }))}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wishes Entry */}
              <div>
                <label className="text-lg font-bold mb-4 block">Describe Your Wishes:</label>
                <div className="bg-gray-100 p-4 rounded-lg mb-4 min-h-[120px]">
                  <span className="text-lg">{willData.wishes || willData.template || 'Use the alphabet below to describe your wishes'}</span>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-9 gap-2">
                    {alphabet.map(letter => (
                      <button
                        key={letter}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-bold text-lg"
                        onClick={() => setWillData(prev => ({ ...prev, wishes: (prev.wishes || prev.template) + letter }))}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-8 gap-2">
                    {numbers.concat(symbols).map((char, index) => (
                      <button
                        key={`wishes-${char}-${index}`}
                        className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded font-bold text-lg"
                        onClick={() => setWillData(prev => ({ ...prev, wishes: (prev.wishes || prev.template) + char }))}
                      >
                        {char === ' ' ? 'SPACE' : char}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded font-bold"
                      onClick={() => setWillData(prev => ({ ...prev, wishes: (prev.wishes || prev.template).slice(0, -1) }))}
                    >
                      DELETE LAST LETTER
                    </button>
                    <button
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-bold"
                      onClick={() => setWillData(prev => ({ ...prev, wishes: prev.template }))}
                    >
                      RESET TO TEMPLATE
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-8">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back to Templates
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={!willData.name || !willData.state}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                >
                  Create My Legal Will
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: Final Review and Generate
  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Review Your Will</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Will Details:</h3>
                <p><strong>Name:</strong> {willData.name}</p>
                <p><strong>State:</strong> {willData.state}</p>
                <p><strong>Wishes:</strong> {willData.wishes || willData.template}</p>
              </div>

              {willGenerated ? (
                <div className="bg-green-50 border-2 border-green-300 p-8 rounded-lg text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Will Created Successfully!</h3>
                  <p className="text-lg text-green-700 mb-4">Your legal will has been generated and saved.</p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Download className="mr-2 h-5 w-5" />
                    Download Legal Document
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Button 
                    onClick={generateWill}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl"
                    disabled={createWillMutation.isPending}
                  >
                    {createWillMutation.isPending ? 'Generating...' : 'Generate Legal Will'}
                  </Button>
                </div>
              )}

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Edit Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}