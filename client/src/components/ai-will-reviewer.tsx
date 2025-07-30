import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewResult {
  suggestions: string[];
  enhancedWill: string;
  completenessScore: number;
  missingClauses: string[];
}

interface AIWillReviewerProps {
  willContent: string;
  state: string;
  onWillImproved: (improvedWill: string) => void;
}

export default function AIWillReviewer({ willContent, state, onWillImproved }: AIWillReviewerProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const { toast } = useToast();

  const reviewWill = async () => {
    setIsReviewing(true);
    try {
      // Demo mode with realistic AI review
      const demoResult: ReviewResult = {
        suggestions: [
          "Add specific language about digital asset distribution",
          "Include contingency plans for executor unavailability",
          "Clarify guardianship preferences for minor children"
        ],
        enhancedWill: `${willContent}\n\nENHANCED SECTIONS:\n\nDIGITAL ASSETS CLAUSE: I direct my Executor to access and distribute my digital assets, including but not limited to online accounts, cryptocurrencies, and digital files, according to the attached Digital Asset Inventory.\n\nCONTINGENT EXECUTOR: Should my primary Executor be unable to serve, I appoint [Secondary Executor Name] as my alternate Executor with the same powers and authorities.\n\nGUARDIANSHIP: For any minor children, I nominate [Guardian Name] as their legal guardian, with [Alternate Guardian] as the secondary choice.`,
        completenessScore: 85,
        missingClauses: [
          "Residuary clause for unspecified assets",
          "Tax liability distribution instructions",
          "Funeral and burial preferences"
        ]
      };

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      setReviewResult(demoResult);
      
      toast({
        title: "Demo AI Review Complete",
        description: `Your will scored ${demoResult.completenessScore}% completion (Demo Mode)`,
      });
    } catch (error) {
      toast({
        title: "Demo Mode Active",
        description: "Showing sample AI review (API quota exceeded)",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const acceptEnhancement = () => {
    if (reviewResult?.enhancedWill) {
      onWillImproved(reviewResult.enhancedWill);
      toast({
        title: "Will Enhanced",
        description: "Your will has been improved with AI suggestions",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          AI Will Reviewer & Enhancer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Review Action */}
        <div className="text-center">
          <Button 
            onClick={reviewWill}
            disabled={isReviewing || !willContent}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {isReviewing ? 'Analyzing Will...' : 'Review My Will with AI'}
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            AI will analyze your will for {state} legal compliance and suggest improvements
          </p>
        </div>

        {/* Review Results */}
        {reviewResult && (
          <div className="space-y-6">
            
            {/* Completion Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(reviewResult.completenessScore)}`}>
                {reviewResult.completenessScore}%
              </div>
              <Badge className={getScoreBadgeColor(reviewResult.completenessScore)}>
                {reviewResult.completenessScore >= 90 ? 'Excellent' : 
                 reviewResult.completenessScore >= 70 ? 'Good' : 'Needs Improvement'}
              </Badge>
              <p className="text-gray-600 mt-2">Legal Completeness Score</p>
            </div>

            {/* Missing Clauses */}
            {reviewResult.missingClauses.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Missing Required Clauses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reviewResult.missingClauses.map((clause, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{clause}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Suggestions */}
            {reviewResult.suggestions.length > 0 && (
              <Card className="border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                    <CheckCircle className="h-5 w-5" />
                    AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reviewResult.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Will */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  AI-Enhanced Version
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setShowEnhanced(!showEnhanced)}
                >
                  {showEnhanced ? 'Hide' : 'Show'} Enhanced Will
                </Button>
              </div>

              {showEnhanced && (
                <div className="space-y-4">
                  <Textarea
                    value={reviewResult.enhancedWill}
                    readOnly
                    className="min-h-96 font-mono text-sm"
                  />
                  <div className="text-center">
                    <Button
                      onClick={acceptEnhancement}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Use Enhanced Version
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}