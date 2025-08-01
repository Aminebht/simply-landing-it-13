import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useComponentMedia } from '@/hooks/useComponentMedia';
import { useStyles } from '../useStyles';
import { DynamicCheckoutForm } from './shared/DynamicCheckoutForm';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { getClass, getElementStyles } from '../classUtils';
import { getCtaVariation3ClassMaps } from './classmaps/cta-variation-3';

interface CtaVariation3Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
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

  // Get shared class maps
  const {
    container: containerClassMap,
    grid: gridClassMap,
    imageContainer: imageContainerClassMap,
    contentContainer: contentContainerClassMap,
    card: cardClassMap,
    imageCard: imageCardClassMap,
    imageOverlay: imageOverlayClassMap,
    headline: headlineClassMap,
    checkoutForm: checkoutFormClassMap,
    ctaButton: ctaButtonClassMap,
    guarantee: guaranteeClassMap
  } = getCtaVariation3ClassMaps();

  // Action handler for CTA button
  const ctaAction = customActions?.['cta-button'];

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
                    onSubmit={() => { /* handle form submit */ }}
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