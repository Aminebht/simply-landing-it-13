import React, { useState } from 'react';
import { ComponentProps } from '@/types/components';

const FaqVariation1: React.FC<ComponentProps> = ({
  content,
  styles,
  visibility,
  isEditing,
  onStyleChange,
  onContentChange
}) => {
  const containerStyles = styles?.container || {};
  const [openItem, setOpenItem] = useState<number | null>(null);
  
  const faqItems = content.faqItems || [
    { question: 'How does it work?', answer: 'Our platform is designed to be intuitive and easy to use.' },
    { question: 'What is included?', answer: 'All features are included in every plan with no hidden costs.' },
    { question: 'Can I cancel anytime?', answer: 'Yes, you can cancel your subscription at any time.' }
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
      <div className="max-w-4xl mx-auto">
        {visibility?.sectionTitle !== false && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {content.sectionTitle || 'Frequently Asked Questions'}
            </h2>
          </div>
        )}
        
        {visibility?.searchBar !== false && (
          <div className="mb-8">
            <input 
              type="text" 
              placeholder="Search questions..."
              className="w-full px-4 py-3 border border-border rounded-lg bg-background"
            />
          </div>
        )}
        
        {visibility?.accordion !== false && (
          <div className="space-y-4">
            {faqItems.map((item: any, index: number) => (
              <div key={index} className="bg-card border border-border rounded-lg">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center"
                  onClick={() => setOpenItem(openItem === index ? null : index)}
                >
                  <span className="font-medium">{item.question}</span>
                  <span className="text-2xl">{openItem === index ? '−' : '+'}</span>
                </button>
                {openItem === index && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FaqVariation1;