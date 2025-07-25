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

  const { getMediaUrl } = useComponentMedia({
    componentId,
    initialMediaUrls: mediaUrls,
    autoLoad: true,
  });

  const getImageUrl = (fieldName: string): string | undefined => {
    return mediaUrls?.[fieldName] || getMediaUrl(fieldName);
  };

  const containerClassMap = {
    mobile: 'py-12 px-4',
    tablet: 'py-16 px-6',
    desktop: 'py-20 px-8',
    responsive: 'py-12 px-4 md:py-16 md:px-6 lg:py-20 lg:px-8',
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
    `w-full text-left p-4 rounded-lg transition-all text-lg font-medium ${isActive ? 'bg-primary text-primary-foreground shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`;

  const contentContainerClassMap = {
    mobile: 'lg:col-span-8',
    tablet: 'lg:col-span-8',
    desktop: 'lg:col-span-8',
    responsive: 'lg:col-span-8',
  };

  const defaultFeatures = [
    {
      title: 'Seamless Integration',
      description: 'Connect with your favorite tools in just a few clicks. Our extensive library of integrations makes your workflow smoother than ever.',
      image: 'https://via.placeholder.com/800x600?text=Integration',
    },
    {
      title: 'Advanced Analytics',
      description: 'Gain deep insights into your performance with our comprehensive analytics dashboard. Track metrics that matter and make data-driven decisions.',
      image: 'https://via.placeholder.com/800x600?text=Analytics',
    },
    {
      title: '24/7 Priority Support',
      description: 'Our dedicated support team is always available to help you with any questions or issues. Get expert help whenever you need it.',
      image: 'https://via.placeholder.com/800x600?text=Support',
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
              <div className="bg-white p-8 rounded-xl shadow-lg">
                {isVisible(visibility, `feature-image-${activeTab}`) && (
                  <SelectableElement
                    elementId={`feature-image-container-${activeTab}`}
                    isSelected={selectedElementId === `feature-image-container-${activeTab}`}
                    isEditing={isEditing}
                    onSelect={onElementSelect}
                    className="mb-6 w-full h-64 bg-gray-200 rounded-lg overflow-hidden"
                  >
                    <img
                src={content.mainImageUrl || 'https://via.placeholder.com/600x400'}
                alt="Feature showcase"
                className="w-full h-full object-cover rounded-xl"
                style={getElementStyles(styles, 'mainImage')}
              />
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
                    className="text-lg text-muted-foreground"
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