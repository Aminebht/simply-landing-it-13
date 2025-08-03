import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Wand2 } from 'lucide-react';
import type { OnboardingStepProps } from '@/types/onboarding';

export const DescriptionStep = ({ onboardingData, setOnboardingData }: OnboardingStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Product Description
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Choose how to describe your product for maximum impact on your landing page
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4">
            {/* Use Product Description Option */}
            <Card 
              className={`cursor-pointer transition-all border-2 ${
                onboardingData.useProductDescription 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => setOnboardingData(prev => ({ 
                ...prev, 
                useProductDescription: true,
                customDescription: ''
              }))}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                    onboardingData.useProductDescription 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {onboardingData.useProductDescription && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <Label className="text-sm font-semibold text-gray-900">
                        Use existing product description
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Perfect for maintaining consistency with your product listings
                    </p>
                    {onboardingData.selectedProduct?.description && (
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Current description:</p>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          "{onboardingData.selectedProduct.description}"
                        </p>
                      </div>
                    )}
                    {!onboardingData.selectedProduct?.description && (
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <p className="text-xs text-amber-700">
                          No description available for this product
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Description Option */}
            <Card 
              className={`cursor-pointer transition-all border-2 ${
                !onboardingData.useProductDescription 
                  ? 'border-green-500 bg-green-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => setOnboardingData(prev => ({ 
                ...prev, 
                useProductDescription: false
              }))}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                    !onboardingData.useProductDescription 
                      ? 'border-green-500 bg-green-500' 
                      : 'border-gray-300'
                  }`}>
                    {!onboardingData.useProductDescription && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Wand2 className="h-4 w-4 text-green-600" />
                      <Label className="text-sm font-semibold text-gray-900">
                        Create custom description
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Write a compelling description specifically optimized for conversions
                    </p>
                    {!onboardingData.useProductDescription && (
                      <div className="mt-3">
                        <Textarea
                          placeholder="Enter a compelling description that highlights your product's unique value proposition..."
                          value={onboardingData.customDescription}
                          onChange={(e) => setOnboardingData(prev => ({ 
                            ...prev, 
                            customDescription: e.target.value 
                          }))}
                          className="min-h-[100px] resize-none"
                          rows={4}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          💡 Tip: Focus on benefits, use action words, and highlight what makes your product special
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Character count for custom description */}
          {!onboardingData.useProductDescription && onboardingData.customDescription && (
            <div className="text-right">
              <span className={`text-xs ${
                onboardingData.customDescription.length > 500 
                  ? 'text-amber-600' 
                  : 'text-gray-500'
              }`}>
                {onboardingData.customDescription.length} characters
                {onboardingData.customDescription.length > 500 && ' (consider shortening for better impact)'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
