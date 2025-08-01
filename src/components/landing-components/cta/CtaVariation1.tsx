import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { useStyles } from '../useStyles';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { DynamicCheckoutForm } from './shared/DynamicCheckoutForm';
import { getClass, getElementStyles } from '../classUtils';
import { ctaVariation1ClassMaps } from './classmaps/cta-variation-1';

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
  customActions,
  checkoutFields
}) => {
  const { primaryColor } = useStyles({ styles, variation: 1 });

  // Use shared class maps
  const {
    container: containerClassMap,
    card: cardClassMap,
    headline: headlineClassMap,
    subheadline: subheadlineClassMap,
    formContainer: formContainerClassMap,
    ctaButton: ctaButtonClassMap,
    price: priceClassMap
  } = ctaVariation1ClassMaps;

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
                  checkoutFields={checkoutFields}
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