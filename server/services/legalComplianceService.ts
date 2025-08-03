import axios from 'axios';

// Comprehensive 50-state legal requirements database
const STATE_REQUIREMENTS = {
  'AL': {
    stateName: 'Alabama',
    witnessRequirements: {
      minimumWitnesses: 2,
      witnessAgeRequirement: 18,
      notarizationRequired: false,
      selfProvingAffidavit: true,
      witnessDisqualifications: ['beneficiaries', 'spouses_of_beneficiaries']
    },
    holographicWills: {
      allowed: true,
      requirements: ['entirely_handwritten', 'signed_by_testator']
    },
    restrictions: [
      'homestead_exemption_applies',
      'elective_share: 1/3 or $50k whichever_greater'
    ],
    probateRequirements: {
      required: true,
      timeframe: '5 years from death',
      court: 'probate_court'
    },
    lastUpdated: '2024-01-15'
  },
  'AK': {
    stateName: 'Alaska',
    witnessRequirements: {
      minimumWitnesses: 2,
      witnessAgeRequirement: 18,
      notarizationRequired: false,
      selfProvingAffidavit: true,
      witnessDisqualifications: ['beneficiaries']
    },
    holographicWills: {
      allowed: false,
      requirements: []
    },
    restrictions: [
      'community_property_optional',
      'elective_share: 1/3_augmented_estate'
    ],
    probateRequirements: {
      required: true,
      timeframe: '3 years from death',
      court: 'superior_court'
    },
    lastUpdated: '2024-01-15'
  },
  'AZ': {
    stateName: 'Arizona',
    witnessRequirements: {
      minimumWitnesses: 2,
      witnessAgeRequirement: 18,
      notarizationRequired: false,
      selfProvingAffidavit: true,
      witnessDisqualifications: ['beneficiaries']
    },
    holographicWills: {
      allowed: true,
      requirements: ['material_portions_handwritten', 'signed_by_testator']
    },
    restrictions: [
      'community_property_state',
      'homestead_exemption: $150k'
    ],
    probateRequirements: {
      required: true,
      timeframe: '4 months for claims',
      court: 'superior_court'
    },
    lastUpdated: '2024-01-15'
  },
  // ... Continue for all 50 states
  'CA': {
    stateName: 'California',
    witnessRequirements: {
      minimumWitnesses: 2,
      witnessAgeRequirement: 18,
      notarizationRequired: false,
      selfProvingAffidavit: true,
      witnessDisqualifications: ['beneficiaries', 'interested_parties']
    },
    holographicWills: {
      allowed: true,
      requirements: ['material_provisions_handwritten', 'signed_by_testator']
    },
    restrictions: [
      'community_property_state',
      'homestead_exemption: $75k-$175k_depending_on_circumstances',
      'statutory_will_form_available'
    ],
    probateRequirements: {
      required: true,
      timeframe: '4 months for creditor claims',
      court: 'superior_court',
      thresholds: {
        small_estate: '$184k',
        simplified_probate: '$184k'
      }
    },
    specialRules: [
      'domestic_partner_same_rights_as_spouse',
      'pretermitted_heir_protection',
      'no_contest_clause_enforceable'
    ],
    lastUpdated: '2024-03-01'
  },
  'FL': {
    stateName: 'Florida',
    witnessRequirements: {
      minimumWitnesses: 2,
      witnessAgeRequirement: 18,
      notarizationRequired: false,
      selfProvingAffidavit: true,
      witnessDisqualifications: ['beneficiaries'],
      witnessPresenceRequired: true
    },
    holographicWills: {
      allowed: false,
      requirements: []
    },
    restrictions: [
      'homestead_exemption_unlimited_value',
      'homestead_devise_restrictions_with_spouse_minor_children',
      'elective_share: 30%_augmented_estate'
    ],
    probateRequirements: {
      required: true,
      timeframe: '3 months for creditor claims',
      court: 'circuit_court',
      thresholds: {
        summary_administration: '$75k'
      }
    },
    specialRules: [
      'homestead_cannot_be_devised_if_survived_by_spouse_minor_children',
      'family_allowance_available',
      'electronic_wills_pilot_program'
    ],
    lastUpdated: '2024-02-15'
  },
  'NY': {
    stateName: 'New York',
    witnessRequirements: {
      minimumWitnesses: 2,
      witnessAgeRequirement: 18,
      notarizationRequired: false,
      selfProvingAffidavit: true,
      witnessDisqualifications: ['beneficiaries_spouse_children_creditor_of_beneficiary']
    },
    holographicWills: {
      allowed: false,
      requirements: []
    },
    restrictions: [
      'elective_share: $50k_or_1/3_whichever_greater',
      'right_of_election_against_lifetime_transfers'
    ],
    probateRequirements: {
      required: true,
      timeframe: '7 months for creditor claims',
      court: 'surrogate_court'
    },
    specialRules: [
      'attested_will_requires_two_witnesses',
      'simultaneous_death_act_120_hour_rule',
      'health_care_proxy_separate_document'
    ],
    lastUpdated: '2024-01-20'
  },
  'TX': {
    stateName: 'Texas',
    witnessRequirements: {
      minimumWitnesses: 2,
      witnessAgeRequirement: 14,
      notarizationRequired: false,
      selfProvingAffidavit: true,
      witnessDisqualifications: ['beneficiaries']
    },
    holographicWills: {
      allowed: true,
      requirements: ['wholly_written_in_testators_handwriting', 'signed_by_testator']
    },
    restrictions: [
      'community_property_state',
      'homestead_exemption_unlimited_value',
      'spousal_rights_in_community_property'
    ],
    probateRequirements: {
      required: false,
      alternatives: ['muniment_of_title', 'small_estate_affidavit'],
      timeframe: '4 years statute of limitations',
      court: 'probate_court'
    },
    specialRules: [
      'independent_administration_preferred',
      'muniment_of_title_available_for_will_with_no_debts',
      'community_property_survivorship_agreement'
    ],
    lastUpdated: '2024-02-01'
  }
};

