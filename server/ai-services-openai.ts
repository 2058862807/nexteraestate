import OpenAI from 'openai';

// Initialize OpenAI client only
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Will Reviewer & Enhancer using OpenAI
export async function reviewAndEnhanceWill(willContent: string, state: string): Promise<{
  suggestions: string[];
  enhancedWill: string;
  completenessScore: number;
  missingClauses: string[];
}> {
  try {
    const prompt = `You are a legal expert reviewing a will for ${state} state law compliance. Analyze this will and provide:

1. Specific suggestions for legal improvements
2. Missing legal clauses required by ${state} law
3. A completeness score (0-100)
4. An enhanced version with improvements

Will content:
${willContent}

Respond in JSON format with keys: suggestions, enhancedWill, completenessScore, missingClauses`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('AI will review error:', error);
    throw new Error('Failed to review will with AI');
  }
}

// Voice-to-Will Generator
export async function convertVoiceToWill(audioBuffer: Buffer, userContext: any): Promise<{
  transcript: string;
  structuredWill: string;
  extractedIntents: string[];
}> {
  try {
    // Step 1: Convert speech to text using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.wav', { type: 'audio/wav' }),
      model: 'whisper-1',
    });

    // Step 2: Convert transcript to structured will using OpenAI
    const prompt = `Convert this spoken will request into proper legal language for ${userContext.state}:

User context: ${JSON.stringify(userContext)}
Spoken request: "${transcription.text}"

Create a structured will section and extract the user's intents. Respond in JSON with: transcript, structuredWill, extractedIntents`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    result.transcript = transcription.text;
    return result;
  } catch (error) {
    console.error('Voice to will conversion error:', error);
    throw new Error('Failed to convert voice to will');
  }
}

// Auto-Categorization of Documents
export async function categorizeDocument(fileName: string, content: string): Promise<{
  category: 'legal' | 'financial' | 'personal' | 'digital_assets';
  confidence: number;
  tags: string[];
  summary: string;
}> {
  try {
    const prompt = `Analyze this document and categorize it for estate planning:

Filename: ${fileName}
Content preview: ${content.substring(0, 1000)}

Categorize as: legal, financial, personal, or digital_assets
Provide confidence score (0-1), relevant tags, and brief summary.

Respond in JSON with: category, confidence, tags, summary`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Document categorization error:', error);
    throw new Error('Failed to categorize document');
  }
}

// Smart Death Switch Configuration
export async function generateDeathSwitchConfig(userProfile: any): Promise<{
  recommendedSettings: any;
  explanation: string;
  alternatives: any[];
}> {
  try {
    const prompt = `Based on this user profile, recommend optimal death switch configuration:

User Profile: ${JSON.stringify(userProfile)}

Consider:
- Check-in frequency based on age/health
- Escalation timeline
- Notification methods
- Family structure

Respond in JSON with: recommendedSettings, explanation, alternatives`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Death switch config error:', error);
    throw new Error('Failed to generate death switch configuration');
  }
}

// AI Heir & Executor Recommender
export async function recommendHeirsAndExecutors(familyData: any, interactions: any): Promise<{
  executorRecommendations: any[];
  heirSuggestions: any[];
  reasoning: string;
}> {
  try {
    const prompt = `Analyze family data and interactions to recommend heirs and executors:

Family Data: ${JSON.stringify(familyData)}
Interactions: ${JSON.stringify(interactions)}

Consider trust levels, responsibility, geographic proximity, age, financial acumen.

Respond in JSON with: executorRecommendations, heirSuggestions, reasoning`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Heir/executor recommendation error:', error);
    throw new Error('Failed to generate recommendations');
  }
}

// AI Message Coach
export async function coachLegacyMessage(messageContent: string, recipientType: string, relationship: string): Promise<{
  suggestions: string[];
  improvedMessage: string;
  emotionalTone: string;
  additionalTopics: string[];
}> {
  try {
    const prompt = `Coach this legacy message for a ${recipientType} (relationship: ${relationship}):

Message: "${messageContent}"

Provide:
1. Specific suggestions for improvement
2. Enhanced version that's more meaningful
3. Emotional tone assessment
4. Additional topics they might want to include

Respond in JSON with: suggestions, improvedMessage, emotionalTone, additionalTopics`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Message coaching error:', error);
    throw new Error('Failed to coach message');
  }
}

// Compliance Checker
export async function checkCompliance(willData: any, documents: any[], state: string): Promise<{
  isCompliant: boolean;
  missingRequirements: string[];
  alerts: string[];
  fixes: string[];
}> {
  try {
    const prompt = `Check ${state} estate planning compliance:

Will Data: ${JSON.stringify(willData)}
Documents: ${JSON.stringify(documents.map(d => ({ type: d.category, name: d.fileName })))}
State: ${state}

Check against current ${state} requirements for:
- Will witnessing requirements
- Required documents
- Beneficiary designations
- Power of attorney needs

Respond in JSON with: isCompliant, missingRequirements, alerts, fixes`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Compliance check error:', error);
    throw new Error('Failed to check compliance');
  }
}

// Predictive Task Nudges
export async function generateTaskNudges(userProgress: any): Promise<{
  urgentTasks: string[];
  suggestions: string[];
  motivationalMessage: string;
  nextSteps: string[];
}> {
  try {
    const prompt = `Analyze user progress and generate helpful nudges:

Progress Data: ${JSON.stringify(userProgress)}

Generate:
1. Urgent tasks they should complete
2. Helpful suggestions
3. Motivational message
4. Clear next steps

Be encouraging but direct. Focus on what matters most.

Respond in JSON with: urgentTasks, suggestions, motivationalMessage, nextSteps`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Task nudges error:', error);
    throw new Error('Failed to generate task nudges');
  }
}

// Legal Readiness Certificate Generator
export async function generateLegalCertificate(userData: any, completionData: any): Promise<{
  certificateHtml: string;
  completionPercentage: number;
  legalValidation: boolean;
  summary: string;
}> {
  try {
    const prompt = `Generate a legal readiness certificate:

User Data: ${JSON.stringify(userData)}
Completion Data: ${JSON.stringify(completionData)}

Create:
1. Professional HTML certificate
2. Completion percentage
3. Legal validation status
4. Summary of what's complete

Respond in JSON with: certificateHtml, completionPercentage, legalValidation, summary`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Certificate generation error:', error);
    throw new Error('Failed to generate certificate');
  }
}