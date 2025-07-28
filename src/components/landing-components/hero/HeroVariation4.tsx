import React, { useState } from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useComponentMedia } from '@/hooks/useComponentMedia';
import { useStyles } from '../useStyles';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { getClass, getElementStyles } from '../classUtils';

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

  // Helper function to get media URL - prioritize prop over hook
  const getImageUrl = (fieldName: string): string | undefined => {
    return mediaUrls?.[fieldName] || hookMediaUrls[fieldName] || getMediaUrl(fieldName);
  };



  // Class maps for all elements
  const containerClassMap = {
    mobile: "relative min-h-screen flex items-center py-12 px-3",
    tablet: "relative min-h-screen flex items-center py-16 px-4",
    desktop: "relative min-h-screen flex items-center py-20 px-4",
    responsive: "relative min-h-screen flex items-center py-12 px-3 md:py-16 md:px-4 lg:py-20 lg:px-4"
  };
  const headerClassMap = {
    mobile: "text-center mb-8",
    tablet: "text-center mb-12",
    desktop: "text-center mb-16",
    responsive: "text-center mb-8 md:mb-12 lg:mb-16"
  };
  const badgeClassMap = {
    mobile: "inline-block font-semibold rounded-full px-3 py-1.5 text-xs mb-4",
    tablet: "inline-block font-semibold rounded-full px-4 py-2 text-sm mb-5",
    desktop: "inline-block font-semibold rounded-full px-4 py-2 text-sm mb-6",
    responsive: "inline-block font-semibold rounded-full px-3 py-1.5 text-xs mb-4 md:px-4 md:py-2 md:text-sm md:mb-5 lg:px-4 lg:py-2 lg:text-sm lg:mb-6"
  };
  const headlineClassMap = {
    mobile: "font-bold leading-tight text-4xl mb-4",
    tablet: "font-bold leading-tight text-6xl mb-5",
    desktop: "font-bold leading-tight text-7xl mb-6",
    responsive: "font-bold leading-tight text-4xl mb-4 md:text-6xl md:mb-5 lg:text-7xl lg:mb-6"
  };
  const subtitleClassMap = {
    mobile: "text-gray-300 mx-auto text-base mb-8 max-w-xl",
    tablet: "text-gray-300 mx-auto text-xl mb-10 max-w-2xl",
    desktop: "text-gray-300 mx-auto text-2xl mb-12 max-w-3xl",
    responsive: "text-gray-300 mx-auto text-base mb-8 max-w-xl md:text-xl md:mb-10 md:max-w-2xl lg:text-2xl lg:mb-12 lg:max-w-3xl"
  };
  const priceSectionClassMap = {
    mobile: "flex items-center justify-center gap-2 mb-6",
    tablet: "flex items-center justify-center gap-3 mb-7",
    desktop: "flex items-center justify-center gap-4 mb-8",
    responsive: "flex items-center justify-center gap-2 mb-6 md:gap-3 md:mb-7 lg:gap-4 lg:mb-8"
  };
  const priceClassMap = {
    mobile: "font-bold text-green-400 text-2xl",
    tablet: "font-bold text-green-400 text-3xl",
    desktop: "font-bold text-green-400 text-4xl",
    responsive: "font-bold text-green-400 text-2xl md:text-3xl lg:text-4xl"
  };
  const originalPriceClassMap = {
    mobile: "text-gray-400 line-through text-base",
    tablet: "text-gray-400 line-through text-lg",
    desktop: "text-gray-400 line-through text-xl",
    responsive: "text-gray-400 line-through text-base md:text-lg lg:text-xl"
  };
  const statsSectionClassMap = {
    mobile: "flex justify-center items-center gap-4 mb-8 flex-col",
    tablet: "flex justify-center items-center gap-6 mb-10 flex-row",
    desktop: "flex justify-center items-center gap-8 mb-12 flex-row",
    responsive: "flex justify-center items-center gap-4 mb-8 flex-col md:gap-6 md:mb-10 md:flex-row lg:gap-8 lg:mb-12 lg:flex-row"
  };
  const statValueClassMap = {
    purple: {
      mobile: "font-bold text-purple-400 text-2xl",
      tablet: "font-bold text-purple-400 text-3xl",
      desktop: "font-bold text-purple-400 text-3xl",
      responsive: "font-bold text-purple-400 text-2xl md:text-3xl lg:text-3xl"
    },
    pink: {
      mobile: "font-bold text-pink-400 text-2xl",
      tablet: "font-bold text-pink-400 text-3xl",
      desktop: "font-bold text-pink-400 text-3xl",
      responsive: "font-bold text-pink-400 text-2xl md:text-3xl lg:text-3xl"
    },
    blue: {
      mobile: "font-bold text-blue-400 text-2xl",
      tablet: "font-bold text-blue-400 text-3xl",
      desktop: "font-bold text-blue-400 text-3xl",
      responsive: "font-bold text-blue-400 text-2xl md:text-3xl lg:text-3xl"
    }
  };
  const statLabelClassMap = {
    mobile: "text-gray-400 text-xs",
    tablet: "text-gray-400 text-sm",
    desktop: "text-gray-400 text-sm",
    responsive: "text-gray-400 text-xs md:text-sm lg:text-sm"
  };
  const statsDividerClassMap = {
    mobile: "w-px bg-gray-600 h-8",
    tablet: "w-px bg-gray-600 h-10",
    desktop: "w-px bg-gray-600 h-12",
    responsive: "w-px bg-gray-600 h-8 md:h-10 lg:h-12"
  };
  const ctaButtonsSectionClassMap = {
    mobile: "flex gap-4 justify-center items-center flex-col mb-10",
    tablet: "flex gap-4 justify-center items-center flex-row mb-12",
    desktop: "flex gap-4 justify-center items-center flex-row mb-16",
    responsive: "flex gap-4 justify-center items-center flex-col mb-10 md:flex-row md:mb-12 lg:mb-16"
  };
  const primaryCTAClassMap = {
    mobile: "text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-xl px-6 py-3 text-base w-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    tablet: "text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-xl px-7 py-3.5 text-lg w-auto focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    desktop: "text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-xl px-8 py-4 text-lg w-auto focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    responsive: "text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-xl px-6 py-3 text-base w-full md:px-7 md:py-3.5 md:text-lg md:w-auto lg:px-8 lg:py-4 lg:text-lg lg:w-auto focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150"
  };
  const secondaryCTAClassMap = {
    mobile: "border-2 font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-300 transition-all px-6 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    tablet: "border-2 font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-300 transition-all px-7 py-3.5 text-base w-auto focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    desktop: "border-2 font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-300 transition-all px-8 py-4 text-base w-auto focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    responsive: "border-2 font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-300 transition-all px-6 py-3 text-sm w-full md:px-7 md:py-3.5 md:text-base md:w-auto lg:px-8 lg:py-4 lg:text-base lg:w-auto focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150"
  };
  const templateGridClassMap = {
    mobile: "grid max-w-5xl mx-auto grid-cols-1 gap-6",
    tablet: "grid max-w-5xl mx-auto grid-cols-2 gap-7",
    desktop: "grid max-w-5xl mx-auto grid-cols-3 gap-8",
    responsive: "grid max-w-5xl mx-auto grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8"
  };
  const templateCardClassMap = {
    mobile: "bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105 p-4",
    tablet: "bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105 p-5",
    desktop: "bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105 p-6",
    responsive: "bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105 p-4 md:p-5 lg:p-6"
  };
  const templateImageClassMap = {
    mobile: "aspect-video rounded-lg overflow-hidden relative mb-3",
    tablet: "aspect-video rounded-lg overflow-hidden relative mb-3.5",
    desktop: "aspect-video rounded-lg overflow-hidden relative mb-4",
    responsive: "aspect-video rounded-lg overflow-hidden relative mb-3 md:mb-3.5 lg:mb-4"
  };
  const templateTitleClassMap = {
    mobile: "text-white font-semibold mb-2 text-base",
    tablet: "text-white font-semibold mb-2 text-lg",
    desktop: "text-white font-semibold mb-2 text-lg",
    responsive: "text-white font-semibold mb-2 text-base md:text-lg lg:text-lg"
  };
  const templateDescClassMap = {
    mobile: "text-gray-300 text-sm",
    tablet: "text-gray-300 text-sm",
    desktop: "text-gray-300 text-sm",
    responsive: "text-gray-300 text-sm"
  };
  const bottomCTAClassMap = {
    mobile: "text-center mt-12",
    tablet: "text-center mt-14",
    desktop: "text-center mt-16",
    responsive: "text-center mt-12 md:mt-14 lg:mt-16"
  };
  const bottomTextClassMap = {
    mobile: "text-gray-400 mb-3 text-sm",
    tablet: "text-gray-400 mb-3.5 text-base",
    desktop: "text-gray-400 mb-4 text-base",
    responsive: "text-gray-400 mb-3 text-sm md:mb-3.5 md:text-base lg:mb-4 lg:text-base"
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