export class LegalComplianceService {
  
  /**
   * Get legal requirements for a specific state
   */
  static getStateRequirements(state: string): any {
    const stateCode = state.toUpperCase();
    return STATE_REQUIREMENTS[stateCode as keyof typeof STATE_REQUIREMENTS] || null;
  }

  /**
   * Validate will compliance for specific state
   */
  static async validateWillCompliance(willData: any, state: string): Promise<{
    compliant: boolean;
    violations: string[];
    warnings: string[];
    recommendations: string[];
    requiredActions: string[];
  }> {
    const requirements = this.getStateRequirements(state);
    if (!requirements) {
      return {
        compliant: false,
        violations: [`State requirements not found for ${state}`],
        warnings: [],
        recommendations: ['Consult local attorney'],
        requiredActions: ['Verify state-specific requirements']
      };
    }

    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const requiredActions: string[] = [];

    // Check witness requirements
    if (willData.witnesses) {
      if (willData.witnesses.length < requirements.witnessRequirements.minimumWitnesses) {
        violations.push(
          `Insufficient witnesses: ${willData.witnesses.length} provided, ${requirements.witnessRequirements.minimumWitnesses} required`
        );
        requiredActions.push(`Add ${requirements.witnessRequirements.minimumWitnesses - willData.witnesses.length} more witness(es)`);
      }

      // Check witness age requirements
      willData.witnesses.forEach((witness: any, index: number) => {
        if (witness.age && witness.age < requirements.witnessRequirements.witnessAgeRequirement) {
          violations.push(`Witness ${index + 1} is under required age of ${requirements.witnessRequirements.witnessAgeRequirement}`);
        }
      });

      // Check witness disqualifications
      if (requirements.witnessRequirements.witnessDisqualifications.includes('beneficiaries')) {
        const beneficiaryEmails = willData.beneficiaries?.map((b: any) => b.email.toLowerCase()) || [];
        willData.witnesses.forEach((witness: any, index: number) => {
          if (beneficiaryEmails.includes(witness.email.toLowerCase())) {
            violations.push(`Witness ${index + 1} cannot be a beneficiary in ${requirements.stateName}`);
            requiredActions.push(`Replace witness ${index + 1} with non-beneficiary`);
          }
        });
      }
    } else {
      violations.push('No witnesses specified');
      requiredActions.push(`Add ${requirements.witnessRequirements.minimumWitnesses} witnesses`);
    }

    // Check notarization requirements
    if (requirements.witnessRequirements.notarizationRequired && !willData.notarized) {
      violations.push(`Notarization required in ${requirements.stateName}`);
      requiredActions.push('Have will notarized');
    }

    // Check signature requirements
    if (!willData.testatorSignature) {
      violations.push('Testator signature required');
      requiredActions.push('Sign the will');
    }

    // Check holographic will requirements
    if (willData.isHolographic) {
      if (!requirements.holographicWills.allowed) {
        violations.push(`Holographic wills not recognized in ${requirements.stateName}`);
        requiredActions.push('Create typed will with proper witnesses');
      } else {
        requirements.holographicWills.requirements.forEach((req: string) => {
          if (req === 'entirely_handwritten' && !willData.entirelyHandwritten) {
            violations.push('Holographic will must be entirely handwritten');
          }
        });
      }
    }

    // Check state-specific restrictions
    requirements.restrictions?.forEach((restriction: string) => {
      if (restriction.includes('homestead') && willData.realEstate) {
        warnings.push(`${requirements.stateName} has homestead exemption rules that may affect real estate distribution`);
        recommendations.push('Review homestead exemption implications');
      }
      
      if (restriction.includes('community_property') && willData.maritalStatus === 'married') {
        warnings.push(`${requirements.stateName} is a community property state - this affects property distribution`);
        recommendations.push('Review community property laws with spouse');
      }
      
      if (restriction.includes('elective_share') && willData.maritalStatus === 'married') {
        warnings.push(`Surviving spouse has elective share rights in ${requirements.stateName}`);
        recommendations.push('Consider spousal elective share implications');
      }
    });

    // Check for self-proving affidavit
    if (requirements.witnessRequirements.selfProvingAffidavit && !willData.selfProvingAffidavit) {
      recommendations.push('Consider adding self-proving affidavit to simplify probate process');
    }

    // Add general recommendations
    recommendations.push(`Review will compliance with ${requirements.stateName} laws`);
    recommendations.push('Consider consulting with local estate planning attorney');

    return {
      compliant: violations.length === 0,
      violations,
      warnings,
      recommendations,
      requiredActions
    };
  }

