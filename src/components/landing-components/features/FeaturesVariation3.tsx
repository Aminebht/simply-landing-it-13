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
    mobile: 'py-12 px-4 bg-gradient-to-br from-background via-muted/30 to-background',
    tablet: 'py-16 px-6 bg-gradient-to-br from-background via-muted/30 to-background',
    desktop: 'py-20 px-8 bg-gradient-to-br from-background via-muted/30 to-background',
    responsive: 'py-12 px-4 md:py-16 md:px-6 lg:py-20 lg:px-8 bg-gradient-to-br from-background via-muted/30 to-background',
  };

  const gridClassMap = {
    mobile: 'grid grid-cols-1 gap-6',
    tablet: 'grid grid-cols-2 gap-8',
    desktop: 'grid grid-cols-3 gap-8',
    responsive: 'grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3',
  };

  const featureCardClassMap = {
    mobile: 'group bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-primary/30 hover:bg-card/80',
    tablet: 'group bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-primary/30 hover:bg-card/80',
    desktop: 'group bg-card/50 backdrop-blur-sm p-10 rounded-3xl border border-border/50 shadow-xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-4 hover:border-primary/30 hover:bg-card/80',
    responsive: 'group bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-primary/30 hover:bg-card/80 lg:p-10 lg:rounded-3xl lg:shadow-xl lg:hover:shadow-3xl lg:hover:-translate-y-4',
  };

  const iconContainerClassMap = {
    mobile: 'w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300',
    tablet: 'w-18 h-18 mb-7 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300',
    desktop: 'w-20 h-20 mb-8 mx-auto flex items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300',
    responsive: 'w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 md:w-18 md:h-18 md:mb-7 lg:w-20 lg:h-20 lg:mb-8 lg:rounded-3xl lg:shadow-xl lg:group-hover:shadow-2xl',
  };

  const defaultFeatures = [
    {
      icon: '🚀',
      title: 'Launch Faster',
      description: 'Go from idea to market in half the time with our streamlined development process and proven frameworks.',
    },
    {
      icon: '💰',
      title: 'Increase Revenue',
      description: 'Boost your bottom line with features designed to maximize conversions and customer lifetime value.',
    },
    {
      icon: '🎯',
      title: 'Hit Your Goals',
      description: 'Achieve ambitious targets with data-driven strategies and continuous optimization.',
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