export interface FacebookEvent {
  event_name: string;
  event_time: number;
  event_id?: string;
  user_data: {
    email?: string;
    phone?: string;
    external_id?: string;
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID
    fbp?: string; // Facebook browser ID
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_ids?: string[];
    content_type?: string;
    content_name?: string;
    num_items?: number;
  };
  event_source_url?: string;
  action_source: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
}

export class FacebookConversionAPIService {
  private pixelId: string;
  private accessToken: string;
  private apiVersion = 'v18.0';
  private baseUrl = 'https://graph.facebook.com';

  constructor(pixelId: string, accessToken: string) {
    this.pixelId = pixelId;
    this.accessToken = accessToken;
  }

  async sendEvent(event: FacebookEvent): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${this.pixelId}/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: [event],
            access_token: this.accessToken,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Facebook API error');
      }

      return { success: true };
    } catch (error) {
      console.error('Facebook Conversion API error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async sendPageView(userData: FacebookEvent['user_data'], pageUrl: string): Promise<void> {
    await this.sendEvent({
      event_name: 'PageView',
      event_time: Math.floor(Date.now() / 1000),
      event_id: this.generateEventId(),
      user_data: userData,
      event_source_url: pageUrl,
      action_source: 'website',
    });
  }

  async sendPurchase(
    userData: FacebookEvent['user_data'],
    purchaseData: {
      value: number;
      currency: string;
      content_ids: string[];
      content_type?: string;
    },
    pageUrl: string
  ): Promise<void> {
    await this.sendEvent({
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: this.generateEventId(),
      user_data: userData,
      custom_data: {
        currency: purchaseData.currency,
        value: purchaseData.value,
        content_ids: purchaseData.content_ids,
        content_type: purchaseData.content_type || 'product',
        num_items: purchaseData.content_ids.length,
      },
      event_source_url: pageUrl,
      action_source: 'website',
    });
  }

  async sendAddToCart(
    userData: FacebookEvent['user_data'],
    productData: {
      value: number;
      currency: string;
      content_ids: string[];
      content_name?: string;
    },
    pageUrl: string
  ): Promise<void> {
    await this.sendEvent({
      event_name: 'AddToCart',
      event_time: Math.floor(Date.now() / 1000),
      event_id: this.generateEventId(),
      user_data: userData,
      custom_data: {
        currency: productData.currency,
        value: productData.value,
        content_ids: productData.content_ids,
        content_name: productData.content_name,
        content_type: 'product',
      },
      event_source_url: pageUrl,
      action_source: 'website',
    });
  }

  async sendInitiateCheckout(
    userData: FacebookEvent['user_data'],
    checkoutData: {
      value: number;
      currency: string;
      content_ids: string[];
      num_items: number;
    },
    pageUrl: string
  ): Promise<void> {
    await this.sendEvent({
      event_name: 'InitiateCheckout',
      event_time: Math.floor(Date.now() / 1000),
      event_id: this.generateEventId(),
      user_data: userData,
      custom_data: {
        currency: checkoutData.currency,
        value: checkoutData.value,
        content_ids: checkoutData.content_ids,
        content_type: 'product',
        num_items: checkoutData.num_items,
      },
      event_source_url: pageUrl,
      action_source: 'website',
    });
  }

  async sendLead(
    userData: FacebookEvent['user_data'],
    leadData?: {
      value?: number;
      currency?: string;
      content_name?: string;
    },
    pageUrl?: string
  ): Promise<void> {
    await this.sendEvent({
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: this.generateEventId(),
      user_data: userData,
      custom_data: leadData,
      event_source_url: pageUrl,
      action_source: 'website',
    });
  }

  async sendCompleteRegistration(
    userData: FacebookEvent['user_data'],
    registrationData?: {
      content_name?: string;
      status?: string;
    },
    pageUrl?: string
  ): Promise<void> {
    await this.sendEvent({
      event_name: 'CompleteRegistration',
      event_time: Math.floor(Date.now() / 1000),
      event_id: this.generateEventId(),
      user_data: userData,
      custom_data: registrationData,
      event_source_url: pageUrl,
      action_source: 'website',
    });
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const testEvent: FacebookEvent = {
        event_name: 'PageView',
        event_time: Math.floor(Date.now() / 1000),
        event_id: this.generateEventId(),
        user_data: {
          client_ip_address: '127.0.0.1',
          client_user_agent: 'test-agent',
        },
        action_source: 'website',
      };

      return await this.sendEvent(testEvent);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static hashUserData(data: string): string {
    // In a real implementation, you'd use a proper hashing library
    // This is a simplified version for demonstration
    return btoa(data.toLowerCase().trim());
  }

  static getUserDataFromRequest(request: Request): FacebookEvent['user_data'] {
    // Extract user data from request headers and parameters
    const userAgent = request.headers.get('user-agent') || '';
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || '';
    
    return {
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };
  }
}

// Helper function for browser-side Facebook Pixel tracking
export const trackFacebookEvent = (
  eventName: string,
  eventData?: Record<string, any>
): void => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, eventData);
  }
};

// Initialize Facebook Pixel
export const initializeFacebookPixel = (pixelId: string): void => {
  if (typeof window === 'undefined') return;

  // Load Facebook Pixel script
  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);

  // Add noscript fallback
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `
    <img height="1" width="1" style="display:none"
         src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
  `;
  document.body.appendChild(noscript);
};