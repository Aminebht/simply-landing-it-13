import React, { FC, useState } from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useComponentMedia } from '@/hooks/useComponentMedia';
import { useStyles } from '../useStyles';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { getClass, getElementStyles } from '../classUtils';
import { heroVariation3ClassMaps } from './classmaps/hero-variation-3';

interface HeroVariation3Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
}

const HeroVariation3: FC<HeroVariation3Props> = ({
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
  // State to track if we're hovering over the dashboard area
  const [isDashboardHovered, setIsDashboardHovered] = useState(false);
  const { primaryColor } = useStyles({ styles, variation: 3 });
  
  // Use media service to manage images in media_urls column
  const { mediaUrls: hookMediaUrls, getMediaUrl, refreshMediaUrls } = useComponentMedia({
    componentId: componentId || 'hero-variation-3',
    autoLoad: true,
    initialMediaUrls: mediaUrls
  });

  // Helper function to get media URL - prioritize fresh hook data over potentially stale props
  const getImageUrl = (fieldName: string): string | undefined => {
    return hookMediaUrls[fieldName] || getMediaUrl(fieldName) || mediaUrls?.[fieldName];
  };


  // Destructure shared class maps for better performance
  const {
    container: containerClassMap,
    header: headerClassMap,
    badge: badgeClassMap,
    headline: headlineClassMap,
    subheadline: subheadlineClassMap,
    features: featuresClassMap,
    featureIcon: featureIconClassMap,
    featureTitle: featureTitleClassMap,
    featureDesc: featureDescClassMap,
    pricing: pricingClassMap,
    priceContainer: priceContainerClassMap,
    price: priceClassMap,
    priceDescription: priceDescriptionClassMap,
    actions: actionsClassMap,
    ctaButton: ctaButtonClassMap,
    secondaryButton: secondaryButtonClassMap,
    trustIndicators: trustIndicatorsClassMap,
    demoContainer: demoContainerClassMap,
    dashboardContent: dashboardContentClassMap,
    dashboardGrid: dashboardGridClassMap
  } = heroVariation3ClassMaps;

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
                   '#061010',
        color: getElementStyles(styles, 'container').textColor || '#fffffe'
      }}
    >
      <div className="relative max-w-7xl mx-auto">
        <div className={getClass(headerClassMap, viewport)}>
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
                backgroundColor: getElementStyles(styles, 'badge').backgroundColor || primaryColor || '#4f46e5',
                color: getElementStyles(styles, 'badge').textColor || '#fffffe',
                borderRadius: getElementStyles(styles, 'badge').borderRadius || 9999,
                ...getElementStyles(styles, 'badge')
              }}
            >
              {content.badge || '🎯 Software Solution'}
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
                color: getElementStyles(styles, 'headline').textColor || '#fffffe',
                ...getElementStyles(styles, 'headline')
              }}
            >
              {content.headline || 'Revolutionary SaaS Platform'}
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
                color: getElementStyles(styles, 'subheadline').textColor || '#64748b',
                ...getElementStyles(styles, 'subheadline')
              }}
            >
              {content.subheadline || 'Transform your business with our cutting-edge software solution. Streamline operations, boost productivity, and scale effortlessly.'}
            </SelectableElement>
          )}
          
          {/* Feature Grid */}
          {(visibility?.features !== undefined 
            ? visibility?.features !== false
            : (visibility?.feature1Icon !== false || visibility?.feature1Title !== false || visibility?.feature1Desc !== false ||
               visibility?.feature2Icon !== false || visibility?.feature2Title !== false || visibility?.feature2Desc !== false ||
               visibility?.feature3Icon !== false || visibility?.feature3Title !== false || visibility?.feature3Desc !== false)) && (
            <SelectableElement
              elementId="features"
              isSelected={selectedElementId === 'features'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              className={getClass(featuresClassMap, viewport)}
            >
              <SelectableElement
                elementId="feature-1"
                isSelected={selectedElementId === 'feature-1'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className="flex flex-col items-center text-center"
                style={{
                  padding: getElementStyles(styles, 'feature-1').padding,
                  backgroundColor: getElementStyles(styles, 'feature-1').backgroundColor,
                  borderRadius: getElementStyles(styles, 'feature-1').borderRadius,
                  border: getElementStyles(styles, 'feature-1').border,
                  ...getElementStyles(styles, 'feature-1')
                }}
              >
                <SelectableElement
                  elementId="feature-1-icon"
                  isSelected={selectedElementId === 'feature-1-icon'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="feature1Icon"
                  isContentEditable={true}
                  className={getClass(featureIconClassMap, viewport)}
                  style={{
                    backgroundColor: getElementStyles(styles, 'feature-1-icon').backgroundColor || '#e0e7ff',
                    borderRadius: getElementStyles(styles, 'feature-1-icon').borderRadius || '50%',
                    color: getElementStyles(styles, 'feature-1-icon').color || primaryColor || '#4f46e5',
                    border: getElementStyles(styles, 'feature-1-icon').border,
                    borderWidth: getElementStyles(styles, 'feature-1-icon').borderWidth,
                    borderColor: getElementStyles(styles, 'feature-1-icon').borderColor,
                    ...getElementStyles(styles, 'feature-1-icon')
                  }}
                >
                  {content.feature1Icon == null || content.feature1Icon === '' ? '⚡' : content.feature1Icon}
                </SelectableElement>
                <SelectableElement
                  elementId="feature-1-title"
                  isSelected={selectedElementId === 'feature-1-title'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="feature1Title"
                  isContentEditable={true}
                  className={getClass(featureTitleClassMap, viewport)}
                  style={{
                    color: getElementStyles(styles, 'feature-1-title').textColor || '#fffffe',
                    ...getElementStyles(styles, 'feature-1-title')
                  }}
                >
                  {content.feature1Title || 'Lightning Fast'}
                </SelectableElement>
                <SelectableElement
                  elementId="feature-1-desc"
                  isSelected={selectedElementId === 'feature-1-desc'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="feature1Desc"
                  isContentEditable={true}
                  className={getClass(featureDescClassMap, viewport)}
                  style={{
                    color: getElementStyles(styles, 'feature-1-desc').textColor || '#64748b',
                    ...getElementStyles(styles, 'feature-1-desc')
                  }}
                >
                  {content.feature1Desc || 'Process data 10x faster than traditional solutions'}
                </SelectableElement>
              </SelectableElement>

              <SelectableElement
                elementId="feature-2"
                isSelected={selectedElementId === 'feature-2'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className="flex flex-col items-center text-center"
                style={{
                  padding: getElementStyles(styles, 'feature-2').padding,
                  backgroundColor: getElementStyles(styles, 'feature-2').backgroundColor,
                  borderRadius: getElementStyles(styles, 'feature-2').borderRadius,
                  border: getElementStyles(styles, 'feature-2').border,
                  ...getElementStyles(styles, 'feature-2')
                }}
              >
                <SelectableElement
                  elementId="feature-2-icon"
                  isSelected={selectedElementId === 'feature-2-icon'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="feature2Icon"
                  isContentEditable={true}
                  className={getClass(featureIconClassMap, viewport)}
                  style={{
                    backgroundColor: getElementStyles(styles, 'feature-2-icon').backgroundColor || '#e0e7ff',
                    borderRadius: getElementStyles(styles, 'feature-2-icon').borderRadius || '50%',
                    color: getElementStyles(styles, 'feature-2-icon').color || primaryColor || '#4f46e5',
                    border: getElementStyles(styles, 'feature-2-icon').border,
                    borderWidth: getElementStyles(styles, 'feature-2-icon').borderWidth,
                    borderColor: getElementStyles(styles, 'feature-2-icon').borderColor,
                    ...getElementStyles(styles, 'feature-2-icon')
                  }}
                >
                  {content.feature2Icon == null || content.feature2Icon === '' ? '🔒' : content.feature2Icon}
                </SelectableElement>
                <SelectableElement
                  elementId="feature-2-title"
                  isSelected={selectedElementId === 'feature-2-title'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="feature2Title"
                  isContentEditable={true}
                  className={getClass(featureTitleClassMap, viewport)}
                  style={{
                    color: getElementStyles(styles, 'feature-2-title').textColor || '#fffffe',
                    ...getElementStyles(styles, 'feature-2-title')
                  }}
                >
                  {content.feature2Title || 'Bank-Level Security'}
                </SelectableElement>
                <SelectableElement
                  elementId="feature-2-desc"
                  isSelected={selectedElementId === 'feature-2-desc'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="feature2Desc"
                  isContentEditable={true}
                  className={getClass(featureDescClassMap, viewport)}
                  style={{
                    color: getElementStyles(styles, 'feature-2-desc').textColor || '#64748b',
                    ...getElementStyles(styles, 'feature-2-desc')
                  }}
                >
                  {content.feature2Desc || 'Enterprise-grade security with end-to-end encryption'}
                </SelectableElement>
              </SelectableElement>

              <SelectableElement
                elementId="feature-3"
                isSelected={selectedElementId === 'feature-3'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className="flex flex-col items-center text-center"
                style={{
                  padding: getElementStyles(styles, 'feature-3').padding,
                  backgroundColor: getElementStyles(styles, 'feature-3').backgroundColor,
                  borderRadius: getElementStyles(styles, 'feature-3').borderRadius,
                  border: getElementStyles(styles, 'feature-3').border,
                  ...getElementStyles(styles, 'feature-3')
                }}
              >
                <SelectableElement
                  elementId="feature-3-icon"
                  isSelected={selectedElementId === 'feature-3-icon'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="feature3Icon"
                  isContentEditable={true}
                  className={getClass(featureIconClassMap, viewport)}
                  style={{
                    backgroundColor: getElementStyles(styles, 'feature-3-icon').backgroundColor || '#e0e7ff',
                    borderRadius: getElementStyles(styles, 'feature-3-icon').borderRadius || '50%',
                    color: getElementStyles(styles, 'feature-3-icon').color || primaryColor || '#4f46e5',
                    border: getElementStyles(styles, 'feature-3-icon').border,
                    borderWidth: getElementStyles(styles, 'feature-3-icon').borderWidth,
                    borderColor: getElementStyles(styles, 'feature-3-icon').borderColor,
                    ...getElementStyles(styles, 'feature-3-icon')
                  }}
                >
                  {content.feature3Icon == null || content.feature3Icon === '' ? '📊' : content.feature3Icon}
                </SelectableElement>
                <SelectableElement
                  elementId="feature-3-title"
                  isSelected={selectedElementId === 'feature-3-title'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="feature3Title"
                  isContentEditable={true}
                  className={getClass(featureTitleClassMap, viewport)}
                  style={{
                    color: getElementStyles(styles, 'feature-3-title').textColor || '#fffffe',
                    ...getElementStyles(styles, 'feature-3-title')
                  }}
                >
                  {content.feature3Title || 'Advanced Analytics'}
                </SelectableElement>
                <SelectableElement
                  elementId="feature-3-desc"
                  isSelected={selectedElementId === 'feature-3-desc'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="feature3Desc"
                  isContentEditable={true}
                  className={getClass(featureDescClassMap, viewport)}
                  style={{
                    color: getElementStyles(styles, 'feature-3-desc').textColor || '#64748b',
                    ...getElementStyles(styles, 'feature-3-desc')
                  }}
                >
                  {content.feature3Desc || 'Real-time insights and predictive analytics'}
                </SelectableElement>
              </SelectableElement>
            </SelectableElement>
          )}
          
          {/* Pricing */}
          {(visibility?.pricing !== undefined 
            ? visibility?.pricing !== false
            : (visibility?.price !== false || visibility?.priceDescription !== false)) && (
            <SelectableElement
              elementId="pricing"
              isSelected={selectedElementId === 'pricing'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              className={getClass(pricingClassMap, viewport)}
            >
              <div className={getClass(priceContainerClassMap, viewport)}>
                {visibility?.price !== false && (
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
                      color: getElementStyles(styles, 'price').textColor || primaryColor || '#4f46e5',
                      ...getElementStyles(styles, 'price')
                    }}
                  >
                    {content.price || '49'} DT
                  </SelectableElement>
                )}
              </div>
              
              {visibility?.priceDescription !== false && (
                <SelectableElement
                  elementId="price-description"
                  isSelected={selectedElementId === 'price-description'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="priceDescription"
                  isContentEditable={true}
                  className={getClass(priceDescriptionClassMap, viewport)}
                  style={{
                    color: getElementStyles(styles, 'price-description').textColor || '#64748b',
                    ...getElementStyles(styles, 'price-description')
                  }}
                >
                  {content.priceDescription || 'Start your 14-day free trial. No credit card required.'}
                </SelectableElement>
              )}
            </SelectableElement>
          )}
          
          {/* Action Buttons */}
          {(visibility?.buttons !== undefined 
            ? visibility?.buttons !== false
            : (visibility?.ctaButton !== false || visibility?.secondaryButton !== false)) && (
          <SelectableElement
            elementId="actions"
            isSelected={selectedElementId === 'actions'}
            isEditing={isEditing}
            onSelect={onElementSelect}
            className={getClass(actionsClassMap, viewport)}
          >
            {visibility?.ctaButton !== false && (
              renderButton({
                action: ctaAction,
                isEditing,
                content: content.ctaButton || 'Start Free Trial',
                elementId: 'cta-button',
                selectedElementId,
                onSelect: onElementSelect,
                onContentChange,
                contentField: 'ctaButton',
                className: getClass(ctaButtonClassMap, viewport),
                style: {
                  backgroundColor: getElementStyles(styles, 'cta-button').backgroundColor || primaryColor || '#4f46e5',
                  color: getElementStyles(styles, 'cta-button').textColor || '#ffffff',
                  borderRadius: getElementStyles(styles, 'cta-button').borderRadius || 8,
                  ...getElementStyles(styles, 'cta-button')
                },
                as: 'primary',
                viewport
              })
            )}
            
            {visibility?.secondaryButton !== false && (
              renderButton({
                action: secondaryAction,
                isEditing,
                content: content.secondaryButton || 'Watch Demo',
                elementId: 'secondary-button',
                selectedElementId,
                onSelect: onElementSelect,
                onContentChange,
                contentField: 'secondaryButton',
                className: getClass(secondaryButtonClassMap, viewport),
                style: {
                  backgroundColor: getElementStyles(styles, 'secondary-button').backgroundColor || 'transparent',
                  color: getElementStyles(styles, 'secondary-button').textColor || primaryColor || '#4f46e5',
                  borderColor: getElementStyles(styles, 'secondary-button').borderColor || primaryColor || '#4f46e5',
                  borderRadius: getElementStyles(styles, 'secondary-button').borderRadius || 8,
                  ...getElementStyles(styles, 'secondary-button')
                },
                as: 'secondary',
                viewport
              })
            )}
          </SelectableElement>
          )}
          
          {/* Trust Indicators */}
          { visibility?.trustIndicators !== false && (
            <SelectableElement
              elementId="trust-indicators"
              isSelected={selectedElementId === 'trust-indicators'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              className={getClass(trustIndicatorsClassMap, viewport)}
            >
              <SelectableElement
                elementId="trust-customers"
                isSelected={selectedElementId === 'trust-customers'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                onContentChange={onContentChange}
                contentField="trustCustomers"
                isContentEditable={true}
                className="flex items-center gap-2"
                style={{
                  color: getElementStyles(styles, 'trust-customers').textColor || '#6b7280',
                  ...getElementStyles(styles, 'trust-customers')
                }}
              >
                <span>👥</span>
                <span>{content.trustCustomers || '10,000+ customers'}</span>
              </SelectableElement>
              
              <SelectableElement
                elementId="trust-rating"
                isSelected={selectedElementId === 'trust-rating'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                onContentChange={onContentChange}
                contentField="trustRating"
                isContentEditable={true}
                className="flex items-center gap-2"
                style={{
                  color: getElementStyles(styles, 'trust-rating').textColor || '#6b7280',
                  ...getElementStyles(styles, 'trust-rating')
                }}
              >
                <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                <span>{content.trustRating || '4.9/5 rating'}</span>
              </SelectableElement>
              
              <SelectableElement
                elementId="trust-uptime"
                isSelected={selectedElementId === 'trust-uptime'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                onContentChange={onContentChange}
                contentField="trustUptime"
                isContentEditable={true}
                className="flex items-center gap-2"
                style={{
                  color: getElementStyles(styles, 'trust-uptime').textColor || '#6b7280',
                  ...getElementStyles(styles, 'trust-uptime')
                }}
              >
                <span>🚀</span>
                <span>{content.trustUptime || '99.9% uptime'}</span>
              </SelectableElement>
            </SelectableElement>
          )}
        </div>
        
        {/* Product Demo/Screenshot */}
        {visibility?.productDemo !== false && (
          <SelectableElement
            elementId="product-demo"
            isSelected={selectedElementId === 'product-demo'}
            isEditing={isEditing}
            onSelect={onElementSelect}
            className="relative"
          >
            <SelectableElement
              elementId="demo-container"
              isSelected={selectedElementId === 'demo-container'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              className={getClass(demoContainerClassMap, viewport)}
            >
              {/* Main Dashboard Mockup */}
              <div 
                className="relative"
                onMouseEnter={() => isEditing && setIsDashboardHovered(true)}
                onMouseLeave={() => setIsDashboardHovered(false)}
              >
                <SelectableElement
                  elementId="dashboard-mockup"
                  isSelected={selectedElementId === 'dashboard-mockup'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  className="relative bg-white rounded-xl shadow-2xl overflow-hidden group"
                  style={{
                    backgroundColor: getElementStyles(styles, 'dashboard-mockup').backgroundColor || '#ffffff',
                    borderRadius: getElementStyles(styles, 'dashboard-mockup').borderRadius || 12,
                    border: getElementStyles(styles, 'dashboard-mockup').border || 'none',
                    borderWidth: getElementStyles(styles, 'dashboard-mockup').borderWidth || 0,
                    borderColor: getElementStyles(styles, 'dashboard-mockup').borderColor || 'transparent',
                    borderStyle: getElementStyles(styles, 'dashboard-mockup').borderStyle || 'solid',
                    boxShadow: getElementStyles(styles, 'dashboard-mockup').boxShadow || '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    ...getElementStyles(styles, 'dashboard-mockup')
                  }}
                >
                  {/* Image Upload Overlay - Only shown on hover when editing */}
                  {isEditing && isDashboardHovered && (
                    <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center">
                      <div className="w-full max-w-md p-4">
                        <ImageUpload
                          value={getImageUrl('dashboardImage') || ''}
                          onChange={async (value) => {
                            await refreshMediaUrls();
                          }}
                          placeholder="Upload a custom dashboard image"
                          aspectRatio={16/9}
                          className="w-full"
                          imageType="product"
                          enableWebP={true}
                          useMediaService={true}
                          componentId={componentId || 'hero-variation-3'}
                          fieldName="dashboardImage"
                        />
                      </div>
                    </div>
                  )}

                  {/* If there's a custom image, show that instead of the default dashboard */}
                  {getImageUrl('dashboardImage') ? (
                    <div className="relative w-full">
                      <img 
                        src={getImageUrl('dashboardImage')}
                        alt="Custom dashboard"
                        className="w-full object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      {/* Default Dashboard - Browser Chrome */}
                      <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 flex items-center gap-2">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="bg-white rounded px-3 py-1 text-sm text-gray-600">
                            app.yourplatform.com
                          </div>
                        </div>
                      </div>
                      
                      {/* Default Dashboard Content */}
                      <div className={getClass(dashboardContentClassMap, viewport)}>
                        <div className={getClass(dashboardGridClassMap, viewport)}>
                          {/* Stats Cards */}
                          <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-indigo-600 mb-2">248%</div>
                            <div className="text-sm text-gray-600">Growth Rate</div>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-green-600 mb-2">847K DT</div>
                            <div className="text-sm text-gray-600">Revenue</div>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-blue-600 mb-2">15.2K</div>
                            <div className="text-sm text-gray-600">Active Users</div>
                          </div>
                        </div>
                        
                        {/* Chart Area */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Analytics Overview</h3>
                            <div className="flex gap-2">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          </div>
                          <div className="h-32 bg-gradient-to-r from-indigo-100 via-green-100 to-blue-100 rounded flex items-end justify-center">
                            
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </SelectableElement>
              </div>
            </SelectableElement>
          </SelectableElement>
        )}
      </div>
    </SelectableElement>
  );
};

export default HeroVariation3;