import React from 'react';
import { ComponentProps } from '@/types/components';

const TestimonialsVariation1: React.FC<ComponentProps> = ({
  content,
  styles,
  visibility,
  isEditing,
  onStyleChange,
  onContentChange
}) => {
  const containerStyles = styles?.container || {};
  const testimonials = content.testimonials || [
    { name: 'John Doe', text: 'Amazing product! Highly recommend.', image: '', rating: 5 },
    { name: 'Jane Smith', text: 'Changed the way we do business.', image: '', rating: 5 },
    { name: 'Mike Johnson', text: 'Outstanding support and features.', image: '', rating: 5 }
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
          <h2 className="text-4xl font-bold text-center mb-16">
            {content.sectionTitle || 'What Our Customers Say'}
          </h2>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <div key={index} className="bg-card p-6 rounded-lg border">
              {visibility?.ratings !== false && (
                <div className="flex mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
              )}
              
              {visibility?.testimonials !== false && (
                <p className="text-muted-foreground mb-4">
                  "{testimonial.text}"
                </p>
              )}
              
              {visibility?.authorImages !== false && (
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-muted rounded-full mr-3 flex items-center justify-center">
                    <span className="text-sm">{testimonial.name[0]}</span>
                  </div>
                  <span className="font-medium">{testimonial.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsVariation1;