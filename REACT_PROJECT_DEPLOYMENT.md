# React Project Deployment System

This document explains the new React Project deployment system that replaces static HTML generation with complete React project deployment.

## Overview

The new system generates a complete React project instead of static HTML files, preserving the component structure and avoiding layout issues that occur during HTML conversion.

## Key Components

### 1. ReactProjectTemplateGenerator

Generates the base React project structure including:
- `package.json` with proper dependencies
- `index.html` with SEO meta tags and tracking scripts
- `vite.config.js` for build configuration
- `src/main.jsx` entry point
- `src/App.jsx` main application component
- `src/index.css` base styles
- `netlify.toml` deployment configuration

### 2. ComponentCleanerService

Cleans React components by removing:
- Edit wrapper elements (`<SelectableElement>`)
- Editing event handlers (`onStyleChange`, `onContentChange`)
- Builder-specific props (`isEditing`, `selectedElementId`)
- Development-only code (console.logs, DEV comments)
- Editor-specific imports and dependencies

### 3. ReactProjectGenerator

Orchestrates the entire process:
- Generates base project template
- Cleans and processes components
- Creates utility files
- Validates the final project
- Provides project metrics

## Usage

### Basic Deployment (React Project Mode)

```typescript
import { ReactDeploymentService } from '@/services/react-deployment-service';

// Create service with React project mode enabled (default)
const deploymentService = new ReactDeploymentService(netlifyToken, true);

// Deploy landing page as React project
const result = await deploymentService.deployLandingPage(pageId);
console.log('Deployed to:', result.url);
```

### Switch Between Deployment Modes

```typescript
// Switch to static HTML mode
deploymentService.setDeploymentMode(false);

// Switch back to React project mode
deploymentService.setDeploymentMode(true);

// Check current mode
const mode = deploymentService.getDeploymentMode(); // 'react-project' | 'static-html'
```

### Using the Hook

```typescript
import { useReactDeployment } from '@/hooks/useReactDeployment';

function DeployButton() {
  // Enable React project deployment (second parameter)
  const { deployLandingPage, isDeploying, deploymentError } = useReactDeployment(
    'your-netlify-token',
    true // Use React project mode
  );

  const handleDeploy = async () => {
    try {
      const result = await deployLandingPage(pageId);
      console.log('Deployment successful:', result.url);
    } catch (error) {
      console.error('Deployment failed:', error);
    }
  };

  return (
    <button onClick={handleDeploy} disabled={isDeploying}>
      {isDeploying ? 'Deploying...' : 'Deploy'}
    </button>
  );
}
```

## Generated Project Structure

When deploying in React project mode, the following structure is created:

```
project-root/
├── package.json              # React project dependencies
├── index.html                # Main HTML file with SEO and tracking
├── vite.config.js            # Build configuration
├── netlify.toml              # Netlify deployment settings
├── _headers                  # Security headers
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Main application component
│   ├── index.css            # Global styles
│   ├── components/
│   │   ├── index.js         # Component exports
│   │   ├── HeroVariation1.jsx
│   │   ├── FeaturesVariation1.jsx
│   │   └── ...other components
│   └── utils/
│       ├── cn.js            # Class name utility
│       ├── button-actions.js # Button click handlers
│       └── format.js        # Formatting utilities
```

## Component Cleaning Process

### Before Cleaning (Original Builder Component)

```tsx
import { SelectableElement } from '@/components/builder/SelectableElement';
import { useComponentMedia } from '@/hooks/useComponentMedia';

const HeroVariation1 = ({ 
  content, 
  styles, 
  isEditing, 
  selectedElementId,
  onStyleChange,
  onContentChange 
}) => {
  const handleElementSelect = (elementId) => {
    console.log('DEV: Element selected:', elementId);
    onElementSelect?.(elementId);
  };

  return (
    <SelectableElement
      elementId="hero-container"
      onSelect={handleElementSelect}
      isSelected={selectedElementId === 'hero-container'}
    >
      <div onClick={() => handleElementSelect('headline')}>
        {content.headline}
      </div>
    </SelectableElement>
  );
};
```

