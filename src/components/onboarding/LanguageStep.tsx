import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Globe, Wand2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/constants/onboarding';
import type { OnboardingStepProps } from '@/types/onboarding';

export const LanguageStep = ({ onboardingData, setOnboardingData }: OnboardingStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="mr-2 h-5 w-5" />
          Language & Final Settings
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Choose your target language and review your configuration
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Select Target Language</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SUPPORTED_LANGUAGES.map((language) => (
              <Card 
                key={language.code}
                className={`cursor-pointer transition-all border-2 ${
                  onboardingData.language === language.code 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => setOnboardingData(prev => ({ ...prev, language: language.code as any }))}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-4 h-4 rounded-full border-2 mx-auto mb-2 flex items-center justify-center ${
                    onboardingData.language === language.code 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {onboardingData.language === language.code && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="text-2xl mb-1">{language.flag}</div>
                  <Label className="text-sm font-semibold">{language.name}</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    {language.direction === 'rtl' ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
    
      </CardContent>
    </Card>
  );
};
