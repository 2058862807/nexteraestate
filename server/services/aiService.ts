import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// DeepSeek API configuration (alternative AI provider)
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

export class AIProcessor {
  
  /**
   * Generate AI-powered will suggestions
   */
  static async generateWillSuggestions(personalInfo: any, assets: any[]): Promise<string> {
    try {
      const prompt = `
        Based on this personal information and assets, provide comprehensive will suggestions:
        
        Personal Info: ${JSON.stringify(personalInfo)}
        Assets: ${JSON.stringify(assets)}
        
        Please provide:
        1. Asset distribution recommendations
        2. Executor selection guidance
        3. Tax optimization suggestions
        4. Legal compliance notes
        5. Potential issues to address
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert estate planning attorney. Provide detailed, legally-sound advice for will creation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('[AI] Will suggestions failed:', error);
      return 'Unable to generate suggestions at this time.';
    }
  }

  /**
   * AI-powered document categorization
   */
  static async categorizeDocument(fileName: string, fileContent?: string): Promise<string> {
    try {
      const prompt = `Categorize this document into one of these categories: legal, financial, digital_assets, personal, insurance, property.
      
      Document: ${fileName}
      ${fileContent ? `Content preview: ${fileContent.substring(0, 500)}` : ''}
      
      Respond with just the category name.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a document classification expert. Categorize documents accurately."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      });

      const category = completion.choices[0].message.content?.toLowerCase().trim();
      const validCategories = ['legal', 'financial', 'digital_assets', 'personal', 'insurance', 'property'];
      
      return validCategories.includes(category || '') ? category! : 'personal';
    } catch (error) {
      console.error('[AI] Document categorization failed:', error);
      return 'personal';
    }
  }

  /**
   * Generate AI summary of estate contents
   */
  static async generateSummary(vaultContents: any): Promise<string> {
    try {
      const prompt = `Create a comprehensive but sensitive summary of this person's digital estate:
      
      ${JSON.stringify(vaultContents, null, 2)}
      
      Focus on:
      - Key documents and their importance
      - Asset overview
      - Important contacts and relationships
      - Final wishes and instructions
      
      Keep the tone respectful and informative for grieving family members.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a compassionate estate advisor helping families understand their loved one's final arrangements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      return completion.choices[0].message.content || 'Estate summary unavailable.';
    } catch (error) {
      console.error('[AI] Estate summary failed:', error);
      return 'Estate summary unavailable.';
    }
  }

  /**
   * AI Grief Counseling Response
   */
  static async generateGriefCounselingResponse(message: string, context?: any): Promise<{
    response: string;
    emotion: string;
    suggestedActions: string[];
  }> {
    try {
      const prompt = `
        As a professional grief counselor, respond to this message with empathy and helpful guidance:
        
        User message: "${message}"
        ${context ? `Context: ${JSON.stringify(context)}` : ''}
        
        Please provide:
        1. A compassionate response
        2. Practical coping strategies
        3. When appropriate, suggest professional resources
        
        Detect the primary emotion and suggest helpful actions.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a licensed grief counselor with 20+ years of experience. Provide professional, compassionate support while being mindful of your limitations and when to refer to in-person help."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.4
      });

      // Basic emotion detection
      const emotion = this.detectEmotion(message);
      
      // Generate suggested actions based on emotion
      const suggestedActions = this.getSuggestedActions(emotion);

