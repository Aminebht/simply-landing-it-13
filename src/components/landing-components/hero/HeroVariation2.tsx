import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { useStyles } from '../useStyles';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { getClass, getElementStyles } from '../classUtils';

interface HeroVariation2Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
}

const HeroVariation2: React.FC<HeroVariation2Props> = ({
  content,
  styles,
  visibility,
  isEditing,
  selectedElementId,
  viewport,
  componentId,
  onStyleChange,
  onContentChange,
  onElementSelect,
  customActions
}) => {
  const { primaryColor } = useStyles({ styles, variation: 2 });




  // Class maps for all elements - ensuring exact visual parity
  const containerClassMap = {
    mobile: "relative min-h-screen flex items-center py-8 px-3",
    tablet: "relative min-h-screen flex items-center py-16 px-6",
    desktop: "relative min-h-screen flex items-center py-20 px-8",
    responsive: "relative min-h-screen flex items-center py-8 px-3 md:py-16 md:px-6 lg:py-20 lg:px-8"
  };

  const gridClassMap = {
    mobile: "grid items-center grid-cols-1 gap-8",
    tablet: "grid items-center grid-cols-1 gap-12",
    desktop: "grid items-center grid-cols-2 gap-16",
    responsive: "grid items-center grid-cols-1 gap-8 md:grid-cols-1 md:gap-12 lg:grid-cols-2 lg:gap-16"
  };

  const leftContentClassMap = {
    mobile: "text-left order-2 px-2",
    tablet: "text-left order-2 px-0",
    desktop: "text-left order-1 px-0",
    responsive: "text-left order-2 px-2 md:order-2 md:px-0 lg:order-1 lg:px-0"
  };

  const rightContentClassMap = {
    mobile: "relative flex justify-center order-1 px-2",
    tablet: "relative flex justify-center order-1 px-0",
    desktop: "relative flex justify-center order-2 px-0",
    responsive: "relative flex justify-center order-1 px-2 md:order-1 md:px-0 lg:order-2 lg:px-0"
  };

  const badgeClassMap = {
    mobile: "inline-flex items-center rounded-full font-semibold px-3 py-1.5 text-xs mb-4",
    tablet: "inline-flex items-center rounded-full font-semibold px-4 py-2 text-sm mb-5",
    desktop: "inline-flex items-center rounded-full font-semibold px-4 py-2 text-sm mb-6",
    responsive: "inline-flex items-center rounded-full font-semibold px-3 py-1.5 text-xs mb-4 md:px-4 md:py-2 md:text-sm md:mb-5 lg:px-4 lg:py-2 lg:text-sm lg:mb-6"
  };

  const headlineClassMap = {
    mobile: "font-bold leading-tight text-3xl mb-4",
    tablet: "font-bold leading-tight text-5xl mb-5",
    desktop: "font-bold leading-tight text-6xl mb-6",
    responsive: "font-bold leading-tight text-3xl mb-4 md:text-5xl md:mb-5 lg:text-6xl lg:mb-6"
  };

  const subheadlineClassMap = {
    mobile: "text-gray-600 leading-relaxed text-base mb-6",
    tablet: "text-gray-600 leading-relaxed text-lg mb-7",
    desktop: "text-gray-600 leading-relaxed text-xl mb-8",
    responsive: "text-gray-600 leading-relaxed text-base mb-6 md:text-lg md:mb-7 lg:text-xl lg:mb-8"
  };

  const featuresClassMap = {
    mobile: "mb-6",
    tablet: "mb-7",
    desktop: "mb-8",
    responsive: "mb-6 md:mb-7 lg:mb-8"
  };

  const priceSectionClassMap = {
    mobile: "mb-6",
    tablet: "mb-7",
    desktop: "mb-8",
    responsive: "mb-6 md:mb-7 lg:mb-8"
  };

  const priceContainerClassMap = {
    mobile: "flex items-center gap-4 mb-4",
    tablet: "flex items-center gap-4 mb-5",
    desktop: "flex items-center gap-4 mb-6",
    responsive: "flex items-center gap-4 mb-4 md:mb-5 lg:mb-6"
  };

  const priceValueClassMap = {
    mobile: "font-bold text-amber-600 text-2xl",
    tablet: "font-bold text-amber-600 text-3xl",
    desktop: "font-bold text-amber-600 text-4xl",
    responsive: "font-bold text-amber-600 text-2xl md:text-3xl lg:text-4xl"
  };

  const priceLabelClassMap = {
    mobile: "text-gray-500 text-base",
    tablet: "text-gray-500 text-lg",
    desktop: "text-gray-500 text-lg",
    responsive: "text-gray-500 text-base md:text-lg lg:text-lg"
  };

  const buttonSectionClassMap = {
    mobile: "flex flex-col gap-3 mb-6",
    tablet: "flex flex-row gap-4 mb-7",
    desktop: "flex flex-row gap-4 mb-8",
    responsive: "flex flex-col gap-3 mb-6 md:flex-row md:gap-4 md:mb-7 lg:flex-row lg:gap-4 lg:mb-8"
  };

  const ctaButtonClassMap = {
    mobile: "bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors w-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    tablet: "bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors w-auto px-8 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    desktop: "bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors w-auto px-8 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    responsive: "bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors w-full px-6 py-3 text-sm md:w-auto md:px-8 md:py-4 md:text-base lg:w-auto lg:px-8 lg:py-4 lg:text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150"
  };

  const secondaryButtonClassMap = {
    mobile: "border-2 border-amber-600 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors w-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    tablet: "border-2 border-amber-600 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors w-auto px-8 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    desktop: "border-2 border-amber-600 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors w-auto px-8 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    responsive: "border-2 border-amber-600 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors w-full px-6 py-3 text-sm md:w-auto md:px-8 md:py-4 md:text-base lg:w-auto lg:px-8 lg:py-4 lg:text-base focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150"
  };

  const trustIndicatorsClassMap = {
    mobile: "flex items-center gap-6 text-sm text-gray-500 mt-6 flex-col gap-4",
    tablet: "flex items-center gap-6 text-sm text-gray-500 mt-7 flex-row gap-6",
    desktop: "flex items-center gap-6 text-sm text-gray-500 mt-8 flex-row gap-6",
    responsive: "flex items-center gap-6 text-sm text-gray-500 mt-6 flex-col gap-4 md:mt-7 md:flex-row md:gap-6 lg:mt-8 lg:flex-row lg:gap-6"
  };

  const bookCoverClassMap = {
    mobile: "relative rounded-lg shadow-2xl transform hover:rotate-3 transition-transform duration-300 w-64 h-80 rotate-3",
    tablet: "relative rounded-lg shadow-2xl transform hover:rotate-3 transition-transform duration-300 w-72 h-88 rotate-6",
    desktop: "relative rounded-lg shadow-2xl transform hover:rotate-3 transition-transform duration-300 w-80 h-96 rotate-6",
    responsive: "relative rounded-lg shadow-2xl transform hover:rotate-3 transition-transform duration-300 w-64 h-80 rotate-3 md:w-72 md:h-88 md:rotate-6 lg:w-80 lg:h-96 lg:rotate-6"
  };

  const bookContentClassMap = {
    mobile: "absolute rounded-md p-6 text-gray-800 bg-white inset-3",
    tablet: "absolute rounded-md p-6 text-gray-800 bg-white inset-4",
    desktop: "absolute rounded-md p-6 text-gray-800 bg-white inset-4",
    responsive: "absolute rounded-md p-6 text-gray-800 bg-white inset-3 md:inset-4 lg:inset-4"
  };

  const bookTitle1ClassMap = {
    mobile: "font-bold text-gray-900 text-base mb-2",
    tablet: "font-bold text-gray-900 text-lg mb-2",
    desktop: "font-bold text-gray-900 text-lg mb-2",
    responsive: "font-bold text-gray-900 text-base mb-2 md:text-lg md:mb-2 lg:text-lg lg:mb-2"
  };

  const bookTitle2ClassMap = {
    mobile: "font-bold text-amber-600 text-lg mb-3",
    tablet: "font-bold text-amber-600 text-xl mb-4",
    desktop: "font-bold text-amber-600 text-xl mb-4",
    responsive: "font-bold text-amber-600 text-lg mb-3 md:text-xl md:mb-4 lg:text-xl lg:mb-4"
  };

  const bookDividerClassMap = {
    mobile: "bg-[#d97706] w-12 h-0.5 mb-3",
    tablet: "bg-[#d97706] w-16 h-1 mb-4",
    desktop: "bg-[#d97706] w-16 h-1 mb-4",
    responsive: "bg-[#d97706] w-12 h-0.5 mb-3 md:w-16 md:h-1 md:mb-4 lg:w-16 lg:h-1 lg:mb-4"
  };

  const bookSubtitleClassMap = {
    mobile: "text-gray-600 text-xs mb-3",
    tablet: "text-gray-600 text-sm mb-4",
    desktop: "text-gray-600 text-sm mb-4",
    responsive: "text-gray-600 text-xs mb-3 md:text-sm md:mb-4 lg:text-sm lg:mb-4"
  };

  const bookFooterClassMap = {
    mobile: "border-t pt-3",
    tablet: "border-t pt-4",
    desktop: "border-t pt-4",
    responsive: "border-t pt-3 md:pt-4 lg:pt-4"
  };

  const bookAuthorClassMap = {
    mobile: "text-gray-500 text-xs mb-1",
    tablet: "text-gray-500 text-xs mb-2",
    desktop: "text-gray-500 text-xs mb-2",
    responsive: "text-gray-500 text-xs mb-1 md:text-xs md:mb-2 lg:text-xs lg:mb-2"
  };

  const bookYearClassMap = {
    mobile: "text-gray-500 text-xs",
    tablet: "text-gray-500 text-xs",
    desktop: "text-gray-500 text-xs",
    responsive: "text-gray-500 text-xs md:text-xs lg:text-xs"
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
        background: getElementStyles(styles, 'container').backgroundColor || '#ffffff',
        color: getElementStyles(styles, 'container').textColor || '#1f2937'
      }}
    >
      <div className="relative max-w-7xl mx-auto">
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
                  backgroundColor: getElementStyles(styles, 'badge').backgroundColor || primaryColor || '#d97706',
                  color: getElementStyles(styles, 'badge').textColor || '#ffffff',
                  ...getElementStyles(styles, 'badge')
                }}
              >
                {content.badge || '📚 #1 Best Seller'}
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
                {content.headline || 'Master Your Digital Marketing'}
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
                {content.subheadline || 'The complete guide to building a profitable online business with proven strategies and actionable insights.'}
              </SelectableElement>
            )}
            
            {visibility?.features !== false && (
              <SelectableElement
                elementId="features"
                isSelected={selectedElementId === 'features'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={getClass(featuresClassMap, viewport)}
              >
                <ul className="space-y-3">
                  <SelectableElement
                    elementId="feature1"
                    isSelected={selectedElementId === 'feature1'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="feature1"
                    isContentEditable={true}
                    className="flex items-center text-gray-700"
                    style={{
                      color: getElementStyles(styles, 'feature1').textColor || '#d1d5db',
                      ...getElementStyles(styles, 'feature1')
                    }}
                  >
                    <span className="mr-3 text-green-500">✓</span>
                    {content.feature1 || '200+ pages of actionable strategies'}
                  </SelectableElement>
                  <SelectableElement
                    elementId="feature2"
                    isSelected={selectedElementId === 'feature2'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="feature2"
                    isContentEditable={true}
                    className="flex items-center text-gray-700"
                    style={{
                      color: getElementStyles(styles, 'feature2').textColor || '#d1d5db',
                      ...getElementStyles(styles, 'feature2')
                    }}
                  >
                    <span className="mr-3 text-green-500">✓</span>
                    {content.feature2 || 'Step-by-step implementation guide'}
                  </SelectableElement>
                  <SelectableElement
                    elementId="feature3"
                    isSelected={selectedElementId === 'feature3'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="feature3"
                    isContentEditable={true}
                    className="flex items-center text-gray-700"
                    style={{
                      color: getElementStyles(styles, 'feature3').textColor || '#d1d5db',
                      ...getElementStyles(styles, 'feature3')
                    }}
                  >
                    <span className="mr-3 text-green-500">✓</span>
                    {content.feature3 || 'Bonus templates and resources'}
                  </SelectableElement>
                </ul>
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
                <div className={getClass(priceContainerClassMap, viewport)}>
                  <SelectableElement
                    elementId="priceValue"
                    isSelected={selectedElementId === 'priceValue'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="price"
                    isContentEditable={true}
                    className={getClass(priceValueClassMap, viewport)}
                    style={{
                      color: getElementStyles(styles, 'priceValue').textColor || primaryColor || '#d97706',
                      ...getElementStyles(styles, 'priceValue')
                    }}
                  >
                    {content.price || '29'} DT
                  </SelectableElement>
                  <SelectableElement
                    elementId="priceLabel"
                    isSelected={selectedElementId === 'priceLabel'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="priceLabel"
                    isContentEditable={true}
                    className={getClass(priceLabelClassMap, viewport)}
                    style={{
                      color: getElementStyles(styles, 'priceLabel').textColor || '#d1d5db',
                      ...getElementStyles(styles, 'priceLabel')
                    }}
                  >
                    {content.priceLabel || 'One-time payment'}
                  </SelectableElement>
                </div>
              </SelectableElement>
            )}
            
            {/* Action Buttons */}
            <SelectableElement
              elementId="buttons-section"
              isSelected={selectedElementId === 'buttons-section'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              className={getClass(buttonSectionClassMap, viewport)}
            >
              {visibility?.ctaButton !== false && (
                renderButton({
                  action: ctaAction,
                  isEditing,
                  content: content.ctaButton || 'Download Now',
                  elementId: 'cta-button',
                  selectedElementId,
                  onSelect: onElementSelect,
                  onContentChange,
                  contentField: 'ctaButton',
                  className: getClass(ctaButtonClassMap, viewport),
                  style: {
                    backgroundColor: getElementStyles(styles, 'ctaButton').backgroundColor || primaryColor || '#d97706',
                    color: getElementStyles(styles, 'ctaButton').textColor || '#ffffff',
                    borderRadius: getElementStyles(styles, 'ctaButton').borderRadius || 8,
                    ...getElementStyles(styles, 'ctaButton')
                  },
                  as: 'primary',
                  viewport
                })
              )}
              
              {visibility?.secondaryButton !== false && (
                renderButton({
                  action: secondaryAction,
                  isEditing,
                  content: content.secondaryButton || 'Read Sample',
                  elementId: 'secondary-button',
                  selectedElementId,
                  onSelect: onElementSelect,
                  onContentChange,
                  contentField: 'secondaryButton',
                  className: getClass(secondaryButtonClassMap, viewport),
                  style: {
                    backgroundColor: getElementStyles(styles, 'secondaryButton').backgroundColor || 'transparent',
                    color: getElementStyles(styles, 'secondaryButton').textColor || primaryColor || '#d97706',
                    borderColor: getElementStyles(styles, 'secondaryButton').borderColor || primaryColor || '#d97706',
                    borderRadius: getElementStyles(styles, 'secondaryButton').borderRadius || 8,
                    ...getElementStyles(styles, 'secondaryButton')
                  },
                  as: 'secondary',
                  viewport
                })
              )}
            </SelectableElement>
            
            {/* Trust Indicators */}
            {visibility?.trustIndicators !== false && (
              <SelectableElement
                elementId="trust-indicators"
                isSelected={selectedElementId === 'trust-indicators'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={getClass(trustIndicatorsClassMap, viewport)}
              >
                <SelectableElement
                  elementId="reviews"
                  isSelected={selectedElementId === 'reviews'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="reviews"
                  isContentEditable={true}
                  className="flex items-center gap-1"
                  style={{
                    color: getElementStyles(styles, 'reviews').textColor || '#d1d5db',
                    ...getElementStyles(styles, 'reviews')
                  }}
                >
                  <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  <span>{content.reviews || '4.9/5 (2,847 reviews)'}</span>
                </SelectableElement>
                <SelectableElement
                  elementId="downloads"
                  isSelected={selectedElementId === 'downloads'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="downloads"
                  isContentEditable={true}
                  className="flex items-center gap-1"
                  style={{
                    color: getElementStyles(styles, 'downloads').textColor || '#d1d5db',
                    ...getElementStyles(styles, 'downloads')
                  }}
                >
                  <span>📥</span>
                  <span>{content.downloads || '50,000+ downloads'}</span>
                </SelectableElement>
              </SelectableElement>
            )}
          </SelectableElement>

          {/* Right Visual - E-book Cover */}
          <SelectableElement
            elementId="content-right"
            isSelected={selectedElementId === 'content-right'}
            isEditing={isEditing}
            onSelect={onElementSelect}
            className={getClass(rightContentClassMap, viewport)}
          >
            {visibility?.productMockup !== false && (
              <SelectableElement
                elementId="productMockup"
                isSelected={selectedElementId === 'productMockup'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className="relative"
              >
                {/* E-book Cover */}
                <SelectableElement
                  elementId="book-cover"
                  isSelected={selectedElementId === 'book-cover'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  className={getClass(bookCoverClassMap, viewport)}
                  style={{
                    background: getElementStyles(styles, 'book-cover').backgroundColor || primaryColor ||
                               'linear-gradient(to bottom right, #fbbf24, #f97316)',
                    ...getElementStyles(styles, 'book-cover')
                  }}
                >
                  <div className={getClass(bookContentClassMap, viewport)}>
                    <div className="h-full flex flex-col justify-between">
                      <div>
                        <SelectableElement
                          elementId="book-title-1"
                          isSelected={selectedElementId === 'book-title-1'}
                          isEditing={isEditing}
                          onSelect={onElementSelect}
                          onContentChange={onContentChange}
                          contentField="bookTitle1"
                          isContentEditable={true}
                          className={getClass(bookTitle1ClassMap, viewport)}
                          style={{
                            color: getElementStyles(styles, 'book-title-1').textColor || '#111827',
                            ...getElementStyles(styles, 'book-title-1')
                          }}
                        >
                          {content.bookTitle1 || 'The Ultimate Guide to'}
                        </SelectableElement>
                        <SelectableElement
                          elementId="book-title-2"
                          isSelected={selectedElementId === 'book-title-2'}
                          isEditing={isEditing}
                          onSelect={onElementSelect}
                          onContentChange={onContentChange}
                          contentField="bookTitle2"
                          isContentEditable={true}
                          className={getClass(bookTitle2ClassMap, viewport)}
                          style={{
                            color: getElementStyles(styles, 'book-title-2').textColor || primaryColor || '#d97706',
                            ...getElementStyles(styles, 'book-title-2')
                          }}
                        >
                          {content.bookTitle2 || 'Financial Freedom'}
                        </SelectableElement>
                        <div className={getClass(bookDividerClassMap, viewport)}></div>
                        <SelectableElement
                          elementId="book-subtitle"
                          isSelected={selectedElementId === 'book-subtitle'}
                          isEditing={isEditing}
                          onSelect={onElementSelect}
                          onContentChange={onContentChange}
                          contentField="bookSubtitle"
                          isContentEditable={true}
                          className={getClass(bookSubtitleClassMap, viewport)}
                          style={{
                            color: getElementStyles(styles, 'book-subtitle').textColor || '#d1d5db',
                            ...getElementStyles(styles, 'book-subtitle')
                          }}
                        >
                          {content.bookSubtitle || '200+ Pages of Proven Strategies'}
                        </SelectableElement>
                      </div>
                      <div className={getClass(bookFooterClassMap, viewport)}>
                        <SelectableElement
                          elementId="book-author"
                          isSelected={selectedElementId === 'book-author'}
                          isEditing={isEditing}
                          onSelect={onElementSelect}
                          onContentChange={onContentChange}
                          contentField="bookAuthor"
                          isContentEditable={true}
                          className={getClass(bookAuthorClassMap, viewport)}
                          style={{
                            color: getElementStyles(styles, 'book-author').textColor || '#6b7280',
                            ...getElementStyles(styles, 'book-author')
                          }}
                        >
                          {content.bookAuthor || 'By Expert Author'}
                        </SelectableElement>
                        <div className="flex items-center justify-between">
                          <div className="flex text-yellow-500">
                            <span>⭐⭐⭐⭐⭐</span>
                          </div>
                          <SelectableElement
                            elementId="book-year"
                            isSelected={selectedElementId === 'book-year'}
                            isEditing={isEditing}
                            onSelect={onElementSelect}
                            onContentChange={onContentChange}
                            contentField="bookYear"
                            isContentEditable={true}
                            className={getClass(bookYearClassMap, viewport)}
                            style={{
                              color: getElementStyles(styles, 'book-year').textColor || '#6b7280',
                              ...getElementStyles(styles, 'book-year')
                            }}
                          >
                            {content.bookYear || '2025 Edition'}
                          </SelectableElement>
                        </div>
                      </div>
                    </div>
                  </div>
                </SelectableElement>
              </SelectableElement>
            )}
          </SelectableElement>
        </div>
      </div>
    </SelectableElement>
  );
};

export default HeroVariation2;