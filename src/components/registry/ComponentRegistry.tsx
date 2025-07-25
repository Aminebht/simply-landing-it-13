import React from 'react';
import { ComponentProps } from '@/types/components';

// Import all landing components
import {
  HeroVariation1,
  HeroVariation2,
  HeroVariation3,
  HeroVariation4,
  HeroVariation5,
  HeroVariation6
} from '@/components/landing-components/hero';

import {
  TestimonialsVariation1,
  TestimonialsVariation2,
  TestimonialsVariation3,
  TestimonialsVariation4,
  TestimonialsVariation5,
  TestimonialsVariation6
} from '@/components/landing-components/testimonials';

import {
  FeaturesVariation1,
  FeaturesVariation2,
  FeaturesVariation3,
  FeaturesVariation4,
  FeaturesVariation5,
  FeaturesVariation6
} from '@/components/landing-components/features';

import {
  PricingVariation1,
  PricingVariation2,
  PricingVariation3,
  PricingVariation4,
  PricingVariation5,
  PricingVariation6
} from '@/components/landing-components/pricing';

import {
  FaqVariation1,
  FaqVariation2,
  FaqVariation3,
  FaqVariation4,
  FaqVariation5,
  FaqVariation6
} from '@/components/landing-components/faq';

import {
  CtaVariation2,
  CtaVariation3,
  CtaVariation1
} from '@/components/landing-components/cta';

type ComponentType = React.FC<ComponentProps>;

// Component registry mapping with actual components
export const ComponentRegistry: Record<string, Record<number, ComponentType>> = {
  hero: {
    1: HeroVariation1,
    2: HeroVariation2,
    3: HeroVariation3,
    4: HeroVariation4,
    5: HeroVariation5,
    6: HeroVariation6
  },
  testimonials: {
    1: TestimonialsVariation1,
    2: TestimonialsVariation2,
    3: TestimonialsVariation3,
    4: TestimonialsVariation4,
    5: TestimonialsVariation5,
    6: TestimonialsVariation6
  },
  features: {
    1: FeaturesVariation1,
    2: FeaturesVariation2,
    3: FeaturesVariation3,
    4: FeaturesVariation4,
    5: FeaturesVariation5,
    6: FeaturesVariation6
  },
  pricing: {
    1: PricingVariation1,
    2: PricingVariation2,
    3: PricingVariation3,
    4: PricingVariation4,
    5: PricingVariation5,
    6: PricingVariation6
  },
  faq: {
    1: FaqVariation1,
    2: FaqVariation2,
    3: FaqVariation3,
    4: FaqVariation4,
    5: FaqVariation5,
    6: FaqVariation6
  },
  cta: {
    1: CtaVariation1,
    2: CtaVariation2,
    3: CtaVariation3
  }
};

// Helper function to get a component
export function getComponent(type: string, variation: number): ComponentType | null {
  return ComponentRegistry[type]?.[variation] || null;
}

// Helper function to get all available variations for a component type
export function getAvailableVariations(type: string): number[] {
  return Object.keys(ComponentRegistry[type] || {}).map(Number);
}

// Helper function to check if a component exists
export function componentExists(type: string, variation: number): boolean {
  return !!(ComponentRegistry[type]?.[variation]);
}