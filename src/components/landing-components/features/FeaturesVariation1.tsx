import React from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { getClass, getElementStyles, isVisible } from '../classUtils';

interface FeaturesVariation1Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
}

const FeaturesVariation1: React.FC<FeaturesVariation1Props> = ({
  content,
  styles,
  visibility,
  isEditing,
  selectedElementId,
  onElementSelect,
  onContentChange,
  onStyleChange,
  viewport,
}) => {
  const containerClassMap = {
    mobile: 'py-12 px-4 bg-gradient-to-b from-background to-muted',
    tablet: 'py-16 px-6 bg-gradient-to-b from-background to-muted',
    desktop: 'py-20 px-8 bg-gradient-to-b from-background to-muted',
    responsive: 'py-12 px-4 md:py-16 md:px-6 lg:py-20 lg:px-8 bg-gradient-to-b from-background to-muted',
  };

  const gridClassMap = {
    mobile: 'grid grid-cols-1 gap-8',
    tablet: 'grid grid-cols-2 gap-8',
    desktop: 'grid grid-cols-3 gap-10',
    responsive: 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10',
  };

  const featureCardClassMap = {
    mobile: 'group relative p-8 bg-card rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2',
    tablet: 'group relative p-8 bg-card rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2',
    desktop: 'group relative p-10 bg-card rounded-3xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-3',
    responsive: 'group relative p-8 bg-card rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 lg:p-10 lg:rounded-3xl lg:hover:shadow-2xl lg:hover:-translate-y-3',
  };

  const iconContainerClassMap = {
    mobile: 'w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300',
    tablet: 'w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300',
    desktop: 'w-20 h-20 mb-8 mx-auto flex items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300',
    responsive: 'w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 lg:w-20 lg:h-20 lg:mb-8 lg:rounded-3xl',
  };

  const defaultFeatures = [
    { 
      title: 'Lightning Fast', 
      description: 'Get results in seconds, not minutes. Our optimized platform delivers exceptional performance.',
      icon: '⚡' 
    },
    { 
      title: 'Secure & Reliable', 
      description: 'Enterprise-grade security with 99.9% uptime guarantee. Your data is always protected.',
      icon: '🔒' 
    },
    { 
      title: 'Expert Support', 
      description: 'Get help from our team of experts, available 24/7 to ensure your success.',
      icon: '👨‍💼' 
    }
  ];

  const features = content.features || defaultFeatures;

  return (
    <SelectableElement
      elementId="container"
      isSelected={selectedElementId === 'container'}
      isEditing={isEditing}
      onSelect={onElementSelect}
      className={getClass(containerClassMap, viewport)}
      style={getElementStyles(styles, 'container')}
    >
      <div className="max-w-7xl mx-auto">
        {isVisible(visibility, 'sectionTitle') && (
          <div className="text-center mb-16">
            <SelectableElement
              elementId="sectionTitle"
              isSelected={selectedElementId === 'sectionTitle'}
              isEditing={isEditing}
              onSelect={onElementSelect}
              onContentChange={onContentChange}
              contentField="sectionTitle"
              isContentEditable
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
              style={getElementStyles(styles, 'sectionTitle')}
            >
              {content.sectionTitle || 'Why Choose Us'}
            </SelectableElement>
            {isVisible(visibility, 'description') && (
              <SelectableElement
                elementId="description"
                isSelected={selectedElementId === 'description'}
                isEditing={isEditing}
                onSelect={onElementSelect}
                onContentChange={onContentChange}
                contentField="description"
                isContentEditable
                className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                style={getElementStyles(styles, 'description')}
              >
                {content.description || 'Discover what makes us the preferred choice for thousands of satisfied customers worldwide.'}
              </SelectableElement>
            )}
          </div>
        )}
        
        {isVisible(visibility, 'featureList') && (
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
                {isVisible(visibility, 'icons') && (
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
                      className="text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300"
                      style={getElementStyles(styles, `feature-icon-${index}`)}
                    >
                      {feature.icon}
                    </SelectableElement>
                  </SelectableElement>
                )}
                <div className="text-center">
                  <SelectableElement
                    elementId={`feature-title-${index}`}
                    isSelected={selectedElementId === `feature-title-${index}`}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={(field, value) => onContentChange(`features[${index}].title`, value)}
                    contentField={`features[${index}].title`}
                    isContentEditable
                    className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300"
                    style={getElementStyles(styles, `feature-title-${index}`)}
                  >
                    {feature.title}
                  </SelectableElement>
                  <SelectableElement
                    elementId={`feature-description-${index}`}
                    isSelected={selectedElementId === `feature-description-${index}`}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={(field, value) => onContentChange(`features[${index}].description`, value)}
                    contentField={`features[${index}].description`}
                    isContentEditable
                    className="text-muted-foreground leading-relaxed"
                    style={getElementStyles(styles, `feature-description-${index}`)}
                  >
                    {feature.description}
                  </SelectableElement>
                </div>
              </SelectableElement>
            ))}
          </div>
        )}
      </div>
    </SelectableElement>
  );
};

export default FeaturesVariation1;