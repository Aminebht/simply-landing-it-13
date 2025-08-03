import React, { useState } from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useComponentMedia } from '@/hooks/useComponentMedia';
import { useStyles } from '../useStyles';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { getClass, getElementStyles } from '../classUtils';
import { getHeroVariation4ClassMaps } from './classmaps/hero-variation-4';

interface HeroVariation4Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
}

const HeroVariation4: React.FC<HeroVariation4Props> = ({
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
  customActions
}) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { primaryColor } = useStyles({ styles, variation: 4 });
  // Use media service to manage images in media_urls column
  const { mediaUrls: hookMediaUrls, getMediaUrl, refreshMediaUrls } = useComponentMedia({
    componentId: componentId || 'hero-variation-4',
    autoLoad: true,
    initialMediaUrls: mediaUrls
  });

  // Helper function to get media URL - prioritize fresh hook data over potentially stale props
  const getImageUrl = (fieldName: string): string | undefined => {
    return hookMediaUrls[fieldName] || getMediaUrl(fieldName) || mediaUrls?.[fieldName];
  };

  // Get shared class maps
  const {
    container: containerClassMap,
    header: headerClassMap,
    badge: badgeClassMap,
    headline: headlineClassMap,
    subtitle: subtitleClassMap,
    priceSection: priceSectionClassMap,
    price: priceClassMap,
    originalPrice: originalPriceClassMap,
    statsSection: statsSectionClassMap,
    statValue: statValueClassMap,
    statLabel: statLabelClassMap,
    statsDivider: statsDividerClassMap,
    ctaButtonsSection: ctaButtonsSectionClassMap,
    primaryCTA: primaryCTAClassMap,
    secondaryCTA: secondaryCTAClassMap,
    templateGrid: templateGridClassMap,
    templateCard: templateCardClassMap,
    templateImage: templateImageClassMap,
    templateTitle: templateTitleClassMap,
    templateDesc: templateDescClassMap,
    bottomCTA: bottomCTAClassMap,
    bottomText: bottomTextClassMap
  } = getHeroVariation4ClassMaps();

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
        background: getElementStyles(styles, 'container').backgroundColor || 
                   getElementStyles(styles, 'container').background || 
                   'linear-gradient(to bottom right, #0f1419, #1e1b4b, #0f1419)',
        color: getElementStyles(styles, 'container').textColor || '#ffffff'
      }}
    >
      
      
      <div className="relative max-w-7xl mx-auto">
        <div className={getClass(headerClassMap, viewport)}>
          {/* Category Badge */}
          {visibility?.badge !== false && (
            <SelectableElement
              elementId="badge"
              isSelected={selectedElementId === 'badge'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              onContentChange={onContentChange}
              contentField="category"
              isContentEditable={true}
              className={getClass(badgeClassMap, viewport)}
              style={{
                background: getElementStyles(styles, 'badge').backgroundColor ||  primaryColor ||
                           'linear-gradient(to right, #a855f7, #ec4899)',
                color: getElementStyles(styles, 'badge').textColor || '#ffffff',
                fontWeight: getElementStyles(styles, 'badge').fontWeight || 600,
                borderRadius: getElementStyles(styles, 'badge').borderRadius || 9999,
                ...getElementStyles(styles, 'badge')
              }}
            >
              {content.badge || '🎨 Premium Design Collection'}
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
              className={getClass(headlineClassMap, viewport)}
              style={{
                fontWeight: getElementStyles(styles, 'headline').fontWeight || 800,
                lineHeight: getElementStyles(styles, 'headline').lineHeight || 1.1,
                color: getElementStyles(styles, 'headline').textColor || '#fffffe',
                ...getElementStyles(styles, 'headline')
              }}
            >
              {content.headline || 'Professional Templates That Convert'}
            </SelectableElement>
          )}

            {/* Subtitle */}
            {visibility?.subheadline !== false && (
              <SelectableElement
                elementId="subheadline"
                isSelected={selectedElementId === 'subheadline'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                onContentChange={onContentChange}
                contentField="subheadline"
                isContentEditable={true}
                className={getClass(subtitleClassMap, viewport)}
                style={{
                  color: getElementStyles(styles, 'subheadline').textColor || '#d1d5db',
                  ...getElementStyles(styles, 'subheadline')
                }}
              >
                {content.subtitle || 'Access our complete library of premium design templates. Built by professionals, optimized for conversion, ready to customize.'}
              </SelectableElement>
            )}

            {/* Price Section */}
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
                    fontWeight: getElementStyles(styles, 'price').fontWeight || 700,
                    color: getElementStyles(styles, 'price').textColor || primaryColor || '#ec4899',
                    ...getElementStyles(styles, 'price')
                  }}
                >
                  {content.price || '49'} DT
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

            {/* Trust Indicators */}
            {visibility?.trustIndicators !== false && (
              <SelectableElement
                elementId="stats"
                isSelected={selectedElementId === 'stats'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={getClass(statsSectionClassMap, viewport)}
              >
                <SelectableElement
                  elementId="stat1"
                  isSelected={selectedElementId === 'stat1'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="stat1"
                  isContentEditable={true}
                  className="text-center"
                  style={{
                    color: getElementStyles(styles, 'stat1').textColor || '#ffffff',
                    ...getElementStyles(styles, 'stat1')
                  }}
                >
                  <SelectableElement
                    elementId="stat1-value"
                    isSelected={selectedElementId === 'stat1-value'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="stat1"
                    isContentEditable={true}
                    className={getClass(statValueClassMap.purple, viewport)}
                    style={{
                      fontWeight: getElementStyles(styles, 'stat1-value').fontWeight || 700,
                      color: getElementStyles(styles, 'stat1-value').textColor || '#c084fc',
                      ...getElementStyles(styles, 'stat1-value')
                    }}
                  >
                    {content.stat1 || '500+'}
                  </SelectableElement>
                  <SelectableElement
                    elementId="stat1-label"
                    isSelected={selectedElementId === 'stat1-label'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="stat1Label"
                    isContentEditable={true}
                    className={getClass(statLabelClassMap, viewport)}
                    style={{
                      color: getElementStyles(styles, 'stat1-label').textColor || '#9ca3af',
                      ...getElementStyles(styles, 'stat1-label')
                    }}
                  >
                    {content.stat1Label || 'Templates'}
                  </SelectableElement>
                </SelectableElement>
                <SelectableElement
                  elementId="stats-divider-1"
                  isSelected={selectedElementId === 'stats-divider-1'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  className={getClass(statsDividerClassMap, viewport)}
                  style={{
                    width: getElementStyles(styles, 'stats-divider-1').width || 1,
                    backgroundColor: getElementStyles(styles, 'stats-divider-1').backgroundColor || '#4b5563',
                    ...getElementStyles(styles, 'stats-divider-1')
                  }}
                >
                  <div></div>
                </SelectableElement>
                <SelectableElement
                  elementId="stat2"
                  isSelected={selectedElementId === 'stat2'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="stat2"
                  isContentEditable={true}
                  className="text-center"
                  style={{
                    color: getElementStyles(styles, 'stat2').textColor || '#ffffff',
                    ...getElementStyles(styles, 'stat2')
                  }}
                >
                  <SelectableElement
                    elementId="stat2-value"
                    isSelected={selectedElementId === 'stat2-value'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="stat2"
                    isContentEditable={true}
                    className={getClass(statValueClassMap.pink, viewport)}
                    style={{
                      fontWeight: getElementStyles(styles, 'stat2-value').fontWeight || 700,
                      color: getElementStyles(styles, 'stat2-value').textColor || '#f472b6',
                      ...getElementStyles(styles, 'stat2-value')
                    }}
                  >
                    {content.stat2 || '25K+'}
                  </SelectableElement>
                  <SelectableElement
                    elementId="stat2-label"
                    isSelected={selectedElementId === 'stat2-label'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="stat2Label"
                    isContentEditable={true}
                    className={getClass(statLabelClassMap, viewport)}
                    style={{
                      color: getElementStyles(styles, 'stat2-label').textColor || '#9ca3af',
                      ...getElementStyles(styles, 'stat2-label')
                    }}
                  >
                    {content.stat2Label || 'Downloads'}
                  </SelectableElement>
                </SelectableElement>
                <SelectableElement
                  elementId="stats-divider-2"
                  isSelected={selectedElementId === 'stats-divider-2'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  className={getClass(statsDividerClassMap, viewport)}
                  style={{
                    width: getElementStyles(styles, 'stats-divider-2').width || 1,
                    backgroundColor: getElementStyles(styles, 'stats-divider-2').backgroundColor || '#4b5563',
                    ...getElementStyles(styles, 'stats-divider-2')
                  }}
                >
                  <div></div>
                </SelectableElement>
                <SelectableElement
                  elementId="stat3"
                  isSelected={selectedElementId === 'stat3'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="stat3"
                  isContentEditable={true}
                  className="text-center"
                  style={{
                    color: getElementStyles(styles, 'stat3').textColor || '#ffffff',
                    ...getElementStyles(styles, 'stat3')
                  }}
                >
                  <SelectableElement
                    elementId="stat3-value"
                    isSelected={selectedElementId === 'stat3-value'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="stat3"
                    isContentEditable={true}
                    className={getClass(statValueClassMap.blue, viewport)}
                    style={{
                      fontWeight: getElementStyles(styles, 'stat3-value').fontWeight || 700,
                      color: getElementStyles(styles, 'stat3-value').textColor || '#60a5fa',
                      ...getElementStyles(styles, 'stat3-value')
                    }}
                  >
                    {content.stat3 || '4.9★'}
                  </SelectableElement>
                  <SelectableElement
                    elementId="stat3-label"
                    isSelected={selectedElementId === 'stat3-label'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="stat3Label"
                    isContentEditable={true}
                    className={getClass(statLabelClassMap, viewport)}
                    style={{
                      color: getElementStyles(styles, 'stat3-label').textColor || '#9ca3af',
                      ...getElementStyles(styles, 'stat3-label')
                    }}
                  >
                    {content.stat3Label || 'Rating'}
                  </SelectableElement>
                </SelectableElement>
              </SelectableElement>
            )}

            {/* CTA Buttons */}
            <SelectableElement
              elementId="cta-buttons-section"
              isSelected={selectedElementId === 'cta-buttons-section'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              className={getClass(ctaButtonsSectionClassMap, viewport)}
              style={getElementStyles(styles, 'cta-buttons-section')}
            >
              {visibility?.ctaButton !== false && (
                renderButton({
                  action: ctaAction,
                  isEditing,
                  content: content.ctaButton || 'Get All Templates Now',
                  elementId: 'cta-button',
                  selectedElementId,
                  onSelect: onElementSelect,
                  onContentChange,
                  contentField: 'ctaButton',
                  className: getClass(primaryCTAClassMap, viewport),
                  style: {
                    ...getElementStyles(styles, 'cta-button'),
                    background: getElementStyles(styles, 'cta-button').backgroundColor || primaryColor || 'linear-gradient(to right, #a855f7, #ec4899)',
                    color: getElementStyles(styles, 'cta-button').textColor || '#ffffff',
                    fontWeight: getElementStyles(styles, 'cta-button').fontWeight || 700,
                    borderRadius: getElementStyles(styles, 'cta-button').borderRadius || 8,
                    border: getElementStyles(styles, 'cta-button').border || 'none',
                  },
                  as: 'primary',
                  viewport
                })
              )}
              
              {visibility?.secondaryButton !== false && (
                renderButton({
                  action: secondaryAction,
                  isEditing,
                  content: content.secondaryButton || 'Browse Free Templates',
                  elementId: 'secondary-button',
                  selectedElementId,
                  onSelect: onElementSelect,
                  onContentChange,
                  contentField: 'secondaryCTA',
                  className: getClass(secondaryCTAClassMap, viewport),
                  style: {
                    backgroundColor: getElementStyles(styles, 'secondary-button').backgroundColor || 'transparent',
                    color: getElementStyles(styles, 'secondary-button').textColor || primaryColor || '#d1d5db',
                    borderColor: getElementStyles(styles, 'secondary-button').borderColor || primaryColor || '#9ca3af',
                    borderWidth: getElementStyles(styles, 'secondary-button').borderWidth || '2px',
                    borderStyle: getElementStyles(styles, 'secondary-button').borderStyle || 'solid',
                    fontWeight: getElementStyles(styles, 'secondary-button').fontWeight || 600,
                    borderRadius: getElementStyles(styles, 'secondary-button').borderRadius || 8,
                    ...getElementStyles(styles, 'secondary-button')
                  },
                  as: 'secondary',
                  viewport
                })
              )}
            </SelectableElement>

          {/* Template Showcase */}
          {visibility?.templates !== false && (
            <SelectableElement
              elementId="showcase"
              isSelected={selectedElementId === 'showcase'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              className="relative"
            >
              <SelectableElement
                elementId="template-grid"
                isSelected={selectedElementId === 'template-grid'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={getClass(templateGridClassMap, viewport)}
                style={getElementStyles(styles, 'template-grid')}
              >
                {/* Template Card 1 */}
                <div
                  onMouseEnter={() => setHoveredCard(1)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <SelectableElement
                    elementId="template-card-1"
                    isSelected={selectedElementId === 'template-card-1'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    className={getClass(templateCardClassMap, viewport)}
                    style={{
                      backgroundColor: getElementStyles(styles, 'template-card-1').backgroundColor || 'rgba(255,255,255,0.1)',
                      borderRadius: getElementStyles(styles, 'template-card-1').borderRadius || 16,
                      border: getElementStyles(styles, 'template-card-1').border || '1px solid rgba(255,255,255,0.2)',
                      ...getElementStyles(styles, 'template-card-1')
                    }}
                  >
                    <SelectableElement
                      elementId="template1-image"
                      isSelected={selectedElementId === 'template1-image'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      className={getClass(templateImageClassMap, viewport)}
                    >
                      {getImageUrl('template1Image') ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={getImageUrl('template1Image')} 
                            alt="Template 1 Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {isEditing && hoveredCard === 1 && (
                            <div className="absolute inset-0 bg-black/50 opacity-100 transition-opacity duration-200 rounded-lg">
                              <ImageUpload
                                value={getImageUrl('template1Image') || ''}
                                onChange={async (value) => {
                                  await refreshMediaUrls();
                                }}
                                placeholder="Upload template preview"
                                aspectRatio={16/9}
                                className="w-full h-full"
                                imageType="product"
                                enableWebP={true}
                                useMediaService={true}
                                componentId={componentId || 'hero-variation-4'}
                                fieldName="template1Image"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          <div
                            className="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center"
                            style={{
                              background: getElementStyles(styles, 'template1-image').backgroundColor || getElementStyles(styles, 'template1-image').background || 'linear-gradient(to bottom right, #c084fc, #f472b6)',
                              borderRadius: getElementStyles(styles, 'template1-image').borderRadius || 8,
                              ...getElementStyles(styles, 'template1-image')
                            }}
                          >
                            <SelectableElement
                              elementId="template1-icon"
                              isSelected={selectedElementId === 'template1-icon'}
                              isEditing={isEditing}
                              onSelect={onElementSelect}
                              onContentChange={onContentChange}
                              contentField="template1Icon"
                              isContentEditable={true}
                              className="text-white text-2xl"
                              style={{
                                color: getElementStyles(styles, 'template1-icon').textColor || '#ffffff',
                                fontSize: getElementStyles(styles, 'template1-icon').fontSize || 24,
                                ...getElementStyles(styles, 'template1-icon')
                              }}
                            >
                              {content.template1Icon || '🌐'}
                            </SelectableElement>
                          </div>
                          {isEditing && hoveredCard === 1 && (
                            <div className="absolute inset-0 bg-black/50 opacity-100 transition-opacity duration-200 rounded-lg">
                              <ImageUpload
                                value={getImageUrl('template1Image') || ''}
                                onChange={async (value) => {
                                  await refreshMediaUrls();
                                }}
                                placeholder="Upload template preview"
                                aspectRatio={16/9}
                                className="w-full h-full"
                                imageType="product"
                                enableWebP={true}
                                useMediaService={true}
                                componentId={componentId || 'hero-variation-4'}
                                fieldName="template1Image"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </SelectableElement>
                  <SelectableElement
                    elementId="template-title-1"
                    isSelected={selectedElementId === 'template-title-1'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="templateTitle1"
                    isContentEditable={true}
                    className={getClass(templateTitleClassMap, viewport)}
                    style={{
                      color: getElementStyles(styles, 'template-title-1').textColor || '#ffffff',
                      ...getElementStyles(styles, 'template-title-1')
                    }}
                  >
                    {content.templateTitle1 || 'Landing Page Kit'}
                  </SelectableElement>
                  <SelectableElement
                    elementId="template-desc-1"
                    isSelected={selectedElementId === 'template-desc-1'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="templateDesc1"
                    isContentEditable={true}
                    className={getClass(templateDescClassMap, viewport)}
                    style={{
                      color: getElementStyles(styles, 'template-desc-1').textColor || '#d1d5db',
                      ...getElementStyles(styles, 'template-desc-1')
                    }}                    >
                      {content.templateDesc1 || '12 high-converting templates'}
                    </SelectableElement>
                  </SelectableElement>
                </div>

                {/* Template Card 2 */}
                <div
                  onMouseEnter={() => setHoveredCard(2)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <SelectableElement
                    elementId="template-card-2"
                    isSelected={selectedElementId === 'template-card-2'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    className={getClass(templateCardClassMap, viewport)}
                    style={{
                      backgroundColor: getElementStyles(styles, 'template-card-2').backgroundColor || 'rgba(255,255,255,0.1)',
                      borderRadius: getElementStyles(styles, 'template-card-2').borderRadius || 16,
                      border: getElementStyles(styles, 'template-card-2').border || '1px solid rgba(255,255,255,0.2)',
                      ...getElementStyles(styles, 'template-card-2')
                    }}
                  >
                    <SelectableElement
                      elementId="template2-image"
                      isSelected={selectedElementId === 'template2-image'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      className={getClass(templateImageClassMap, viewport)}
                    >
                      {getImageUrl('template2Image') ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={getImageUrl('template2Image')} 
                            alt="Template 2 Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {isEditing && hoveredCard === 2 && (
                            <div className="absolute inset-0 bg-black/50 opacity-100 transition-opacity duration-200 rounded-lg">
                              <ImageUpload
                                value={getImageUrl('template2Image') || ''}
                                onChange={async (value) => {
                                  await refreshMediaUrls();
                                }}
                                placeholder="Upload template preview"
                                aspectRatio={16/9}
                                className="w-full h-full"
                                imageType="product"
                                enableWebP={true}
                                useMediaService={true}
                                componentId={componentId || 'hero-variation-4'}
                                fieldName="template2Image"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          <div
                            className="aspect-video bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center"
                            style={{
                              background: getElementStyles(styles, 'template2-image').backgroundColor || getElementStyles(styles, 'template2-image').background || 'linear-gradient(to bottom right, #60a5fa, #c084fc)',
                              borderRadius: getElementStyles(styles, 'template2-image').borderRadius || 8,
                              ...getElementStyles(styles, 'template2-image')
                            }}
                          >
                            <SelectableElement
                              elementId="template2-icon"
                              isSelected={selectedElementId === 'template2-icon'}
                              isEditing={isEditing}
                              onSelect={onElementSelect}
                              onContentChange={onContentChange}
                              contentField="template2Icon"
                              isContentEditable={true}
                              className="text-white text-2xl"
                              style={{
                                color: getElementStyles(styles, 'template2-icon').textColor || '#ffffff',
                                fontSize: getElementStyles(styles, 'template2-icon').fontSize || 24,
                                ...getElementStyles(styles, 'template2-icon')
                              }}
                            >
                              {content.template2Icon || '📱'}
                            </SelectableElement>
                          </div>
                          {isEditing && hoveredCard === 2 && (
                            <div className="absolute inset-0 bg-black/50 opacity-100 transition-opacity duration-200 rounded-lg">
                              <ImageUpload
                                value={getImageUrl('template2Image') || ''}
                                onChange={async (value) => {
                                  await refreshMediaUrls();
                                }}
                                placeholder="Upload template preview"
                                aspectRatio={16/9}
                                className="w-full h-full"
                                imageType="product"
                                enableWebP={true}
                                useMediaService={true}
                                componentId={componentId || 'hero-variation-4'}
                                fieldName="template2Image"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </SelectableElement>
                    <SelectableElement
                      elementId="template-title-2"
                      isSelected={selectedElementId === 'template-title-2'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={onContentChange}
                      contentField="templateTitle2"
                      isContentEditable={true}
                      className={getClass(templateTitleClassMap, viewport)}
                      style={{
                        color: getElementStyles(styles, 'template-title-2').textColor || '#ffffff',
                        ...getElementStyles(styles, 'template-title-2')
                      }}
                    >
                      {content.templateTitle2 || 'Mobile App UI Kit'}
                    </SelectableElement>
                    <SelectableElement
                      elementId="template-desc-2"
                      isSelected={selectedElementId === 'template-desc-2'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={onContentChange}
                      contentField="templateDesc2"
                      isContentEditable={true}
                      className={getClass(templateDescClassMap, viewport)}
                      style={{
                        color: getElementStyles(styles, 'template-desc-2').textColor || '#d1d5db',
                        ...getElementStyles(styles, 'template-desc-2')
                      }}
                    >
                      {content.templateDesc2 || '50+ screens & components'}
                    </SelectableElement>
                  </SelectableElement>
                </div>

                {/* Template Card 3 */}
                <div
                  onMouseEnter={() => setHoveredCard(3)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <SelectableElement
                    elementId="template-card-3"
                    isSelected={selectedElementId === 'template-card-3'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    className={getClass(templateCardClassMap, viewport)}
                    style={{
                      backgroundColor: getElementStyles(styles, 'template-card-3').backgroundColor || 'rgba(255,255,255,0.1)',
                      borderRadius: getElementStyles(styles, 'template-card-3').borderRadius || 16,
                      border: getElementStyles(styles, 'template-card-3').border || '1px solid rgba(255,255,255,0.2)',
                      ...getElementStyles(styles, 'template-card-3')
                    }}
                  >
                    <SelectableElement
                      elementId="template3-image"
                      isSelected={selectedElementId === 'template3-image'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      className={getClass(templateImageClassMap, viewport)}
                    >
                      {getImageUrl('template3Image') ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={getImageUrl('template3Image')} 
                            alt="Template 3 Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {isEditing && hoveredCard === 3 && (
                            <div className="absolute inset-0 bg-black/50 opacity-100 transition-opacity duration-200 rounded-lg">
                              <ImageUpload
                                value={getImageUrl('template3Image') || ''}
                                onChange={async (value) => {
                                  await refreshMediaUrls();
                                }}
                                placeholder="Upload template preview"
                                aspectRatio={16/9}
                                className="w-full h-full"
                                imageType="product"
                                enableWebP={true}
                                useMediaService={true}
                                componentId={componentId || 'hero-variation-4'}
                                fieldName="template3Image"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          <div
                            className="aspect-video bg-gradient-to-br from-green-400 to-blue-400 rounded-lg flex items-center justify-center"
                            style={{
                              background: getElementStyles(styles, 'template3-image').backgroundColor || getElementStyles(styles, 'template3-image').background || 'linear-gradient(to bottom right, #4ade80, #60a5fa)',
                              borderRadius: getElementStyles(styles, 'template3-image').borderRadius || 8,
                              ...getElementStyles(styles, 'template3-image')
                            }}
                          >
                            <SelectableElement
                              elementId="template3-icon"
                              isSelected={selectedElementId === 'template3-icon'}
                              isEditing={isEditing}
                              onSelect={onElementSelect}
                              onContentChange={onContentChange}
                              contentField="template3Icon"
                              isContentEditable={true}
                              className="text-white text-2xl"
                              style={{
                                color: getElementStyles(styles, 'template3-icon').textColor || '#ffffff',
                                fontSize: getElementStyles(styles, 'template3-icon').fontSize || 24,
                                ...getElementStyles(styles, 'template3-icon')
                              }}
                            >
                              {content.template3Icon || '🎨'}
                            </SelectableElement>
                          </div>
                          {isEditing && hoveredCard === 3 && (
                            <div className="absolute inset-0 bg-black/50 opacity-100 transition-opacity duration-200 rounded-lg">
                              <ImageUpload
                                value={getImageUrl('template3Image') || ''}
                                onChange={async (value) => {
                                  await refreshMediaUrls();
                                }}
                                placeholder="Upload template preview"
                                aspectRatio={16/9}
                                className="w-full h-full"
                                imageType="product"
                                enableWebP={true}
                                useMediaService={true}
                                componentId={componentId || 'hero-variation-4'}
                                fieldName="template3Image"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </SelectableElement>
                    <SelectableElement
                      elementId="template-title-3"
                      isSelected={selectedElementId === 'template-title-3'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={onContentChange}
                      contentField="templateTitle3"
                      isContentEditable={true}
                      className={getClass(templateTitleClassMap, viewport)}
                      style={{
                        color: getElementStyles(styles, 'template-title-3').textColor || '#ffffff',
                        ...getElementStyles(styles, 'template-title-3')
                      }}
                    >
                      {content.templateTitle3 || 'Dashboard Templates'}
                    </SelectableElement>
                    <SelectableElement
                      elementId="template-desc-3"
                      isSelected={selectedElementId === 'template-desc-3'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={onContentChange}
                      contentField="templateDesc3"
                      isContentEditable={true}
                      className={getClass(templateDescClassMap, viewport)}
                      style={{
                        color: getElementStyles(styles, 'template-desc-3').textColor || '#d1d5db',
                        ...getElementStyles(styles, 'template-desc-3')
                      }}
                    >
                      {content.templateDesc3 || 'Analytics & admin templates'}
                    </SelectableElement>
                  </SelectableElement>
                </div>

              </SelectableElement>
            </SelectableElement>
          )}

          {/* Bottom CTA */}
          {visibility?.ctaSentence !== false && (
            <SelectableElement
              elementId="bottom-cta"
              isSelected={selectedElementId === 'bottom-cta'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              className={getClass(bottomCTAClassMap, viewport)}
            >
              <SelectableElement
                elementId="bottom-text"
                isSelected={selectedElementId === 'bottom-text'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                onContentChange={onContentChange}
                contentField="ctaText"
                isContentEditable={true}
                className={getClass(bottomTextClassMap, viewport)}
                style={{
                  color: getElementStyles(styles, 'bottom-text').textColor || '#9ca3af',
                  ...getElementStyles(styles, 'bottom-text')
                }}
              >
                {content.ctaText || 'Join thousands of creators building with our templates'}
              </SelectableElement>
            </SelectableElement>
          )}
        </div>
      </div>
    </SelectableElement>
  );
};

export default HeroVariation4;