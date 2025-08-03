import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Image, Camera, Sparkles, FileText, Wand2 } from 'lucide-react';
import type { OnboardingStepProps } from '@/types/onboarding';

export const ImageSelectionStep = ({ onboardingData, setOnboardingData }: OnboardingStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Image className="mr-2 h-5 w-5" />
          Product Images
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Choose how to handle images for your landing page
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4">
            {/* Use Product Images Option */}
            <Card 
              className={`cursor-pointer transition-all border-2 ${
                onboardingData.useProductImages 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => setOnboardingData(prev => ({ 
                ...prev, 
                useProductImages: true,
                generateAIImages: false
              }))}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                    onboardingData.useProductImages 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {onboardingData.useProductImages && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Camera className="h-4 w-4 text-blue-600" />
                      <Label className="text-sm font-semibold text-gray-900">
                        Use existing product images
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Perfect for showcasing authentic product visuals and building trust
                    </p>
                    {onboardingData.selectedProductMedia && onboardingData.selectedProductMedia.length > 0 ? (
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">
                          Available images ({onboardingData.selectedProductMedia.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {onboardingData.selectedProductMedia.slice(0, 4).map((media, index) => (
                            <img 
                              key={media.id}
                              src={media.file_url} 
                              alt={`Product image ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border shadow-sm"
                            />
                          ))}
                          {onboardingData.selectedProductMedia.length > 4 && (
                            <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                +{onboardingData.selectedProductMedia.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : onboardingData.selectedProduct?.preview_image_url ? (
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Preview image only:</p>
                        <img 
                          src={onboardingData.selectedProduct.preview_image_url} 
                          alt="Product preview"
                          className="w-24 h-24 object-cover rounded border shadow-sm"
                        />
                        <p className="text-xs text-amber-600 mt-2">
                          💡 Consider uploading more product images for better variety
                        </p>
                      </div>
                    ) : (
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <p className="text-xs text-amber-700">
                          ⚠️ No product images available - consider uploading images to your product first
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Generated Images Option */}
            <Card 
              className={`cursor-pointer transition-all border-2 ${
                onboardingData.generateAIImages 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => setOnboardingData(prev => ({ 
                ...prev, 
                generateAIImages: true,
                useProductImages: false
              }))}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                    onboardingData.generateAIImages 
                      ? 'border-purple-500 bg-purple-500' 
                      : 'border-gray-300'
                  }`}>
                    {onboardingData.generateAIImages && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <Label className="text-sm font-semibold text-gray-900">
                        Generate AI images
                      </Label>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        ✨ Available
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Let AI create custom, professional images based on your product description
                    </p>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-700">
                        ✨ AI will generate hero images, product mockups, and visual elements tailored to your brand
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* No Images Option */}
            <Card 
              className={`cursor-pointer transition-all border-2 ${
                !onboardingData.useProductImages && !onboardingData.generateAIImages 
                  ? 'border-gray-500 bg-gray-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => setOnboardingData(prev => ({ 
                ...prev, 
                useProductImages: false,
                generateAIImages: false
              }))}
            >
     
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
