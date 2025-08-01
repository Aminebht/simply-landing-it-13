import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { DynamicCheckoutForm } from './shared/DynamicCheckoutForm';
import { handleButtonClick, renderButton } from '../ButtonUtils';
import { useStyles } from '../useStyles';
import { getClass, getElementStyles } from '../classUtils';
import { getCtaVariation2ClassMaps } from './classmaps/cta-variation-2';

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
  customActions = {},
  checkoutFields
}) => {

  // Get the action for the CTA button (like CtaVariation1)
  const ctaAction = customActions['ctaButton'] || customActions['cta-button'];
  const { primaryColor } = useStyles({ styles, variation: 2 });

  // Get shared class maps
  const {
    container: containerClassMap,
    headline: headlineClassMap,
    subheadline: subheadlineClassMap,
    priceRow: priceRowClassMap,
    originalPrice: originalPriceClassMap,
    price: priceClassMap,
    form: formClassMap,
    button: buttonClassMap,
    guaranteeText: guaranteeTextClassMap
  } = getCtaVariation2ClassMaps();

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
          checkoutFields={checkoutFields}
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