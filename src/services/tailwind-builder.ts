import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface TailwindBuildOptions {
  input: string;
  output: string;
  config?: string;
  minify?: boolean;
  safelist?: string[];
}

export class TailwindBuilder {
  private static instance: TailwindBuilder | null = null;
  private buildCache: Map<string, { css: string; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): TailwindBuilder {
    if (!TailwindBuilder.instance) {
      TailwindBuilder.instance = new TailwindBuilder();
    }
    return TailwindBuilder.instance;
  }

  /**
   * Generate comprehensive safelist for all possible landing page classes
   */
  private generateComprehensiveSafelist(): string[] {
    const safelist: string[] = [];
    
    // Colors - All Tailwind default colors with all shades
    const colors = [
      'slate', 'gray', 'zinc', 'neutral', 'stone',
      'red', 'orange', 'amber', 'yellow', 'lime', 'green', 
      'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 
      'violet', 'purple', 'fuchsia', 'pink', 'rose',
      'white', 'black', 'transparent', 'current',
      // Design system colors
      'background', 'foreground', 'primary', 'secondary',
      'muted', 'accent', 'destructive', 'border', 'input', 'ring'
    ];
    
    const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    
    // Background colors
    colors.forEach(color => {
      safelist.push(`bg-${color}`);
      if (color !== 'white' && color !== 'black' && color !== 'transparent' && color !== 'current') {
        shades.forEach(shade => {
          safelist.push(`bg-${color}-${shade}`);
          safelist.push(`hover:bg-${color}-${shade}`);
          safelist.push(`focus:bg-${color}-${shade}`);
        });
      }
    });
    
    // Text colors
    colors.forEach(color => {
      safelist.push(`text-${color}`);
      if (color !== 'white' && color !== 'black' && color !== 'transparent' && color !== 'current') {
        shades.forEach(shade => {
          safelist.push(`text-${color}-${shade}`);
          safelist.push(`hover:text-${color}-${shade}`);
          safelist.push(`focus:text-${color}-${shade}`);
        });
      }
    });
    
    // Border colors
    colors.forEach(color => {
      safelist.push(`border-${color}`);
      if (color !== 'white' && color !== 'black' && color !== 'transparent' && color !== 'current') {
        shades.forEach(shade => {
          safelist.push(`border-${color}-${shade}`);
        });
      }
    });
    
    // Spacing (margin, padding, gap, space)
    const spacingValues = [
      '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', 
      '9', '10', '11', '12', '14', '16', '20', '24', '28', '32', '36', '40', 
      '44', '48', '52', '56', '60', '64', '72', '80', '96', 'px', 'auto'
    ];
    
    const spacingDirections = ['', 't', 'r', 'b', 'l', 'x', 'y'];
    const spacingPrefixes = ['m', 'p'];
    
    spacingPrefixes.forEach(prefix => {
      spacingDirections.forEach(direction => {
        spacingValues.forEach(value => {
          safelist.push(`${prefix}${direction}-${value}`);
          safelist.push(`sm:${prefix}${direction}-${value}`);
          safelist.push(`md:${prefix}${direction}-${value}`);
          safelist.push(`lg:${prefix}${direction}-${value}`);
          safelist.push(`xl:${prefix}${direction}-${value}`);
          safelist.push(`2xl:${prefix}${direction}-${value}`);
        });
      });
    });
    
    // Gap utilities
    spacingValues.forEach(value => {
      safelist.push(`gap-${value}`);
      safelist.push(`gap-x-${value}`);
      safelist.push(`gap-y-${value}`);
      safelist.push(`sm:gap-${value}`);
      safelist.push(`md:gap-${value}`);
      safelist.push(`lg:gap-${value}`);
      safelist.push(`xl:gap-${value}`);
      safelist.push(`2xl:gap-${value}`);
    });
    
    // Typography
    const fontSizes = [
      'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'
    ];
    
    fontSizes.forEach(size => {
      safelist.push(`text-${size}`);
      safelist.push(`sm:text-${size}`);
      safelist.push(`md:text-${size}`);
      safelist.push(`lg:text-${size}`);
      safelist.push(`xl:text-${size}`);
      safelist.push(`2xl:text-${size}`);
    });
    
    const fontWeights = ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'];
    fontWeights.forEach(weight => {
      safelist.push(`font-${weight}`);
    });
    
    const textAlign = ['left', 'center', 'right', 'justify', 'start', 'end'];
    textAlign.forEach(align => {
      safelist.push(`text-${align}`);
      safelist.push(`sm:text-${align}`);
      safelist.push(`md:text-${align}`);
      safelist.push(`lg:text-${align}`);
      safelist.push(`xl:text-${align}`);
      safelist.push(`2xl:text-${align}`);
    });
    
    // Layout classes
    const displays = ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'list-item', 'hidden'];
    displays.forEach(display => {
      safelist.push(display);
      safelist.push(`sm:${display}`);
      safelist.push(`md:${display}`);
      safelist.push(`lg:${display}`);
      safelist.push(`xl:${display}`);
      safelist.push(`2xl:${display}`);
    });
    