### After Cleaning (Production Component)

```tsx
import React from 'react';
import { cn } from '../utils/cn';

const HeroVariation1 = ({ 
  content, 
  styles, 
  visibility,
  mediaUrls,
  customActions,
  globalTheme 
}) => {
  const handleButtonClick = (actionKey) => {
    const action = customActions[actionKey];
    if (action?.type === 'checkout' && action.url) {
      window.open(action.url, '_blank');
    }
  };

  return (
    <section className="w-full">
      <div className="container mx-auto">
        <h1 style={{ color: globalTheme.primaryColor }}>
          {content.headline}
        </h1>
        <button onClick={() => handleButtonClick('ctaButton')}>
          {content.ctaButton}
        </button>
      </div>
    </section>
  );
};

export default HeroVariation1;
```

## Benefits

### 1. Preserves Component Structure
- Components remain as React components
- No conversion to static HTML
- Maintains interactivity and state

### 2. Better Layout Fidelity
- CSS classes and styles are preserved exactly
- No loss of responsive behavior
- Tailwind CSS works properly

### 3. Enhanced Performance
- React's optimizations are maintained
- Proper code splitting
- Vite build optimizations

### 4. Better SEO
- Server-side rendering capabilities
- Proper meta tags and structured data
- Open Graph and Twitter Cards

### 5. Development Experience
- Hot reload during development
- Better debugging with React DevTools
- Familiar React development workflow

## Tracking and Analytics

The generated React project includes:

### Facebook Pixel
```html
<script>
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

### Google Analytics
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  gtag('config', 'GA_ID');
</script>
```

### Microsoft Clarity
```html
<script>
  clarity('init', 'CLARITY_ID');
</script>
```

## Deployment Configuration

### Netlify Settings (netlify.toml)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Build Process
1. `npm install` - Install dependencies
2. `npm run build` - Build with Vite
3. Deploy `dist/` folder to Netlify

## Security Headers

The system includes comprehensive security headers:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Error Handling

The deployment service includes comprehensive error handling:

```typescript
try {
  const result = await deploymentService.deployLandingPage(pageId);
} catch (error) {
  if (error.message.includes('validation')) {
    // Handle validation errors
  } else if (error.message.includes('network')) {
    // Handle network errors
  } else {
    // Handle other errors
  }
}
```

## Migration Guide

### From Static HTML to React Project

1. **Update service initialization:**
   ```typescript
   // Before
   const service = new ReactDeploymentService(token);
   
   // After
   const service = new ReactDeploymentService(token, true);
   ```

2. **Update hook usage:**
   ```typescript
   // Before
   const { deployLandingPage } = useReactDeployment(token);
   
   // After
   const { deployLandingPage } = useReactDeployment(token, true);
   ```

3. **No other code changes required** - the API remains the same!

## Testing

### Validation
The system automatically validates:
- Project structure completeness
- Component code validity
- Package.json correctness
- Build configuration

### Example Validation
```typescript
const files = reactProjectGenerator.generateReactProject(pageData);
const isValid = reactProjectGenerator.validateProject(files);

if (!isValid) {
  throw new Error('Generated project failed validation');
}
```

## Performance Metrics

The system tracks:
- Total file count
- Component count
- Project size
- Build time
- Deployment time

```typescript
const projectInfo = reactProjectGenerator.getProjectInfo(files);
console.log({
  totalFiles: projectInfo.totalFiles,
  componentCount: projectInfo.componentCount,
  totalSize: projectInfo.totalSize
});
```

## Troubleshooting

### Common Issues

1. **Component Not Rendering**
   - Check component exports in `src/components/index.js`
   - Verify component props match expected interface

2. **Build Failures**
   - Check console for syntax errors
   - Verify all imports are correct

3. **Deployment Timeout**
   - Check project size (should be < 100MB)
   - Verify Netlify build logs

### Debug Mode

Enable debug logging:
```typescript
const service = new ReactDeploymentService(token, true);
service.logger.setLevel('debug');
```

This comprehensive system ensures that your landing pages deploy as proper React applications, maintaining all the benefits of the React ecosystem while providing a seamless deployment experience.