      return {
        response: completion.choices[0].message.content || 'I understand you are going through a difficult time.',
        emotion,
        suggestedActions
      };
    } catch (error) {
      console.error('[AI] Grief counseling failed:', error);
      return {
        response: 'I understand you are going through a difficult time. Please consider reaching out to a professional counselor for additional support.',
        emotion: 'unknown',
        suggestedActions: ['Consider professional counseling', 'Connect with support groups']
      };
    }
  }

  /**
   * Voice-to-Will conversion
   */
  static async convertVoiceToWill(audioTranscript: string): Promise<{
    willSections: any;
    confidence: number;
    suggestions: string[];
  }> {
    try {
      const prompt = `
        Convert this voice transcript into structured will sections:
        
        Transcript: "${audioTranscript}"
        
        Extract and structure:
        1. Personal information mentioned
        2. Asset descriptions and distributions
        3. Executor nominations
        4. Guardian appointments
        5. Specific bequests
        6. Final instructions
        
        Format as JSON with sections and confidence level.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert at converting natural speech into structured legal documents. Extract key information while noting what needs clarification."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.2
      });

      // Parse the response (would need better error handling in production)
      const response = completion.choices[0].message.content || '{}';
      
      return {
        willSections: this.parseWillSections(response),
        confidence: 0.8, // Would calculate based on clarity
        suggestions: [
          'Please review and clarify any unclear sections',
          'Consider adding more specific asset descriptions',
          'Verify all names and relationships are correct'
        ]
      };
    } catch (error) {
      console.error('[AI] Voice-to-will conversion failed:', error);
      return {
        willSections: {},
        confidence: 0,
        suggestions: ['Please try recording your will instructions again']
      };
    }
  }

  /**
   * Legal compliance checker
   */
  static async checkLegalCompliance(willData: any, state: string): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
        Check this will for legal compliance in ${state}:
        
        Will Data: ${JSON.stringify(willData)}
        State: ${state}
        
        Check for:
        1. Required witness signatures
        2. Notarization requirements
        3. Asset distribution rules
        4. Executor qualification requirements
        5. State-specific restrictions
        
        Provide compliance status and specific recommendations.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a legal expert specializing in estate law across all US states. Provide accurate compliance guidance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.1
      });

      // Parse compliance response (simplified)
      const response = completion.choices[0].message.content || '';
      
      return {
        compliant: !response.toLowerCase().includes('non-compliant'),
        issues: this.extractIssues(response),
        recommendations: this.extractRecommendations(response)
      };
    } catch (error) {
      console.error('[AI] Legal compliance check failed:', error);
      return {
        compliant: false,
        issues: ['Unable to verify compliance'],
        recommendations: ['Please consult with a local attorney']
      };
    }
  }

  // Helper methods
  private static detectEmotion(message: string): string {
    const sadWords = ['sad', 'depressed', 'grief', 'loss', 'miss', 'alone'];
    const angryWords = ['angry', 'mad', 'frustrated', 'unfair'];
    const anxiousWords = ['worried', 'anxious', 'scared', 'afraid'];
    
    const lowerMessage = message.toLowerCase();
    
    if (sadWords.some(word => lowerMessage.includes(word))) return 'sadness';
    if (angryWords.some(word => lowerMessage.includes(word))) return 'anger';
    if (anxiousWords.some(word => lowerMessage.includes(word))) return 'anxiety';
    
    return 'mixed';
  }

  private static getSuggestedActions(emotion: string): string[] {
    const actions = {
      sadness: [
        'Practice gentle self-care',
        'Connect with supportive friends/family',
        'Consider grief support groups',
        'Maintain daily routines'
      ],
      anger: [
        'Try physical exercise to release tension',
        'Practice deep breathing',
        'Journal your feelings',
        'Speak with a counselor about anger management'
      ],
      anxiety: [
        'Practice mindfulness and grounding techniques',
        'Limit overwhelming decisions',
        'Maintain sleep and nutrition',
        'Consider professional anxiety support'
      ],
      mixed: [
        'Be patient with yourself',
        'Consider professional grief counseling',
        'Connect with others who understand',
        'Take one day at a time'
      ]
    };

    return actions[emotion as keyof typeof actions] || actions.mixed;
  }

  private static parseWillSections(response: string): any {
    try {
      return JSON.parse(response);
    } catch {
      return {
        personalInfo: {},
        assets: [],
        executors: [],
        guardians: [],
        bequests: [],
        instructions: ''
      };
    }
  }

  private static extractIssues(response: string): string[] {
    // Simple extraction - would need more sophisticated parsing
    return response.match(/issue:.*$/gim) || [];
  }

  private static extractRecommendations(response: string): string[] {
    // Simple extraction - would need more sophisticated parsing
    return response.match(/recommend:.*$/gim) || [];
  }
}

export default AIProcessor;