import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { useStyles } from '../useStyles';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { DynamicCheckoutForm } from './shared/DynamicCheckoutForm';
import { getClass, getElementStyles } from '../classUtils';

interface CtaVariation1Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
}

const CtaVariation1: React.FC<CtaVariation1Props> = ({
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
  const { primaryColor } = useStyles({ styles, variation: 1 });

  // Class maps for all elements - ensuring exact visual parity
  const containerClassMap = {
    mobile: "relative overflow-hidden min-h-screen flex items-center justify-center py-8 px-4",
    tablet: "relative overflow-hidden min-h-screen flex items-center justify-center py-16 px-6",
    desktop: "relative overflow-hidden min-h-screen flex items-center justify-center py-24 px-8",
    responsive: "relative overflow-hidden min-h-screen flex items-center justify-center py-8 px-4 md:py-16 md:px-6 lg:py-24 lg:px-8"
  };

  // Updated card class with enhanced glass effect
  const cardClassMap = {
    mobile: "relative max-w-md mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none",
    tablet: "relative max-w-lg mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none",
    desktop: "relative max-w-xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none",
    responsive: "relative max-w-md mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none md:max-w-lg md:rounded-3xl md:p-8 md:before:rounded-3xl lg:max-w-xl lg:rounded-3xl lg:p-10 lg:before:rounded-3xl"
  };
  const headlineClassMap = {
    mobile: "font-bold leading-tight text-2xl mb-3 text-white text-center relative z-10",
    tablet: "font-bold leading-tight text-3xl mb-4 text-white text-center relative z-10",
    desktop: "font-bold leading-tight text-4xl mb-6 text-white text-center relative z-10",
    responsive: "font-bold leading-tight text-2xl mb-3 text-white text-center relative z-10 md:text-3xl md:mb-4 lg:text-4xl lg:mb-6"
  };

  const subheadlineClassMap = {
    mobile: "text-white/80 leading-relaxed text-sm mb-6 text-center relative z-10",
    tablet: "text-white/80 leading-relaxed text-base mb-8 text-center relative z-10",
    desktop: "text-white/80 leading-relaxed text-lg mb-8 text-center relative z-10",
    responsive: "text-white/80 leading-relaxed text-sm mb-6 text-center relative z-10 md:text-base md:mb-8 lg:text-lg lg:mb-8"
  };


  const formContainerClassMap = {
    mobile: "mb-6 relative z-10",
    tablet: "mb-8 relative z-10",
    desktop: "mb-8 relative z-10",
    responsive: "mb-6 relative z-10 md:mb-8 lg:mb-8"
  };

  // Updated CTA button with rounded-full
  const ctaButtonClassMap = {
    mobile: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center px-6 py-3 text-sm relative z-10",
    tablet: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center px-8 py-4 text-base relative z-10",
    desktop: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center px-8 py-4 text-base relative z-10",
    responsive: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center px-6 py-3 text-sm relative z-10 md:px-8 md:py-4 md:text-base lg:px-8 lg:py-4 lg:text-base"
  };

  // Price class map for responsive price styling
  const priceClassMap = {
    mobile: "font-extrabold text-4xl text-primary text-center drop-shadow-lg",
    tablet: "font-extrabold text-5xl text-primary text-center drop-shadow-lg",
    desktop: "font-extrabold text-6xl text-primary text-center drop-shadow-lg",
    responsive: "font-extrabold text-4xl text-primary text-center drop-shadow-lg md:text-5xl lg:text-6xl"
  };

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
        background: getElementStyles(styles, 'container').background || getElementStyles(styles, 'container').backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: getElementStyles(styles, 'container').textColor || '#ffffff'
        
      }}
      >
      {/* Main Content Card with Glass Effect */}
      <SelectableElement
        elementId="card"
        isSelected={selectedElementId === 'card'}
        isEditing={isEditing}
        onSelect={onElementSelect}
        className={getClass(cardClassMap, viewport)}
        style={{
          background: getElementStyles(styles, 'card').backgroundColor || 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: getElementStyles(styles, 'card').borderColor || 'rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
          ...getElementStyles(styles, 'card')
        }}
      >
        <div className="text-center relative z-10">

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
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                ...getElementStyles(styles, 'headline')
              }}
            >
              {content.headline || 'Unlock Instant Access to Your Exclusive eBook'}
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
                color: getElementStyles(styles, 'subheadline').textColor || 'rgba(255, 255, 255, 0.8)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                ...getElementStyles(styles, 'subheadline')
              }}
            >
              {content.subheadline || 'Download your copy now and start learning something new today. Limited-time offer—don’t miss out!'}
            </SelectableElement>
          )}

          {/* Price Section (replaces stats) */}
          <div className="flex flex-row items-center justify-center gap-6 mb-8">
            {content.originalPrice && (
              <SelectableElement
                elementId="original-price"
                isSelected={selectedElementId === 'original-price'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                onContentChange={onContentChange}
                contentField="originalPrice"
                isContentEditable={true}
                className="text-gray-400 line-through text-2xl md:text-3xl text-center font-semibold"
                style={{ color: getElementStyles(styles, 'original-price').textColor || 'rgba(255, 255, 255, 0.8)', 
                  ...getElementStyles(styles, 'original-price') }}
              >
                {content.originalPrice ||'39'} DT
              </SelectableElement>
            )}
            <SelectableElement
              elementId="price"
              isSelected={selectedElementId === 'price'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              onContentChange={onContentChange}
              contentField="price"
              isContentEditable={true}
              className={getClass(priceClassMap, viewport)}
              style={{ color: getElementStyles(styles, 'price').textColor || '#fff',
                ...getElementStyles(styles, 'price') }}
            >
              {content.price || '9'} DT
            </SelectableElement>
          </div>

          {/* Form and CTA */}
          <div className="relative z-10">
              <SelectableElement
                elementId="checkout-form"
                isSelected={selectedElementId === 'checkout-form'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={getClass(formContainerClassMap, viewport)}
              >
                <DynamicCheckoutForm 
                  className="w-full [&_input]:rounded-full [&_input]:bg-white/10 [&_input]:backdrop-blur-md [&_input]:border-white/20 [&_input]:text-white [&_input]:placeholder-white/60 [&_select]:rounded-full [&_select]:bg-white/10 [&_select]:backdrop-blur-md [&_select]:border-white/20 [&_select]:text-white [&_textarea]:rounded-2xl [&_textarea]:bg-white/10 [&_textarea]:backdrop-blur-md [&_textarea]:border-white/20 [&_textarea]:text-white [&_textarea]:placeholder-white/60"
                  onSubmit={(data) => { /* handle form submit */ }}
                />
              </SelectableElement>
          

            {
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
                  ...getElementStyles(styles, 'cta-button'),
                  background: getElementStyles(styles, 'cta-button').backgroundColor ||primaryColor || 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                },
                as: 'primary',
                viewport
              })
            }
          </div>
        </div>
      </SelectableElement>
    </SelectableElement>
  );
};

export default CtaVariation1;