export interface WillData {
  personalInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    dateOfBirth?: string;
  };
  executors: Array<{
    name: string;
    relationship: string;
    address: string;
  }>;
  beneficiaries: Array<{
    name: string;
    relationship: string;
    percentage: number;
  }>;
  assets: Array<{
    type: string;
    description: string;
    value: number;
  }>;
}

export const generateLegalWill = (willData: WillData): string => {
  const { personalInfo, executors, beneficiaries } = willData;
  
  return `
LAST WILL AND TESTAMENT OF ${personalInfo.name.toUpperCase()}

I, ${personalInfo.name}, of ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state}, being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament.

ARTICLE I - REVOCATION
I hereby revoke all former wills and codicils made by me.

ARTICLE II - EXECUTOR
I nominate and appoint ${executors[0]?.name || '[EXECUTOR NAME]'} as Executor of this my Last Will and Testament.

ARTICLE III - DISTRIBUTIONS
I give, devise, and bequeath my estate as follows:
${beneficiaries.map(b => `- ${b.percentage}% to ${b.name} (${b.relationship})`).join('\n')}

IN WITNESS WHEREOF, I have subscribed my name to this Will.

                                        _________________________________
                                        ${personalInfo.name}, Testator

Witnesses:
_________________________________    _________________________________
Witness 1                           Witness 2
  `;
};

export const generateWitnessInstructions = (state: string): string[] => {
  return [
    `This will must be signed by the testator in the presence of two witnesses in ${state}.`,
    'Witnesses must be at least 18 years old (14 in Texas).',
    'Witnesses should not be beneficiaries of the will.',
    'All parties should sign on the same day.',
    'Consider adding a self-proving affidavit to simplify probate.'
  ];
};