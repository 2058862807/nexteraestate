export interface AIWillSuggestion {
  section: string;
  suggestion: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export const generateSmartDefaults = (personalInfo: any): any => {
  const defaults: any = {
    executors: [],
    guardians: [],
    beneficiaries: [],
    assets: []
  };

  // Smart executor suggestions
  if (personalInfo.maritalStatus === 'married') {
    defaults.executors.push({
      name: personalInfo.spouseName || '[Spouse Name]',
      relationship: 'spouse',
      primary: true
    });
  }

  // Default beneficiary structure
  if (personalInfo.children?.length > 0) {
    const childPercentage = personalInfo.maritalStatus === 'married' ? 50 : 100;
    const perChild = childPercentage / personalInfo.children.length;
    
    personalInfo.children.forEach((child: any) => {
      defaults.beneficiaries.push({
        name: child.name,
        relationship: 'child',
        percentage: perChild
      });
    });
  }

  if (personalInfo.maritalStatus === 'married') {
    defaults.beneficiaries.push({
      name: personalInfo.spouseName || '[Spouse Name]',
      relationship: 'spouse',
      percentage: 50
    });
  }

  return defaults;
};

export const generateAISuggestions = (willData: any): AIWillSuggestion[] => {
  const suggestions: AIWillSuggestion[] = [];

  // Check for missing executors
  if (!willData.executors || willData.executors.length === 0) {
    suggestions.push({
      section: 'executors',
      suggestion: 'Add at least one executor to manage your estate',
      reasoning: 'An executor is required to handle your affairs after death',
      priority: 'high'
    });
  }

  // Check for backup executor
  if (willData.executors?.length === 1) {
    suggestions.push({
      section: 'executors',
      suggestion: 'Consider naming a backup executor',
      reasoning: 'If your primary executor cannot serve, a backup ensures continuity',
      priority: 'medium'
    });
  }

  // Check beneficiary percentages
  const totalPercentage = willData.beneficiaries?.reduce((sum: number, b: any) => sum + (b.percentage || 0), 0) || 0;
  if (totalPercentage !== 100) {
    suggestions.push({
      section: 'beneficiaries',
      suggestion: `Beneficiary percentages total ${totalPercentage}% instead of 100%`,
      reasoning: 'All assets should be allocated to ensure clear distribution',
      priority: 'high'
    });
  }

  // Suggest healthcare directive
  if (!willData.healthcareDirective) {
    suggestions.push({
      section: 'healthcare',
      suggestion: 'Consider adding healthcare directives',
      reasoning: 'Healthcare directives ensure your medical wishes are followed',
      priority: 'medium'
    });
  }

  return suggestions;
};