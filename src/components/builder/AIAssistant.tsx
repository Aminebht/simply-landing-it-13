import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Send, X } from 'lucide-react';
import { useAIGeneration } from '@/hooks/useAIGeneration';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyContent: (content: any) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onClose,
  onApplyContent
}) => {
  const [prompt, setPrompt] = useState('');
  const [componentType, setComponentType] = useState<'hero' | 'testimonials' | 'features' | 'pricing' | 'faq' | 'cta'>('hero');
  const { generateContent, isGenerating, error } = useAIGeneration();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      const result = await generateContent({
        productType: 'general',
        targetAudience: 'general',
        language: 'en',
        tone: 'professional',
        componentType,
        context: prompt
      });

      if (result) {
        onApplyContent(result);
        setPrompt('');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Component Type</label>
            <select 
              value={componentType} 
              onChange={(e) => setComponentType(e.target.value as 'hero' | 'testimonials' | 'features' | 'pricing' | 'faq' | 'cta')}
              className="w-full p-2 border rounded-md"
            >
              <option value="hero">Hero Section</option>
              <option value="features">Features Section</option>
              <option value="testimonials">Testimonials</option>
              <option value="pricing">Pricing</option>
              <option value="cta">Call to Action</option>
              <option value="faq">FAQ</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Describe what you want</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a hero section for a SaaS product that helps developers build faster..."
              className="min-h-[100px]"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            <p>💡 Tips for better results:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Be specific about your target audience</li>
              <li>Mention your product/service clearly</li>
              <li>Include desired tone (professional, friendly, etc.)</li>
              <li>Specify any key benefits or features</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
