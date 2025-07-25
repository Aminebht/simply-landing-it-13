import React from 'react';
import { ComponentProps } from '@/types/components';

const FeaturesVariation1: React.FC<ComponentProps> = ({
  content,
  styles,
  visibility,
  isEditing,
  onStyleChange,
  onContentChange
}) => {
  const containerStyles = styles?.container || {};
  const features = content.features || [
    { title: 'Easy to Use', description: 'Intuitive interface that anyone can master', icon: '🚀' },
    { title: 'Powerful Features', description: 'All the tools you need in one place', icon: '⚡' },
    { title: '24/7 Support', description: 'We are here to help whenever you need', icon: '🎯' }
  ];

  return (
    <section 
      className="py-20 px-4"
      style={{
        backgroundColor: containerStyles.backgroundColor || 'hsl(var(--muted))',
        color: containerStyles.textColor || 'hsl(var(--foreground))',
        ...containerStyles
      }}
    >
      <div className="max-w-6xl mx-auto">
        {visibility?.sectionTitle !== false && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {content.sectionTitle || 'Why Choose Us'}
            </h2>
            {visibility?.description !== false && (
              <p className="text-xl text-muted-foreground">
                {content.description || 'Discover what makes us different'}
              </p>
            )}
          </div>
        )}
        
        {visibility?.featureList !== false && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature: any, index: number) => (
              <div key={index} className="text-center">
                {visibility?.icons !== false && (
                  <div className="text-4xl mb-4">{feature.icon}</div>
                )}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturesVariation1;