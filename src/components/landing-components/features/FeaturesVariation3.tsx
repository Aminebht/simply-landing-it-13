import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { getClass, getElementStyles, isVisible } from '../classUtils';

interface FeaturesVariation3Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
}

const FeaturesVariation3: React.FC<FeaturesVariation3Props> = ({
  content,
  styles,
  visibility,
  isEditing,
  selectedElementId,
  onElementSelect,
  onContentChange,
  viewport,
}) => {
  const containerClassMap = {
    mobile: 'py-12 px-4 bg-gray-50',
    tablet: 'py-16 px-6 bg-gray-50',
    desktop: 'py-20 px-8 bg-gray-50',
    responsive: 'py-12 px-4 md:py-16 md:px-6 lg:py-20 lg:px-8 bg-gray-50',
  };

  const gridClassMap = {
    mobile: 'grid grid-cols-1 gap-6',
    tablet: 'grid grid-cols-2 gap-8',
    desktop: 'grid grid-cols-3 gap-8',
    responsive: 'grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3',
  };

  const featureCardClassMap = {
    mobile: 'bg-white p-6 rounded-xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-1',
    tablet: 'bg-white p-6 rounded-xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-1',
    desktop: 'bg-white p-8 rounded-2xl shadow-md transition-all hover:shadow-xl hover:-translate-y-2',
    responsive: 'bg-white p-6 rounded-xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 md:p-6 lg:p-8 lg:rounded-2xl lg:hover:shadow-xl lg:hover:-translate-y-2',
  };

  const iconContainerClassMap = {
    mobile: 'w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground',
    tablet: 'w-14 h-14 mb-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground',
    desktop: 'w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground',
    responsive: 'w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground md:w-14 md:h-14 md:mb-5 lg:w-16 lg:h-16 lg:mb-6',
  };

  const defaultFeatures = [
    {
      icon: '💡',
      title: 'Innovative Ideas',
      description: 'We bring fresh perspectives to solve complex challenges.',
    },
    {
      icon: '📈',
      title: 'Measurable Growth',
      description: 'Data-driven strategies that deliver tangible results.',
    },
    {
      icon: '🤝',
      title: 'Collaborative Spirit',
      description: 'We work with you, not just for you, to achieve shared goals.',
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
        backgroundColor: getElementStyles(styles, 'container').backgroundColor || '#f9fafb',
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
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={getElementStyles(styles, 'sectionTitle')}
          >
            {content.sectionTitle || 'Why Partner With Us'}
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
            {content.description || 'Our commitment to excellence and innovation makes us the ideal partner for your next project.'}
          </SelectableElement>
        )}

        <div className={getClass(gridClassMap, viewport)}>
          {features.map((feature: any, index: number) => (
            <SelectableElement
              key={index}
              elementId={`feature-card-${index}`}
              isSelected={selectedElementId === `feature-card-${index}`}
              isEditing={isEditing}
              onSelect={onElementSelect}
              className={getClass(featureCardClassMap, viewport)}
              style={getElementStyles(styles, `feature-card-${index}`)}
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
                    className="text-2xl md:text-3xl"
                    style={getElementStyles(styles, `feature-icon-${index}`)}
                  >
                    {feature.icon}
                  </SelectableElement>
                </SelectableElement>
              )}
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
                  className="text-muted-foreground"
                  style={getElementStyles(styles, `feature-description-${index}`)}
                >
                  {feature.description}
                </SelectableElement>
              )}
            </SelectableElement>
          ))}
        </div>
      </div>
    </SelectableElement>
  );
};

export default FeaturesVariation3;