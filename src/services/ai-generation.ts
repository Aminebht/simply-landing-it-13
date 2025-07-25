export interface AIGenerationRequest {
  productType: string;
  targetAudience: string;
  language: 'en' | 'fr' | 'ar';
  tone: 'professional' | 'casual' | 'persuasive' | 'friendly';
  componentType: 'hero' | 'testimonials' | 'features' | 'pricing' | 'faq' | 'cta';
  context?: string;
}

export interface AIGeneratedContent {
  headline?: string;
  subheadline?: string;
  description?: string;
  ctaText?: string;
  features?: string[];
  testimonials?: Array<{
    name: string;
    text: string;
    role: string;
  }>;
  faqItems?: Array<{
    question: string;
    answer: string;
  }>;
  pricingPlans?: Array<{
    name: string;
    price: string;
    features: string[];
  }>;
}

export class AIGenerationService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(request: AIGenerationRequest): Promise<AIGeneratedContent> {
    const prompt = this.buildPrompt(request);
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert copywriter specializing in landing pages. Generate compelling, conversion-focused content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return this.parseGeneratedContent(content, request.componentType);
  }

  async generateImage(prompt: string, style: 'realistic' | 'illustration' | 'minimal' = 'realistic'): Promise<string> {
    const enhancedPrompt = `${prompt}, ${style} style, high quality, professional`;
    
    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Image API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].url;
  }

  async optimizeContent(content: string, goal: 'conversion' | 'engagement' | 'clarity'): Promise<string> {
    const prompt = `Optimize this content for ${goal}:\n\n${content}\n\nProvide an improved version:`;
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert copywriter. Optimize content while maintaining the original message.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private buildPrompt(request: AIGenerationRequest): string {
    const basePrompt = `Generate ${request.componentType} content for a ${request.productType} targeting ${request.targetAudience}. 
    Use a ${request.tone} tone and write in ${request.language}.
    ${request.context ? `Additional context: ${request.context}` : ''}`;

    switch (request.componentType) {
      case 'hero':
        return `${basePrompt}
        
        Generate a compelling hero section with:
        - A powerful headline (max 60 characters)
        - A supporting subheadline (max 120 characters)
        - A clear call-to-action button text (max 25 characters)
        
        Format as JSON: {"headline": "", "subheadline": "", "ctaText": ""}`;

      case 'features':
        return `${basePrompt}
        
        Generate a features section with:
        - A section title
        - 3-6 key features with titles and descriptions
        
        Format as JSON: {"title": "", "features": [{"title": "", "description": ""}]}`;

      case 'testimonials':
        return `${basePrompt}
        
        Generate 3 realistic testimonials with:
        - Customer name
        - Testimonial text (conversational, specific)
        - Customer role/title
        
        Format as JSON: {"testimonials": [{"name": "", "text": "", "role": ""}]}`;

      case 'faq':
        return `${basePrompt}
        
        Generate 5-7 frequently asked questions with clear, helpful answers.
        
        Format as JSON: {"faqItems": [{"question": "", "answer": ""}]}`;

      case 'pricing':
        return `${basePrompt}
        
        Generate 3 pricing tiers (Basic, Pro, Enterprise) with:
        - Plan name
        - Price
        - 4-6 features per plan
        
        Format as JSON: {"pricingPlans": [{"name": "", "price": "", "features": []}]}`;

      case 'cta':
        return `${basePrompt}
        
        Generate a compelling call-to-action section with:
        - Urgent headline
        - Persuasive description
        - Action button text
        
        Format as JSON: {"headline": "", "description": "", "ctaText": ""}`;

      default:
        return basePrompt;
    }
  }

  private parseGeneratedContent(content: string, componentType: string): AIGeneratedContent {
    try {
      // Try to parse as JSON first
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('Failed to parse AI content as JSON, using fallback parsing');
    }

    // Fallback: parse text content
    return this.parseTextContent(content, componentType);
  }

  private parseTextContent(content: string, componentType: string): AIGeneratedContent {
    const result: AIGeneratedContent = {};
    
    // Basic text parsing based on component type
    const lines = content.split('\n').filter(line => line.trim());
    
    switch (componentType) {
      case 'hero':
        result.headline = lines[0] || 'Generated Headline';
        result.subheadline = lines[1] || 'Generated Subheadline';
        result.ctaText = 'Get Started';
        break;
        
      default:
        result.description = content;
    }
    
    return result;
  }
}