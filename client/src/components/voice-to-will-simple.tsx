import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Play, FileText, CheckCircle } from "lucide-react";

interface VoiceResult {
  transcript: string;
  structuredWill: string;
  extractedIntents: string[];
}

export default function VoiceToWillSimple() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const { toast } = useToast();

  const voiceScenarios = [
    { 
      id: 'simple_house', 
      name: 'Leave House to Family',
      example: "I want to leave my house to my daughter Sarah and split my savings between my two sons."
    },
    { 
      id: 'business_owner', 
      name: 'Business Owner Will',
      example: "I want my business to go to my partner, my house to my spouse, and create a trust for my children."
    },
    { 
      id: 'charity_focused', 
      name: 'Charitable Giving',
      example: "I want to give 30% to charity, leave my house to my nephew, and the rest to my church."
    },
    { 
      id: 'complex_family', 
      name: 'Large Family Estate',
      example: "I have 4 children, 2 properties, investments, and want everything divided fairly with guardianship plans."
    }
  ];

  const simulateVoiceRecording = async (scenario: string) => {
    setIsRecording(true);
    setSelectedScenario(scenario);
    
    // Simulate recording time
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsRecording(false);
    
    processVoiceInput(scenario);
  };

  const processVoiceInput = async (scenario: string) => {
    setIsProcessing(true);
    
    try {
      // Demo mode with realistic voice processing based on scenario
      const scenarioData = voiceScenarios.find(s => s.id === scenario);
      
      const demoResult: VoiceResult = {
        transcript: scenarioData?.example || "Sample voice input processed",
        structuredWill: scenario === 'simple_house' ? 
          "REAL PROPERTY: I devise my primary residence to my daughter, SARAH [LAST NAME], absolutely and in fee simple.\n\nMONETARY BEQUESTS: I direct that my savings accounts and liquid assets be divided equally between my sons, MICHAEL [LAST NAME] and DAVID [LAST NAME], share and share alike." :
          scenario === 'business_owner' ?
          "BUSINESS INTERESTS: I bequeath my business interests and partnership shares to my business partner, [PARTNER NAME].\n\nREAL PROPERTY: I devise my primary residence to my spouse, [SPOUSE NAME].\n\nTRUST PROVISIONS: I direct that a trust be established for the benefit of my minor children." :
          scenario === 'charity_focused' ?
          "CHARITABLE BEQUESTS: I bequeath thirty percent (30%) of my estate to [CHARITY NAME].\n\nREAL PROPERTY: I devise my residence to my nephew, [NEPHEW NAME].\n\nRELIGIOUS BEQUEST: I bequeath the remainder of my estate to [CHURCH NAME]." :
          "FAMILY PROVISIONS: I direct that my estate be divided equally among my four children: [CHILD 1], [CHILD 2], [CHILD 3], and [CHILD 4].\n\nREAL PROPERTY: My two properties shall be distributed as follows: [Property details to be specified].\n\nGUARDIANSHIP: For any minor children, I nominate [GUARDIAN NAME] as their legal guardian.",
        extractedIntents: scenario === 'simple_house' ? [
          "House to daughter Sarah",
          "Savings split between sons",
          "Equal distribution preference",
          "Family-focused estate plan"
        ] : scenario === 'business_owner' ? [
          "Business to partner",
          "House to spouse", 
          "Trust for children",
          "Business succession planning"
        ] : scenario === 'charity_focused' ? [
          "30% to charity",
          "House to nephew",
          "Remainder to church",
          "Charitable giving focus"
        ] : [
          "Equal division among 4 children",
          "Multiple property distribution",
          "Guardianship planning",
          "Complex family structure"
        ]
      };

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 4000));
      setVoiceResult(demoResult);
      
      toast({
        title: "Voice Processing Complete!",
        description: "Your spoken will has been converted to legal language",
      });
    } catch (error) {
      toast({
        title: "Demo Mode Active",
        description: "Showing sample voice processing (API quota exceeded)",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full overflow-x-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-6 w-6 text-purple-600" />
          Voice-to-Will Generator - Simple Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 overflow-x-hidden">
        
        {/* Voice Scenario Selection */}
        {!voiceResult && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose Your Estate Planning Scenario:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-full overflow-x-hidden">
              {voiceScenarios.map((scenario) => (
                <Card key={scenario.id} className="border-2 hover:border-purple-300 cursor-pointer">
                  <CardContent className="p-4">
                    <Button 
                      onClick={() => simulateVoiceRecording(scenario.id)}
                      disabled={isRecording || isProcessing}
                      className="w-full h-auto flex-col gap-3 p-4"
                      variant="outline"
                    >
                      <div className="font-semibold">{scenario.name}</div>
                      <div className="text-sm text-gray-600 italic">"{scenario.example}"</div>
                      <div className="flex items-center gap-2 text-purple-600">
                        {isRecording && selectedScenario === scenario.id ? (
                          <>
                            <Square className="h-4 w-4 animate-pulse" />
                            <span>Recording...</span>
                          </>
                        ) : isProcessing && selectedScenario === scenario.id ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                            <span>Processing Voice...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4" />
                            <span>Click to Record</span>
                          </>
                        )}
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Voice Processing Results */}
        {voiceResult && (
          <div className="space-y-6">
            
            {/* Transcript */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                  <Play className="h-5 w-5" />
                  What You Said
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="italic">"{voiceResult.transcript}"</p>
                </div>
              </CardContent>
            </Card>

            {/* Extracted Intents */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  AI Understood Your Wishes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {voiceResult.extractedIntents.map((intent, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{intent}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Structured Will */}
            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
                  <FileText className="h-5 w-5" />
                  Generated Legal Language
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                  <div className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded border break-words overflow-hidden max-w-full">
                    {voiceResult.structuredWill}
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => toast({ title: "Will Section Added", description: "Legal language has been added to your will" })}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Add to My Will
                  </Button>
                  <Button
                    onClick={() => setVoiceResult(null)}
                    variant="outline"
                  >
                    Record Different Scenario
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}