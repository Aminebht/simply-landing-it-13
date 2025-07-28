import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useComponentMedia } from '@/hooks/useComponentMedia';
import { useStyles } from '../useStyles';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { getClass, getElementStyles } from '../classUtils';

interface HeroVariation1Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
}

const HeroVariation1: React.FC<HeroVariation1Props> = ({
  content,
  styles,
  visibility,
  mediaUrls,
  isEditing,
  selectedElementId,
  viewport,
  componentId,
  onStyleChange,
  onContentChange,
  onElementSelect,
  customActions // <-- Add this
}) => {
  const { primaryColor } = useStyles({ styles, variation: 1 });

  // Use media service to manage images in media_urls column
  const { mediaUrls: hookMediaUrls, getMediaUrl, refreshMediaUrls } = useComponentMedia({
    componentId: componentId || 'hero-variation-1',
    autoLoad: true,
    initialMediaUrls: mediaUrls
  });

  // Helper function to get media URL - prioritize prop over hook
  const getImageUrl = (fieldName: string): string | undefined => {
    return mediaUrls?.[fieldName] || hookMediaUrls[fieldName] || getMediaUrl(fieldName);
  };



  // Class maps for all elements - ensuring exact visual parity
  const containerClassMap = {
    mobile: "relative overflow-hidden min-h-screen flex items-center py-8 px-3",
    tablet: "relative overflow-hidden min-h-screen flex items-center py-16 px-6",
    desktop: "relative overflow-hidden min-h-screen flex items-center py-24 px-8",
    responsive: "relative overflow-hidden min-h-screen flex items-center py-8 px-3 md:py-16 md:px-6 lg:py-24 lg:px-8"
  };

  const gridClassMap = {
    mobile: "grid items-center grid-cols-1 gap-6",
    tablet: "grid items-center grid-cols-1 gap-10",
    desktop: "grid items-center grid-cols-2 gap-12",
    responsive: "grid items-center grid-cols-1 gap-6 md:grid-cols-1 md:gap-10 lg:grid-cols-2 lg:gap-12"
  };

  const leftContentClassMap = {
    mobile: "text-left order-2 px-2",
    tablet: "text-left order-2 px-0",
    desktop: "text-left order-1 px-0",
    responsive: "text-left order-2 px-2 md:order-2 md:px-0 lg:order-1 lg:px-0"
  };

  const rightContentClassMap = {
    mobile: "relative order-1 px-2",
    tablet: "relative order-1 px-0",
    desktop: "relative order-2 px-0",
    responsive: "relative order-1 px-2 md:order-1 md:px-0 lg:order-2 lg:px-0"
  };

  const badgeClassMap = {
    mobile: "inline-flex items-center rounded-full font-medium px-2 py-1 text-xs mb-4",
    tablet: "inline-flex items-center rounded-full font-medium px-3 py-1 text-sm mb-6",
    desktop: "inline-flex items-center rounded-full font-medium px-3 py-1 text-sm mb-6",
    responsive: "inline-flex items-center rounded-full font-medium px-2 py-1 text-xs mb-4 md:px-3 md:py-1 md:text-sm md:mb-6 lg:px-3 lg:py-1 lg:text-sm lg:mb-6"
  };

  const headlineClassMap = {
    mobile: "font-bold leading-tight text-2xl mb-3",
    tablet: "font-bold leading-tight text-4xl mb-4",
    desktop: "font-bold leading-tight text-6xl mb-6",
    responsive: "font-bold leading-tight text-2xl mb-3 md:text-4xl md:mb-4 lg:text-6xl lg:mb-6"
  };

  const subheadlineClassMap = {
    mobile: "text-gray-300 leading-relaxed text-sm mb-4",
    tablet: "text-gray-300 leading-relaxed text-lg mb-6",
    desktop: "text-gray-300 leading-relaxed text-xl mb-8",
    responsive: "text-gray-300 leading-relaxed text-sm mb-4 md:text-lg md:mb-6 lg:text-xl lg:mb-8"
  };

  const priceSectionClassMap = {
    mobile: "flex flex-wrap items-center gap-1.5 mb-4",
    tablet: "flex flex-wrap items-center gap-2 mb-6",
    desktop: "flex flex-wrap items-center gap-4 mb-8",
    responsive: "flex flex-wrap items-center gap-1.5 mb-4 md:gap-2 md:mb-6 lg:gap-4 lg:mb-8"
  };

  const priceClassMap = {
    mobile: "font-bold text-green-400 text-lg",
    tablet: "font-bold text-green-400 text-2xl",
    desktop: "font-bold text-green-400 text-3xl",
    responsive: "font-bold text-green-400 text-lg md:text-2xl lg:text-3xl"
  };

  const originalPriceClassMap = {
    mobile: "text-gray-400 line-through text-xs",
    tablet: "text-gray-400 line-through text-sm",
    desktop: "text-gray-400 line-through text-lg",
    responsive: "text-gray-400 line-through text-xs md:text-sm lg:text-lg"
  };

  const discountBadgeClassMap = {
    mobile: "bg-red-500 text-white font-medium rounded px-1 py-0.5 text-xs",
    tablet: "bg-red-500 text-white font-medium rounded px-1.5 py-0.5 text-xs",
    desktop: "bg-red-500 text-white font-medium rounded px-2 py-1 text-sm",
    responsive: "bg-red-500 text-white font-medium rounded px-1 py-0.5 text-xs md:px-1.5 md:py-0.5 md:text-xs lg:px-2 lg:py-1 lg:text-sm"
  };

  const buttonSectionClassMap = {
    mobile: "flex flex-col gap-2.5",
    tablet: "flex flex-row gap-3",
    desktop: "flex flex-row gap-4",
    responsive: "flex flex-col gap-2.5 md:flex-row md:gap-3 lg:flex-row lg:gap-4"
  };

  const ctaButtonClassMap = {
    mobile: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-4 py-2.5 text-sm",
    tablet: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-auto px-6 py-3 text-base",
    desktop: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-auto px-8 py-4 text-base",
    responsive: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-4 py-2.5 text-sm md:w-auto md:px-6 md:py-3 md:text-base lg:w-auto lg:px-8 lg:py-4 lg:text-base"
  };

  const secondaryButtonClassMap = {
    mobile: "border-2 border-gray-400 text-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-center w-full px-4 py-2.5 text-sm",
    tablet: "border-2 border-gray-400 text-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-center w-auto px-6 py-3 text-base",
    desktop: "border-2 border-gray-400 text-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-center w-auto px-8 py-4 text-base",
    responsive: "border-2 border-gray-400 text-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-center w-full px-4 py-2.5 text-sm md:w-auto md:px-6 md:py-3 md:text-base lg:w-auto lg:px-8 lg:py-4 lg:text-base"
  };

  const productImageContainerClassMap = {
    mobile: "relative",
    tablet: "relative",
    desktop: "relative",
    responsive: "relative"
  };

  const productImageClassMap = {
    mobile: "w-full overflow-hidden transition-transform duration-300 hover:rotate-0 h-48 rounded-lg shadow-lg transform rotate-0",
    tablet: "w-full overflow-hidden transition-transform duration-300 hover:rotate-0 h-80 rounded-xl shadow-xl transform rotate-1",
    desktop: "w-full overflow-hidden transition-transform duration-300 hover:rotate-0 h-96 rounded-2xl shadow-2xl transform rotate-3",
    responsive: "w-full overflow-hidden transition-transform duration-300 hover:rotate-0 h-48 rounded-lg shadow-lg transform rotate-0 md:h-80 md:rounded-xl md:shadow-xl md:transform md:rotate-1 lg:h-96 lg:rounded-2xl lg:shadow-2xl lg:transform lg:rotate-3"
  };

  // Action handler for CTA button
  const ctaAction = customActions?.['cta-button'];
  // Action handler for Secondary button
  const secondaryAction = customActions?.['secondary-button'];


  return (
    <SelectableElement
      elementId="container"
      isSelected={selectedElementId === 'container'}
      isEditing={isEditing}
      onSelect={onElementSelect}
      className={getClass(containerClassMap, viewport)}
      style={{
        ...getElementStyles(styles, 'container'),
        background: getElementStyles(styles, 'container').backgroundColor || '#fff',
        color: getElementStyles(styles, 'container').textColor || '#0f172a'
      }}
    >

      
      <div className="relative w-full max-w-7xl mx-auto">
        <div className={getClass(gridClassMap, viewport)}>
          {/* Left Content */}
          <SelectableElement
            elementId="content-left"
            isSelected={selectedElementId === 'content-left'}
            isEditing={isEditing}
            onSelect={onElementSelect}
            className={getClass(leftContentClassMap, viewport)}
          >
            {visibility?.badge !== false && (
              <SelectableElement
                elementId="badge"
                isSelected={selectedElementId === 'badge'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                onContentChange={onContentChange}
                contentField="badge"
                isContentEditable={true}
                className={getClass(badgeClassMap, viewport)}
                style={{
                  backgroundColor: getElementStyles(styles, 'badge').backgroundColor || primaryColor || '#2563e0',
                  color: getElementStyles(styles, 'badge').textColor || '#ffffff',
                  ...getElementStyles(styles, 'badge')
                }}
              >
                {content.badge || '🔥 Best Seller'}
              </SelectableElement>
            )}
            
            {visibility?.headline !== false && (
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
                  color: getElementStyles(styles, 'headline').textColor || '#ffffff',
                  ...getElementStyles(styles, 'headline')
                }}
              >
                {content.headline || 'Master Digital Marketing in 30 Days'}
              </SelectableElement>
            )}
            
            {visibility?.subheadline !== false && (
              <SelectableElement
                elementId="subheadline"
                isSelected={selectedElementId === 'subheadline'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                onContentChange={onContentChange}
                contentField="subheadline"
                isContentEditable={true}
                className={getClass(subheadlineClassMap, viewport)}
                style={{
                  color: getElementStyles(styles, 'subheadline').textColor || '#d1d5db',
                  ...getElementStyles(styles, 'subheadline')
                }}
              >
                {content.subheadline || 'Transform your business with our comprehensive digital marketing course. Learn proven strategies used by top professionals.'}
              </SelectableElement>
            )}

            {visibility?.price !== false && (
              <SelectableElement
                elementId="price-section"
                isSelected={selectedElementId === 'price-section'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={getClass(priceSectionClassMap, viewport)}
              >
                <SelectableElement
                  elementId="price"
                  isSelected={selectedElementId === 'price'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="price"
                  isContentEditable={true}
                  className={getClass(priceClassMap, viewport)}
                  style={{
                    ...getElementStyles(styles, 'price'),
                    color: getElementStyles(styles, 'price').color || primaryColor || '#2563e0'
                  }}
                >
                  {content.price || '197'} DT
                </SelectableElement>
                {content.originalPrice && (
                  <SelectableElement
                    elementId="original-price"
                    isSelected={selectedElementId === 'original-price'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="originalPrice"
                    isContentEditable={true}
                    className={getClass(originalPriceClassMap, viewport)}
                    style={{
                      color: getElementStyles(styles, 'original-price').textColor || '#9ca3af',
                      ...getElementStyles(styles, 'original-price')
                    }}
                  >
                    {content.originalPrice} DT
                  </SelectableElement>
                )}
              </SelectableElement>
            )}
            
            <SelectableElement
              elementId="button-section"
              isSelected={selectedElementId === 'button-section'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              className={getClass(buttonSectionClassMap, viewport)}
            >
              {visibility?.ctaButton !== false && (
                renderButton({
                  action: ctaAction,
                  isEditing,
                  content: content.ctaButton || 'Get Instant Access',
                  elementId: 'cta-button',
                  selectedElementId,
                  onSelect: onElementSelect,
                  onContentChange,
                  contentField: 'ctaButton',
                  className: getClass(ctaButtonClassMap, viewport),
                  style: {
                    ...getElementStyles(styles, 'cta-button'),
                    backgroundColor: getElementStyles(styles, 'cta-button').backgroundColor || primaryColor || '#2563e0',
                  },
                  as: 'primary',
                  viewport
                })
              )}
              
              {visibility?.secondaryButton !== false && (
                renderButton({
                  action: secondaryAction,
                  isEditing,
                  content: content.secondaryButton || 'Preview Course',
                  elementId: 'secondary-button',
                  selectedElementId,
                  onSelect: onElementSelect,
                  onContentChange,
                  contentField: 'secondaryButton',
                  className: getClass(secondaryButtonClassMap, viewport),
                  style: {
                    borderColor: getElementStyles(styles, 'secondary-button').borderColor || primaryColor || '#9ca3af',
                    color: getElementStyles(styles, 'secondary-button').textColor || primaryColor || '#d1d5db',
                    borderRadius: getElementStyles(styles, 'secondary-button').borderRadius || 8,
                    ...getElementStyles(styles, 'secondary-button')
                  },
                  as: 'secondary',
                  viewport
                })
              )}
            </SelectableElement>
          </SelectableElement>

          {/* Right Visual */}
          <SelectableElement
            elementId="content-right"
            isSelected={selectedElementId === 'content-right'}
            isEditing={isEditing}
            onSelect={onElementSelect}
            className={getClass(rightContentClassMap, viewport)}
          >
            {visibility?.productImage !== false && (
              <SelectableElement
                elementId="product-image-container"
                isSelected={selectedElementId === 'product-image-container'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={getClass(productImageContainerClassMap, viewport)}
              >
                <SelectableElement
                  elementId="product-image"
                  isSelected={selectedElementId === 'product-image'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  className={getClass(productImageClassMap, viewport)}
                  style={{
                    ...getElementStyles(styles, 'product-image')
                  }}
                >
                  <ImageUpload
                    value={getImageUrl('productImage') || ''}
                    onChange={async (value) => {
                      // The media service automatically saves to media_urls
                      // Refresh the media URLs to show the new image
                      await refreshMediaUrls();
                    }}
                    placeholder="Upload product image"
                    className="w-full h-full"
                    disabled={!isEditing}
                    containerId="product-image"
                    autoDetectDimensions={true}
                    aspectRatio={4/3} // Fallback aspect ratio
                    minWidth={200}
                    minHeight={150}
                    imageType="product"
                    enableWebP={true}
                    useMediaService={true}
                    componentId={componentId || 'hero-variation-1'}
                    fieldName="productImage"
                  />
                </SelectableElement>
              </SelectableElement>
            )}
          </SelectableElement>
        </div>
      </div>
    </SelectableElement>
  );
};

export default HeroVariation1;
