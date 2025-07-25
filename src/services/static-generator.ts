import { LandingPage } from '@/types/landing-page';
import { LandingPageComponent } from '@/types/components';

export class StaticGeneratorService {

  async generateStaticSite(landingPage: LandingPage, components: LandingPageComponent[]): Promise<Record<string, string>> {
    const files: Record<string, string> = {};

    // Generate HTML
    files['index.html'] = this.generateHTML(landingPage, components);
    
    // Generate CSS
    files['styles.css'] = this.generateCSS(landingPage, components);
    
    // Generate JavaScript (if needed for interactivity)
    files['script.js'] = this.generateJS(landingPage, components);
    
    // Generate additional pages if needed
    if (landingPage.seo_config.canonical) {
      files['robots.txt'] = this.generateRobotsTxt(landingPage);
      files['sitemap.xml'] = this.generateSitemap(landingPage);
    }

    return files;
  }

  private generateHTML(landingPage: LandingPage, components: LandingPageComponent[]): string {
    
    return `<!DOCTYPE html>
<html lang="${landingPage.language || 'en'}" dir="${landingPage.global_theme.direction || 'ltr'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${landingPage.seo_config.title}</title>
    <meta name="description" content="${landingPage.seo_config.description}">
    <meta name="keywords" content="${landingPage.seo_config.keywords.join(', ')}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${landingPage.seo_config.title}">
    <meta property="og:description" content="${landingPage.seo_config.description}">
    <meta property="og:image" content="${landingPage.seo_config.ogImage}">
    <meta property="og:url" content="${landingPage.seo_config.canonical}">
    <meta property="og:type" content="website">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${landingPage.seo_config.title}">
    <meta name="twitter:description" content="${landingPage.seo_config.description}">
    <meta name="twitter:image" content="${landingPage.seo_config.ogImage}">
    
    <!-- Canonical URL -->
    ${landingPage.seo_config.canonical ? `<link rel="canonical" href="${landingPage.seo_config.canonical}">` : ''}
    

    
    <!-- Styles -->
    <link rel="stylesheet" href="styles.css">
    
    <!-- Analytics -->
    ${this.generateAnalyticsScript(landingPage.tracking_config)}
</head>
<body>
    <main>
        ${this.generateComponentsHTML(components)}
    </main>
    
    <!-- Scripts -->
    <script src="script.js"></script>
    ${this.generateTrackingScripts(landingPage.tracking_config)}
</body>
</html>`;
  }

  private generateCSS(landingPage: LandingPage, components: LandingPageComponent[]): string {
    return `
/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${landingPage.global_theme.fontFamily}, sans-serif;
    background-color: ${landingPage.global_theme.backgroundColor};
    color: ${landingPage.global_theme.primaryColor};
    direction: ${landingPage.global_theme.direction};
}

/* Component styles */
${this.generateComponentStyles(components)}

/* Responsive styles */
@media (max-width: 768px) {
    .container {
        padding: 0 1rem;
    }
}
`;
  }

  private generateJS(landingPage: LandingPage, components: LandingPageComponent[]): string {
    return `
// Landing page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tracking
    ${this.generateTrackingJS(landingPage.tracking_config)}
    
    // Initialize interactive components
    ${this.generateInteractiveJS(components)}
    
    // Initialize smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
`;
  }

  private generateComponentsHTML(components: LandingPageComponent[]): string {
    return components
      .sort((a, b) => a.order_index - b.order_index)
      .map(component => this.generateComponentHTML(component))
      .join('\n');
  }

  private generateComponentHTML(component: LandingPageComponent): string {
    // This would render each component based on its type and variation
    // For now, return a placeholder
    return `<section class="component component-${component.component_variation?.component_type}" id="component-${component.id}">
        <!-- Component content would be rendered here -->
        <div class="container">
            <h2>${component.content.headline || ''}</h2>
            <p>${component.content.subheadline || ''}</p>
        </div>
    </section>`;
  }

  private generateComponentStyles(components: LandingPageComponent[]): string {
    return components.map(component => {
      const styles = Object.entries(component.styles).map(([selector, style]) => {
        return `#component-${component.id} .${selector} {
            ${Object.entries(style).map(([prop, value]) => `${prop}: ${value};`).join('\n    ')}
        }`;
      }).join('\n');
      
      return styles;
    }).join('\n');
  }

  private generateAnalyticsScript(trackingConfig: any): string {
    let scripts = '';
    
    if (trackingConfig.google_analytics_id) {
      scripts += `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${trackingConfig.google_analytics_id}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${trackingConfig.google_analytics_id}');
    </script>`;
    }
    
    if (trackingConfig.facebook_pixel_id) {
      scripts += `
    <!-- Facebook Pixel -->
    <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${trackingConfig.facebook_pixel_id}');
        fbq('track', 'PageView');
    </script>
    <noscript>
        <img height="1" width="1" style="display:none"
             src="https://www.facebook.com/tr?id=${trackingConfig.facebook_pixel_id}&ev=PageView&noscript=1"/>
    </noscript>`;
    }
    
    return scripts;
  }

  private generateTrackingScripts(trackingConfig: any): string {
    return ''; // Additional tracking scripts if needed
  }

  private generateTrackingJS(trackingConfig: any): string {
    return `
    // Track conversion events
    function trackEvent(eventName, data) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, data);
        }
    }
    `;
  }

  private generateInteractiveJS(components: LandingPageComponent[]): string {
    // Generate JavaScript for interactive components
    return '';
  }

  private generateRobotsTxt(landingPage: LandingPage): string {
    return `User-agent: *
Allow: /

Sitemap: ${landingPage.seo_config.canonical}/sitemap.xml`;
  }

  private generateSitemap(landingPage: LandingPage): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${landingPage.seo_config.canonical}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`;
  }
}