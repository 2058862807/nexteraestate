import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Scale,
  FileText,
  Users,
  Clock,
  MapPin
} from 'lucide-react';

interface LegalComplianceProps {
  willData: any;
  onComplianceChange?: (compliant: boolean, violations: string[]) => void;
}

export default function LegalComplianceChecker({ willData, onComplianceChange }: LegalComplianceProps) {
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState(willData?.personalInfo?.state || '');
  const [validationResult, setValidationResult] = useState<any>(null);

  // US States for dropdown
  const US_STATES = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
  ];

  // Get state requirements
  const { data: stateRequirements, isLoading: requirementsLoading } = useQuery({
    queryKey: ['/api/legal/states', selectedState, 'requirements'],
    queryFn: async () => {
      if (!selectedState) return null;
      return await apiRequest('GET', `/api/legal/states/${selectedState}/requirements`);
    },
    enabled: !!selectedState
  });

  // Validate will compliance
  const validateComplianceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedState || !willData) throw new Error('State and will data required');
      return await apiRequest('POST', `/api/legal/validate/${selectedState}`, willData);
    },
    onSuccess: (data) => {
      setValidationResult(data.validation);
      onComplianceChange?.(data.validation.compliant, data.validation.violations);
      
      toast({
        title: data.validation.compliant ? "Compliance Check Passed" : "Compliance Issues Found",
        description: data.validation.compliant 
          ? "Your will meets all legal requirements for this state."
          : `${data.validation.violations.length} violation(s) and ${data.validation.warnings.length} warning(s) found.`,
        variant: data.validation.compliant ? "default" : "destructive"
      });
    },
    onError: (error) => {
      toast({
        title: "Compliance Check Failed",
        description: "Unable to validate will compliance. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Auto-validate when state or will data changes
  useEffect(() => {
    if (selectedState && willData && Object.keys(willData).length > 0) {
      validateComplianceMutation.mutate();
    }
  }, [selectedState, willData]);

  const getComplianceIcon = (compliant: boolean) => {
    return compliant ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getStatusColor = (compliant: boolean) => {
    return compliant ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* State Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scale className="h-5 w-5 mr-2" />
            Legal Compliance Checker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Select State for Legal Requirements
              </label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your state of residence" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(state => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name} ({state.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedState && (
              <Button 
                onClick={() => validateComplianceMutation.mutate()}
                disabled={validateComplianceMutation.isPending || !willData}
                className="w-full"
              >
                {validateComplianceMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Checking Compliance...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Check Legal Compliance
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* State Requirements */}
      {stateRequirements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              {stateRequirements.stateName} Legal Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Witness Requirements
                </h4>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• {stateRequirements.requirements.witnessRequirements.minimumWitnesses} witnesses required</li>
                  <li>• Minimum age: {stateRequirements.requirements.witnessRequirements.witnessAgeRequirement}</li>
                  <li>• Notarization: {stateRequirements.requirements.witnessRequirements.notarizationRequired ? 'Required' : 'Not required'}</li>
                  <li>• Self-proving affidavit: {stateRequirements.requirements.witnessRequirements.selfProvingAffidavit ? 'Available' : 'Not available'}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Will Types
                </h4>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• Holographic wills: {stateRequirements.requirements.holographicWills.allowed ? 'Allowed' : 'Not allowed'}</li>
                  {stateRequirements.requirements.holographicWills.allowed && 
                    stateRequirements.requirements.holographicWills.requirements.map((req: string, index: number) => (
                      <li key={index}>• {req.replace(/_/g, ' ')}</li>
                    ))
                  }
                </ul>
              </div>
            </div>

            {stateRequirements.requirements.restrictions.length > 0 && (
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  State-Specific Restrictions
                </h4>
                <ul className="text-sm text-neutral-600 space-y-1">
                  {stateRequirements.requirements.restrictions.map((restriction: string, index: number) => (
                    <li key={index}>• {restriction.replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center text-xs text-neutral-500">
              <Clock className="h-3 w-3 mr-1" />
              Last updated: {new Date(stateRequirements.lastUpdated).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                {getComplianceIcon(validationResult.compliant)}
                <span className="ml-2">Compliance Status</span>
              </span>
              <Badge className={getStatusColor(validationResult.compliant)}>
                {validationResult.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Violations */}
            {validationResult.violations.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="font-semibold mb-2">Legal Violations ({validationResult.violations.length})</div>
                  <ul className="space-y-1">
                    {validationResult.violations.map((violation: string, index: number) => (
                      <li key={index} className="text-sm">• {violation}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="font-semibold mb-2">Warnings ({validationResult.warnings.length})</div>
                  <ul className="space-y-1">
                    {validationResult.warnings.map((warning: string, index: number) => (
                      <li key={index} className="text-sm">• {warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Required Actions */}
            {validationResult.requiredActions.length > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="font-semibold mb-2">Required Actions ({validationResult.requiredActions.length})</div>
                  <ul className="space-y-1">
                    {validationResult.requiredActions.map((action: string, index: number) => (
                      <li key={index} className="text-sm">• {action}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Recommendations */}
            {validationResult.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-neutral-800 mb-2">Recommendations</h4>
                <ul className="text-sm text-neutral-600 space-y-1">
                  {validationResult.recommendations.map((recommendation: string, index: number) => (
                    <li key={index}>• {recommendation}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.compliant && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="font-semibold mb-2">Compliance Verified</div>
                  <p className="text-sm">
                    Your will meets all legal requirements for {stateRequirements?.stateName}. 
                    The will has been blockchain-notarized for additional security and verification.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legal Disclaimer */}
      <Card className="bg-neutral-50 border-neutral-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-neutral-500 mt-0.5" />
            <div className="text-sm text-neutral-600">
              <div className="font-semibold mb-1">Legal Disclaimer</div>
              <p>
                This compliance checker provides general information about state requirements and does not constitute legal advice. 
                Laws can change, and individual circumstances may require specific legal guidance. We recommend consulting with 
                a qualified estate planning attorney in your state for personalized advice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}