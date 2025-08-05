import React from 'react';
import { cn } from '../utils/cn';

interface HeroVariation1Props {
  content: Record<string, any>;
  styles: Record<string, any>;
  visibility: Record<string, boolean>;
  mediaUrls: Record<string, string>;
  customActions: Record<string, any>;
  globalTheme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    direction: 'ltr' | 'rtl';
    language: string;
  };
  viewport?: 'mobile' | 'tablet' | 'desktop' | 'responsive';
}

const HeroVariation1: React.FC<HeroVariation1Props> = ({
  content,
  styles,
  visibility,
  mediaUrls,
  customActions,
  globalTheme,
  viewport = 'responsive'
}) => {
  const containerStyles = styles.container || {};
  const primaryColor = globalTheme.primaryColor || '#3b82f6';
  
  // Handle button clicks
  const handleButtonClick = (actionKey: string) => {
    const action = customActions[actionKey];
    if (!action) return;
    
    switch (action.type) {
      case 'checkout':
        if (action.url) {
          window.open(action.url, '_blank');
        }
        break;
      case 'external_link':
        if (action.url) {
          window.open(action.url, action.target || '_blank');
        }
        break;
      case 'scroll_to':
        if (action.target_id) {
          const element = document.getElementById(action.target_id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  };
  
  return (
    <section 
      className={cn(
        "w-full relative overflow-hidden",
        viewport === 'mobile' && "px-4 py-12",
        viewport === 'tablet' && "px-6 py-16",
        viewport === 'desktop' && "px-8 py-20"
      )}
      style={{
        backgroundColor: containerStyles.backgroundColor || 'transparent',
        color: containerStyles.textColor || '#1a202c',
        padding: containerStyles.padding ? 
          `${containerStyles.padding[0]}px ${containerStyles.padding[1]}px ${containerStyles.padding[2]}px ${containerStyles.padding[3]}px` : 
          undefined
      }}
    >
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {visibility.headline !== false && (
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                style={{ 
                  color: styles.headline?.color || primaryColor,
                  fontFamily: styles.headline?.fontFamily || globalTheme.fontFamily
                }}
              >
                {content.headline || 'Transform Your Ideas Into Reality'}
              </h1>
            )}
            
            {visibility.subheadline !== false && (
              <p 
                className="text-xl mb-8 opacity-90 leading-relaxed"
                style={{ 
                  color: styles.subheadline?.color || containerStyles.textColor || '#6b7280',
                  fontFamily: styles.subheadline?.fontFamily || globalTheme.fontFamily
                }}
              >
                {content.subheadline || 'Build stunning landing pages that convert visitors into customers with our powerful, easy-to-use platform.'}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {visibility.ctaButton !== false && (
                <button
                  onClick={() => handleButtonClick('ctaButton')}
                  className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:opacity-90 hover:transform hover:scale-105"
                  style={{ 
                    backgroundColor: styles.ctaButton?.backgroundColor || primaryColor,
                    color: styles.ctaButton?.color || '#ffffff'
                  }}
                >
                  {content.ctaButton || 'Get Started Free'}
                </button>
              )}
              
              {visibility.secondaryButton !== false && (
                <button
                  onClick={() => handleButtonClick('secondaryButton')}
                  className="px-8 py-4 rounded-lg font-semibold text-lg border-2 transition-all duration-200 hover:opacity-80"
                  style={{ 
                    borderColor: styles.secondaryButton?.borderColor || primaryColor,
                    color: styles.secondaryButton?.color || primaryColor,
                    backgroundColor: styles.secondaryButton?.backgroundColor || 'transparent'
                  }}
                >
                  {content.secondaryButton || 'Learn More'}
                </button>
              )}
            </div>
            
            {visibility.trustIndicators !== false && content.trustIndicators && (
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start items-center gap-6 opacity-70">
                {content.trustIndicators.map((indicator: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium">{indicator.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Right Content - Hero Image */}
          <div className="relative">
            {visibility.heroImage !== false && (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {mediaUrls.heroImage ? (
                  <img
                    src={mediaUrls.heroImage}
                    alt={content.imageAlt || 'Hero Image'}
                    className="w-full h-auto object-cover"
                    style={{
                      aspectRatio: '16/10',
                      maxHeight: '500px'
                    }}
                  />
                ) : (
                  <div 
                    className="w-full flex items-center justify-center text-gray-400"
                    style={{
                      aspectRatio: '16/10',
                      maxHeight: '500px',
                      backgroundColor: '#f3f4f6'
                    }}
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-4">🚀</div>
                      <p className="text-lg font-medium">Hero Image</p>
                    </div>
                  </div>
                )}
                
                {/* Floating Elements */}
                {content.floatingElements && (
                  <>
                    <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Live Analytics</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
          style={{ backgroundColor: primaryColor }}
        ></div>
        <div 
          className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-5"
          style={{ backgroundColor: primaryColor }}
        ></div>
      </div>
    </section>
  );
};

export default HeroVariation1;
