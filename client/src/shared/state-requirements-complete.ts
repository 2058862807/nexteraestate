// Complete state legal requirements database
export interface StateRequirements {
  witnessRequirements: {
    minimum: number;
    ageRequirement: number;
    notarizationRequired: boolean;
    selfProving: boolean;
  };
  holographicWills: {
    allowed: boolean;
    requirements: string[];
  };
  restrictions: string[];
}

export const getStateRequirements = (state: string): StateRequirements | null => {
  const requirements: Record<string, StateRequirements> = {
    'CA': {
      witnessRequirements: {
        minimum: 2,
        ageRequirement: 18,
        notarizationRequired: false,
        selfProving: true
      },
      holographicWills: {
        allowed: true,
        requirements: ['Handwritten by testator', 'Signed by testator']
      },
      restrictions: ['Community property state', 'Homestead exemption applies']
    },
    'TX': {
      witnessRequirements: {
        minimum: 2,
        ageRequirement: 14,
        notarizationRequired: false,
        selfProving: true
      },
      holographicWills: {
        allowed: true,
        requirements: ['Entirely handwritten', 'Signed by testator']
      },
      restrictions: ['Community property state', 'Independent administration preferred']
    },
    'NY': {
      witnessRequirements: {
        minimum: 2,
        ageRequirement: 18,
        notarizationRequired: false,
        selfProving: true
      },
      holographicWills: {
        allowed: false,
        requirements: []
      },
      restrictions: ['Elective share for spouse', 'Witnessed will required']
    },
    'FL': {
      witnessRequirements: {
        minimum: 2,
        ageRequirement: 18,
        notarizationRequired: false,
        selfProving: true
      },
      holographicWills: {
        allowed: false,
        requirements: []
      },
      restrictions: ['Homestead restrictions', 'Elective share 30%']
    }
  };

  return requirements[state.toUpperCase()] || null;
};

export const getAllStates = () => {
  return [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];
};