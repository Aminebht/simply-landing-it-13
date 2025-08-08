# Onboarding Refactoring

This document outlines the refactoring of the Onboarding component to improve maintainability, readability, and code organization.

## What Was Refactored

The original `Onboarding.tsx` file was a massive 1400+ line component that handled everything from UI rendering to AI service integration. It has been broken down into:

### 1. **Types & Interfaces** (`src/types/onboarding.ts`)
- `OnboardingData` - Main state interface
- `Product` - Product data structure
- `ComponentVariation` - Component variation data structure  
- `OnboardingStepProps` - Props for step components

### 2. **Constants** (`src/constants/onboarding.ts`)
- `COLOR_PALETTES` - Pre-defined color themes
- `SUPPORTED_LANGUAGES` - Language configuration

### 3. **Custom Hooks** (`src/hooks/useOnboardingData.ts`)
- `useOnboardingData` - Centralized data fetching and state management
- Handles products, component variations, and product media fetching
- Includes error handling and loading states

### 4. **Utility Functions** (`src/utils/onboardingHelpers.ts`)
- `getImageFieldNames` - Maps component variations to image field names
- `mapImageKeysToFieldNames` - Generic image key mapping
- `generateSlugFromTitle` - URL slug generation
- `determineImagesToGenerate` - AI image generation logic

### 5. **AI Service** (`src/services/onboarding-ai.ts`)
- `OnboardingAIService` - Dedicated class for AI operations
- Component selection logic
- Content generation
- Landing page creation
- Image generation coordination
- Custom actions setup

### 6. **Step Components** (`src/components/onboarding/`)
- `ProductSelectionStep` - Product selection UI
- `DescriptionStep` - Description configuration UI
- `ImageSelectionStep` - Image preferences UI
- `LanguageStep` - Language and final settings UI

### 7. **Main Component** (`src/pages/Onboarding.tsx`)
- Orchestrates the entire onboarding flow
- Minimal UI logic, delegates to step components
- Calls AI service for business logic
- Clean separation of concerns

## Benefits of Refactoring

### **Maintainability**
- Each component has a single responsibility
- Easy to find and fix bugs
- Changes to one step don't affect others

### **Reusability**
- Step components can be reused in other contexts
- AI service can be used by other components
- Utility functions are generic and reusable

### **Testability**
- Each piece can be unit tested independently
- Easier to mock dependencies
- Clear input/output contracts

### **Readability**
- Reduced cognitive load
- Self-documenting code structure
- Clear data flow

### **Type Safety**
- Better TypeScript support
- Catch errors at compile time
- Clearer interfaces and contracts

## File Structure

```
src/
├── types/
│   └── onboarding.ts           # Type definitions
├── constants/
│   └── onboarding.ts           # Constants and configuration
├── hooks/
│   └── useOnboardingData.ts    # Data management hook
├── utils/
│   └── onboardingHelpers.ts    # Helper utilities
├── services/
│   └── onboarding-ai.ts        # AI service logic
├── components/
│   └── onboarding/
│       ├── index.ts            # Export barrel
│       ├── ProductSelectionStep.tsx
│       ├── DescriptionStep.tsx
│       ├── ImageSelectionStep.tsx
│       └── LanguageStep.tsx
└── pages/
    ├── Onboarding.tsx          # Main refactored component
    └── OnboardingOriginal.tsx  # Original backup
```

## Migration Notes

- Original file backed up as `OnboardingOriginal.tsx`
- All functionality preserved
- No breaking changes to external API
- Build successfully passes
- Maintains exact same user experience

## Future Improvements

With this refactored structure, future improvements become easier:

1. **Add new steps** - Just create new step components
2. **Enhance AI logic** - Modify the AI service without touching UI
3. **Add validation** - Integrate form validation per step
4. **Improve testing** - Add comprehensive test coverage
5. **Performance optimization** - Add lazy loading and code splitting

## Usage

The refactored component works exactly the same as before:

```tsx
import Onboarding from '@/pages/Onboarding';

// Use as before - no changes needed
<Onboarding />
```

Individual components can also be imported and used separately:

```tsx
import { ProductSelectionStep } from '@/components/onboarding';
import { useOnboardingData } from '@/hooks/useOnboardingData';

// Use individual step in custom flows
```
