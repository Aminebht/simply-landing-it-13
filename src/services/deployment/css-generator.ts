import { supabase } from '@/integrations/supabase/client';

export class CssGeneratorService {
  async generateCss(html: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('css-generator', {
        body: { html },
      });

      if (error) {
        throw new Error(`Failed to invoke css-generator function: ${error.message}`);
      }

      if (!data.css) {
        throw new Error('CSS generation returned no content.');
      }

      return data.css;
    } catch (error) {
      console.error('Error generating CSS:', error);
      throw error;
    }
  }
}
