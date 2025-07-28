import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import VideoPlayer from '@/components/ui/video-player';
import { mediaService } from '@/services/media';
import { useStyles } from '../useStyles';
import { useComponentMedia } from '@/hooks/useComponentMedia';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { getClass, getElementStyles } from '../classUtils';

interface HeroVariation5Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
  componentId?: string;
  mediaUrls?: Record<string, string>;
  selectedElementId?: string;
  customActions?: Record<string, any>;
}

const HeroVariation5: React.FC<HeroVariation5Props> = ({
  content,
  styles,
  visibility = {},
  isEditing = false,
  viewport,
  onElementSelect,
  onContentChange,
  componentId,
  mediaUrls: initialMediaUrls,
  selectedElementId,
  customActions
}) => {
  const { primaryColor } = useStyles({ styles, variation: 5 });
  const { mediaUrls, refreshMediaUrls } = useComponentMedia({
    componentId: componentId || 'hero-variation-5',
    autoLoad: true,
    initialMediaUrls
  });

  // Action handler for CTA button
  const ctaAction = customActions?.['cta-button'];
  // Action handler for Secondary button
  const secondaryAction = customActions?.['secondary-button'];

  // Class maps for precise hybrid approach
  const classMaps = {
    container: {
      mobile: 'py-12 px-4',
      tablet: 'py-16 px-6', 
      desktop: 'py-20 px-4',
      responsive: 'py-12 px-4 md:py-16 md:px-6 lg:py-20 lg:px-4'
    },
    grid: {
      mobile: 'grid grid-cols-1 gap-8',
      tablet: 'grid grid-cols-1 gap-10',
      desktop: 'grid grid-cols-2 gap-12',
      responsive: 'grid grid-cols-1 gap-8 md:grid-cols-1 md:gap-10 lg:grid-cols-2 lg:gap-12'
    },
    contentRight: {
      mobile: 'order-1',
      tablet: 'order-1',
      desktop: 'order-2',
      responsive: 'order-1 lg:order-2'
    },
    contentLeft: {
      mobile: 'order-2',
      tablet: 'order-2', 
      desktop: 'order-1',
      responsive: 'order-2 lg:order-1'
    },
    coursePreview: {
      mobile: 'rounded-lg shadow-lg',
      tablet: 'rounded-lg shadow-xl',
      desktop: 'rounded-xl shadow-2xl',
      responsive: 'rounded-lg shadow-lg md:rounded-lg md:shadow-xl lg:rounded-xl lg:shadow-2xl'
    },
    courseInfo: {
      mobile: 'p-4',
      tablet: 'p-5',
      desktop: 'p-6',
      responsive: 'p-4 md:p-5 lg:p-6'
    },
    courseTitle: {
      mobile: 'font-bold text-lg mb-3',
      tablet: 'font-bold text-lg mb-4',
      desktop: 'font-bold text-xl mb-4',
      responsive: 'font-bold text-lg mb-3 md:text-lg md:mb-4 lg:text-xl lg:mb-4'
    },
    modules: {
      mobile: 'space-y-2',
      tablet: 'space-y-3',
      desktop: 'space-y-3',
      responsive: 'space-y-2 md:space-y-3 lg:space-y-3'
    },
    module: {
      mobile: 'flex items-center gap-3 p-2 bg-gray-50 rounded-lg',
      tablet: 'flex items-center gap-3 p-2 bg-gray-50 rounded-lg',
      desktop: 'flex items-center gap-3 p-3 bg-gray-50 rounded-lg',
      responsive: 'flex items-center gap-3 p-2 bg-gray-50 rounded-lg md:p-2 lg:p-3'
    },
    moduleNumber: {
      mobile: 'w-7 h-7 text-xs bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold',
      tablet: 'w-8 h-8 text-sm bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold',
      desktop: 'w-8 h-8 text-sm bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold',
      responsive: 'w-7 h-7 text-xs bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold md:w-8 md:h-8 md:text-sm lg:w-8 lg:h-8 lg:text-sm'
    },
    moduleTitle: {
      mobile: 'font-medium text-sm',
      tablet: 'font-medium text-base',
      desktop: 'font-medium text-base',
      responsive: 'font-medium text-sm md:text-base lg:text-base'
    },
    badge: {
      mobile: 'px-3 py-1.5 text-xs mb-4 inline-flex items-center rounded-full font-semibold bg-emerald-100 text-emerald-800',
      tablet: 'px-4 py-2 text-sm mb-5 inline-flex items-center rounded-full font-semibold bg-emerald-100 text-emerald-800',
      desktop: 'px-4 py-2 text-sm mb-6 inline-flex items-center rounded-full font-semibold bg-emerald-100 text-emerald-800',
      responsive: 'px-3 py-1.5 text-xs mb-4 inline-flex items-center rounded-full font-semibold bg-emerald-100 text-emerald-800 md:px-4 md:py-2 md:text-sm md:mb-5 lg:px-4 lg:py-2 lg:text-sm lg:mb-6'
    },
    headline: {
      mobile: 'text-3xl mb-4 font-bold leading-tight text-gray-900',
      tablet: 'text-4xl mb-5 font-bold leading-tight text-gray-900',
      desktop: 'text-5xl mb-6 font-bold leading-tight text-gray-900',
      responsive: 'text-3xl mb-4 font-bold leading-tight text-gray-900 md:text-4xl md:mb-5 lg:text-5xl lg:mb-6'
    },
    subheadline: {
      mobile: 'text-lg mb-6 text-gray-600 leading-relaxed',
      tablet: 'text-xl mb-7 text-gray-600 leading-relaxed',
      desktop: 'text-xl mb-8 text-gray-600 leading-relaxed',
      responsive: 'text-lg mb-6 text-gray-600 leading-relaxed md:text-xl md:mb-7 lg:text-xl lg:mb-8'
    },
    courseStats: {
      mobile: 'grid grid-cols-3 gap-4 mb-6',
      tablet: 'grid grid-cols-3 gap-4 mb-7',
      desktop: 'grid grid-cols-3 gap-6 mb-8',
      responsive: 'grid grid-cols-3 gap-4 mb-6 md:gap-4 md:mb-7 lg:gap-6 lg:mb-8'
    },
    statNumber: {
      mobile: 'text-2xl font-bold text-emerald-600 mb-2',
      tablet: 'text-2xl font-bold text-emerald-600 mb-2',
      desktop: 'text-3xl font-bold text-emerald-600 mb-2',
      responsive: 'text-2xl font-bold text-emerald-600 mb-2 md:text-2xl lg:text-3xl'
    },
    statLabel: {
      mobile: 'text-gray-600 text-xs',
      tablet: 'text-gray-600 text-sm',
      desktop: 'text-gray-600 text-sm',
      responsive: 'text-gray-600 text-xs md:text-sm lg:text-sm'
    },
    pricing: {
      mobile: 'mb-6',
      tablet: 'mb-7',
      desktop: 'mb-8',
      responsive: 'mb-6 md:mb-7 lg:mb-8'
    },
    priceRow: {
      mobile: 'flex items-center gap-3 mb-5',
      tablet: 'flex items-center gap-4 mb-6',
      desktop: 'flex items-center gap-4 mb-6',
      responsive: 'flex items-center gap-3 mb-5 md:gap-4 md:mb-6 lg:gap-4 lg:mb-6'
    },
    originalPrice: {
      mobile: 'text-gray-500 line-through text-base',
      tablet: 'text-gray-500 line-through text-lg',
      desktop: 'text-gray-500 line-through text-lg',
      responsive: 'text-gray-500 line-through text-base md:text-lg lg:text-lg'
    },
    price: {
      mobile: 'font-bold text-emerald-600 text-2xl',
      tablet: 'font-bold text-emerald-600 text-3xl',
      desktop: 'font-bold text-emerald-600 text-4xl',
      responsive: 'font-bold text-emerald-600 text-2xl md:text-3xl lg:text-4xl'
    },
    priceLabel: {
      mobile: 'text-gray-600 text-base',
      tablet: 'text-gray-600 text-lg',
      desktop: 'text-gray-600 text-lg',
      responsive: 'text-gray-600 text-base md:text-lg lg:text-lg'
    },
    moneyBack: {
      mobile: 'text-gray-600 text-xs mb-5',
      tablet: 'text-gray-600 text-sm mb-6',
      desktop: 'text-gray-600 text-sm mb-6',
      responsive: 'text-gray-600 text-xs mb-5 md:text-sm md:mb-6 lg:text-sm lg:mb-6'
    },
    actions: {
      mobile: 'flex flex-col gap-4 mb-6',
      tablet: 'flex flex-col gap-4 mb-7',
      desktop: 'flex flex-row gap-4 mb-8',
      responsive: 'flex flex-col gap-4 mb-6 md:flex-col md:gap-4 md:mb-7 lg:flex-row lg:gap-4 lg:mb-8'
    },
    ctaButton: {
      mobile: 'px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150',
      tablet: 'px-7 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150',
      desktop: 'px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150',
      responsive: 'px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors md:px-7 md:py-3 lg:px-8 lg:py-4 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150'
    },
    secondaryButton: {
      mobile: 'px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150',
      tablet: 'px-7 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150',
      desktop: 'px-8 py-4 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150',
      responsive: 'px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors md:px-7 md:py-3 lg:px-8 lg:py-4 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150'
    },
    trustIndicators: {
      mobile: 'flex flex-col items-start gap-4 text-xs text-gray-600',
      tablet: 'flex items-center gap-4 text-sm text-gray-600',
      desktop: 'flex items-center gap-6 text-sm text-gray-600',
      responsive: 'flex flex-col items-start gap-4 text-xs text-gray-600 md:flex md:items-center md:gap-4 md:text-sm lg:flex lg:items-center lg:gap-6 lg:text-sm'
    }
  };



  return (
    <SelectableElement
      elementId="container"
      isSelected={selectedElementId === 'container'}
      isEditing={isEditing}
      onSelect={onElementSelect}
      className={`relative ${getClass(classMaps.container, viewport)} bg-gradient-to-r from-emerald-50 to-teal-50 overflow-hidden`}
      style={{
        ...getElementStyles(styles, 'container'),
        background: getElementStyles(styles, 'container').backgroundColor || 
                   getElementStyles(styles, 'container').background || 
                   'transparent',
        color: getElementStyles(styles, 'container').textColor || '#0f172a'
      }}
    >
      
      
      <div className="relative max-w-7xl mx-auto">
        <div className={`${getClass(classMaps.grid, viewport)} items-center`}>
          {/* Right Content - Course Preview - First on mobile, second on desktop */}
          <SelectableElement
            elementId="content-right"
            isSelected={selectedElementId === 'content-right'}
            isEditing={isEditing}
            onSelect={onElementSelect}
            className={`relative ${getClass(classMaps.contentRight, viewport)}`}
            style={{
              backgroundColor: getElementStyles(styles, 'content-right').backgroundColor,
              border: getElementStyles(styles, 'content-right').border,
              borderRadius: getElementStyles(styles, 'content-right').borderRadius,
              padding: getElementStyles(styles, 'content-right').padding,
              margin: getElementStyles(styles, 'content-right').margin,
              ...getElementStyles(styles, 'content-right')
            }}
          >
            { visibility?.coursePreview !== false && (
              <SelectableElement
                elementId="course-preview"
                isSelected={selectedElementId === 'course-preview'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={`relative bg-white overflow-hidden ${getClass(classMaps.coursePreview, viewport)}`}
                style={{
                  backgroundColor: getElementStyles(styles, 'course-preview').backgroundColor,
                  border: getElementStyles(styles, 'course-preview').border,
                  borderRadius: getElementStyles(styles, 'course-preview').borderRadius,
                  padding: getElementStyles(styles, 'course-preview').padding,
                  margin: getElementStyles(styles, 'course-preview').margin,
                  boxShadow: getElementStyles(styles, 'course-preview').boxShadow,
                  ...getElementStyles(styles, 'course-preview')
                }}
              >
                {/* Video Player */}
                <div
                  className={`aspect-video  flex items-center justify-center relative`}
                  style={{
                    backgroundColor: getElementStyles(styles, 'video-player').backgroundColor || primaryColor || '#d1fae5',
                    border: getElementStyles(styles, 'video-player').border,
                    borderRadius: getElementStyles(styles, 'video-player').borderRadius,
                    padding: getElementStyles(styles, 'video-player').padding,
                    margin: getElementStyles(styles, 'video-player').margin,
                    ...getElementStyles(styles, 'video-player')
                  }}
                >
                  <div className="absolute inset-0 bg-white opacity-80"></div>
                  <VideoPlayer
                    url={mediaUrls?.videoUrl || ''}
                    className="w-full h-full"
                    autoplay={false}
                    muted={true}
                    controls={true}
                    isPreviewMode={!isEditing}
                    onUrlChange={async (url) => {
                      if (componentId) {
                        try {
                          await mediaService.updateComponentMediaUrl(componentId, 'videoUrl', url);
                          await refreshMediaUrls();
                        } catch (error) {
                        }
                      }
                    }}
                  />
                </div>
                
                {/* Course Info */}
                <SelectableElement
                  elementId="course-info"
                  isSelected={selectedElementId === 'course-info'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  className={`${getClass(classMaps.courseInfo, viewport)}`}
                  style={{
                    backgroundColor: getElementStyles(styles, 'course-info').backgroundColor,
                    border: getElementStyles(styles, 'course-info').border,
                    borderRadius: getElementStyles(styles, 'course-info').borderRadius,
                    padding: getElementStyles(styles, 'course-info').padding,
                    margin: getElementStyles(styles, 'course-info').margin,
                    ...getElementStyles(styles, 'course-info')
                  }}
                >
                  <SelectableElement
                    elementId="course-title"
                    isSelected={selectedElementId === 'course-title'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="courseTitle"
                    isContentEditable={true}
                    className={`${getClass(classMaps.courseTitle, viewport)}`}
                    style={{
                      color: getElementStyles(styles, 'course-title').textColor || '#111827',
                      fontWeight: getElementStyles(styles, 'course-title').fontWeight || 700,
                      backgroundColor: getElementStyles(styles, 'course-title').backgroundColor,
                      border: getElementStyles(styles, 'course-title').border,
                      borderRadius: getElementStyles(styles, 'course-title').borderRadius,
                      padding: getElementStyles(styles, 'course-title').padding,
                      margin: getElementStyles(styles, 'course-title').margin,
                      lineHeight: getElementStyles(styles, 'course-title').lineHeight || 1.4,
                      ...getElementStyles(styles, 'course-title')
                    }}
                  >
                    {content.courseTitle || 'Digital Marketing Masterclass'}
                  </SelectableElement>
                  
                  {/* Course modules */}
                  <SelectableElement
                    elementId="modules"
                    isSelected={selectedElementId === 'modules'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    className={`${getClass(classMaps.modules, viewport)}`}
                    style={{
                      backgroundColor: getElementStyles(styles, 'modules').backgroundColor,
                      border: getElementStyles(styles, 'modules').border,
                      borderRadius: getElementStyles(styles, 'modules').borderRadius,
                      padding: getElementStyles(styles, 'modules').padding,
                      margin: getElementStyles(styles, 'modules').margin,
                      ...getElementStyles(styles, 'modules')
                    }}
                  >
                    {/* ...existing modules code... */}
                    <SelectableElement
                      elementId="module-1"
                      isSelected={selectedElementId === 'module-1'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      className={`${getClass(classMaps.module, viewport)}`}
                      style={{
                        backgroundColor: getElementStyles(styles, 'module-1').backgroundColor,
                        border: getElementStyles(styles, 'module-1').border,
                        borderRadius: getElementStyles(styles, 'module-1').borderRadius,
                        padding: getElementStyles(styles, 'module-1').padding,
                        margin: getElementStyles(styles, 'module-1').margin,
                        ...getElementStyles(styles, 'module-1')
                      }}
                    >
                      <SelectableElement
                        elementId="module-1-number"
                        isSelected={selectedElementId === 'module-1-number'}
                        isEditing={isEditing}
                        onSelect={onElementSelect}
                        onContentChange={onContentChange}
                        contentField="module1Number"
                        isContentEditable={true}
                        className={`${getClass(classMaps.moduleNumber, viewport)}`}
                        style={{
                          backgroundColor: getElementStyles(styles, 'module-1-number').backgroundColor || (primaryColor ? `${primaryColor}22` : '#d1fae5'),
                          color: getElementStyles(styles, 'module-1-number').textColor || primaryColor || '#059669',
                          border: getElementStyles(styles, 'module-1-number').border,
                          borderRadius: getElementStyles(styles, 'module-1-number').borderRadius,
                          width: getElementStyles(styles, 'module-1-number').width,
                          height: getElementStyles(styles, 'module-1-number').height,
                          fontSize: getElementStyles(styles, 'module-1-number').fontSize,
                          fontWeight: getElementStyles(styles, 'module-1-number').fontWeight,
                          ...getElementStyles(styles, 'module-1-number')
                        }}
                      >
                        1
                      </SelectableElement>
                      <SelectableElement
                        elementId="module-1-title"
                        isSelected={selectedElementId === 'module-1-title'}
                        isEditing={isEditing}
                        onSelect={onElementSelect}
                        onContentChange={onContentChange}
                        contentField="module1Title"
                        isContentEditable={true}
                        className={`${getClass(classMaps.moduleTitle, viewport)}`}
                        style={{
                          color: getElementStyles(styles, 'module-1-title').textColor,
                          fontSize: getElementStyles(styles, 'module-1-title').fontSize,
                          fontWeight: getElementStyles(styles, 'module-1-title').fontWeight,
                          backgroundColor: getElementStyles(styles, 'module-1-title').backgroundColor,
                          border: getElementStyles(styles, 'module-1-title').border,
                          borderRadius: getElementStyles(styles, 'module-1-title').borderRadius,
                          padding: getElementStyles(styles, 'module-1-title').padding,
                          margin: getElementStyles(styles, 'module-1-title').margin,
                          ...getElementStyles(styles, 'module-1-title')
                        }}
                      >
                        {content.module1Title || 'HTML & CSS Fundamentals'}
                      </SelectableElement>
                    </SelectableElement>
                    
                    <SelectableElement
                      elementId="module-2"
                      isSelected={selectedElementId === 'module-2'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      className={`${getClass(classMaps.module, viewport)}`}
                      style={{
                        backgroundColor: getElementStyles(styles, 'module-2').backgroundColor,
                        border: getElementStyles(styles, 'module-2').border,
                        borderRadius: getElementStyles(styles, 'module-2').borderRadius,
                        padding: getElementStyles(styles, 'module-2').padding,
                        margin: getElementStyles(styles, 'module-2').margin,
                        ...getElementStyles(styles, 'module-2')
                      }}
                    >
                      <SelectableElement
                        elementId="module-2-number"
                        isSelected={selectedElementId === 'module-2-number'}
                        isEditing={isEditing}
                        onSelect={onElementSelect}
                        onContentChange={onContentChange}
                        contentField="module2Number"
                        isContentEditable={true}
                        className={`${getClass(classMaps.moduleNumber, viewport)}`}
                        style={{
                          backgroundColor: getElementStyles(styles, 'module-2-number').backgroundColor || (primaryColor ? `${primaryColor}22` : '#d1fae5'),
                          color: getElementStyles(styles, 'module-2-number').textColor || primaryColor || '#059669',
                          border: getElementStyles(styles, 'module-2-number').border,
                          borderRadius: getElementStyles(styles, 'module-2-number').borderRadius,
                          width: getElementStyles(styles, 'module-2-number').width,
                          height: getElementStyles(styles, 'module-2-number').height,
                          fontSize: getElementStyles(styles, 'module-2-number').fontSize,
                          fontWeight: getElementStyles(styles, 'module-2-number').fontWeight,
                          ...getElementStyles(styles, 'module-2-number')
                        }}
                      >
                        2
                      </SelectableElement>
                      <SelectableElement
                        elementId="module-2-title"
                        isSelected={selectedElementId === 'module-2-title'}
                        isEditing={isEditing}
                        onSelect={onElementSelect}
                        onContentChange={onContentChange}
                        contentField="module2Title"
                        isContentEditable={true}
                        className={`${getClass(classMaps.moduleTitle, viewport)}`}
                        style={{
                          color: getElementStyles(styles, 'module-2-title').textColor,
                          fontSize: getElementStyles(styles, 'module-2-title').fontSize,
                          fontWeight: getElementStyles(styles, 'module-2-title').fontWeight,
                          backgroundColor: getElementStyles(styles, 'module-2-title').backgroundColor,
                          border: getElementStyles(styles, 'module-2-title').border,
                          borderRadius: getElementStyles(styles, 'module-2-title').borderRadius,
                          padding: getElementStyles(styles, 'module-2-title').padding,
                          margin: getElementStyles(styles, 'module-2-title').margin,
                          ...getElementStyles(styles, 'module-2-title')
                        }}
                      >
                        {content.module2Title || 'JavaScript & ES6+'}
                      </SelectableElement>
                    </SelectableElement>
                    
                    <SelectableElement
                      elementId="module-3"
                      isSelected={selectedElementId === 'module-3'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      className={`${getClass(classMaps.module, viewport)}`}
                      style={{
                        backgroundColor: getElementStyles(styles, 'module-3').backgroundColor,
                        border: getElementStyles(styles, 'module-3').border,
                        borderRadius: getElementStyles(styles, 'module-3').borderRadius,
                        padding: getElementStyles(styles, 'module-3').padding,
                        margin: getElementStyles(styles, 'module-3').margin,
                        ...getElementStyles(styles, 'module-3')
                      }}
                    >
                      <SelectableElement
                        elementId="module-3-number"
                        isSelected={selectedElementId === 'module-3-number'}
                        isEditing={isEditing}
                        onSelect={onElementSelect}
                        onContentChange={onContentChange}
                        contentField="module3Number"
                        isContentEditable={true}
                        className={`${getClass(classMaps.moduleNumber, viewport)}`}
                        style={{
                          backgroundColor: getElementStyles(styles, 'module-3-number').backgroundColor || (primaryColor ? `${primaryColor}22` : '#d1fae5'),
                          color: getElementStyles(styles, 'module-3-number').textColor || primaryColor || '#059669',
                          border: getElementStyles(styles, 'module-3-number').border,
                          borderRadius: getElementStyles(styles, 'module-3-number').borderRadius,
                          width: getElementStyles(styles, 'module-3-number').width,
                          height: getElementStyles(styles, 'module-3-number').height,
                          fontSize: getElementStyles(styles, 'module-3-number').fontSize,
                          fontWeight: getElementStyles(styles, 'module-3-number').fontWeight,
                          ...getElementStyles(styles, 'module-3-number')
                        }}
                      >
                        3
                      </SelectableElement>
                      <SelectableElement
                        elementId="module-3-title"
                        isSelected={selectedElementId === 'module-3-title'}
                        isEditing={isEditing}
                        onSelect={onElementSelect}
                        onContentChange={onContentChange}
                        contentField="module3Title"
                        isContentEditable={true}
                        className={`${getClass(classMaps.moduleTitle, viewport)}`}
                        style={{
                          color: getElementStyles(styles, 'module-3-title').textColor,
                          fontSize: getElementStyles(styles, 'module-3-title').fontSize,
                          fontWeight: getElementStyles(styles, 'module-3-title').fontWeight,
                          backgroundColor: getElementStyles(styles, 'module-3-title').backgroundColor,
                          border: getElementStyles(styles, 'module-3-title').border,
                          borderRadius: getElementStyles(styles, 'module-3-title').borderRadius,
                          padding: getElementStyles(styles, 'module-3-title').padding,
                          margin: getElementStyles(styles, 'module-3-title').margin,
                          ...getElementStyles(styles, 'module-3-title')
                        }}
                      >
                        {content.module3Title || 'React & Modern Frontend'}
                      </SelectableElement>
                    </SelectableElement>
                    
                    {/* More modules indicator */}
                    <div className="flex items-center justify-center py-2">
                      <span className="text-gray-400 text-lg">...</span>
                    </div>
                  </SelectableElement>
                </SelectableElement>
              </SelectableElement>
            )}
          </SelectableElement>

          {/* Left Content - Second on mobile, first on desktop */}
          <SelectableElement
            elementId="content-left"
            isSelected={selectedElementId === 'content-left'}
            isEditing={isEditing}
            onSelect={onElementSelect}
            className={`text-left ${getClass(classMaps.contentLeft, viewport)}`}
            style={{
              backgroundColor: getElementStyles(styles, 'content-left').backgroundColor,
              border: getElementStyles(styles, 'content-left').border,
              borderRadius: getElementStyles(styles, 'content-left').borderRadius,
              padding: getElementStyles(styles, 'content-left').padding,
              margin: getElementStyles(styles, 'content-left').margin,
              ...getElementStyles(styles, 'content-left')
            }}
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
                className={`${getClass(classMaps.badge, viewport)}`}
                style={{
                  backgroundColor: getElementStyles(styles, 'badge').backgroundColor ||  (primaryColor ? `${primaryColor}22` : '#d1fae5'),
                  color: getElementStyles(styles, 'badge').textColor || primaryColor || '#059669',
                  border: getElementStyles(styles, 'badge').border,
                  borderRadius: getElementStyles(styles, 'badge').borderRadius,
                  fontWeight: getElementStyles(styles, 'badge').fontWeight || 600,
                  ...getElementStyles(styles, 'badge')
                }}
              >
                {content.badge || '📚 Premium Course'}
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
                className={`${getClass(classMaps.headline, viewport)}`}
                style={{
                  color: getElementStyles(styles, 'headline').textColor || '#fffffe',
                  fontWeight: getElementStyles(styles, 'headline').fontWeight || 700,
                  backgroundColor: getElementStyles(styles, 'headline').backgroundColor,
                  border: getElementStyles(styles, 'headline').border,
                  borderRadius: getElementStyles(styles, 'headline').borderRadius,
                  padding: getElementStyles(styles, 'headline').padding,
                  margin: getElementStyles(styles, 'headline').margin,
                  lineHeight: getElementStyles(styles, 'headline').lineHeight || 1.1,
                  ...getElementStyles(styles, 'headline')
                }}
              >
                {content.headline || 'Master Web Development'}
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
                className={`${getClass(classMaps.subheadline, viewport)}`}
                style={{
                  color: getElementStyles(styles, 'subheadline').textColor || '#4b5563',
                  backgroundColor: getElementStyles(styles, 'subheadline').backgroundColor,
                  border: getElementStyles(styles, 'subheadline').border,
                  borderRadius: getElementStyles(styles, 'subheadline').borderRadius,
                  padding: getElementStyles(styles, 'subheadline').padding,
                  margin: getElementStyles(styles, 'subheadline').margin,
                  fontWeight: getElementStyles(styles, 'subheadline').fontWeight || 400,
                  lineHeight: getElementStyles(styles, 'subheadline').lineHeight || 1.6,
                  ...getElementStyles(styles, 'subheadline')
                }}
              >
                {content.subheadline || 'Learn from industry experts and transform your career with our comprehensive web development course.'}
              </SelectableElement>
            )}
            
            {/* Course Stats */}
            {visibility?.courseStats !== false && (                
              <SelectableElement
                  elementId="course-stats"
                  isSelected={selectedElementId === 'course-stats'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  className={`${getClass(classMaps.courseStats, viewport)}`}
                  style={{
                    backgroundColor: getElementStyles(styles, 'course-stats').backgroundColor,
                    border: getElementStyles(styles, 'course-stats').border,
                    borderRadius: getElementStyles(styles, 'course-stats').borderRadius,
                    padding: getElementStyles(styles, 'course-stats').padding,
                    margin: getElementStyles(styles, 'course-stats').margin,
                    ...getElementStyles(styles, 'course-stats')
                  }}
                >                  <SelectableElement
                    elementId="stat-1"
                    isSelected={selectedElementId === 'stat-1'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    className="text-start"
                    style={{
                      backgroundColor: getElementStyles(styles, 'stat-1').backgroundColor,
                      border: getElementStyles(styles, 'stat-1').border,
                      borderRadius: getElementStyles(styles, 'stat-1').borderRadius,
                      padding: getElementStyles(styles, 'stat-1').padding,
                      margin: getElementStyles(styles, 'stat-1').margin,
                      ...getElementStyles(styles, 'stat-1')
                    }}
                  >                    <SelectableElement
                      elementId="stat-1-number"
                      isSelected={selectedElementId === 'stat-1-number'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={onContentChange}
                      contentField="stat1Number"
                      isContentEditable={true}
                      className={`${getClass(classMaps.statNumber, viewport)}`}
                      style={{
                        color: getElementStyles(styles, 'stat-1-number').textColor || primaryColor || '#059669',
                        fontSize: getElementStyles(styles, 'stat-1-number').fontSize,
                        fontWeight: getElementStyles(styles, 'stat-1-number').fontWeight,
                        backgroundColor: getElementStyles(styles, 'stat-1-number').backgroundColor,
                        border: getElementStyles(styles, 'stat-1-number').border,
                        borderRadius: getElementStyles(styles, 'stat-1-number').borderRadius,
                        padding: getElementStyles(styles, 'stat-1-number').padding,
                        margin: getElementStyles(styles, 'stat-1-number').margin,
                        ...getElementStyles(styles, 'stat-1-number')
                      }}
                    >
                    {content.stat1Number || '120+'}
                  </SelectableElement>                    
                  <SelectableElement
                      elementId="stat-1-label"
                      isSelected={selectedElementId === 'stat-1-label'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={onContentChange}
                      contentField="stat1Label"
                      isContentEditable={true}
                      className={`${getClass(classMaps.statLabel, viewport)}`}
                      style={{
                        color: getElementStyles(styles, 'stat-1-label').textColor,
                        fontSize: getElementStyles(styles, 'stat-1-label').fontSize,
                        fontWeight: getElementStyles(styles, 'stat-1-label').fontWeight,
                        backgroundColor: getElementStyles(styles, 'stat-1-label').backgroundColor,
                        border: getElementStyles(styles, 'stat-1-label').border,
                        borderRadius: getElementStyles(styles, 'stat-1-label').borderRadius,
                        padding: getElementStyles(styles, 'stat-1-label').padding,
                        margin: getElementStyles(styles, 'stat-1-label').margin,
                        ...getElementStyles(styles, 'stat-1-label')
                      }}
                    >
                    {content.stat1Label || 'Video Lessons'}
                  </SelectableElement>
                </SelectableElement>                  
                <SelectableElement
                    elementId="stat-2"
                    isSelected={selectedElementId === 'stat-2'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    className="text-start"
                    style={{
                      backgroundColor: getElementStyles(styles, 'stat-2').backgroundColor,
                      border: getElementStyles(styles, 'stat-2').border,
                      borderRadius: getElementStyles(styles, 'stat-2').borderRadius,
                      padding: getElementStyles(styles, 'stat-2').padding,
                      margin: getElementStyles(styles, 'stat-2').margin,
                      ...getElementStyles(styles, 'stat-2')
                    }}
                  >                    
                  <SelectableElement
                      elementId="stat-2-number"
                      isSelected={selectedElementId === 'stat-2-number'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={onContentChange}
                      contentField="stat2Number"
                      isContentEditable={true}
                      className={`${getClass(classMaps.statNumber, viewport)}`}
                      style={{
                        color: getElementStyles(styles, 'stat-2-number').textColor || primaryColor || '#059669',
                        fontSize: getElementStyles(styles, 'stat-2-number').fontSize,
                        fontWeight: getElementStyles(styles, 'stat-2-number').fontWeight,
                        backgroundColor: getElementStyles(styles, 'stat-2-number').backgroundColor,
                        border: getElementStyles(styles, 'stat-2-number').border,
                        borderRadius: getElementStyles(styles, 'stat-2-number').borderRadius,
                        padding: getElementStyles(styles, 'stat-2-number').padding,
                        margin: getElementStyles(styles, 'stat-2-number').margin,
                        ...getElementStyles(styles, 'stat-2-number')
                      }}
                    >
                    {content.stat2Number || '25h'}
                  </SelectableElement>                    
                  <SelectableElement
                      elementId="stat-2-label"
                      isSelected={selectedElementId === 'stat-2-label'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={onContentChange}
                      contentField="stat2Label"
                      isContentEditable={true}
                      className={`${getClass(classMaps.statLabel, viewport)}`}
                      style={{
                        color: getElementStyles(styles, 'stat-2-label').textColor,
                        fontSize: getElementStyles(styles, 'stat-2-label').fontSize,
                        fontWeight: getElementStyles(styles, 'stat-2-label').fontWeight,
                        backgroundColor: getElementStyles(styles, 'stat-2-label').backgroundColor,
                        border: getElementStyles(styles, 'stat-2-label').border,
                        borderRadius: getElementStyles(styles, 'stat-2-label').borderRadius,
                        padding: getElementStyles(styles, 'stat-2-label').padding,
                        margin: getElementStyles(styles, 'stat-2-label').margin,
                        ...getElementStyles(styles, 'stat-2-label')
                      }}
                    >
                    {content.stat2Label || 'Content'}
                  </SelectableElement>
                </SelectableElement>

                <SelectableElement
                  elementId="stat-3"
                  isSelected={selectedElementId === 'stat-3'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  className="text-start"
                   style={{
                        color: getElementStyles(styles, 'stat-3').textColor,
                        fontSize: getElementStyles(styles, 'stat-3').fontSize,
                        fontWeight: getElementStyles(styles, 'stat-3').fontWeight,
                        backgroundColor: getElementStyles(styles, 'stat-3').backgroundColor,
                        border: getElementStyles(styles, 'stat-3').border,
                        borderRadius: getElementStyles(styles, 'stat-3').borderRadius,
                        padding: getElementStyles(styles, 'stat-3').padding,
                        margin: getElementStyles(styles, 'stat-3').margin,
                        ...getElementStyles(styles, 'stat-3')
                      }}
                >
                  <SelectableElement
                    elementId="stat-3-number"
                    isSelected={selectedElementId === 'stat-3-number'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="stat3Number"
                    isContentEditable={true}
                    className={`${getClass(classMaps.statNumber, viewport)}`}
                    style={{
                        color: getElementStyles(styles, 'stat-3-number').textColor || primaryColor || '#059669',
                        fontSize: getElementStyles(styles, 'stat-3-number').fontSize,
                        fontWeight: getElementStyles(styles, 'stat-3-number').fontWeight,
                        backgroundColor: getElementStyles(styles, 'stat-3-number').backgroundColor,
                        border: getElementStyles(styles, 'stat-3-number').border,
                        borderRadius: getElementStyles(styles, 'stat-3-number').borderRadius,
                        padding: getElementStyles(styles, 'stat-3-number').padding,
                        margin: getElementStyles(styles, 'stat-3-number').margin,
                        ...getElementStyles(styles, 'stat-3-number')
                      }}
                  >
                    {content.stat3Number || '12K+'}
                  </SelectableElement>
                  <SelectableElement
                    elementId="stat-3-label"
                    isSelected={selectedElementId === 'stat-3-label'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="stat3Label"
                    isContentEditable={true}
                    className={`${getClass(classMaps.statLabel, viewport)}`}
                    style={{
                        color: getElementStyles(styles, 'stat-3-label').textColor,
                        fontSize: getElementStyles(styles, 'stat-3-label').fontSize,
                        fontWeight: getElementStyles(styles, 'stat-3-label').fontWeight,
                        backgroundColor: getElementStyles(styles, 'stat-3-label').backgroundColor,
                        border: getElementStyles(styles, 'stat-3-label').border,
                        borderRadius: getElementStyles(styles, 'stat-3-label').borderRadius,
                        padding: getElementStyles(styles, 'stat-3-label').padding,
                        margin: getElementStyles(styles, 'stat-3-label').margin,
                        ...getElementStyles(styles, 'stat-3-label')
                      }}
                  >
                    {content.stat3Label || 'Students'}
                  </SelectableElement>
                </SelectableElement>
              </SelectableElement>
            )}
            
            {/* Pricing */}
            {visibility?.pricing !== false && (
              <SelectableElement
                elementId="pricing"
                isSelected={selectedElementId === 'pricing'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={`${getClass(classMaps.pricing, viewport)}`}
              >
                <div className={`${getClass(classMaps.priceRow, viewport)}`}>
                  {/* Only render original price if it is truthy (not empty, null, or undefined) */}
                  {content.originalPrice && (
                    <SelectableElement
                      elementId="original-price"
                      isSelected={selectedElementId === 'original-price'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={onContentChange}
                      contentField="originalPrice"
                      isContentEditable={true}
                      className={`text-gray-500 line-through ${getClass(classMaps.originalPrice, viewport)}`}
                      style={{
                        color: getElementStyles(styles, 'original-price').textColor || '#6b7280',
                        ...getElementStyles(styles, 'original-price')
                      }}
                    >
                      {`${content.originalPrice} DT`}
                    </SelectableElement>
                  )}
                  {visibility?.price !== false && (
                    <SelectableElement
                      elementId="price"
                      isSelected={selectedElementId === 'price'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={onContentChange}
                      contentField="price"
                      isContentEditable={true}
                      className={`font-bold text-emerald-600 ${getClass(classMaps.price, viewport)}`}
                      style={{
                        color: getElementStyles(styles, 'price').textColor || primaryColor || '#059669',
                        fontWeight: getElementStyles(styles, 'price').fontWeight || 700,
                        ...getElementStyles(styles, 'price')
                      }}
                    >
                      {content.price || '149'} DT
                    </SelectableElement>
                  )}
                  {visibility?.priceLabel !== false && (
                    <SelectableElement
                      elementId="price-label"
                      isSelected={selectedElementId === 'price-label'}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={onContentChange}
                      contentField="priceLabel"
                      isContentEditable={true}
                      className={`text-gray-600 ${getClass(classMaps.priceLabel, viewport)}`}
                      style={{
                        color: getElementStyles(styles, 'price-label').textColor || '#4b5563',
                        ...getElementStyles(styles, 'price-label')
                      }}
                    >
                      {content.priceLabel || 'lifetime access'}
                    </SelectableElement>
                  )}
                </div>
                
                <SelectableElement
                  elementId="money-back"
                  isSelected={selectedElementId === 'money-back'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={onContentChange}
                  contentField="moneyBackGuarantee"
                  isContentEditable={true}
                  className={`${getClass(classMaps.moneyBack, viewport)}`}
                  style={{
                    color: getElementStyles(styles, 'money-back').textColor || '#4b5563',
                    ...getElementStyles(styles, 'money-back')
                  }}
                >
                  {content.moneyBackGuarantee || '30-day money-back guarantee'}
                </SelectableElement>
              </SelectableElement>
            )}
            
            {/* Action Buttons */}
            {visibility?.buttons !== false && (
            <SelectableElement
              elementId="actions"
              isSelected={selectedElementId === 'actions'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              className={`${getClass(classMaps.actions, viewport)}`}
            >
              {visibility?.ctaButton !== false && (
                renderButton({
                  action: ctaAction,
                  isEditing,
                  content: content.ctaButton || 'Start Learning Now',
                  elementId: 'cta-button',
                  selectedElementId,
                  onSelect: onElementSelect,
                  onContentChange,
                  contentField: 'ctaButton',
                  className: getClass(classMaps.ctaButton, viewport),
                  style: {
                    backgroundColor: getElementStyles(styles, 'cta-button').backgroundColor || primaryColor || '#059669',
                    color: getElementStyles(styles, 'cta-button').textColor || '#ffffff',
                    borderRadius: getElementStyles(styles, 'cta-button').borderRadius || 8,
                    margin: getElementStyles(styles, 'cta-button').margin,
                    fontWeight: getElementStyles(styles, 'cta-button').fontWeight || 600,
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
                  content: content.secondaryButton || 'View Curriculum',
                  elementId: 'secondary-button',
                  selectedElementId,
                  onSelect: onElementSelect,
                  onContentChange,
                  contentField: 'secondaryButton',
                  className: getClass(classMaps.secondaryButton, viewport),
                  style: {
                    backgroundColor: getElementStyles(styles, 'secondary-button').backgroundColor,
                    color: getElementStyles(styles, 'secondary-button').textColor || primaryColor || '#059669',
                    borderColor: getElementStyles(styles, 'secondary-button').borderColor || primaryColor || '#059669',
                    borderRadius: getElementStyles(styles, 'secondary-button').borderRadius || 8,
                    margin: getElementStyles(styles, 'secondary-button').margin,
                    fontWeight: getElementStyles(styles, 'secondary-button').fontWeight || 600,
                    ...getElementStyles(styles, 'secondary-button')
                  },
                  as: 'secondary',
                  viewport
                })
              )}
            </SelectableElement>
            )}
            
            {/* Trust Indicators */}
            {visibility?.trustIndicators !== false && (
              <SelectableElement
                elementId="trust-indicators"
                isSelected={selectedElementId === 'trust-indicators'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={`${getClass(classMaps.trustIndicators, viewport)}`}
              >
                <SelectableElement
                  elementId="rating"
                  isSelected={selectedElementId === 'rating'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  className="flex items-center gap-2"
                  style={{
                    backgroundColor: getElementStyles(styles, 'rating').backgroundColor,
                    border: getElementStyles(styles, 'rating').border,
                    borderRadius: getElementStyles(styles, 'rating').borderRadius,
                    padding: getElementStyles(styles, 'rating').padding,
                    margin: getElementStyles(styles, 'rating').margin,
                    ...getElementStyles(styles, 'rating')
                  }}
                >
                  <SelectableElement
                    elementId="rating-stars"
                    isSelected={selectedElementId === 'rating-stars'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="ratingStars"
                    isContentEditable={true}
                    className="text-yellow-500"
                    style={{
                      color: getElementStyles(styles, 'rating-stars').textColor,
                      fontSize: getElementStyles(styles, 'rating-stars').fontSize,
                      backgroundColor: getElementStyles(styles, 'rating-stars').backgroundColor,
                      border: getElementStyles(styles, 'rating-stars').border,
                      borderRadius: getElementStyles(styles, 'rating-stars').borderRadius,
                      padding: getElementStyles(styles, 'rating-stars').padding,
                      margin: getElementStyles(styles, 'rating-stars').margin,
                      ...getElementStyles(styles, 'rating-stars')
                    }}
                  >
                    {content.ratingStars || '⭐⭐⭐⭐⭐'}
                  </SelectableElement>
                  <SelectableElement
                    elementId="rating-text"
                    isSelected={selectedElementId === 'rating-text'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="rating"
                    isContentEditable={true}
                    style={{
                      color: getElementStyles(styles, 'rating-text').textColor,
                      fontSize: getElementStyles(styles, 'rating-text').fontSize,
                      fontWeight: getElementStyles(styles, 'rating-text').fontWeight,
                      backgroundColor: getElementStyles(styles, 'rating-text').backgroundColor,
                      border: getElementStyles(styles, 'rating-text').border,
                      borderRadius: getElementStyles(styles, 'rating-text').borderRadius,
                      padding: getElementStyles(styles, 'rating-text').padding,
                      margin: getElementStyles(styles, 'rating-text').margin,
                      ...getElementStyles(styles, 'rating-text')
                    }}
                  >
                    {content.rating || '4.8/5 (1,243 reviews)'}
                  </SelectableElement>
                </SelectableElement>
                
                <SelectableElement
                  elementId="certification"
                  isSelected={selectedElementId === 'certification'}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  className="flex items-center gap-2"
                  style={{
                    backgroundColor: getElementStyles(styles, 'certification').backgroundColor,
                    border: getElementStyles(styles, 'certification').border,
                    borderRadius: getElementStyles(styles, 'certification').borderRadius,
                    padding: getElementStyles(styles, 'certification').padding,
                    margin: getElementStyles(styles, 'certification').margin,
                    ...getElementStyles(styles, 'certification')
                  }}
                >
                  <SelectableElement
                    elementId="certification-icon"
                    isSelected={selectedElementId === 'certification-icon'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="certificationIcon"
                    isContentEditable={true}
                    style={{
                      fontSize: getElementStyles(styles, 'certification-icon').fontSize,
                      backgroundColor: getElementStyles(styles, 'certification-icon').backgroundColor,
                      border: getElementStyles(styles, 'certification-icon').border,
                      borderRadius: getElementStyles(styles, 'certification-icon').borderRadius,
                      padding: getElementStyles(styles, 'certification-icon').padding,
                      margin: getElementStyles(styles, 'certification-icon').margin,
                      ...getElementStyles(styles, 'certification-icon')
                    }}
                  >
                    {content.certificationIcon || '🏆'}
                  </SelectableElement>
                  <SelectableElement
                    elementId="certification-text"
                    isSelected={selectedElementId === 'certification-text'}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={onContentChange}
                    contentField="certification"
                    isContentEditable={true}
                    style={{
                      color: getElementStyles(styles, 'certification-text').textColor,
                      fontSize: getElementStyles(styles, 'certification-text').fontSize,
                      fontWeight: getElementStyles(styles, 'certification-text').fontWeight,
                      backgroundColor: getElementStyles(styles, 'certification-text').backgroundColor,
                      border: getElementStyles(styles, 'certification-text').border,
                      borderRadius: getElementStyles(styles, 'certification-text').borderRadius,
                      padding: getElementStyles(styles, 'certification-text').padding,
                      margin: getElementStyles(styles, 'certification-text').margin,
                      ...getElementStyles(styles, 'certification-text')
                    }}
                  >
                    {content.certification || 'Certified Program'}
                  </SelectableElement>
                </SelectableElement>
              </SelectableElement>
            )}
          </SelectableElement>
        </div>
      </div>
    </SelectableElement>
  );
};

export default HeroVariation5;
