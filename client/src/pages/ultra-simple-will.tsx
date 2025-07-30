import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Download } from 'lucide-react';

export default function UltraSimpleWill() {
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [situation, setSituation] = useState('');
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
      console.log('Generating will with data:', { name, state, situation });
      
      const willData = {
        title: `Last Will and Testament of ${name}`,
        state: state,
        personalInfo: {
          fullName: name,
          state: state,
          city: 'Not specified',
          maritalStatus: 'single'
        },
        executors: [],
        assets: [],
        status: "ai_generated",
        completionPercentage: 100,
        aiGenerated: true,
        originalDescription: situation,
        // Add the raw data for AI processing
        aiPrompt: `Create a legal will for ${name} in ${state}. Their wishes: ${situation}`,
        userInput: {
          name: name,
          state: state,
          wishes: situation
        }
      };

      console.log('Sending will data:', willData);
      const result = await createWillMutation.mutateAsync(willData);
      console.log('Will creation result:', result);
      
      setWillGenerated(true);
      
      toast({
        title: "Will Created Successfully!",
        description: `Your legal will for ${name} has been generated and saved.`,
      });
    } catch (error) {
      console.error('Will generation error:', error);
      toast({
        title: "Error", 
        description: "Failed to create will. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (willGenerated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-24 w-24 mx-auto mb-6 text-green-600" />
              <h1 className="text-4xl font-bold text-green-800 mb-4">Will Created Successfully!</h1>
              <p className="text-xl text-green-700 mb-8">Your legal will for {name} has been generated and saved.</p>
              <div className="space-y-4">
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-4 mr-4"
                >
                  <Download className="mr-2 h-6 w-6" />
                  View Your Will
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">Create Your Legal Will</h1>
          <p className="text-2xl text-gray-600">Three simple steps to legal peace of mind</p>
        </div>

        <Card className="shadow-2xl">
          <CardContent className="p-12 space-y-12">
            
            {/* Step 1: Name Entry with Large Keyboard */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Step 1: Enter Your Full Legal Name</h2>
                <div className="bg-blue-50 p-8 rounded-xl border-4 border-blue-200 mb-6">
                  <div className="text-3xl font-bold text-blue-800 min-h-[60px] flex items-center justify-center">
                    {name || 'Click letters below to spell your name'}
                  </div>
                </div>
              </div>

              {/* Extra Large QWERTY Keyboard */}
              <div className="space-y-4">
                <div className="flex justify-center gap-3 flex-wrap">
                  {['Q','W','E','R','T','Y','U','I','O','P'].map(letter => (
                    <button
                      key={letter}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-xl text-2xl min-w-[70px] min-h-[70px] shadow-lg transition-all transform hover:scale-105"
                      onClick={() => setName(prev => prev + letter)}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center gap-3 flex-wrap">
                  {['A','S','D','F','G','H','J','K','L'].map(letter => (
                    <button
                      key={letter}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-xl text-2xl min-w-[70px] min-h-[70px] shadow-lg transition-all transform hover:scale-105"
                      onClick={() => setName(prev => prev + letter)}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center gap-3 flex-wrap">
                  {['Z','X','C','V','B','N','M'].map(letter => (
                    <button
                      key={letter}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-xl text-2xl min-w-[70px] min-h-[70px] shadow-lg transition-all transform hover:scale-105"
                      onClick={() => setName(prev => prev + letter)}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center gap-6">
                <button
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl text-xl"
                  onClick={() => setName(prev => prev + ' ')}
                >
                  SPACE
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl text-xl"
                  onClick={() => setName(prev => prev.slice(0, -1))}
                >
                  DELETE
                </button>
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl text-xl"
                  onClick={() => setName('')}
                >
                  CLEAR
                </button>
              </div>
            </div>

            {/* Step 2: State Selection */}
            <div className="space-y-6 border-t-4 border-gray-200 pt-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Step 2: Select Your State</h2>
                <div className="bg-green-50 p-8 rounded-xl border-4 border-green-200 mb-6">
                  <div className="text-3xl font-bold text-green-800 min-h-[60px] flex items-center justify-center">
                    {state ? `Selected: ${state}` : 'Click your state below'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-10 gap-3">
                {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(stateCode => (
                  <button
                    key={stateCode}
                    className={`p-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                      state === stateCode 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => setState(stateCode)}
                  >
                    {stateCode}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Situation Selection */}
            <div className="space-y-6 border-t-4 border-gray-200 pt-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Step 3: Choose Your Situation</h2>
                <div className="bg-purple-50 p-8 rounded-xl border-4 border-purple-200 mb-6">
                  <div className="text-2xl font-bold text-purple-800 min-h-[60px] flex items-center justify-center">
                    {situation || 'Select the option that best describes your wishes'}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
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
                ].map((option, index) => (
                  <button
                    key={index}
                    className={`p-8 border-4 rounded-2xl text-left transition-all transform hover:scale-105 ${
                      situation === option.template
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                    onClick={() => setSituation(option.template)}
                  >
                    <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                    <p className="text-gray-600">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center pt-12 border-t-4 border-gray-200">
              <Button 
                onClick={generateWill}
                disabled={!name.trim() || !state || !situation || createWillMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white text-3xl px-16 py-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all"
              >
                {createWillMutation.isPending ? 'Generating...' : 'Create My Legal Will'}
              </Button>
              
              <div className="mt-6 text-lg text-gray-600">
                {!name.trim() && <p>⏸ Enter your name above</p>}
                {name.trim() && !state && <p>⏸ Select your state above</p>}
                {name.trim() && state && !situation && <p>⏸ Choose your situation above</p>}
                {name.trim() && state && situation && <p>✅ Ready to generate your legal will!</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}