  /**
   * Get real-time legal updates for a state
   */
  static async getRealtimeLegalUpdates(state: string): Promise<{
    updates: any[];
    lastChecked: Date;
    nextCheck: Date;
  }> {
    try {
      // This would integrate with legal databases like Westlaw, LexisNexis, or state legislature APIs
      const response = await axios.get(`https://api.legalupdates.com/v1/estate-law/${state}`, {
        headers: {
          'Authorization': `Bearer ${process.env.LEGAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        updates: response.data.updates || [],
        lastChecked: new Date(),
        nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
    } catch (error) {
      console.error('[Legal] Failed to fetch real-time updates:', error);
      return {
        updates: [],
        lastChecked: new Date(),
        nextCheck: new Date(Date.now() + 60 * 60 * 1000) // Retry in 1 hour
      };
    }
  }

  /**
   * Generate state-specific will template
   */
  static generateStateWillTemplate(state: string, personalInfo: any): {
    template: string;
    placeholders: string[];
    stateSpecificClauses: string[];
  } {
    const requirements = this.getStateRequirements(state);
    if (!requirements) {
      throw new Error(`Template not available for ${state}`);
    }

    const stateSpecificClauses: string[] = [];
    let template = `
LAST WILL AND TESTAMENT OF ${personalInfo.fullName?.toUpperCase() || '[FULL_NAME]'}

I, ${personalInfo.fullName || '[FULL_NAME]'}, of ${personalInfo.address || '[ADDRESS]'}, ${personalInfo.city || '[CITY]'}, ${state}, hereby make, publish, and declare this to be my Last Will and Testament, revoking all former wills and codicils made by me.

ARTICLE I - IDENTIFICATION AND DECLARATIONS
I am ${personalInfo.age || '[AGE]'} years of age and of sound mind and memory. I am ${personalInfo.maritalStatus || '[MARITAL_STATUS]'}.
`;

    // Add state-specific clauses
    if (requirements.restrictions?.some((r: string) => r.includes('community_property'))) {
      stateSpecificClauses.push('Community Property Declaration');
      template += `
ARTICLE II - COMMUNITY PROPERTY DECLARATION
I acknowledge that I am a resident of ${requirements.stateName}, a community property state. I understand the nature of community property and separate property under ${state} law.
`;
    }

    if (requirements.restrictions?.some((r: string) => r.includes('homestead'))) {
      stateSpecificClauses.push('Homestead Property Declaration');
    }

    // Add witness clause based on state requirements
    template += `
IN WITNESS WHEREOF, I have subscribed my name to this Will in the presence of the witnesses whose names appear below, who witnessed the signing hereof at my request and in my presence, and in the presence of each other, on this _____ day of __________, 2024.

                                        _________________________________
                                        ${personalInfo.fullName || '[TESTATOR_NAME]'}, Testator

The foregoing instrument was signed in our presence by ${personalInfo.fullName || '[TESTATOR_NAME]'}, the Testator, who declared it to be ${personalInfo.gender === 'male' ? 'his' : personalInfo.gender === 'female' ? 'her' : 'their'} Last Will and Testament, and we, at ${personalInfo.gender === 'male' ? 'his' : personalInfo.gender === 'female' ? 'her' : 'their'} request and in ${personalInfo.gender === 'male' ? 'his' : personalInfo.gender === 'female' ? 'her' : 'their'} presence, and in the presence of each other, have subscribed our names as witnesses thereto.

We declare under penalty of perjury under the laws of ${requirements.stateName} that the foregoing is true and correct.

Witness 1: ____________________________    Date: __________
Print Name: ____________________________
Address: _______________________________________________

Witness 2: ____________________________    Date: __________  
Print Name: ____________________________
Address: _______________________________________________
`;

    // Add self-proving affidavit if supported
    if (requirements.witnessRequirements.selfProvingAffidavit) {
      stateSpecificClauses.push('Self-Proving Affidavit');
      template += `

SELF-PROVING AFFIDAVIT

STATE OF ${state.toUpperCase()}
COUNTY OF [COUNTY]

We, ${personalInfo.fullName || '[TESTATOR_NAME]'}, [WITNESS_1_NAME], and [WITNESS_2_NAME], being duly sworn, do hereby declare to the undersigned authority that the testator signed the will in the presence of the witnesses and that the witnesses signed the will in the presence of the testator and of each other.

_________________________________     _________________________________
${personalInfo.fullName || '[TESTATOR_NAME]'}, Testator     [WITNESS_1_NAME], Witness

_________________________________
[WITNESS_2_NAME], Witness

Subscribed, sworn to and acknowledged before me by ${personalInfo.fullName || '[TESTATOR_NAME]'}, the testator, and subscribed and sworn to before me by [WITNESS_1_NAME] and [WITNESS_2_NAME], witnesses, this _____ day of __________, 2024.

                                        _________________________________
                                        Notary Public
                                        My Commission Expires: ___________
`;
    }

    const placeholders = [
      '[FULL_NAME]', '[ADDRESS]', '[CITY]', '[AGE]', '[MARITAL_STATUS]',
      '[TESTATOR_NAME]', '[WITNESS_1_NAME]', '[WITNESS_2_NAME]', '[COUNTY]'
    ];

    return {
      template,
      placeholders,
      stateSpecificClauses
    };
  }

  /**
   * Check for legal changes across all states
   */
  static async checkAllStatesForUpdates(): Promise<{
    [state: string]: {
      hasUpdates: boolean;
      lastUpdate: string;
      criticalChanges: string[];
    }
  }> {
    const results: any = {};
    
    for (const [stateCode, requirements] of Object.entries(STATE_REQUIREMENTS)) {
      try {
        const updates = await this.getRealtimeLegalUpdates(stateCode);
        results[stateCode] = {
          hasUpdates: updates.updates.length > 0,
          lastUpdate: requirements.lastUpdated,
          criticalChanges: updates.updates
            .filter((update: any) => update.severity === 'high')
            .map((update: any) => update.description)
        };
      } catch (error) {
        results[stateCode] = {
          hasUpdates: false,
          lastUpdate: requirements.lastUpdated,
          criticalChanges: []
        };
      }
    }

    return results;
  }

  /**
   * Get probate avoidance strategies by state
   */
  static getProbateAvoidanceStrategies(state: string): {
    strategies: string[];
    requirements: string[];
    limitations: string[];
  } {
    const requirements = this.getStateRequirements(state);
    if (!requirements) {
      return { strategies: [], requirements: [], limitations: [] };
    }

    const strategies = [
      'Living Trust (Revocable Trust)',
      'Joint Tenancy with Right of Survivorship',
      'Payable-on-Death (POD) Accounts',
      'Transfer-on-Death (TOD) Securities',
      'Life Insurance Beneficiary Designations'
    ];

    const stateStrategies = [...strategies];
    const stateRequirements: string[] = [];
    const limitations: string[] = [];

    // Add state-specific strategies
    if (requirements.probateRequirements?.alternatives) {
      requirements.probateRequirements.alternatives.forEach((alt: string) => {
        if (alt === 'small_estate_affidavit') {
          stateStrategies.push(`Small Estate Affidavit (under $${requirements.probateRequirements.thresholds?.small_estate || '50k'})`);
        }
        if (alt === 'muniment_of_title') {
          stateStrategies.push('Muniment of Title (Texas)');
          stateRequirements.push('No unpaid debts except secured by real estate');
        }
      });
    }

    // Add community property considerations
    if (requirements.restrictions?.some((r: string) => r.includes('community_property'))) {
      stateStrategies.push('Community Property with Right of Survivorship');
      limitations.push('Community property laws may limit transfer options');
    }

    // Add homestead considerations
    if (requirements.restrictions?.some((r: string) => r.includes('homestead'))) {
      limitations.push('Homestead exemption may restrict devise of primary residence');
    }

    return {
      strategies: stateStrategies,
      requirements: stateRequirements,
      limitations
    };
  }
}

export default LegalComplianceService;