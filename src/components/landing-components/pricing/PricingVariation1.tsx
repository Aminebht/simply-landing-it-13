import React from 'react';
import { ComponentProps } from '@/types/components';

const PricingVariation1: React.FC<ComponentProps> = ({
  content,
  styles,
  visibility,
  isEditing,
  onStyleChange,
  onContentChange
}) => {
  const containerStyles = styles?.container || {};
  const pricingPlans = content.pricingPlans || [
    { name: 'Basic', price: '$9', features: ['Feature 1', 'Feature 2', 'Email Support'] },
    { name: 'Pro', price: '$29', features: ['Everything in Basic', 'Feature 3', 'Priority Support'], popular: true },
    { name: 'Enterprise', price: '$99', features: ['Everything in Pro', 'Custom Features', 'Dedicated Support'] }
  ];

  return (
    <section 
      className="py-20 px-4"
      style={{
        backgroundColor: containerStyles.backgroundColor || 'hsl(var(--background))',
        color: containerStyles.textColor || 'hsl(var(--foreground))',
        ...containerStyles
      }}
    >
      <div className="max-w-6xl mx-auto">
        {visibility?.sectionTitle !== false && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {content.sectionTitle || 'Choose Your Plan'}
            </h2>
          </div>
        )}
        
        {visibility?.pricingCards !== false && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan: any, index: number) => (
              <div key={index} className={`bg-card p-8 rounded-lg border ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && visibility?.popularBadge !== false && (
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm text-center mb-4">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">
                  {plan.price}<span className="text-lg text-muted-foreground">/month</span>
                </div>
                
                {visibility?.features !== false && (
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-center">
                        <span className="text-primary mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                
                {visibility?.ctaButtons !== false && (
                  <button className={`w-full py-3 rounded-lg font-semibold ${
                    plan.popular 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border border-border hover:bg-accent'
                  }`}>
                    Get Started
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingVariation1;