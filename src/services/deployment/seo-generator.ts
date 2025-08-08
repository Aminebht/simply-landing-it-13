export class SeoGenerator {
  generateSEOMetaTags(pageData: any, deploymentUrl?: string): string {
    const seoConfig = pageData.seo_config || {};
    const currentUrl = deploymentUrl || seoConfig.canonical || `https://${pageData.slug || 'landing-page'}.netlify.app`;
    
    let metaTags = '';
    
    // Basic SEO meta tags
    if (seoConfig.description) {
      metaTags += `  <meta name="description" content="${this.escapeHtml(seoConfig.description)}">\n`;
    }
    
    if (seoConfig.keywords && Array.isArray(seoConfig.keywords) && seoConfig.keywords.length > 0) {
      metaTags += `  <meta name="keywords" content="${seoConfig.keywords.join(', ')}">\n`;
    }
    
    if (seoConfig.canonical) {
      metaTags += `  <link rel="canonical" href="${seoConfig.canonical}">\n`;
    } else if (deploymentUrl) {
      metaTags += `  <link rel="canonical" href="${deploymentUrl}">\n`;
    }
    
    // Open Graph meta tags
    metaTags += this.generateOpenGraphTags(seoConfig, pageData, currentUrl);
    
    // Twitter Card meta tags
    metaTags += this.generateTwitterCardTags(seoConfig, pageData);
    
    // Additional SEO meta tags
    metaTags += this.generateAdditionalSeoTags();
    
    // Favicon and app icons
    if (seoConfig.ogImage) {
      metaTags += `  <link rel="icon" type="image/x-icon" href="${seoConfig.ogImage}">\n`;
      metaTags += `  <link rel="apple-touch-icon" href="${seoConfig.ogImage}">\n`;
    }
    
    // Structured data
    metaTags += this.generateStructuredData(seoConfig, pageData, currentUrl);
    
    return metaTags;
  }

  private generateOpenGraphTags(seoConfig: any, pageData: any, currentUrl: string): string {
    let tags = '';
    
    tags += `  <meta property="og:title" content="${this.escapeHtml(seoConfig.title || pageData.slug)}">\n`;
    
    if (seoConfig.description) {
      tags += `  <meta property="og:description" content="${this.escapeHtml(seoConfig.description)}">\n`;
    }
    
    tags += `  <meta property="og:type" content="website">\n`;
    tags += `  <meta property="og:url" content="${currentUrl}">\n`;
    
    if (seoConfig.ogImage) {
      tags += `  <meta property="og:image" content="${seoConfig.ogImage}">\n`;
      tags += `  <meta property="og:image:alt" content="${this.escapeHtml(seoConfig.title || pageData.slug)}">\n`;
      tags += `  <meta property="og:image:width" content="1200">\n`;
      tags += `  <meta property="og:image:height" content="630">\n`;
    }
    
    return tags;
  }

  private generateTwitterCardTags(seoConfig: any, pageData: any): string {
    let tags = '';
    
    tags += `  <meta name="twitter:card" content="summary_large_image">\n`;
    tags += `  <meta name="twitter:title" content="${this.escapeHtml(seoConfig.title || pageData.slug)}">\n`;
    
    if (seoConfig.description) {
      tags += `  <meta name="twitter:description" content="${this.escapeHtml(seoConfig.description)}">\n`;
    }
    
    if (seoConfig.ogImage) {
      tags += `  <meta name="twitter:image" content="${seoConfig.ogImage}">\n`;
    }
    
    return tags;
  }

  private generateAdditionalSeoTags(): string {
    return `  <meta name="robots" content="index, follow">\n` +
           `  <meta name="author" content="Landing Page Builder">\n` +
           `  <meta name="generator" content="Landing Page Builder">\n`;
  }

  private generateStructuredData(seoConfig: any, pageData: any, currentUrl: string): string {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": seoConfig.title || pageData.slug,
      "description": seoConfig.description || "",
      "url": currentUrl,
      "image": seoConfig.ogImage || "",
      "inLanguage": pageData.global_theme?.language || "en",
      "datePublished": pageData.created_at || new Date().toISOString(),
      "dateModified": pageData.updated_at || new Date().toISOString()
    };
    
    return `  <script type="application/ld+json">\n` +
           `    ${JSON.stringify(structuredData, null, 2)}\n` +
           `  </script>\n`;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}