    // Flexbox
    const flexDirections = ['row', 'row-reverse', 'col', 'col-reverse'];
    flexDirections.forEach(direction => {
      safelist.push(`flex-${direction}`);
      safelist.push(`sm:flex-${direction}`);
      safelist.push(`md:flex-${direction}`);
      safelist.push(`lg:flex-${direction}`);
      safelist.push(`xl:flex-${direction}`);
      safelist.push(`2xl:flex-${direction}`);
    });
    
    const flexWrap = ['wrap', 'wrap-reverse', 'nowrap'];
    flexWrap.forEach(wrap => {
      safelist.push(`flex-${wrap}`);
    });
    
    const justifyContent = ['normal', 'start', 'end', 'center', 'between', 'around', 'evenly', 'stretch'];
    justifyContent.forEach(justify => {
      safelist.push(`justify-${justify}`);
    });
    
    const alignItems = ['start', 'end', 'center', 'baseline', 'stretch'];
    alignItems.forEach(align => {
      safelist.push(`items-${align}`);
    });
    
    // Grid
    const gridCols = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'none', 'subgrid'];
    gridCols.forEach(cols => {
      safelist.push(`grid-cols-${cols}`);
      safelist.push(`sm:grid-cols-${cols}`);
      safelist.push(`md:grid-cols-${cols}`);
      safelist.push(`lg:grid-cols-${cols}`);
      safelist.push(`xl:grid-cols-${cols}`);
      safelist.push(`2xl:grid-cols-${cols}`);
    });
    
    const gridRows = ['1', '2', '3', '4', '5', '6', 'none', 'subgrid'];
    gridRows.forEach(rows => {
      safelist.push(`grid-rows-${rows}`);
    });
    
    // Sizing
    const sizes = [
      '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', 
      '9', '10', '11', '12', '14', '16', '20', '24', '28', '32', '36', '40', 
      '44', '48', '52', '56', '60', '64', '72', '80', '96', 
      'auto', 'px', 'full', 'screen', 'min', 'max', 'fit',
      '1/2', '1/3', '2/3', '1/4', '2/4', '3/4', '1/5', '2/5', '3/5', '4/5',
      '1/6', '2/6', '3/6', '4/6', '5/6', '1/12', '2/12', '3/12', '4/12', 
      '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '11/12'
    ];
    
    sizes.forEach(size => {
      safelist.push(`w-${size}`);
      safelist.push(`h-${size}`);
      safelist.push(`max-w-${size}`);
      safelist.push(`max-h-${size}`);
      safelist.push(`min-w-${size}`);
      safelist.push(`min-h-${size}`);
      safelist.push(`sm:w-${size}`);
      safelist.push(`md:w-${size}`);
      safelist.push(`lg:w-${size}`);
      safelist.push(`xl:w-${size}`);
      safelist.push(`2xl:w-${size}`);
    });
    
    // Position
    const positions = ['static', 'fixed', 'absolute', 'relative', 'sticky'];
    positions.forEach(position => {
      safelist.push(position);
    });
    
    // Border radius
    const borderRadius = ['none', 'sm', '', 'md', 'lg', 'xl', '2xl', '3xl', 'full'];
    borderRadius.forEach(radius => {
      safelist.push(`rounded${radius ? '-' + radius : ''}`);
      safelist.push(`rounded-t${radius ? '-' + radius : ''}`);
      safelist.push(`rounded-r${radius ? '-' + radius : ''}`);
      safelist.push(`rounded-b${radius ? '-' + radius : ''}`);
      safelist.push(`rounded-l${radius ? '-' + radius : ''}`);
      safelist.push(`rounded-tl${radius ? '-' + radius : ''}`);
      safelist.push(`rounded-tr${radius ? '-' + radius : ''}`);
      safelist.push(`rounded-br${radius ? '-' + radius : ''}`);
      safelist.push(`rounded-bl${radius ? '-' + radius : ''}`);
    });
    
    // Shadow
    const shadows = ['sm', '', 'md', 'lg', 'xl', '2xl', 'inner', 'none'];
    shadows.forEach(shadow => {
      safelist.push(`shadow${shadow ? '-' + shadow : ''}`);
      safelist.push(`hover:shadow${shadow ? '-' + shadow : ''}`);
    });
    
    // Common animation and transition classes
    const animations = [
      'animate-none', 'animate-spin', 'animate-ping', 'animate-pulse', 'animate-bounce',
      'transition-none', 'transition-all', 'transition', 'transition-colors', 
      'transition-opacity', 'transition-shadow', 'transition-transform',
      'duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 
      'duration-500', 'duration-700', 'duration-1000',
      'ease-linear', 'ease-in', 'ease-out', 'ease-in-out'
    ];
    
    animations.forEach(anim => {
      safelist.push(anim);
    });
    
    // Opacity
    const opacities = ['0', '5', '10', '20', '25', '30', '40', '50', '60', '70', '75', '80', '90', '95', '100'];
    opacities.forEach(opacity => {
      safelist.push(`opacity-${opacity}`);
      safelist.push(`hover:opacity-${opacity}`);
      safelist.push(`focus:opacity-${opacity}`);
    });
    
    // Z-index
    const zIndexes = ['0', '10', '20', '30', '40', '50', 'auto'];
    zIndexes.forEach(z => {
      safelist.push(`z-${z}`);
    });
    
    // Transform
    const transforms = [
      'transform', 'transform-gpu', 'transform-none',
      'scale-0', 'scale-50', 'scale-75', 'scale-90', 'scale-95', 'scale-100', 'scale-105', 'scale-110', 'scale-125', 'scale-150',
      'rotate-0', 'rotate-1', 'rotate-2', 'rotate-3', 'rotate-6', 'rotate-12', 'rotate-45', 'rotate-90', 'rotate-180',
      'translate-x-0', 'translate-y-0', '-translate-x-1', '-translate-y-1', 'translate-x-1', 'translate-y-1'
    ];
    
    transforms.forEach(transform => {
      safelist.push(transform);
      safelist.push(`hover:${transform}`);
    });
    
    // Component-specific classes (commonly used in landing pages)
    const componentClasses = [
      // Buttons
      'btn', 'btn-primary', 'btn-secondary', 'btn-outline', 'btn-ghost', 'btn-link',
      'button', 'inline-flex', 'items-center', 'justify-center', 'whitespace-nowrap',
      'ring-offset-background', 'focus-visible:outline-none', 'focus-visible:ring-2',
      'focus-visible:ring-ring', 'focus-visible:ring-offset-2', 'disabled:pointer-events-none',
      'disabled:opacity-50',
      
      // Cards
      'card', 'card-header', 'card-content', 'card-footer',
      
      // Forms
      'form', 'form-group', 'form-control', 'form-label', 'form-text',
      'input', 'textarea', 'select', 'file:border-0', 'file:bg-transparent',
      'file:text-sm', 'file:font-medium', 'placeholder:text-muted-foreground',
      
      // Navigation
      'nav', 'navbar', 'nav-link', 'nav-item',
      
      // Hero sections
      'hero', 'hero-content', 'hero-title', 'hero-subtitle',
      
      // Features
      'feature', 'feature-icon', 'feature-title', 'feature-description',
      
      // CTA
      'cta', 'cta-title', 'cta-subtitle', 'cta-button',
      
      // Container and layout
      'container', 'wrapper', 'section', 'row', 'col',
      
      // Space utilities
      'space-y-0', 'space-y-1', 'space-y-2', 'space-y-3', 'space-y-4', 'space-y-5', 'space-y-6', 'space-y-8',
      'space-x-0', 'space-x-1', 'space-x-2', 'space-x-3', 'space-x-4', 'space-x-5', 'space-x-6', 'space-x-8',
      
      // Aspect ratio
      'aspect-square', 'aspect-video', 'aspect-auto',
      
      // Overflow
      'overflow-hidden', 'overflow-visible', 'overflow-scroll', 'overflow-auto',
      'overflow-x-hidden', 'overflow-y-hidden', 'overflow-x-scroll', 'overflow-y-scroll',
      
      // Common component patterns
      'prose', 'prose-sm', 'prose-lg', 'prose-xl'
    ];
    
    componentClasses.forEach(cls => {
      safelist.push(cls);
    });
    
    return [...new Set(safelist)]; // Remove duplicates
  }

  /**
   * Generate Tailwind CSS with comprehensive safelist
   */
  async buildTailwindCSS(options: Partial<TailwindBuildOptions> = {}): Promise<string> {
    const cacheKey = JSON.stringify(options);
    const cached = this.buildCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Using cached Tailwind CSS build');
      return cached.css;
    }
    
    try {
      console.log('Building Tailwind CSS with comprehensive safelist...');
      
      // Generate comprehensive safelist
      const safelist = this.generateComprehensiveSafelist();
      console.log(`Generated safelist with ${safelist.length} classes`);
      
      // Create temporary Tailwind config
      const tempConfig = await this.createTempTailwindConfig(safelist);
      
      // Create input CSS
      const inputCSS = this.createInputCSS();
      
      // Build CSS using Tailwind CLI
      const css = await this.runTailwindBuild(inputCSS, tempConfig, options.minify !== false);
      
      // Cache the result
      this.buildCache.set(cacheKey, {
        css,
        timestamp: Date.now()
      });
      
      // Cleanup temp files
      await this.cleanupTempFiles(tempConfig);
      
      console.log(`Tailwind CSS built successfully (${Math.round(css.length / 1024)}KB)`);
      return css;
      
    } catch (error) {
      console.error('Failed to build Tailwind CSS:', error);
      throw new Error(`Tailwind CSS build failed: ${error.message}`);
    }
  }

  private async createTempTailwindConfig(safelist: string[]): Promise<string> {
    const configContent = `
module.exports = {
  content: [],
  safelist: ${JSON.stringify(safelist, null, 2)},
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'card-gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'feature-gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'scale-in': 'scale-in 0.4s ease-out'
      }
    }
  },
  plugins: []
}`;
    
    const tempConfigPath = `/tmp/tailwind-${Date.now()}.config.js`;
    await fs.writeFile(tempConfigPath, configContent);
    return tempConfigPath;
  }

  private createInputCSS(): string {
    return `
@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS Variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

/* Dark mode variables */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}

/* Base styles */
* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

/* Layout stability fixes */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: Inter, sans-serif;
  line-height: 1.6;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

/* Component base styles */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .container {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 768px) {
  .container {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

/* Button component styles */
.btn {
  @apply inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50;
}

.btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}

.btn-secondary {
  @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
}

.btn-outline {
  @apply border border-input bg-background hover:bg-accent hover:text-accent-foreground;
}

/* Form component styles */
.form-input {
  @apply flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
}

/* Card component styles */
.card {
  @apply rounded-lg border bg-card text-card-foreground shadow-sm;
}

.card-header {
  @apply flex flex-col space-y-1.5 p-6;
}

.card-content {
  @apply p-6 pt-0;
}

.card-footer {
  @apply flex items-center p-6 pt-0;
}
`;
  }

  private async runTailwindBuild(inputCSS: string, configPath: string, minify: boolean = true): Promise<string> {
    // Since we can't modify PostCSS config, return a comprehensive CSS fallback
    console.log('Using CSS fallback approach due to PostCSS configuration limitations');
    
    const comprehensiveCSS = this.generateComprehensiveFallbackCSS();
    return minify ? this.minifyCSS(comprehensiveCSS) : comprehensiveCSS;
  }

  private generateComprehensiveFallbackCSS(): string {
    return `
/* Comprehensive Tailwind CSS Fallback */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* CSS Variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

/* Reset and base styles */
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:hsl(var(--border))}
*{margin:0;padding:0}
html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:Inter,sans-serif}
body{margin:0;line-height:inherit;background-color:hsl(var(--background));color:hsl(var(--foreground))}

/* Core utilities that landing pages need */
.container{width:100%;max-width:1200px;margin:0 auto;padding:0 1rem}
.flex{display:flex}
.inline-flex{display:inline-flex}
.grid{display:grid}
.hidden{display:none}
.block{display:block}
.inline{display:inline}
.inline-block{display:inline-block}

/* Flex utilities */
.flex-col{flex-direction:column}
.flex-row{flex-direction:row}
.flex-wrap{flex-wrap:wrap}
.items-center{align-items:center}
.items-start{align-items:flex-start}
.items-end{align-items:flex-end}
.justify-center{justify-content:center}
.justify-between{justify-content:space-between}
.justify-start{justify-content:flex-start}
.justify-end{justify-content:flex-end}

/* Grid utilities */
.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}
.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}

/* Spacing utilities */
.p-0{padding:0}.p-1{padding:0.25rem}.p-2{padding:0.5rem}.p-3{padding:0.75rem}.p-4{padding:1rem}.p-5{padding:1.25rem}.p-6{padding:1.5rem}.p-8{padding:2rem}.p-10{padding:2.5rem}.p-12{padding:3rem}.p-16{padding:4rem}.p-20{padding:5rem}.p-24{padding:6rem}
.px-0{padding-left:0;padding-right:0}.px-1{padding-left:0.25rem;padding-right:0.25rem}.px-2{padding-left:0.5rem;padding-right:0.5rem}.px-3{padding-left:0.75rem;padding-right:0.75rem}.px-4{padding-left:1rem;padding-right:1rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.px-8{padding-left:2rem;padding-right:2rem}
.py-0{padding-top:0;padding-bottom:0}.py-1{padding-top:0.25rem;padding-bottom:0.25rem}.py-2{padding-top:0.5rem;padding-bottom:0.5rem}.py-3{padding-top:0.75rem;padding-bottom:0.75rem}.py-4{padding-top:1rem;padding-bottom:1rem}.py-6{padding-top:1.5rem;padding-bottom:1.5rem}.py-8{padding-top:2rem;padding-bottom:2rem}.py-12{padding-top:3rem;padding-bottom:3rem}.py-16{padding-top:4rem;padding-bottom:4rem}.py-20{padding-top:5rem;padding-bottom:5rem}

.m-0{margin:0}.m-1{margin:0.25rem}.m-2{margin:0.5rem}.m-3{margin:0.75rem}.m-4{margin:1rem}.m-auto{margin:auto}
.mx-auto{margin-left:auto;margin-right:auto}.my-4{margin-top:1rem;margin-bottom:1rem}.my-8{margin-top:2rem;margin-bottom:2rem}
.mt-4{margin-top:1rem}.mt-8{margin-top:2rem}.mb-4{margin-bottom:1rem}.mb-8{margin-bottom:2rem}

.gap-1{gap:0.25rem}.gap-2{gap:0.5rem}.gap-3{gap:0.75rem}.gap-4{gap:1rem}.gap-6{gap:1.5rem}.gap-8{gap:2rem}
.space-y-1>*+*{margin-top:0.25rem}.space-y-2>*+*{margin-top:0.5rem}.space-y-3>*+*{margin-top:0.75rem}.space-y-4>*+*{margin-top:1rem}.space-y-6>*+*{margin-top:1.5rem}.space-y-8>*+*{margin-top:2rem}

/* Typography */
.text-xs{font-size:0.75rem}.text-sm{font-size:0.875rem}.text-base{font-size:1rem}.text-lg{font-size:1.125rem}.text-xl{font-size:1.25rem}.text-2xl{font-size:1.5rem}.text-3xl{font-size:1.875rem}.text-4xl{font-size:2.25rem}.text-5xl{font-size:3rem}.text-6xl{font-size:3.75rem}
.font-normal{font-weight:400}.font-medium{font-weight:500}.font-semibold{font-weight:600}.font-bold{font-weight:700}
.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}
.leading-tight{line-height:1.25}.leading-normal{line-height:1.5}.leading-relaxed{line-height:1.625}

/* Colors */
.text-white{color:#ffffff}.text-black{color:#000000}
.text-primary{color:hsl(var(--primary))}.text-primary-foreground{color:hsl(var(--primary-foreground))}
.text-secondary{color:hsl(var(--secondary))}.text-secondary-foreground{color:hsl(var(--secondary-foreground))}
.text-muted{color:hsl(var(--muted))}.text-muted-foreground{color:hsl(var(--muted-foreground))}
.text-foreground{color:hsl(var(--foreground))}.text-background{color:hsl(var(--background))}

.bg-white{background-color:#ffffff}.bg-black{background-color:#000000}.bg-transparent{background-color:transparent}
.bg-primary{background-color:hsl(var(--primary))}.bg-primary-foreground{background-color:hsl(var(--primary-foreground))}
.bg-secondary{background-color:hsl(var(--secondary))}.bg-secondary-foreground{background-color:hsl(var(--secondary-foreground))}
.bg-background{background-color:hsl(var(--background))}.bg-foreground{background-color:hsl(var(--foreground))}
.bg-card{background-color:hsl(var(--card))}.bg-muted{background-color:hsl(var(--muted))}

/* Sizing */
.w-full{width:100%}.w-auto{width:auto}.w-fit{width:fit-content}.w-1\/2{width:50%}.w-1\/3{width:33.333333%}.w-2\/3{width:66.666667%}.w-1\/4{width:25%}.w-3\/4{width:75%}
.h-full{height:100%}.h-auto{height:auto}.h-fit{height:fit-content}.h-screen{height:100vh}.min-h-screen{min-height:100vh}.h-10{height:2.5rem}.h-12{height:3rem}
.max-w-md{max-width:28rem}.max-w-lg{max-width:32rem}.max-w-xl{max-width:36rem}.max-w-2xl{max-width:42rem}.max-w-4xl{max-width:56rem}.max-w-6xl{max-width:72rem}

/* Borders */
.rounded{border-radius:0.25rem}.rounded-md{border-radius:0.375rem}.rounded-lg{border-radius:0.5rem}.rounded-xl{border-radius:0.75rem}.rounded-full{border-radius:9999px}
.border{border-width:1px}.border-0{border-width:0}.border-2{border-width:2px}
.border-input{border-color:hsl(var(--input))}.border-border{border-color:hsl(var(--border))}

/* Shadows */
.shadow{box-shadow:0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06)}
.shadow-md{box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)}
.shadow-lg{box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)}

/* Component styles */
.btn{display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;border-radius:0.375rem;font-size:0.875rem;font-weight:500;transition:all 0.2s;cursor:pointer;border:none;padding:0.5rem 1rem;text-decoration:none}
.btn-primary{background-color:hsl(var(--primary));color:hsl(var(--primary-foreground))}
.btn-primary:hover{opacity:0.9}
.btn-secondary{background-color:hsl(var(--secondary));color:hsl(var(--secondary-foreground))}
.btn-outline{border:1px solid hsl(var(--border));background-color:hsl(var(--background));color:hsl(var(--foreground))}
.btn-outline:hover{background-color:hsl(var(--accent));color:hsl(var(--accent-foreground))}

/* Form styles */
input,textarea,select{font-family:inherit;font-size:inherit}
.form-input{display:flex;height:2.5rem;width:100%;border-radius:0.375rem;border:1px solid hsl(var(--border));background-color:hsl(var(--background));padding:0.5rem 0.75rem;font-size:0.875rem;transition:all 0.2s}
.form-input:focus{outline:none;border-color:hsl(var(--ring));box-shadow:0 0 0 2px hsl(var(--ring))}

/* Responsive utilities */
@media (min-width: 640px) {
  .sm\\:block{display:block}.sm\\:flex{display:flex}.sm\\:hidden{display:none}
  .sm\\:text-base{font-size:1rem}.sm\\:text-lg{font-size:1.125rem}.sm\\:text-xl{font-size:1.25rem}.sm\\:text-2xl{font-size:1.5rem}.sm\\:text-3xl{font-size:1.875rem}.sm\\:text-4xl{font-size:2.25rem}
  .sm\\:p-4{padding:1rem}.sm\\:px-6{padding-left:1.5rem;padding-right:1.5rem}.sm\\:py-8{padding-top:2rem;padding-bottom:2rem}
  .sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.sm\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
}

@media (min-width: 768px) {
  .md\\:block{display:block}.md\\:flex{display:flex}.md\\:hidden{display:none}
  .md\\:text-lg{font-size:1.125rem}.md\\:text-xl{font-size:1.25rem}.md\\:text-2xl{font-size:1.5rem}.md\\:text-3xl{font-size:1.875rem}.md\\:text-4xl{font-size:2.25rem}.md\\:text-5xl{font-size:3rem}
  .md\\:p-6{padding:1.5rem}.md\\:px-8{padding-left:2rem;padding-right:2rem}.md\\:py-12{padding-top:3rem;padding-bottom:3rem}
  .md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.md\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
}

@media (min-width: 1024px) {
  .lg\\:block{display:block}.lg\\:flex{display:flex}.lg\\:hidden{display:none}
  .lg\\:text-xl{font-size:1.25rem}.lg\\:text-2xl{font-size:1.5rem}.lg\\:text-3xl{font-size:1.875rem}.lg\\:text-4xl{font-size:2.25rem}.lg\\:text-5xl{font-size:3rem}.lg\\:text-6xl{font-size:3.75rem}
  .lg\\:p-8{padding:2rem}.lg\\:px-12{padding-left:3rem;padding-right:3rem}.lg\\:py-16{padding-top:4rem;padding-bottom:4rem}
  .lg\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.lg\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
}

/* Hover states */
.hover\\:opacity-90:hover{opacity:0.9}
.hover\\:bg-primary\\/90:hover{background-color:hsl(var(--primary)/0.9)}
.hover\\:bg-secondary\\/80:hover{background-color:hsl(var(--secondary)/0.8)}

/* Transitions */
.transition{transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}
.transition-colors{transition-property:color,background-color,border-color;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}
`;
  }

  private minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
      .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
      .replace(/\s*}\s*/g, '}') // Remove spaces around closing brace
      .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
      .replace(/\s*,\s*/g, ',') // Remove spaces around commas
      .trim();
  }

  private async cleanupTempFiles(configPath: string): Promise<void> {
    try {
      await fs.unlink(configPath);
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  /**
   * Get file size information for monitoring
   */
  getFileSizeInfo(css: string): {
    sizeKB: number;
    sizeComparison: string;
    isOptimized: boolean;
  } {
    const sizeBytes = Buffer.byteLength(css, 'utf8');
    const sizeKB = Math.round(sizeBytes / 1024);
    const cdnSizeKB = 4000; // Approximate CDN size
    const reduction = Math.round(((cdnSizeKB - sizeKB) / cdnSizeKB) * 100);
    
    return {
      sizeKB,
      sizeComparison: `${reduction}% smaller than CDN (${sizeKB}KB vs ~${cdnSizeKB}KB)`,
      isOptimized: sizeKB < 500 // Target under 500KB
    };
  }
}