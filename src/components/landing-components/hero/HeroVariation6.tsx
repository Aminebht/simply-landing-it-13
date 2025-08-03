import React, { useState } from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useComponentMedia } from '@/hooks/useComponentMedia';
import { useStyles } from '../useStyles';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { getClass, getElementStyles } from '../classUtils';
import { getHeroVariation6ClassMaps } from './classmaps/hero-variation-6';

interface HeroVariation6Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
}

const HeroVariation6: React.FC<HeroVariation6Props> = ({
  content,
  styles,
  visibility,
  mediaUrls,
  isEditing,
  selectedElementId,
  onStyleChange,
  onContentChange,
  onElementSelect,
  viewport,
  componentId,
  customActions
}) => {
  // Use media service to manage images in media_urls column
  const { mediaUrls: hookMediaUrls, getMediaUrl, refreshMediaUrls } = useComponentMedia({
    componentId: componentId || 'hero-variation-6',
    autoLoad: true,
    initialMediaUrls: mediaUrls
  });
  const { primaryColor } = useStyles({ styles, variation: 6 });
  
  // Helper function to get media URL - prioritize fresh hook data over potentially stale props
  const getImageUrl = (fieldName: string): string | undefined => {
    return hookMediaUrls[fieldName] || getMediaUrl(fieldName) || mediaUrls?.[fieldName];
  };

  // Get shared class maps
  const {
    container: containerClassMap,
    header: headerClassMap,
    brandName: brandNameClassMap,
    contactEmail: contactEmailClassMap,
    mainContainer: mainContainerClassMap,
    grid: gridClassMap,
    imageContainer: imageContainerClassMap,
    professionalImage: professionalImageClassMap,
    contentLeft: contentLeftClassMap,
    badge: badgeClassMap,
    headline: headlineClassMap,
    subheadline: subheadlineClassMap,
    benefits: benefitsClassMap,
    benefit: benefitClassMap,
    priceSection: priceSectionClassMap,
    priceLabel: priceLabelClassMap,
    price: priceClassMap,
    priceDescription: priceDescriptionClassMap,
    ctaButton: ctaButtonClassMap,
    professionalName: professionalNameClassMap
  } = getHeroVariation6ClassMaps();

  const [isHoveringLogo, setIsHoveringLogo] = useState(false);

  // Action handler for CTA button
  const ctaAction = customActions?.['cta-button'];

  return (
    <SelectableElement
      elementId="container"
      isSelected={selectedElementId === 'container'}
      isEditing={isEditing}
      onSelect={onElementSelect}
      className={`relative min-h-screen ${getClass(containerClassMap, viewport)}`}
      style={{
        ...getElementStyles(styles, 'container'),
        background: getElementStyles(styles, 'container').backgroundColor || 
                   getElementStyles(styles, 'container').background || 
                   '#1a1a1a',
        color: getElementStyles(styles, 'container').textColor || '#ffffff'
      }}
    >
      {/* Header with Logo and Contact */}
      {visibility?.header !== false && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className={`max-w-7xl mx-auto ${getClass(headerClassMap, viewport)}`}>
            <div className={`flex items-center gap-3 ${getClass(brandNameClassMap, viewport)}`}>
              {/* Logo Section */}
              <SelectableElement
                elementId="brand-logo-icon"
                isSelected={selectedElementId === 'brand-logo-icon'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className="relative"
              >
                <div 
                  className="w-8 h-8 relative cursor-pointer"
                  onMouseEnter={() => setIsHoveringLogo(true)}
                  onMouseLeave={() => setIsHoveringLogo(false)}
                >
                  {getImageUrl('brandLogoIcon') ? (
                    <img 
                      src={getImageUrl('brandLogoIcon')} 
                      alt="Brand Logo" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-yellow-500 transform rotate-45 flex items-center justify-center">
                      <div className="w-4 h-4 bg-black transform -rotate-45"></div>
                    </div>
                  )}
                  
                  {/* Upload Overlay on Hover */}
                  {isEditing && isHoveringLogo && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center transition-all duration-200 z-10 rounded">
                      <ImageUpload
                        value={getImageUrl('brandLogoIcon') || ''}
                        onChange={async (url) => {
                          // The media service automatically saves to media_urls
                          // Refresh the media URLs to show the new image
                          await refreshMediaUrls();
                        }}
                        className="w-full h-full"
                        aspectRatio={1} // Square aspect ratio for logo
                        cropWidth={64}
                        cropHeight={64}
                        imageType="avatar"
                        enableWebP={true}
                        useMediaService={true}
                        componentId={componentId || 'hero-variation-6'}
                        fieldName="brandLogoIcon"
                        placeholder="Upload Logo"
                      />
                    </div>
                  )}
                </div>
              </SelectableElement>
              
              {/* Brand Name Section */}
              <SelectableElement
                elementId="brand-name"
                isSelected={selectedElementId === 'brand-name'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                onContentChange={onContentChange}
                contentField="brandName"
                isContentEditable={true}
                className={`text-white font-bold ${getClass(brandNameClassMap, viewport)}`}
                style={{
                  color: getElementStyles(styles, 'brand-name').textColor || '#ffffff',
                  fontWeight: getElementStyles(styles, 'brand-name').fontWeight || 'bold',
                  ...getElementStyles(styles, 'brand-name')
                }}
              >
                {content.brandName || 'The Jasmine Cole Method™'}
              </SelectableElement>
            </div>
            
            {/* Contact Email - Hidden on mobile */}
            <SelectableElement
              elementId="contact-email"
              isSelected={selectedElementId === 'contact-email'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              onContentChange={onContentChange}
              contentField="contactEmail"
              isContentEditable={true}
              className={`text-gray-300 flex items-center gap-2 ${getClass(contactEmailClassMap, viewport)}`}
              style={{
                color: getElementStyles(styles, 'contact-email').textColor || '#d1d5db',
                ...getElementStyles(styles, 'contact-email')
              }}
            >
              <span>✉️</span>
              {content.contactEmail || 'support@TheJasmineColeMethod™™.com'}
            </SelectableElement>
          </div>
        </div>
      )}

      
      <div className={`relative max-w-7xl mx-auto ${getClass(mainContainerClassMap, viewport)}`}>
        <div className={`items-center ${getClass(gridClassMap, viewport)}`}>
          {/* Right Content - Professional Image - First on mobile, last on desktop */}
          <div className={`relative flex items-center ${getClass(imageContainerClassMap, viewport)}`}>
            {visibility?.professionalImage !== false && (
              <SelectableElement
                elementId="professional-image"
                isSelected={selectedElementId === 'professional-image'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={`relative w-full max-w-md ${getClass(professionalImageClassMap, viewport)} bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden`}
                style={{
                  ...getElementStyles(styles, 'professional-image')
                }}
              >
                  {/* Professional Image */}
                  {getImageUrl('professionalImage') ? (
                    <img 
                      src={getImageUrl('professionalImage')} 
                      alt="Professional Image" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      {/* Professional Image Placeholder */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900">
                        {/* Professional business person placeholder */}
                        <div className="w-full h-full flex items-center justify-center relative">
                          {/* Suit jacket representation */}
                          <div className="w-64 h-80 bg-gradient-to-b from-gray-900 to-black rounded-t-full relative">
                            {/* Shirt/tie area */}
                            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-12 h-24 bg-white rounded-sm">
                              {/* Tie */}
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-20 bg-yellow-500 opacity-80"
                                   style={{
                                     background: 'repeating-linear-gradient(45deg, #d4af37, #d4af37 3px, #b8941f 3px, #b8941f 6px)'
                                   }}>
                              </div>
                            </div>
                            {/* Professional head/face area */}
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-amber-100 to-amber-200 rounded-full">
                              {/* Eyes */}
                              <div className="absolute top-6 left-2 w-2 h-2 bg-gray-800 rounded-full"></div>
                              <div className="absolute top-6 right-2 w-2 h-2 bg-gray-800 rounded-full"></div>
                              {/* Mouth */}
                              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-gray-600 rounded-full"></div>
                            </div>
                            {/* Arms/hands folded position */}
                            <div className="absolute top-24 left-6 w-12 h-10 bg-gray-900 rounded-lg transform rotate-12"></div>
                            <div className="absolute top-24 right-6 w-12 h-10 bg-gray-900 rounded-lg transform -rotate-12"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Professional lighting overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black opacity-40"></div>
                      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white to-transparent opacity-5"></div>
                    </>
                  )}
                  
                  {/* Professional name overlay */}
                  {visibility?.professionalName !== false && (
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                      <SelectableElement
                        elementId="professional-name"
                        isSelected={selectedElementId === 'professional-name'}
                        isEditing={isEditing}
                        onSelect={onElementSelect}
                        onContentChange={onContentChange}
                        contentField="professionalName"
                        isContentEditable={true}
                        className={`font-bold text-white bg-black bg-opacity-50 px-3 py-2 rounded-lg backdrop-blur-sm relative z-20 ${getClass(professionalNameClassMap, viewport)}`}
                        style={{
                          fontWeight: getElementStyles(styles, 'professional-name').fontWeight || 'bold',
                          color: getElementStyles(styles, 'professional-name').textColor || '#ffffff',
                          ...getElementStyles(styles, 'professional-name')
                        }}
                      >
                        {content.professionalName || 'Your Name'}
                      </SelectableElement>
                    </div>
                  )}
                  
                  {/* Image Upload overlay - show when editing and element is selected */}
                  {isEditing && selectedElementId === 'professional-image' && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                      <div className="w-full h-full p-4">
                        <ImageUpload
                          value={getImageUrl('professionalImage') || ''}
                          onChange={async (url) => {
                            // The media service automatically saves to media_urls
                            // Refresh the media URLs to show the new image
                            await refreshMediaUrls();
                          }}
                          className="w-full h-full"
                          aspectRatio={3/4} // Portrait aspect ratio for professional photo
                          cropWidth={450}
                          cropHeight={600}
                          placeholder="Upload Professional Image"
                          imageType="product"
                          enableWebP={true}
                          useMediaService={true}
                          componentId={componentId || 'hero-variation-6'}
                          fieldName="professionalImage"
                        />
                      </div>
                    </div>
                  )}
                </SelectableElement>
            )}
          </div>

          {/* Left Content - Second on mobile, first on desktop */}
          <SelectableElement
            elementId="content-left"
            isSelected={selectedElementId === 'content-left'}
            isEditing={isEditing}
            onSelect={onElementSelect}
            className={`text-left ${getClass(contentLeftClassMap, viewport)}`}
          >
            {/* Badge/Category */}
            {visibility?.badge !== false && (
              <SelectableElement
                elementId="badge"
                isSelected={selectedElementId === 'badge'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                onContentChange={onContentChange}
                contentField="badge"
                isContentEditable={true}
                className={`inline-block text-yellow-500 font-bold tracking-widest uppercase ${getClass(badgeClassMap, viewport)}`}
                style={{
                  color: getElementStyles(styles, 'badge').textColor || primaryColor || '#d4af37',
                  fontWeight: getElementStyles(styles, 'badge').fontWeight || 'bold',
                  letterSpacing: '0.1em',
                  ...getElementStyles(styles, 'badge')
                }}
              >
                {content.badge || 'THE #1 SOLUTION FOR EXPERTS'}
              </SelectableElement>
            )}
            
            {/* Main Headline */}
            {visibility?.headline !== false && (
              <SelectableElement
                elementId="headline"
                isSelected={selectedElementId === 'headline'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                onContentChange={onContentChange}
                contentField="headline"
                isContentEditable={true}
                className={`font-black leading-tight tracking-tight ${getClass(headlineClassMap, viewport)}`}
                style={{
                  fontWeight: getElementStyles(styles, 'headline').fontWeight || '900',
                  color: getElementStyles(styles, 'headline').textColor || '#ffffff',
                  lineHeight: getElementStyles(styles, 'headline').lineHeight || '1.1',
                  letterSpacing: '-0.02em',
                  ...getElementStyles(styles, 'headline')
                }}
              >
                {content.headline || 'GET MORE HIGH TICKET CLIENTS ORGANICALLY.'}
              </SelectableElement>
            )}

            {/* Subheadline */}
            {visibility?.subheadline !== false && (
              <SelectableElement
                elementId="subheadline"
                isSelected={selectedElementId === 'subheadline'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                onContentChange={onContentChange}
                contentField="subheadline"
                isContentEditable={true}
                className={`text-gray-400 leading-relaxed ${getClass(subheadlineClassMap, viewport)}`}
                style={{
                  color: getElementStyles(styles, 'subheadline').textColor || '#9ca3af',
                  lineHeight: getElementStyles(styles, 'subheadline').lineHeight || '1.5',
                  ...getElementStyles(styles, 'subheadline')
                }}
              >
                {content.subheadline || 'No paid ads. No complicated tech. No burnout.'}
              </SelectableElement>
            )}

            {/* Benefits List */}
            {visibility?.benefits !== false && (
              <SelectableElement
                elementId="benefits"
                isSelected={selectedElementId === 'benefits'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={`${getClass(benefitsClassMap, viewport)}`}
              >
                <div className="flex items-center gap-3">
                  <SelectableElement
                    elementId="benefit-1-icon"
                    isSelected={selectedElementId === 'benefit-1-icon'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: getElementStyles(styles, 'benefit-1-icon').backgroundColor || primaryColor || '#d4af37',
                      ...getElementStyles(styles, 'benefit-1-icon')
                    }}
                  >
                    <span className="text-black text-xs font-bold">✓</span>
                  </SelectableElement>
                  <SelectableElement
                    elementId="benefit-1"
                    isSelected={selectedElementId === 'benefit-1'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="benefit1"
                    isContentEditable={true}
                    className={`text-gray-300 ${getClass(benefitClassMap, viewport)}`}
                    style={{
                      color: getElementStyles(styles, 'benefit-1').textColor || '#d1d5db',
                      ...getElementStyles(styles, 'benefit-1')
                    }}
                  >
                    {content.benefit1 || 'Launch your business in just 7 days'}
                  </SelectableElement>
                </div>
                
                <div className="flex items-center gap-3">
                  <SelectableElement
                    elementId="benefit-2-icon"
                    isSelected={selectedElementId === 'benefit-2-icon'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: getElementStyles(styles, 'benefit-2-icon').backgroundColor || primaryColor || '#d4af37',
                      ...getElementStyles(styles, 'benefit-2-icon')
                    }}
                  >
                    <span className="text-black text-xs font-bold">✓</span>
                  </SelectableElement>
                  <SelectableElement
                    elementId="benefit-2"
                    isSelected={selectedElementId === 'benefit-2'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="benefit2"
                    isContentEditable={true}
                    className={`text-gray-300 ${getClass(benefitClassMap, viewport)}`}
                    style={{
                      color: getElementStyles(styles, 'benefit-2').textColor || '#d1d5db',
                      ...getElementStyles(styles, 'benefit-2')
                    }}
                  >
                    {content.benefit2 || 'Attract dream clients organically'}
                  </SelectableElement>
                </div>
                
                <div className="flex items-center gap-3">
                  <SelectableElement
                    elementId="benefit-3-icon"
                    isSelected={selectedElementId === 'benefit-3-icon'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: getElementStyles(styles, 'benefit-3-icon').backgroundColor || primaryColor || '#d4af37',
                      ...getElementStyles(styles, 'benefit-3-icon')
                    }}
                  >
                    <span className="text-black text-xs font-bold">✓</span>
                  </SelectableElement>
                  <SelectableElement
                    elementId="benefit-3"
                    isSelected={selectedElementId === 'benefit-3'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="benefit3"
                    isContentEditable={true}
                    className={`text-gray-300 ${getClass(benefitClassMap, viewport)}`}
                    style={{
                      color: getElementStyles(styles, 'benefit-3').textColor || '#d1d5db',
                      ...getElementStyles(styles, 'benefit-3')
                    }}
                  >
                    {content.benefit3 || 'Close deals without being salesy'}
                  </SelectableElement>
                </div>
              </SelectableElement>
            )}

           
            {visibility?.price !== false && (
              <SelectableElement
                elementId="price-section"
                isSelected={selectedElementId === 'price-section'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={`text-left border-t border-gray-700 ${getClass(priceSectionClassMap, viewport)}`}
              >
                <SelectableElement
                  elementId="price-label"
                  isSelected={selectedElementId === 'price-label'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="priceLabel"
                  isContentEditable={true}
                  className={`text-gray-400 uppercase tracking-wide mb-1 ${getClass(priceLabelClassMap, viewport)}`}
                  style={{
                    color: getElementStyles(styles, 'price-label').textColor || '#9ca3af',
                    fontWeight: getElementStyles(styles, 'price-label').fontWeight || '500',
                    ...getElementStyles(styles, 'price-label')
                  }}
                >
                  {content.priceLabel || 'Starting at'}
                </SelectableElement>
                
                <SelectableElement
                  elementId="price"
                  isSelected={selectedElementId === 'price'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="price"
                  isContentEditable={true}
                  className={`font-bold text-yellow-500 mb-1 ${getClass(priceClassMap, viewport)}`}
                  style={{
                    color: getElementStyles(styles, 'price').textColor  || primaryColor || '#d4af37',
                    fontWeight: getElementStyles(styles, 'price').fontWeight || 'bold',
                    ...getElementStyles(styles, 'price')
                  }}
                >
                  {content.price || '2,500'} DT
                </SelectableElement>
                
                <SelectableElement
                  elementId="price-description"
                  isSelected={selectedElementId === 'price-description'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="priceDescription"
                  isContentEditable={true}
                  className={`text-gray-300 ${getClass(priceDescriptionClassMap, viewport)}`}
                  style={{
                    color: getElementStyles(styles, 'price-description').textColor || '#d1d5db',
                    fontWeight: getElementStyles(styles, 'price-description').fontWeight || '400',
                    ...getElementStyles(styles, 'price-description')
                  }}
                >
                  {content.priceDescription || 'Consultation package'}
                </SelectableElement>
              </SelectableElement>
            )}
             {/* CTA Button */}
            {visibility?.ctaButton !== false && (
              renderButton({
                action: ctaAction,
                isEditing,
                content: content.ctaButton || 'BOOK FREE CONSULTING CALL',
                elementId: 'cta-button',
                selectedElementId,
                onSelect: onElementSelect,
                onContentChange,
                contentField: 'ctaButton',
                className: `inline-block bg-yellow-500 text-black rounded-lg font-bold tracking-wide hover:bg-yellow-400 transition-colors cursor-pointer ${getClass(ctaButtonClassMap, viewport)}`,
                style: {
                  backgroundColor: getElementStyles(styles, 'cta-button').backgroundColor || primaryColor || '#d4af37',
                  color: getElementStyles(styles, 'cta-button').textColor || '#fffffe',
                  fontWeight: getElementStyles(styles, 'cta-button').fontWeight || 'bold',
                  ...getElementStyles(styles, 'cta-button')
                },
                as: 'primary',
                viewport
              })
            )}

            {/* Professional Price Display */}
          </SelectableElement>
        </div>
      </div>
    </SelectableElement>
  );
};

export default HeroVariation6;