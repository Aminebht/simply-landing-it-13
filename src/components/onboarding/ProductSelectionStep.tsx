import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Camera } from 'lucide-react';
import type { OnboardingStepProps } from '@/types/onboarding';

interface ProductSelectionStepProps extends OnboardingStepProps {
  products: any[];
  onFetchProductMedia: (productId: string) => Promise<any>;
}

export const ProductSelectionStep = ({ 
  onboardingData, 
  setOnboardingData, 
  products, 
  onFetchProductMedia 
}: ProductSelectionStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="mr-2 h-5 w-5" />
          Select Product
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Choose the product you want to create a landing page for
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No products available</p>
            <p className="text-sm text-gray-400">Please create a product first before generating a landing page</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className={`cursor-pointer transition-all border-2 ${
                  onboardingData.selectedProduct?.id === product.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={async () => {
                  setOnboardingData(prev => ({ ...prev, selectedProduct: product }));
                  await onFetchProductMedia(product.id);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                      onboardingData.selectedProduct?.id === product.id 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {onboardingData.selectedProduct?.id === product.id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    
                    {product.preview_image_url ? (
                      <img 
                        src={product.preview_image_url} 
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded-lg border shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
                        <span className="text-lg font-bold text-green-600">
                          {product.price} TND
                        </span>
                      </div>
                      
                      {product.original_price && product.original_price !== product.price && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-gray-400 line-through">
                            {product.original_price} TND
                          </span>
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            Sale
                          </span>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {product.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {product.preview_image_url && (
                          <span className="flex items-center">
                            <Camera className="h-3 w-3 mr-1" />
                            Has images
                          </span>
                        )}
                        {product.tags && product.tags.length > 0 && (
                          <span className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                            {product.tags.length} tags
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
