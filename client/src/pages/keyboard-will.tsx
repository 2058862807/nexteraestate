import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { FileText, Download, Delete, Space } from 'lucide-react';

export default function KeyboardWill() {
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [wishes, setWishes] = useState('');
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
    if (!name || !state) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and select your state.",
        variant: "destructive",
      });
      return;
    }

    try {
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
        originalDescription: wishes || `I, ${name}, want my assets distributed according to my wishes.`,
      };

      await createWillMutation.mutateAsync(willData);
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

  const KeyboardRow = ({ letters, target }: { letters: string[], target: 'name' | 'wishes' }) => (
    <div className="flex flex-wrap justify-center gap-2 mb-3">
      {letters.map((letter, index) => (
        <button
          key={`${letter}-${index}`}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded text-lg min-w-[50px] h-[50px] flex items-center justify-center"
          onClick={() => {
            if (target === 'name') {
              setName(prev => prev + letter);
            } else {
              setWishes(prev => prev + letter);
            }
          }}
        >
          {letter}
        </button>
      ))}
    </div>
  );

  const SpecialKeys = ({ target }: { target: 'name' | 'wishes' }) => (
    <div className="flex justify-center gap-2 mb-4">
      <button
        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded flex items-center gap-2"
        onClick={() => {
          if (target === 'name') {
            setName(prev => prev + ' ');
          } else {
            setWishes(prev => prev + ' ');
          }
        }}
      >
        <Space size={20} />
        SPACE
      </button>
      <button
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded flex items-center gap-2"
        onClick={() => {
          if (target === 'name') {
            setName(prev => prev.slice(0, -1));
          } else {
            setWishes(prev => prev.slice(0, -1));
          }
        }}
      >
        <Delete size={20} />
        DELETE
      </button>
      <button
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded"
        onClick={() => {
          if (target === 'name') {
            setName('');
          } else {
            setWishes('');
          }
        }}
      >
        CLEAR
      </button>
    </div>
  );

  if (willGenerated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-24 w-24 mx-auto mb-6 text-green-600" />
              <h1 className="text-4xl font-bold text-green-800 mb-4">Will Created Successfully!</h1>
              <p className="text-xl text-green-700 mb-8">Your legal will for {name} has been generated and saved.</p>
              <Button className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-4">
                <Download className="mr-2 h-6 w-6" />
                Download Legal Document
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Create Will - Keyboard Interface</h1>
          <p className="text-xl text-gray-600">Click the letters below to enter your information</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Name Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Enter Your Full Legal Name</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-6 rounded-lg mb-6 min-h-[80px] flex items-center">
                <span className="text-2xl font-bold text-blue-800">
                  {name || 'Click letters below to spell your name'}
                </span>
              </div>
              
              <KeyboardRow letters={['Q','W','E','R','T','Y','U','I','O','P']} target="name" />
              <KeyboardRow letters={['A','S','D','F','G','H','J','K','L']} target="name" />
              <KeyboardRow letters={['Z','X','C','V','B','N','M']} target="name" />
              <SpecialKeys target="name" />
            </CardContent>
          </Card>

          {/* State Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Select Your State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-6 rounded-lg mb-6 min-h-[80px] flex items-center">
                <span className="text-2xl font-bold text-blue-800">
                  {state || 'Click your state below'}
                </span>
              </div>
              
              <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
                  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
                  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
                  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
                  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(stateCode => (
                  <button
                    key={stateCode}
                    className={`p-3 rounded font-bold text-lg ${
                      state === stateCode ? 'bg-green-500 text-white' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => setState(stateCode)}
                  >
                    {stateCode}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wishes Entry */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Describe Your Wishes (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-6 rounded-lg mb-6 min-h-[120px]">
              <span className="text-lg text-gray-800">
                {wishes || 'Use the keyboard below to describe how you want your assets distributed'}
              </span>
            </div>
            
            <KeyboardRow letters={['Q','W','E','R','T','Y','U','I','O','P']} target="wishes" />
            <KeyboardRow letters={['A','S','D','F','G','H','J','K','L']} target="wishes" />
            <KeyboardRow letters={['Z','X','C','V','B','N','M']} target="wishes" />
            <KeyboardRow letters={['1','2','3','4','5','6','7','8','9','0']} target="wishes" />
            <KeyboardRow letters={['.', ',', '!', '?', ';', ':', "'", '"']} target="wishes" />
            <SpecialKeys target="wishes" />
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="text-center mt-8">
          <Button 
            onClick={generateWill}
            disabled={!name || !state || createWillMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white text-2xl px-12 py-6"
          >
            {createWillMutation.isPending ? 'Generating...' : 'Create My Legal Will'}
          </Button>
          
          {(!name || !state) && (
            <p className="text-red-600 mt-4 text-lg">
              Please enter your name and select your state to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}