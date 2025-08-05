import { LandingPageComponent } from '@/types/components';

export class StyleGenerator {
  generateGoogleFontsLink(pageData: any): string {
    const fontUrls = new Set<string>();
    
    // Add global theme fonts
    if (pageData.global_theme?.headingFont?.googleFontUrl) {
      fontUrls.add(pageData.global_theme.headingFont.googleFontUrl);
    }
    if (pageData.global_theme?.bodyFont?.googleFontUrl) {
      fontUrls.add(pageData.global_theme.bodyFont.googleFontUrl);
    }

    // Add component-specific fonts
    pageData.components?.forEach((component: LandingPageComponent) => {
      const customStyles = component.custom_styles || {};
      Object.values(customStyles).forEach((styles: any) => {
        if (styles?.headingFont?.googleFontUrl) {
          fontUrls.add(styles.headingFont.googleFontUrl);
        }
        if (styles?.bodyFont?.googleFontUrl) {
          fontUrls.add(styles.bodyFont.googleFontUrl);
        }
      });
    });

    // Generate link tags
    return Array.from(fontUrls)
      .map(url => `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${url}" rel="stylesheet">`)
      .join('\n  ');
  }

  generateTailwindCSS(): string {
    return `<script src="https://cdn.tailwindcss.com"></script>
<script>
  // Suppress production warning about CDN usage
  const originalWarn = console.warn;
  console.warn = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('cdn.tailwindcss.com')) {
      return;
    }
    return originalWarn.apply(console, args);
  };

  // Configure Tailwind with full functionality
  tailwind.config = {
    theme: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      extend: {
        spacing: {
          '72': '18rem',
          '84': '21rem',
          '96': '24rem',
        },
        colors: {
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          primary: {
            DEFAULT: 'hsl(var(--primary))',
            foreground: 'hsl(var(--primary-foreground))',
          },
          secondary: {
            DEFAULT: 'hsl(var(--secondary))',
            foreground: 'hsl(var(--secondary-foreground))',
          },
          muted: {
            DEFAULT: 'hsl(var(--muted))',
            foreground: 'hsl(var(--muted-foreground))',
          },
          accent: {
            DEFAULT: 'hsl(var(--accent))',
            foreground: 'hsl(var(--accent-foreground))',
          },
          destructive: {
            DEFAULT: 'hsl(var(--destructive))',
            foreground: 'hsl(var(--destructive-foreground))',
          },
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          ring: 'hsl(var(--ring))',
        }
      }
    },
    variants: {
      extend: {
        display: ['responsive'],
        flexDirection: ['responsive'],
        gridTemplateColumns: ['responsive'],
        gridTemplateRows: ['responsive'],
        gap: ['responsive'],
        padding: ['responsive'],
        margin: ['responsive'],
        fontSize: ['responsive'],
        lineHeight: ['responsive'],
        textAlign: ['responsive'],
        justifyContent: ['responsive'],
        alignItems: ['responsive'],
        width: ['responsive'],
        height: ['responsive'],
        maxWidth: ['responsive'],
        maxHeight: ['responsive'],
        backgroundColor: ['hover', 'focus'],
        textColor: ['hover', 'focus'],
        opacity: ['hover', 'focus'],
        transform: ['hover', 'focus'],
      }
    }
  }
</script>
${this.generateBaseStyles()}`;
  }

  private generateBaseStyles(): string {
    return `<style>
  /* Layout stability fixes */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    font-family: Inter, sans-serif;
    line-height: 1.6;
    color: #1a202c;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }
  
  /* Prevent white gaps between components */
  #landing-page {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
  
  [data-section-id] {
    width: 100% !important;
    margin: 0 !important;
    padding: 0;
    position: relative;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
  
  /* Eliminate gaps between sections */
  [data-section-id] + [data-section-id] {
    margin-top: 0 !important;
    border-top: none !important;
    padding-top: 0 !important;
  }
  
  /* Enhanced button interactions */
  button, [role="button"] {
    cursor: pointer;
    transition: all 0.2s ease;
    will-change: transform, opacity;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  
  button:hover, [role="button"]:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  /* Form styling */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    will-change: auto;
  }
  
  /* Grid and flex layout stability */
  .grid, .flex {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    width: 100%;
  }
  
  /* CSS Variables for theming */
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
  
  /* Container responsive */
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

  /* Toast notification styles */
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 400px;
    width: 100%;
    pointer-events: none;
  }
  
  .toast {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    pointer-events: auto;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  .toast.show {
    transform: translateX(0);
    opacity: 1;
  }
  
  .toast.success {
    border-left: 4px solid #10b981;
  }
  
  .toast.error {
    border-left: 4px solid #ef4444;
  }
  
  .toast.warning {
    border-left: 4px solid #f59e0b;
  }
  
  .toast.info {
    border-left: 4px solid #3b82f6;
  }

  /* Responsive grid utilities */
  @media (max-width: 768px) {
    .md\\:grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    }
    .md\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    .lg\\:grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    }
    .lg\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    .lg\\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }
  }
  
  @media (min-width: 1025px) {
    .xl\\:grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    }
    .xl\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    .xl\\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }
    .xl\\:grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    }
  }
</style>`;
  }
}
