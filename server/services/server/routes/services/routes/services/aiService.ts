import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { DeepSeek } from 'deepseek-api';

const AI_SERVICES = {
  chatgpt: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
  claude: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
  deepseek: new DeepSeek(process.env.DEEPSEEK_API_KEY)
};

class AIProcessor {
  async generateSummary(vaultContents: any): Promise<string> {
    const content = JSON.stringify(vaultContents).substring(0, 5000);
    const prompt = `Generate compassionate summary of estate vault contents for heirs: ${content}`;
    
    try {
      // Try Claude first for sensitive content
      return await AI_SERVICES.claude.completions.create({
        model: 'claude-2',
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 500,
      }).then(r => r.completion);
    } catch {
      // Fallback to GPT-4
      return (await AI_SERVICES.chatgpt.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      })).choices[0].message.content;
    }
  }

  async ensureCompliance(document: string, state: string): Promise<string> {
    const prompt = `Make this estate document compliant with ${state} laws: ${document}`;
    
    return (await AI_SERVICES.deepseek.legalReview({
      text: prompt,
      jurisdiction: state
    })).reviewedDocument;
  }

  async generateVideoScript(userData: any): Promise<string> {
    const prompt = `Create heartfelt video message script based on user profile: ${JSON.stringify(userData)}`;
    
    return (await AI_SERVICES.chatgpt.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })).choices[0].message.content;
  }
}

export default new AIProcessor();
