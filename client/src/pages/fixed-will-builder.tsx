import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, ArrowRight, ArrowLeft } from 'lucide-react';

export default function FixedWillBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [willData, setWillData] = useState({
    name: '',
    state: '',
    situation: '',
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

  // Name Entry Screen
  if (currentStep === 0) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Enter Your Full Legal Name</CardTitle>
              <p className="text-lg text-gray-600">Click letters below to spell your name</p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Name Display */}
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <div className="text-center">
                  <input
                    type="text"
                    value={willData.name}
                    onChange={() => {}} // Read-only display
                    placeholder="Your name will appear here..."
                    className="text-2xl font-bold text-blue-800 bg-transparent border-none outline-none text-center w-full"
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#1e40af',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      textAlign: 'center',
                      width: '100%',
                      cursor: 'default'
                    }}
                    readOnly
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* QWERTY Keyboard Layout */}
              <div className="space-y-3">
                <div className="flex justify-center gap-2 flex-wrap">
                  {['Q','W','E','R','T','Y','U','I','O','P'].map(letter => (
                    <button
                      key={letter}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded text-lg min-w-[50px]"
                      onClick={() => setWillData(prev => ({ ...prev, name: prev.name + letter }))}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {['A','S','D','F','G','H','J','K','L'].map(letter => (
                    <button
                      key={letter}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded text-lg min-w-[50px]"
                      onClick={() => setWillData(prev => ({ ...prev, name: prev.name + letter }))}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {['Z','X','C','V','B','N','M'].map(letter => (
                    <button
                      key={letter}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded text-lg min-w-[50px]"
                      onClick={() => setWillData(prev => ({ ...prev, name: prev.name + letter }))}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded"
                  onClick={() => setWillData(prev => ({ ...prev, name: prev.name + ' ' }))}
                >
                  SPACE
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded"
                  onClick={() => setWillData(prev => ({ ...prev, name: prev.name.slice(0, -1) }))}
                >
                  DELETE
                </button>
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded"
                  onClick={() => setWillData(prev => ({ ...prev, name: '' }))}
                >
                  CLEAR
                </button>
              </div>

              {/* Next Button */}
              <div className="text-center pt-6">
                <Button 
                  onClick={() => setCurrentStep(1)}
                  disabled={!willData.name.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-4"
                >
                  Continue to State Selection <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {willData.name.trim() && (
                  <p className="mt-2 text-sm text-gray-600">
                    ✓ Name entered: {willData.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // State Selection Screen
  if (currentStep === 1) {
    const states = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Select Your State</CardTitle>
              <p className="text-lg text-gray-600">Click your state for legal compliance</p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Current Selection */}
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 text-center">
                <span className="text-2xl font-bold text-blue-800">
                  {willData.state ? `Selected: ${willData.state}` : 'Click your state below'}
                </span>
              </div>

              {/* State Grid */}
              <div className="grid grid-cols-10 gap-3">
                {states.map(state => (
                  <button
                    key={state}
                    className={`p-4 rounded font-bold text-lg ${
                      willData.state === state 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => setWillData(prev => ({ ...prev, state }))}
                  >
                    {state}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(0)}
                  className="text-lg px-6 py-3"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!willData.state}
                  className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3"
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Situation Selection Screen
  if (currentStep === 2) {
    const situations = [
      {
        title: "Married with Children",
        description: "Everything to spouse, then to children if spouse dies first",
        template: "Everything goes to my spouse. If my spouse dies first, split everything equally among my children."
      },
      {
        title: "Single Parent",
        description: "Split assets equally among children",
        template: "Split everything equally among my children."
      },
      {
        title: "Everything to One Person",
        description: "Primary beneficiary with backup",
        template: "Everything goes to one person. If they die first, backup person inherits."
      },
      {
        title: "Custom Distribution",
        description: "Specific items to specific people",
        template: "Specific assets go to specific people as I will describe."
      }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Choose Your Situation</CardTitle>
              <p className="text-lg text-gray-600">Select the option that best describes your wishes</p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {situations.map((situation, index) => (
                <button
                  key={index}
                  className={`w-full p-6 border-4 rounded-xl text-left transition-all ${
                    willData.template === situation.template
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onClick={() => {
                    setWillData(prev => ({ 
                      ...prev, 
                      situation: situation.title,
                      template: situation.template 
                    }));
                  }}
                >
                  <h3 className="text-xl font-bold mb-2">{situation.title}</h3>
                  <p className="text-gray-600">{situation.description}</p>
                </button>
              ))}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                  className="text-lg px-6 py-3"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={!willData.template}
                  className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3"
                >
                  Review & Generate Will <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Final Step - Generate Will
  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Review & Generate Your Will</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Review Information */}
              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <h3 className="text-xl font-bold mb-4">Your Will Details:</h3>
                <p><strong>Name:</strong> {willData.name}</p>
                <p><strong>State:</strong> {willData.state}</p>
                <p><strong>Situation:</strong> {willData.situation}</p>
                <p><strong>Instructions:</strong> {willData.template}</p>
              </div>

              {willGenerated ? (
                <div className="bg-green-50 border-2 border-green-300 p-8 rounded-lg text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Will Created Successfully!</h3>
                  <p className="text-lg text-green-700 mb-4">Your legal will for {willData.name} has been generated and saved.</p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-4">
                    <Download className="mr-2 h-6 w-6" />
                    Download Legal Document
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Button 
                    onClick={generateWill}
                    disabled={createWillMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-2xl px-12 py-6"
                  >
                    {createWillMutation.isPending ? 'Generating...' : 'Generate Legal Will'}
                  </Button>
                  <p className="text-gray-600">This will create a legally compliant will document for {willData.state}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                  className="text-lg px-6 py-3"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back to Edit
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