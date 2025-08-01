import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { useStyles } from '../useStyles';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { getClass, getElementStyles } from '../classUtils';
import { heroVariation2ClassMaps } from './classmaps/hero-variation-2';

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




  // Destructure shared class maps for better performance
  const {
    container: containerClassMap,
    grid: gridClassMap,
    leftContent: leftContentClassMap,
    rightContent: rightContentClassMap,
    badge: badgeClassMap,
    headline: headlineClassMap,
    subheadline: subheadlineClassMap,
    features: featuresClassMap,
    priceSection: priceSectionClassMap,
    priceContainer: priceContainerClassMap,
    priceValue: priceValueClassMap,
    priceLabel: priceLabelClassMap,
    buttonSection: buttonSectionClassMap,
    ctaButton: ctaButtonClassMap,
    secondaryButton: secondaryButtonClassMap,
    trustIndicators: trustIndicatorsClassMap,
    bookCover: bookCoverClassMap,
    bookContent: bookContentClassMap,
    bookTitle1: bookTitle1ClassMap,
    bookTitle2: bookTitle2ClassMap,
    bookDivider: bookDividerClassMap,
    bookSubtitle: bookSubtitleClassMap,
    bookFooter: bookFooterClassMap,
    bookAuthor: bookAuthorClassMap,
    bookYear: bookYearClassMap
  } = heroVariation2ClassMaps;

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