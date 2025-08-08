import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useComponentMedia } from '@/hooks/useComponentMedia';
import { useStyles } from '../useStyles';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { getClass, getElementStyles } from '../classUtils';
import { heroVariation1ClassMaps } from './classmaps/hero-variation-1';

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
  // Prefer freshly loaded URLs from the hook, then fallback to direct getter, then prop
  return hookMediaUrls[fieldName] || getMediaUrl(fieldName) || mediaUrls?.[fieldName];
  };



  // Use shared class maps
  const {
    container: containerClassMap,
    grid: gridClassMap,
    leftContent: leftContentClassMap,
    rightContent: rightContentClassMap,
    badge: badgeClassMap,
    headline: headlineClassMap,
    subheadline: subheadlineClassMap,
    priceContainer: priceSectionClassMap,
    price: priceClassMap,
    originalPrice: originalPriceClassMap,
    discountBadge: discountBadgeClassMap,
    buttonsContainer: buttonSectionClassMap,
    ctaButton: ctaButtonClassMap,
    secondaryButton: secondaryButtonClassMap,
    productImageContainer: productImageContainerClassMap,
    productImage: productImageClassMap
  } = heroVariation1ClassMaps;

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
