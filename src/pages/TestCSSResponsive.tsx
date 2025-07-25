import React from 'react';
import HeroVariation1 from '@/components/landing-components/hero/HeroVariation1';
import HeroVariation2 from '@/components/landing-components/hero/HeroVariation2';
import HeroVariation3 from '@/components/landing-components/hero/HeroVariation3';
import HeroVariation4 from '@/components/landing-components/hero/HeroVariation4';
import HeroVariation5 from '@/components/landing-components/hero/HeroVariation5';
import HeroVariation6 from '@/components/landing-components/hero/HeroVariation6';
import CtaVariation1 from '@/components/landing-components/cta/CtaVariation1';
import CtaVariation2 from '@/components/landing-components/cta/CtaVariation2';
import CtaVariation3 from '@/components/landing-components/cta/CtaVariation3';

const TestCSSResponsive = () => {
  // Mock data for testing
  const mockContent = {
    headline: "Test CSS Responsive Layout",
    subheadline: "Resize your browser window or use DevTools to test responsiveness. This should adapt to your screen size automatically.",
    ctaButton: "Get Started",
    secondaryButton: "Learn More",
    badge: "New Feature",
    price: "99",
    originalPrice: "199",
    priceLabel: "one-time payment",
    moneyBackGuarantee: "30-day money-back guarantee",
    
    // Stats for variation 5
    stat1Number: "120+",
    stat1Label: "Video Lessons",
    stat2Number: "25h",
    stat2Label: "Content",
    stat3Number: "12K+",
    stat3Label: "Students",
    
    // Course content for variation 5
    courseTitle: "Digital Marketing Masterclass",
    module1Title: "HTML & CSS Fundamentals",
    module2Title: "JavaScript & ES6+",
    module3Title: "React & Modern Frontend",
    videoUrl: "",
    
    // Professional content for variation 6
    brandName: "TechCorp Solutions",
    contactEmail: "contact@techcorp.com",
    professionalName: "John Doe",
    
    // Benefits for variation 6
    benefit1: "Launch your business in just 7 days",
    benefit2: "Attract dream clients organically",
    benefit3: "Close deals without being salesy",
    
    // Trust indicators
    ratingStars: "⭐⭐⭐⭐⭐",
    rating: "4.8/5 (1,243 reviews)",
    certificationIcon: "🏆",
    certification: "Certified Program"
  };

  const mockStyles = {};
  const mockVisibility = {};

  // Debug function to show what classes would be generated
  const debugResponsiveClasses = (mobile: string, tablet: string, desktop: string, viewport?: string) => {
    if (viewport) {
      switch (viewport) {
        case 'mobile':
          return mobile;
        case 'tablet':
          return tablet;
        case 'desktop':
          return desktop;
        default:
          return desktop;
      }
    }
    return `${mobile} md:${tablet} lg:${desktop}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>CSS Responsive Mode Test - All Hero Variations</strong><br/>
              This page tests all hero components WITHOUT the viewport prop, so they use CSS media queries.<br/>
              📱 Resize your browser window or use DevTools (F12 → Device Toggle) to test different screen sizes:<br/>
              • <strong>Mobile:</strong> &lt; 768px width<br/>
              • <strong>Tablet:</strong> 768px - 1023px width<br/>
              • <strong>Desktop:</strong> ≥ 1024px width
            </p>
          </div>
        </div>
      </div>

      {/* Debug: Show what classes are being generated */}
      <div className="bg-white p-6 rounded-lg shadow mb-8 mx-4">
        <h3 className="text-lg font-semibold mb-4">Debug: Responsive Class Generation</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-600">Grid Layout Classes:</h4>
            <div className="bg-gray-100 p-3 rounded font-mono text-xs">
              <div><strong>NO viewport:</strong> {debugResponsiveClasses('grid-cols-1 gap-6', 'grid-cols-1 gap-10', 'grid-cols-2 gap-12')}</div>
              <div><strong>viewport="mobile":</strong> {debugResponsiveClasses('grid-cols-1 gap-6', 'grid-cols-1 gap-10', 'grid-cols-2 gap-12', 'mobile')}</div>
              <div><strong>viewport="tablet":</strong> {debugResponsiveClasses('grid-cols-1 gap-6', 'grid-cols-1 gap-10', 'grid-cols-2 gap-12', 'tablet')}</div>
              <div><strong>viewport="desktop":</strong> {debugResponsiveClasses('grid-cols-1 gap-6', 'grid-cols-1 gap-10', 'grid-cols-2 gap-12', 'desktop')}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-blue-600">Content Order Classes:</h4>
            <div className="bg-gray-100 p-3 rounded font-mono text-xs">
              <div><strong>NO viewport:</strong> {debugResponsiveClasses('order-2 px-2', 'order-2 px-0', 'order-1 px-0')}</div>
              <div><strong>viewport="desktop":</strong> {debugResponsiveClasses('order-2 px-2', 'order-2 px-0', 'order-1 px-0', 'desktop')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Current window size indicator */}
      <div className="bg-white p-4 rounded-lg shadow mb-8 text-center">
        <p className="text-sm text-gray-600">Current viewport:</p>
        <p className="text-lg font-semibold">
          <span className="md:hidden">📱 Mobile (&lt; 768px)</span>
          <span className="hidden md:block lg:hidden">📱 Tablet (768px - 1023px)</span>
          <span className="hidden lg:block">🖥️ Desktop (≥ 1024px)</span>
        </p>
      </div>

      {/* Debug: Test responsive classes directly */}
      <div className="bg-white p-6 rounded-lg shadow mb-8 mx-4">
        <h3 className="text-lg font-semibold mb-4">Debug: Responsive Class Test</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-red-100 p-4 rounded">
              <p className="text-sm font-medium">Mobile (default)</p>
              <p className="text-xs text-gray-600">Should be red background</p>
            </div>
            <div className="bg-blue-100 p-4 rounded">
              <p className="text-sm font-medium">Tablet (md:)</p>
              <p className="text-xs text-gray-600">Should be blue background</p>
            </div>
            <div className="bg-green-100 p-4 rounded">
              <p className="text-sm font-medium">Desktop (lg:)</p>
              <p className="text-xs text-gray-600">Should be green background</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              If you see different colored boxes at different screen sizes, Tailwind responsive classes are working.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Variation 1 - NO viewport prop */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 px-4">HeroVariation1 - CSS Responsive (NO viewport prop)</h2>
        <HeroVariation1 
          content={mockContent}
          styles={mockStyles}
          visibility={mockVisibility}
          isEditing={false}
          // NO viewport prop = CSS responsive mode
        />
      </section>

      {/* Hero Variation 2 - NO viewport prop */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 px-4">HeroVariation2 - CSS Responsive (NO viewport prop)</h2>
        <HeroVariation2 
          content={mockContent}
          styles={mockStyles}
          visibility={mockVisibility}
          isEditing={false}
          // NO viewport prop = CSS responsive mode
        />
      </section>

      {/* Hero Variation 3 - NO viewport prop */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 px-4">HeroVariation3 - CSS Responsive (NO viewport prop)</h2>
        <HeroVariation3 
          content={mockContent}
          styles={mockStyles}
          visibility={mockVisibility}
          isEditing={false}
          // NO viewport prop = CSS responsive mode
        />
      </section>

      {/* Hero Variation 4 - NO viewport prop */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 px-4">HeroVariation4 - CSS Responsive (NO viewport prop)</h2>
        <HeroVariation4 
          content={mockContent}
          styles={mockStyles}
          visibility={mockVisibility}
          isEditing={false}
          // NO viewport prop = CSS responsive mode
        />
      </section>

      {/* Hero Variation 5 - NO viewport prop */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 px-4">HeroVariation5 - CSS Responsive (NO viewport prop)</h2>
        <HeroVariation5 
          content={mockContent}
          styles={mockStyles}
          visibility={mockVisibility}
          isEditing={false}
          // NO viewport prop = CSS responsive mode
        />
      </section>

      {/* Hero Variation 6 - NO viewport prop */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 px-4">HeroVariation6 - CSS Responsive (NO viewport prop)</h2>
        <HeroVariation6 
          content={mockContent}
          styles={mockStyles}
          visibility={mockVisibility}
          isEditing={false}
          // NO viewport prop = CSS responsive mode
        />
      </section>

      {/* CTA Variation 1 - NO viewport prop */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 px-4">CtaVariation1 - CSS Responsive (NO viewport prop)</h2>
        <CtaVariation1
          content={mockContent}
          styles={mockStyles}
          visibility={mockVisibility}
          isEditing={false}
        />
      </section>

      {/* CTA Variation 2 - NO viewport prop */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 px-4">CtaVariation2 - CSS Responsive (NO viewport prop)</h2>
        <CtaVariation2
          content={mockContent}
          styles={mockStyles}
          visibility={mockVisibility}
          isEditing={false}
        />
      </section>

      {/* CTA Variation 3 - NO viewport prop */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 px-4">CtaVariation3 - CSS Responsive (NO viewport prop)</h2>
        <CtaVariation3
          content={mockContent}
          styles={mockStyles}
          visibility={mockVisibility}
          isEditing={false}
        />
      </section>

      {/* Testing checklist */}
      <div className="bg-white p-6 rounded-lg shadow mt-8 mx-4">
        <h3 className="text-lg font-semibold mb-4">Testing Checklist:</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-600">Mobile (&lt; 768px)</h4>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• Single column layout</li>
              <li>• Smaller text sizes</li>
              <li>• Stacked elements</li>
              <li>• V5: Course preview on top</li>
              <li>• V6: Image on top, email hidden</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-600">Tablet (768px-1023px)</h4>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• Single column with more spacing</li>
              <li>• Medium text sizes</li>
              <li>• Better element spacing</li>
              <li>• V5: Course preview still on top</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-600">Desktop (≥ 1024px)</h4>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• Two column layout</li>
              <li>• Largest text sizes</li>
              <li>• Side-by-side content</li>
              <li>• V5: Content left, preview right</li>
              <li>• V6: Content left, image right</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCSSResponsive;
