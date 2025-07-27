import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { renderButton, handleButtonClick } from '../ButtonUtils';
import { getClass, getElementStyles, isVisible } from '../classUtils';

interface FeaturesVariation2Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
}

const FeaturesVariation2: React.FC<FeaturesVariation2Props> = ({
  content,
  styles,
  visibility,
  isEditing,
  selectedElementId,
  onElementSelect,
  onContentChange,
  onStyleChange,
  viewport,
  customActions,
}) => {
  const containerClassMap = {
    mobile: 'py-12 px-4',
    tablet: 'py-16 px-6',
    desktop: 'py-20 px-8',
    responsive: 'py-12 px-4 md:py-16 md:px-6 lg:py-20 lg:px-8',
  };

  const gridClassMap = {
    mobile: 'grid grid-cols-1 gap-8',
    tablet: 'grid grid-cols-1 gap-10',
    desktop: 'grid grid-cols-2 gap-12 items-center',
    responsive: 'grid grid-cols-1 gap-8 md:grid-cols-1 md:gap-10 lg:grid-cols-2 lg:gap-12 lg:items-center',
  };

  const featureItemClassMap = {
    mobile: 'group flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
    tablet: 'group flex items-start gap-5 p-7 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
    desktop: 'group flex items-start gap-6 p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2',
    responsive: 'group flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 md:gap-5 md:p-7 lg:gap-6 lg:p-8 lg:rounded-2xl lg:hover:shadow-xl lg:hover:-translate-y-2',
  };

  const iconContainerClassMap = {
    mobile: 'flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg',
    tablet: 'flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg',
    desktop: 'flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl',
    responsive: 'flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg md:w-14 md:h-14 lg:w-16 lg:h-16 lg:rounded-2xl lg:shadow-xl',
  };

  const iconClassMap = {
    mobile: 'text-xl',
    tablet: 'text-2xl',
    desktop: 'text-3xl',
    responsive: 'text-xl md:text-2xl lg:text-3xl',
  };

  const defaultFeatures = [
    {
      icon: '🎯',
      title: 'Precision Targeting',
      description: 'Reach exactly the right audience with AI-powered targeting that increases conversion rates by 3x.',
      buttonText: 'See How →',
      action: { type: 'open_link', url: '#', newTab: false },
    },
    {
      icon: '📊',
      title: 'Real-Time Analytics',
      description: 'Track performance with advanced analytics dashboard. Make data-driven decisions that boost ROI.',
      buttonText: 'View Demo →',
      action: { type: 'open_link', url: '#', newTab: false },
    },
    {
      icon: '⚡',
      title: 'Instant Results',
      description: 'See improvements within 24 hours. Our proven system delivers results faster than any competitor.',
      buttonText: 'Start Now →',
      action: { type: 'open_link', url: '#', newTab: false },
    },
  ];

  const features = content.features || defaultFeatures;

  return (
    <SelectableElement
      elementId="container"
      isSelected={selectedElementId === 'container'}
      isEditing={isEditing}
      onSelect={onElementSelect}
      className={getClass(containerClassMap, viewport)}
      style={{
        ...getElementStyles(styles, 'container'),
        backgroundColor: getElementStyles(styles, 'container').backgroundColor || '#ffffff',
        color: getElementStyles(styles, 'container').textColor || '#000000',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {isVisible(visibility, 'sectionTitle') && (
          <SelectableElement
            elementId="sectionTitle"
            isSelected={selectedElementId === 'sectionTitle'}
            isEditing={isEditing}
            onSelect={onElementSelect}
            onContentChange={onContentChange}
            contentField="sectionTitle"
            isContentEditable
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4"
            style={getElementStyles(styles, 'sectionTitle')}
          >
            {content.sectionTitle || 'Our Amazing Features'}
          </SelectableElement>
        )}
        {isVisible(visibility, 'description') && (
          <SelectableElement
            elementId="description"
            isSelected={selectedElementId === 'description'}
            isEditing={isEditing}
            onSelect={onElementSelect}
            onContentChange={onContentChange}
            contentField="description"
            isContentEditable
            className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12 md:mb-16"
            style={getElementStyles(styles, 'description')}
          >
            {content.description || 'Discover what makes our product stand out from the rest. We have packed it with features that will boost your productivity.'}
          </SelectableElement>
        )}

        <div className={getClass(gridClassMap, viewport)}>
          <div className="space-y-8">
            {features.map((feature: any, index: number) => (
              <SelectableElement
                key={index}
                elementId={`feature-${index}`}
                isSelected={selectedElementId === `feature-${index}`}
                isEditing={isEditing}
                onSelect={onElementSelect}
                className={getClass(featureItemClassMap, viewport)}
                style={getElementStyles(styles, `feature-${index}`)}
              >
                {isVisible(visibility, `feature-icon-${index}`) && (
                  <SelectableElement
                    elementId={`feature-icon-container-${index}`}
                    isSelected={selectedElementId === `feature-icon-container-${index}`}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    className={getClass(iconContainerClassMap, viewport)}
                    style={getElementStyles(styles, `feature-icon-container-${index}`)}
                  >
                    <SelectableElement
                      elementId={`feature-icon-${index}`}
                      isSelected={selectedElementId === `feature-icon-${index}`}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={(field, value) => onContentChange(`features[${index}].icon`, value)}
                      contentField={`features[${index}].icon`}
                      isContentEditable
                      className={getClass(iconClassMap, viewport)}
                      style={getElementStyles(styles, `feature-icon-${index}`)}
                    >
                      {feature.icon}
                    </SelectableElement>
                  </SelectableElement>
                )}
                <div className="flex-grow">
                  {isVisible(visibility, `feature-title-${index}`) && (
                    <SelectableElement
                      elementId={`feature-title-${index}`}
                      isSelected={selectedElementId === `feature-title-${index}`}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={(field, value) => onContentChange(`features[${index}].title`, value)}
                      contentField={`features[${index}].title`}
                      isContentEditable
                      className="text-xl font-semibold mb-2"
                      style={getElementStyles(styles, `feature-title-${index}`)}
                    >
                      {feature.title}
                    </SelectableElement>
                  )}
                  {isVisible(visibility, `feature-description-${index}`) && (
                    <SelectableElement
                      elementId={`feature-description-${index}`}
                      isSelected={selectedElementId === `feature-description-${index}`}
                      isEditing={isEditing}
                      onSelect={onElementSelect}
                      onContentChange={(field, value) => onContentChange(`features[${index}].description`, value)}
                      contentField={`features[${index}].description`}
                      isContentEditable
                      className="text-muted-foreground mb-3"
                      style={getElementStyles(styles, `feature-description-${index}`)}
                    >
                      {feature.description}
                    </SelectableElement>
                  )}
                  {isVisible(visibility, `feature-button-${index}`) &&
                    renderButton({
                      action: feature.action,
                      isEditing,
                      content: feature.buttonText || 'Learn More',
                      elementId: `feature-button-${index}`,
                      selectedElementId,
                      onSelect: onElementSelect,
                      onContentChange: (field, value) => onContentChange(`features[${index}].buttonText`, value),
                      contentField: `features[${index}].buttonText`,
                      className: 'inline-flex items-center text-primary font-semibold hover:text-primary/80 transition-colors duration-200 group-hover:translate-x-1',
                      style: getElementStyles(styles, `feature-button-${index}`),
                    })}
                </div>
              </SelectableElement>
            ))}
          </div>
          {isVisible(visibility, 'mainImage') && (
            <SelectableElement
              elementId="mainImageContainer"
              isSelected={selectedElementId === 'mainImageContainer'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              className="relative h-80 md:h-full w-full bg-gray-200 rounded-xl flex items-center justify-center"
              style={getElementStyles(styles, 'mainImageContainer')}
            >
              {/* Replace with ImageUpload component if you have one */}
              <img
                src={content.mainImageUrl || 'https://via.placeholder.com/600x400'}
                alt="Feature showcase"
                className="w-full h-full object-cover rounded-xl"
                style={getElementStyles(styles, 'mainImage')}
              />
            </SelectableElement>
          )}
        </div>
      </div>
    </SelectableElement>
  );
};

export default FeaturesVariation2;
