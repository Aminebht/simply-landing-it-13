export interface TrackingConfig {
  facebook_pixel_id?: string;
  google_analytics_id?: string;
  clarity_id?: string;
  conversion_events?: {
    page_view?: boolean;
  };
}

export class ScriptGenerator {
  generateSupabaseSDK(pageData: any): string {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ijrisuqixfqzmlomlgjb.supabase.co';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcmlzdXFpeGZxem1sb21sZ2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTg3NjAsImV4cCI6MjA2NzE3NDc2MH0.01KwBmQrfZPMycwqyo_Z7C8S4boJYjDLuldKjrHOJWg';
    
    return `<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
<script>
const supabase=window.supabase.createClient('${supabaseUrl}','${supabaseAnonKey}',{
  auth:{
    storage:localStorage,
    persistSession:true,
    autoRefreshToken:true
  }
});
const SUPABASE_ANON_KEY='${supabaseAnonKey}';
const PAGE_CONFIG={slug:'${pageData.slug || 'landing-page'}',title:'${this.escapeJs(pageData.seo_config?.title || 'Landing Page')}',url:'',language:'${pageData.global_theme?.language || 'en'}'};
PAGE_CONFIG.url=window.location.href;

function generateUUID(){
  if(typeof crypto!=='undefined'&&crypto.randomUUID){return crypto.randomUUID();}
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){
    const r=Math.random()*16|0;
    const v=c=='x'?r:(r&0x3|0x8);
    return v.toString(16);
  });
}

function getSessionId(){
  let sessionId=sessionStorage.getItem('landing_session_id');
  if(!sessionId){
    sessionId='session_'+Date.now()+'_'+Math.random().toString(36).substr(2,9);
    sessionStorage.setItem('landing_session_id',sessionId);
  }
  return sessionId;
}

function trackEvent(eventType,eventData){
  console.log('Landing Page Event:',{
    event_type:eventType,
    event_data:eventData,
    timestamp:new Date().toISOString(),
    page_url:window.location.href
  });
}

window.addEventListener('load',function(){
  trackEvent('page_view',{
    page_title:PAGE_CONFIG.title,
    page_slug:PAGE_CONFIG.slug,
    referrer:document.referrer,
    viewport_width:window.innerWidth,
    viewport_height:window.innerHeight
  });
});
</script>`;
  }

  generateTrackingScripts(pageData: any): string {
    const trackingConfig: TrackingConfig = pageData.tracking_config;
    if (!trackingConfig) {
      return '<!-- No tracking configuration -->';
    }

    let scripts = '';

    if (trackingConfig.facebook_pixel_id) {
      scripts += this.generateFacebookPixelScript(trackingConfig);
    }

    if (trackingConfig.google_analytics_id) {
      scripts += this.generateGoogleAnalyticsScript(trackingConfig);
    }

    if (trackingConfig.clarity_id) {
      scripts += this.generateClarityScript(trackingConfig);
    }

    return scripts;
  }

  private generateFacebookPixelScript(trackingConfig: TrackingConfig): string {
    const pixelId = trackingConfig.facebook_pixel_id;

    if (!pixelId || !/^\d{15,16}$/.test(pixelId)) {
      console.warn('Invalid Facebook Pixel ID format');
      return '<!-- Facebook Pixel ID invalid -->';
    }

    return `
<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  
  fbq('init', '${pixelId}');
  ${trackingConfig.conversion_events?.page_view ? "fbq('track', 'PageView');" : ''}
  
  window.trackFacebookEvent = function(eventName, eventData) {
    if (typeof fbq !== 'undefined') {
      const safeEventData = {
        value: eventData.value || 0,
        currency: eventData.currency || 'TND',
        content_ids: eventData.content_ids || []
      };
      fbq('track', eventName, safeEventData);
    }
  };
</script>
<noscript>
  <img height="1" width="1" style="display:none"
       src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
</noscript>`;
  }

  private generateGoogleAnalyticsScript(trackingConfig: TrackingConfig): string {
    const gaId = trackingConfig.google_analytics_id;

    if (!gaId || !gaId.startsWith('G-')) {
      console.warn('Invalid Google Analytics ID format');
      return '<!-- Google Analytics ID invalid -->';
    }

    return `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaId}', {
    page_title: document.title,
    page_location: window.location.href
  });

  window.trackGoogleEvent = function(eventName, eventData) {
    gtag('event', eventName, {
      event_category: 'Landing Page',
      event_label: eventData.label || '',
      value: eventData.value || 0
    });
  };
</script>`;
  }

  private generateClarityScript(trackingConfig: TrackingConfig): string {
    const clarityId = trackingConfig.clarity_id;

    if (!clarityId || clarityId.length < 8) {
      console.warn('Invalid Clarity ID format');
      return '<!-- Clarity ID invalid -->';
    }

    return `
<!-- Microsoft Clarity -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "${clarityId}");
</script>`;
  }

  private escapeJs(text: string): string {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }
}
