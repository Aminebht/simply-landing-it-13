import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { DynamicCheckoutForm } from './shared/DynamicCheckoutForm';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { useStyles } from '../useStyles';
import { getClass, getElementStyles } from '../classUtils';

interface CtaVariation2Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
}

const CtaVariation2: React.FC<CtaVariation2Props> = ({
  content,
  styles = {},
  visibility = {},
  isEditing,
  selectedElementId,
  onElementSelect,
  onContentChange,
  viewport,
  customActions = {}
}) => {

  // Get the action for the CTA button (like CtaVariation1)
  const ctaAction = customActions['ctaButton'] || customActions['cta-button'];
  const { primaryColor } = useStyles({ styles, variation: 2 });


  // Add local class maps for responsive classes
  const containerClassMap = {
    mobile: 'flex flex-col items-center justify-center min-h-screen w-full px-4',
    tablet: 'flex flex-col items-center justify-center min-h-screen w-full px-8',
    desktop: 'flex flex-col items-center justify-center min-h-screen w-full px-16',
    responsive: 'flex flex-col items-center justify-center min-h-screen w-full px-4 md:px-8 lg:px-16'
  };
  const headlineClassMap = {
    mobile: 'font-bold text-2xl mb-4 text-center',
    tablet: 'font-bold text-4xl mb-4 text-center',
    desktop: 'font-bold text-5xl mb-4 text-center',
    responsive: 'font-bold text-2xl mb-4 text-center md:text-4xl lg:text-5xl'
  };
  const subheadlineClassMap = {
    mobile: 'text-gray-400 text-lg mb-6 text-center',
    tablet: 'text-gray-400 text-xl mb-6 text-center',
    desktop: 'text-gray-400 text-xl mb-6 text-center',
    responsive: 'text-gray-400 text-lg mb-6 text-center md:text-xl'
  };
  const priceRowClassMap = {
    mobile: 'flex flex-row items-center justify-center gap-4 mb-6',
    tablet: 'flex flex-row items-center justify-center gap-6 mb-6',
    desktop: 'flex flex-row items-center justify-center gap-8 mb-6',
    responsive: 'flex flex-row items-center justify-center gap-4 mb-6 md:gap-6 lg:gap-8'
  };
  const originalPriceClassMap = {
    mobile: 'text-gray-400 line-through text-lg text-center',
    tablet: 'text-gray-400 line-through text-xl text-center',
    desktop: 'text-gray-400 line-through text-xl text-center',
    responsive: 'text-gray-400 line-through text-lg text-center md:text-xl'
  };
  const priceClassMap = {
    mobile: 'font-bold text-2xl text-primary text-center',
    tablet: 'font-bold text-3xl text-primary text-center',
    desktop: 'font-bold text-3xl text-primary text-center',
    responsive: 'font-bold text-2xl text-primary text-center md:text-3xl'
  };
  const formClassMap = {
    mobile: 'flex flex-col items-center w-full max-w-md mx-auto gap-4',
    tablet: 'flex flex-col items-center w-full max-w-lg mx-auto gap-4',
    desktop: 'flex flex-col items-center w-full max-w-lg mx-auto gap-4',
    responsive: 'flex flex-col items-center w-full max-w-md mx-auto gap-4 md:max-w-lg'
  };
  const buttonClassMap = {
    mobile: 'w-full rounded-full bg-blue-600 text-white font-semibold py-3 mt-2 hover:bg-blue-700 transition text-center transform hover:scale-105 shadow-lg hover:shadow-xl',
    tablet: 'w-full rounded-full bg-blue-600 text-white font-semibold py-4 mt-2 hover:bg-blue-700 transition text-center transform hover:scale-105 shadow-lg hover:shadow-xl',
    desktop: 'w-full rounded-full bg-blue-600 text-white font-semibold py-4 mt-2 hover:bg-blue-700 transition text-center transform hover:scale-105 shadow-lg hover:shadow-xl',
    responsive: 'w-full max-w-md md:max-w-lg rounded-full bg-blue-600 text-white font-semibold py-3 mt-2 hover:bg-blue-700 transition text-center transform hover:scale-105 shadow-lg hover:shadow-xl md:py-4'
  };
  const guaranteeTextClassMap = {
    mobile: 'text-xs text-gray-400 mt-6 text-center',
    tablet: 'text-xs text-gray-400 mt-6 text-center',
    desktop: 'text-xs text-gray-400 mt-6 text-center',
    responsive: 'text-xs text-gray-400 mt-6 text-center'
  };

  return (
    <SelectableElement
      elementId="container"
      isSelected={selectedElementId === 'container'}
      isEditing={isEditing}
      onSelect={onElementSelect}
      onContentChange={onContentChange}
      isContentEditable={false}
      className={getClass(containerClassMap, viewport)}
      style={{
        ...getElementStyles(styles, 'container'),
        background: getElementStyles(styles, 'container').background || getElementStyles(styles, 'container').backgroundColor || '#0f172a'
      }}
    >
      {visibility.headline && (
      <SelectableElement
        elementId="headline"
        isSelected={selectedElementId === 'headline'}
        isEditing={isEditing}
        onSelect={onElementSelect}
        onContentChange={onContentChange}
        contentField="headline"
        isContentEditable={true}
        className={getClass(headlineClassMap, viewport)}
        style={{ color: getElementStyles(styles, 'headline').textColor || '#fff', 
          ...getElementStyles(styles, 'headline') }}
      >
        {content.headline || 'Get Your Guide to Success Instantly'}
      </SelectableElement>
      )}
      
      {visibility.subheadline && (
      <SelectableElement
        elementId="subheadline"
        isSelected={selectedElementId === 'subheadline'}
        isEditing={isEditing}
        onSelect={onElementSelect}
        onContentChange={onContentChange}
        contentField="subheadline"
        isContentEditable={true}
        className={getClass(subheadlineClassMap, viewport)}
        style={{ color: getElementStyles(styles, 'subheadline').textColor || '#d1d5db', ...getElementStyles(styles, 'subheadline') }}
      >
          {content.subheadline || 'Access expert insights and actionable tips. Download your exclusive eBook and start your journey today!'}
      </SelectableElement>
      )}

      <div className={getClass(priceRowClassMap, viewport)}>
        <SelectableElement
          elementId="original-price"
          isSelected={selectedElementId === 'original-price'}
          isEditing={isEditing}
          onSelect={onElementSelect}
          onContentChange={onContentChange}
          contentField="originalPrice"
          isContentEditable={true}
          className={getClass(originalPriceClassMap, viewport)}
          style={{ color: getElementStyles(styles, 'original-price').textColor || '#9ca3af', ...getElementStyles(styles, 'original-price') }}
        >
          {content.originalPrice ||'29'} DT
        </SelectableElement>
        <SelectableElement
          elementId="price"
          isSelected={selectedElementId === 'price'}
          isEditing={isEditing}
          onSelect={onElementSelect}
          onContentChange={onContentChange}
          contentField="price"
          isContentEditable={true}
          className={getClass(priceClassMap, viewport)}
          style={{ color: getElementStyles(styles, 'price').textColor || '#2563eb', ...getElementStyles(styles, 'price') }}
        >
          {content.price || '7'} DT
        </SelectableElement>
      </div>
      <form className={getClass(formClassMap, viewport)} onSubmit={e => e.preventDefault()}>
        <DynamicCheckoutForm 
          className="w-full flex flex-col gap-4 [&_.field-wrapper]:w-full [&_.field-wrapper]:flex [&_.field-wrapper]:flex-col [&_.field-wrapper]:items-center [&_.label-wrapper]:flex [&_.label-wrapper]:items-center [&_.label-wrapper]:justify-center [&_label]:mb-2 [&_label]:text-center [&_label]:font-medium [&_label]:text-white [&_.required-asterisk]:text-red-500 [&_.required-asterisk]:ml-1 [&_.required-asterisk]:select-none [&_input]:w-full [&_input]:rounded-full [&_input]:px-5 [&_input]:py-3 [&_input]:border [&_input]:border-gray-300 [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-primary [&_input]:text-center [&_select]:w-full [&_select]:rounded-full [&_select]:px-5 [&_select]:py-3 [&_select]:border [&_select]:border-gray-300 [&_select]:focus:outline-none [&_select]:focus:ring-2 [&_select]:focus:ring-primary [&_select]:text-center [&_textarea]:w-full [&_textarea]:rounded-2xl [&_textarea]:px-5 [&_textarea]:py-3 [&_textarea]:border [&_textarea]:border-gray-300 [&_textarea]:focus:outline-none [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-primary [&_textarea]:text-center"
          onSubmit={() => { /* handle form submit */ }}
        />
        {
              renderButton({
                action: ctaAction,
                isEditing,
                content: content.ctaButton || 'Access My eBook',
                elementId: 'cta-button',
                selectedElementId,
                onSelect: onElementSelect,
                onContentChange,
                contentField: 'ctaButton',
                className: getClass(buttonClassMap, viewport),
                style: {
                  ...getElementStyles(styles, 'cta-button'),
                  background: getElementStyles(styles, 'cta-button').backgroundColor ||primaryColor || '#2563eb',
                },
                as: 'primary',
                viewport
              })
            }
      </form>
      {visibility.guarantee !== false && (     
      <SelectableElement
        elementId="guarantee-text"
        isSelected={selectedElementId === 'guarantee-text'}
        isEditing={isEditing}
        onSelect={onElementSelect}
        onContentChange={onContentChange}
        contentField="guaranteeText"
        isContentEditable={true}
        className={getClass(guaranteeTextClassMap, viewport)}
        style={{ color: getElementStyles(styles, 'guarantee-text').textColor || '#9ca3af', ...getElementStyles(styles, 'guarantee-text') }}
      >
        {content.guaranteeText ||'⚡ Instant access • 🔒 Secure payment • 💯 Money-back guarantee'}
      </SelectableElement>
      )}
    </SelectableElement>
  );
};

export default CtaVariation2;