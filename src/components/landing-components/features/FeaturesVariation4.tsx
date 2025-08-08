import React, { useState } from 'react';
import { ComponentProps } from '@/types/components';
import { SelectableElement } from '@/components/builder/SelectableElement';
import { getClass, getElementStyles, isVisible } from '../classUtils';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useComponentMedia } from '@/hooks/useComponentMedia';

interface FeaturesVariation4Props extends ComponentProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
}

const FeaturesVariation4: React.FC<FeaturesVariation4Props> = ({
  content,
  styles,
  visibility,
  mediaUrls,
  isEditing,
  selectedElementId,
  onElementSelect,
  onContentChange,
  onStyleChange,
  componentId,
  viewport,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const { mediaUrls: hookMediaUrls, getMediaUrl, refreshMediaUrls } = useComponentMedia({
    componentId: componentId!,
    initialMediaUrls: mediaUrls,
    autoLoad: true,
  });

  const getImageUrl = (fieldName: string): string | undefined => {
    return hookMediaUrls[fieldName] || getMediaUrl(fieldName) || mediaUrls?.[fieldName];
  };

  const containerClassMap = {
    mobile: 'py-12 px-4 bg-gradient-to-b from-background to-muted/20',
    tablet: 'py-16 px-6 bg-gradient-to-b from-background to-muted/20',
    desktop: 'py-20 px-8 bg-gradient-to-b from-background to-muted/20',
    responsive: 'py-12 px-4 md:py-16 md:px-6 lg:py-20 lg:px-8 bg-gradient-to-b from-background to-muted/20',
  };

  const gridClassMap = {
    mobile: 'grid grid-cols-1 gap-8',
    tablet: 'grid grid-cols-1 gap-10',
    desktop: 'grid grid-cols-12 gap-12',
    responsive: 'grid grid-cols-1 gap-8 md:grid-cols-1 md:gap-10 lg:grid-cols-12 lg:gap-12',
  };

  const tabsContainerClassMap = {
    mobile: 'lg:col-span-4 space-y-2',
    tablet: 'lg:col-span-4 space-y-2',
    desktop: 'lg:col-span-4 space-y-2',
    responsive: 'lg:col-span-4 space-y-2',
  };

  const tabButtonClass = (isActive: boolean) =>
    `w-full text-left p-6 rounded-xl transition-all duration-300 text-lg font-semibold border ${
      isActive 
        ? 'bg-primary text-primary-foreground shadow-lg border-primary transform scale-105' 
        : 'bg-card hover:bg-muted border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-1'
    }`;

  const contentContainerClassMap = {
    mobile: 'lg:col-span-8',
    tablet: 'lg:col-span-8',
    desktop: 'lg:col-span-8',
    responsive: 'lg:col-span-8',
  };

  const defaultFeatures = [
    {
      title: 'AI-Powered Automation',
      description: 'Automate 90% of repetitive tasks with our intelligent AI system. Save 20+ hours per week and focus on what matters most - growing your business.',
      image: 'https://via.placeholder.com/800x600?text=AI+Automation',
    },
    {
      title: 'Advanced Analytics Dashboard',
      description: 'Make data-driven decisions with real-time insights. Track ROI, conversion rates, and customer behavior with precision analytics that drive results.',
      image: 'https://via.placeholder.com/800x600?text=Analytics+Dashboard',
    },
    {
      title: 'White-Glove Onboarding',
      description: 'Get up and running in 24 hours with our dedicated success team. Personal training, custom setup, and ongoing support ensure your success.',
      image: 'https://via.placeholder.com/800x600?text=Onboarding+Support',
    },
  ];

  const features = content.features || defaultFeatures;
  const activeFeature = features[activeTab] || features[0];

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
          <SelectableElement
            elementId="sectionTitle"
            isSelected={selectedElementId === 'sectionTitle'}
            isEditing={isEditing}
            onSelect={onElementSelect}
            onContentChange={onContentChange}
            contentField="sectionTitle"
            isContentEditable
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12"
            style={getElementStyles(styles, 'sectionTitle')}
          >
            {content.sectionTitle || 'Everything You Need, All in One Place'}
          </SelectableElement>
        )}

        <div className={getClass(gridClassMap, viewport)}>
          <div className={getClass(tabsContainerClassMap, viewport)}>
            {features.map((feature: any, index: number) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={tabButtonClass(activeTab === index)}
              >
                <SelectableElement
                  elementId={`feature-title-${index}`}
                  isSelected={selectedElementId === `feature-title-${index}`}
                  isEditing={isEditing}
                  onSelect={onElementSelect}
                  onContentChange={(field, value) => onContentChange(`features[${index}].title`, value)}
                  contentField={`features[${index}].title`}
                  isContentEditable
                >
                  {feature.title}
                </SelectableElement>
              </button>
            ))}
          </div>

          <div className={getClass(contentContainerClassMap, viewport)}>
            {activeFeature && (
              <div className="bg-card/80 backdrop-blur-sm p-8 lg:p-12 rounded-2xl border border-border/50 shadow-xl">
                {isVisible(visibility, `feature-image-${activeTab}`) && (
                  <SelectableElement
                    elementId={`feature-image-container-${activeTab}`}
                    isSelected={selectedElementId === `feature-image-container-${activeTab}`}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    className="mb-8 w-full h-80 bg-muted/30 rounded-xl overflow-hidden border border-border/30 shadow-lg"
                  >
                    {isEditing ? (
                      <ImageUpload
                        value={getImageUrl('mainImage') || activeFeature.image || ''}
                        onChange={async () => {
                          await refreshMediaUrls();
                        }}
                        placeholder="Upload feature image"
                        className="w-full h-full"
                        disabled={!isEditing}
                        containerId={`feature-image-${activeTab}`}
                        autoDetectDimensions={true}
                        aspectRatio={4/3}
                        minWidth={300}
                        minHeight={200}
                        imageType="product"
                        enableWebP={true}
                        useMediaService={true}
                        componentId={componentId!}
                        fieldName={"mainImage"}
                      />
                    ) : (
                      <img
                        src={getImageUrl('mainImage') || activeFeature.image || 'https://via.placeholder.com/800x600'}
                        alt="Feature showcase"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        style={getElementStyles(styles, 'mainImage')}
                      />
                    )}
                  </SelectableElement>
                )}
                {isVisible(visibility, `feature-description-${activeTab}`) && (
                  <SelectableElement
                    elementId={`feature-description-${activeTab}`}
                    isSelected={selectedElementId === `feature-description-${activeTab}`}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    onContentChange={(field, value) => onContentChange(`features[${activeTab}].description`, value)}
                    contentField={`features[${activeTab}].description`}
                    isContentEditable
                    className="text-lg text-muted-foreground leading-relaxed"
                    style={getElementStyles(styles, `feature-description-${activeTab}`)}
                  >
                    {activeFeature.description}
                  </SelectableElement>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SelectableElement>
  );
};

export default FeaturesVariation4;