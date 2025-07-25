import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useComponentMedia } from '@/hooks/useComponentMedia';
import { useStyles } from '../useStyles';
import { DynamicCheckoutForm } from './shared/DynamicCheckoutForm';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { getClass, getElementStyles } from '../classUtils';

interface CtaVariation3Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
  customActions?: Record<string, any>;
}

const CtaVariation3: React.FC<CtaVariation3Props> = ({
  content,
  styles = {},
  visibility = {},
  mediaUrls,
  isEditing,
  selectedElementId,
  viewport,
  componentId,
  onStyleChange,
  onContentChange,
  onElementSelect,
  customActions
}) => {
  // Get primaryColor from styles
  const { primaryColor } = useStyles({ styles, variation: 3 });


  const { mediaUrls: hookMediaUrls, getMediaUrl, refreshMediaUrls } = useComponentMedia({
    componentId: componentId, // must be a valid UUID
    autoLoad: true,
    initialMediaUrls: mediaUrls
  });
  const getImageUrl = (fieldName: string): string | undefined => {
    return mediaUrls?.[fieldName] || hookMediaUrls[fieldName] || getMediaUrl(fieldName);
  };

  // Class maps for layout and cards
  const containerClassMap = {
    mobile: "relative overflow-hidden py-12 px-4 bg-gradient-to-br from-slate-50 to-white",
    tablet: "relative overflow-hidden py-16 px-6 bg-gradient-to-br from-slate-50 to-white",
    desktop: "relative overflow-hidden py-20 px-8 bg-gradient-to-br from-slate-50 to-white",
    responsive: "relative overflow-hidden py-12 px-4 bg-gradient-to-br from-slate-50 to-white md:py-16 md:px-6 lg:py-20 lg:px-8"
  };
  const gridClassMap = {
    mobile: "grid items-center  grid-cols-1 gap-8",
    tablet: "grid items-center grid-cols-1 gap-12",
    desktop: "grid items-center grid-cols-2 gap-16",
    responsive: "grid items-center grid-cols-1 gap-8 md:grid-cols-1 md:gap-12 lg:grid-cols-2 lg:gap-16"
  };
  const imageContainerClassMap = {
    mobile: "relative order-2 px-2 h-full",
    tablet: "relative order-2 px-0 h-full",
    desktop: "relative order-1 px-0 h-full",
    responsive: "relative order-2 px-2 md:order-2 md:px-0 lg:order-1 lg:px-0"
  };
  const contentContainerClassMap = {
    mobile: "order-1 px-2",
    tablet: "order-1 px-0",
    desktop: "order-2 px-0",
    responsive: "order-1 px-2 md:order-1 md:px-0 lg:order-2 lg:px-0"
  };
  const cardClassMap = {
    mobile: "bg-white rounded-2xl shadow-xl border border-gray-100 p-6",
    tablet: "bg-white rounded-2xl shadow-xl border border-gray-100 p-8",
    desktop: "bg-white rounded-2xl shadow-xl border border-gray-100 p-10",
    responsive: "bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 lg:p-10"
  };
  const imageCardClassMap = {
    mobile: "bg-white rounded-2xl shadow-xl h-full min-h-[300px] overflow-hidden",
    tablet: "bg-white rounded-2xl shadow-xl h-full min-h-[300px] overflow-hidden",
    desktop: "bg-white rounded-2xl shadow-xl h-full min-h-[350px] overflow-hidden",
    responsive: "bg-white rounded-2xl shadow-xl h-full min-h-[300px] lg:min-h-[350px] overflow-hidden"
  };
  const imageOverlayClassMap = {
    mobile: "absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-xl",
    tablet: "absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-xl",
    desktop: "absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-2xl",
    responsive: "absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-xl lg:rounded-2xl"
  };
  const headlineClassMap = {
    mobile: "font-bold text-2xl mb-2 text-gray-900",
    tablet: "font-bold text-3xl mb-3 text-gray-900",
    desktop: "font-bold text-3xl mb-4 text-gray-900",
    responsive: "font-bold text-2xl mb-2 text-gray-900 md:text-3xl md:mb-3 lg:text-3xl lg:mb-4"
  };


  const checkoutFormClassMap = {
    mobile: "mb-6",
    tablet: "mb-6",
    desktop: "mb-6",
    responsive: "mb-6"
  };
  const ctaButtonClassMap = {
    mobile: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-4 py-3 text-sm mb-4",
    tablet: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-6 py-4 text-base mb-4",
    desktop: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-8 py-4 text-base mb-4",
    responsive: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-4 py-3 text-sm mb-4 md:px-6 md:py-4 md:text-base lg:px-8 lg:py-4 lg:text-base"
  };
  const guaranteeClassMap = {
    mobile: "text-center text-xs text-gray-500 flex items-center justify-center gap-1",
    tablet: "text-center text-sm text-gray-500 flex items-center justify-center gap-2",
    desktop: "text-center text-sm text-gray-500 flex items-center justify-center gap-2",
    responsive: "text-center text-xs text-gray-500 flex items-center justify-center gap-1 md:text-sm md:gap-2 lg:text-sm lg:gap-2"
  };

  // Action handler for CTA button
  const ctaAction = customActions?.['cta-button'];
  console.log('CtaVariation3 CTA debug:', { ctaAction, isEditing });

  return (
    <SelectableElement
      elementId="container"
      isSelected={selectedElementId === 'container'}
      isEditing={isEditing}
      onSelect={onElementSelect}
      className={getClass(containerClassMap, viewport)}
      style={{
        ...getElementStyles(styles, 'container'),
        background: getElementStyles(styles, 'container').background || getElementStyles(styles, 'container').backgroundColor || '#f8fafc',
        color: getElementStyles(styles, 'container').textColor || '#1e293b'
      }}
    >
      <div className="relative w-full max-w-7xl mx-auto">
      <div className={`${getClass(gridClassMap, viewport)} ${visibility.productImage === false ? 'lg:!grid-cols-1 lg:place-items-center' : ''}`}>
       
            {visibility.productImage !== false && (
              <SelectableElement
                elementId="product-image-container"
                isSelected={selectedElementId === 'product-image-container'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={getClass(imageCardClassMap, viewport)}
                style={{
                  backgroundColor: getElementStyles(styles, 'card').backgroundColor || '#ffffff',
                  borderColor: getElementStyles(styles, 'card').borderColor || '#e5e7eb',
                  ...getElementStyles(styles, 'product-image-container')
                }}
              >
                  <ImageUpload
                    value={getImageUrl('productImage') || ''}
                    onChange={async (value) => {
                      await refreshMediaUrls();
                    }}
                    placeholder="Upload product image"
                    className="w-full h-full object-cover"
                    disabled={!isEditing}
                    containerId="product-image"
                    autoDetectDimensions={true}
                    aspectRatio={4/3}
                    minWidth={200}
                    minHeight={150}
                    imageType="product"
                    enableWebP={true}
                    useMediaService={true}
                    componentId={componentId || 'cta-variation-3'}
                    fieldName="productImage"
                  />
                <div className={getClass(imageOverlayClassMap, viewport)} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}></div>
              </SelectableElement>
            )}

          {/* Content Side */}
          <SelectableElement
            elementId="content-container"
            isSelected={selectedElementId === 'content-container'}
            isEditing={isEditing}
            onSelect={onElementSelect}
            className={getClass(contentContainerClassMap, viewport)}
          >
            <SelectableElement
              elementId="card"
              isSelected={selectedElementId === 'card'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              className={getClass(cardClassMap, viewport)}
              style={{
                backgroundColor: getElementStyles(styles, 'card').backgroundColor || '#ffffff',
                borderColor: getElementStyles(styles, 'card').borderColor || '#e5e7eb',
                ...getElementStyles(styles, 'card')
              }}
            >
              {visibility.headline !== false && (
                <SelectableElement
                  elementId="headline"
                  isSelected={selectedElementId === 'headline'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="headline"
                  isContentEditable={true}
                  className={getClass(headlineClassMap, viewport)}
                  style={{
                    color: getElementStyles(styles, 'headline').textColor || '#111827',
                    ...getElementStyles(styles, 'headline')
                  }}
                >
                     {content.headline || 'Start Reading in Minutes'}
                </SelectableElement>
              )}

                <div className="flex flex-row items-center gap-4 mb-6">
                  <SelectableElement
                    elementId="price"
                    isSelected={selectedElementId === 'price'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="price"
                    isContentEditable={true}
                    className="font-bold text-2xl md:text-3xl text-primary text-center"
                    style={{ color: getElementStyles(styles, 'price').textColor || primaryColor|| '#2563eb', 
                      ...getElementStyles(styles, 'price') }}
                  >
                    {content.price || '19'} DT
                  </SelectableElement>
                  {content.priceLabel && (
                    <SelectableElement
                      elementId="price-label"
                      isSelected={selectedElementId === 'price-label'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={onContentChange}
                      contentField="priceLabel"
                      isContentEditable={true}
                      className="text-gray-500 text-base md:text-lg text-center"
                      style={{ color: getElementStyles(styles, 'price-label').textColor || '#4b5563', ...getElementStyles(styles, 'price-label') }}
                    >
                      {content.priceLabel}
                    </SelectableElement>
                  )}
                </div>
             
                <SelectableElement
                  elementId="checkout-form"
                  isSelected={selectedElementId === 'checkout-form'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  className={getClass(checkoutFormClassMap, viewport)}
                >
                  <DynamicCheckoutForm 
                    className="w-full"
                    onSubmit={(data) => console.log('Form submitted:', data)}
                  />
                </SelectableElement>

              {
                renderButton({
                  action: ctaAction,
                  isEditing,
                  content: content.ctaButton || 'Get My Copy',
                  elementId: 'cta-button',
                  selectedElementId,
                  onSelect: onElementSelect,
                  onContentChange,
                  contentField: 'ctaButton',
                  className: getClass(ctaButtonClassMap, viewport),
                  style: {
                    ...getElementStyles(styles, 'cta-button'),
                    backgroundColor: getElementStyles(styles, 'cta-button').backgroundColor || primaryColor || '#2563eb',
                    color: getElementStyles(styles, 'cta-button').textColor || '#ffffff'
                  },
                  as: 'primary',
                  viewport
                })
              }

              {visibility.guarantee !== false && (
                <SelectableElement
                  elementId="guarantee"
                  isSelected={selectedElementId === 'guarantee'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="guaranteeText"
                  isContentEditable={true}
                  className={getClass(guaranteeClassMap, viewport)}
                  style={{
                    color: getElementStyles(styles, 'guarantee').textColor || '#6b7280',
                    ...getElementStyles(styles, 'guarantee')
                  }}
                >
                  <span className="text-base">🛡️</span>
                  <span>{content.guaranteeText ||'Secure payment'}</span>
                </SelectableElement>
              )}
            </SelectableElement>
          </SelectableElement>
        </div>
      </div>
    </SelectableElement>
  );
};

export default CtaVariation3;