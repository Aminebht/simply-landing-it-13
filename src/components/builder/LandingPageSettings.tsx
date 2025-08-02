import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Settings, Globe, BarChart3, Facebook, Eye, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LandingPageService } from '@/services/landing-page';
import { DomainManagerService } from '@/services/domain-manager';
import type { LandingPage, TrackingConfig } from '@/types/landing-page';

interface LandingPageSettingsProps {
  landingPage: LandingPage | null;
  onSettingsUpdate: (updates: Partial<LandingPage>) => void;
}

interface DomainSetupSteps {
  isValidating: boolean;
  dnsInstructions: string;
  verificationStatus: {
    reachable: boolean;
    ssl_enabled: boolean;
    redirects_properly: boolean;
  } | null;
}

export const LandingPageSettings: React.FC<LandingPageSettingsProps> = ({
  landingPage,
  onSettingsUpdate
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Domain settings
  const [customDomain, setCustomDomain] = useState(landingPage?.custom_domain || '');
  const [domainSetup, setDomainSetup] = useState<DomainSetupSteps>({
    isValidating: false,
    dnsInstructions: '',
    verificationStatus: null
  });

  // Tracking settings
  const [trackingConfig, setTrackingConfig] = useState<TrackingConfig>({
    facebook_pixel_id: '',
    facebook_access_token: '',
    google_analytics_id: '',
    clarity_id: '',
    conversion_events: {
      page_view: true,
      add_to_cart: true,
      purchase: true
    },
    ...landingPage?.tracking_config
  });

  useEffect(() => {
    if (landingPage) {
      setCustomDomain(landingPage.custom_domain || '');
      if (landingPage.tracking_config) {
        setTrackingConfig({
          facebook_pixel_id: '',
          facebook_access_token: '',
          google_analytics_id: '',
          clarity_id: '',
          conversion_events: {
            page_view: true,
            add_to_cart: true,
            purchase: true
          },
          ...landingPage.tracking_config
        });
      }
    }
  }, [landingPage]);

  const handleSaveSettings = async () => {
    if (!landingPage) return;

    setIsSaving(true);
    try {
      const landingPageService = LandingPageService.getInstance();

      // Save tracking config
      await landingPageService.updateTrackingConfig(landingPage.id, trackingConfig);

      // Save custom domain if changed
      if (customDomain !== landingPage.custom_domain) {
        await landingPageService.updateCustomDomain(landingPage.id, customDomain);
      }

      // Update parent component
      onSettingsUpdate({
        custom_domain: customDomain,
        tracking_config: trackingConfig
      });

      toast({
        title: "Settings saved",
        description: "Your landing page settings have been updated successfully. The tracking scripts will be included in your next deployment.",
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDomainSetup = async () => {
    if (!customDomain.trim() || !landingPage?.netlify_site_id) {
      toast({
        title: "Missing information",
        description: "Please ensure you have a custom domain and your site is deployed.",
        variant: "destructive"
      });
      return;
    }

    setDomainSetup(prev => ({ ...prev, isValidating: true }));

    try {
      // Initialize domain manager (you'll need to get the Netlify token from environment or user settings)
      const domainManager = new DomainManagerService('nfp_PxSrwC6LMCXfjrSi28pvhSdx9rNKLKyv4a6d');
      
      // Get DNS records needed
      const netlifyUrl = `https://${landingPage.netlify_site_id}.netlify.app`;
      const dnsRecords = await domainManager.getRequiredDNSRecords(customDomain, netlifyUrl);
      
      // Generate DNS instructions
      const instructions = domainManager.generateDNSInstructions(customDomain, dnsRecords);
      
      // Check current domain status
      const status = await domainManager.checkDomainStatus(customDomain);
      
      setDomainSetup({
        isValidating: false,
        dnsInstructions: instructions,
        verificationStatus: status
      });

      if (status.reachable && status.ssl_enabled) {
        toast({
          title: "Domain configured",
          description: "Your custom domain is working correctly!",
        });
      } else {
        toast({
          title: "DNS setup required",
          description: "Please follow the DNS instructions below to complete domain setup.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error setting up domain:', error);
      setDomainSetup(prev => ({ ...prev, isValidating: false }));
      toast({
        title: "Domain setup error",
        description: "There was a problem setting up your custom domain.",
        variant: "destructive"
      });
    }
  };

  const updateTrackingConfig = (key: keyof TrackingConfig, value: any) => {
    setTrackingConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateConversionEvent = (event: keyof TrackingConfig['conversion_events'], enabled: boolean) => {
    setTrackingConfig(prev => ({
      ...prev,
      conversion_events: {
        ...prev.conversion_events,
        [event]: enabled
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          title="Landing Page Settings"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Landing Page Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="domain" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="domain">Domain & Deployment</TabsTrigger>
            <TabsTrigger value="tracking">Analytics & Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="domain" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Custom Domain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="custom-domain">Custom Domain</Label>
                  <Input
                    id="custom-domain"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="example.com or subdomain.example.com"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your custom domain (without https://)
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDomainSetup}
                    disabled={!customDomain.trim() || domainSetup.isValidating}
                    size="sm"
                  >
                    {domainSetup.isValidating ? 'Checking...' : 'Setup Domain'}
                  </Button>
                  
                  {landingPage?.netlify_site_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://${landingPage.netlify_site_id}.netlify.app`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Live Site
                    </Button>
                  )}
                </div>

                {/* Domain Status */}
                {domainSetup.verificationStatus && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium mb-2">Domain Status</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${domainSetup.verificationStatus.reachable ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>Domain Reachable: {domainSetup.verificationStatus.reachable ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${domainSetup.verificationStatus.ssl_enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>SSL Enabled: {domainSetup.verificationStatus.ssl_enabled ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${domainSetup.verificationStatus.redirects_properly ? 'bg-green-500' : 'bg-orange-500'}`} />
                        <span>Redirects: {domainSetup.verificationStatus.redirects_properly ? 'Working' : 'Check needed'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* DNS Instructions */}
                {domainSetup.dnsInstructions && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">DNS Setup Instructions</h4>
                    <div className="text-sm whitespace-pre-wrap text-gray-700">
                      {domainSetup.dnsInstructions}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4 mt-4">
            {/* Important Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">📝 Important Information</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Tracking scripts will be automatically included in your deployed landing page</p>
                <p>• You must redeploy your landing page after saving these settings</p>
                <p>• Test your tracking setup using browser developer tools</p>
                <p>• Make sure to comply with GDPR and privacy regulations</p>
              </div>
            </div>

            {/* Facebook Pixel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Facebook className="h-5 w-5" />
                  Facebook Pixel & Conversion API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
                  <Input
                    id="facebook-pixel"
                    value={trackingConfig.facebook_pixel_id}
                    onChange={(e) => updateTrackingConfig('facebook_pixel_id', e.target.value)}
                    placeholder="123456789012345"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your Facebook Pixel ID (15-16 digits). Find it in your Facebook Ads Manager.
                  </p>
                  {trackingConfig.facebook_pixel_id && !/^\d{15,16}$/.test(trackingConfig.facebook_pixel_id) && (
                    <p className="text-sm text-red-500 mt-1">
                      ⚠️ Invalid format. Pixel ID should be 15-16 digits.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="facebook-token">Facebook Conversion API Access Token</Label>
                  <Input
                    id="facebook-token"
                    type="password"
                    value={trackingConfig.facebook_access_token}
                    onChange={(e) => updateTrackingConfig('facebook_access_token', e.target.value)}
                    placeholder="Your Facebook Conversion API token"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Used for server-side conversion tracking. Optional but recommended for iOS 14.5+ tracking.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Google Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Google Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="google-analytics">Google Analytics Measurement ID</Label>
                  <Input
                    id="google-analytics"
                    value={trackingConfig.google_analytics_id}
                    onChange={(e) => updateTrackingConfig('google_analytics_id', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your Google Analytics 4 Measurement ID (starts with G-). Find it in Google Analytics.
                  </p>
                  {trackingConfig.google_analytics_id && !/^G-[A-Z0-9]{10}$/.test(trackingConfig.google_analytics_id) && (
                    <p className="text-sm text-red-500 mt-1">
                      ⚠️ Invalid format. Should start with 'G-' followed by 10 characters.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Microsoft Clarity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Microsoft Clarity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clarity-id">Clarity Project ID</Label>
                  <Input
                    id="clarity-id"
                    value={trackingConfig.clarity_id}
                    onChange={(e) => updateTrackingConfig('clarity_id', e.target.value)}
                    placeholder="abcdefghij"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your Microsoft Clarity project ID (usually 10 characters). Find it in your Clarity dashboard.
                  </p>
                  {trackingConfig.clarity_id && trackingConfig.clarity_id.length < 8 && (
                    <p className="text-sm text-red-500 mt-1">
                      ⚠️ Project ID seems too short. Please verify in your Clarity dashboard.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversion Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="page-view">Page View</Label>
                      <p className="text-sm text-gray-500">Track when users view your landing page</p>
                    </div>
                    <Switch
                      id="page-view"
                      checked={trackingConfig.conversion_events.page_view}
                      onCheckedChange={(checked) => updateConversionEvent('page_view', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="add-to-cart">Add to Cart</Label>
                      <p className="text-sm text-gray-500">Track when users add items to cart</p>
                    </div>
                    <Switch
                      id="add-to-cart"
                      checked={trackingConfig.conversion_events.add_to_cart}
                      onCheckedChange={(checked) => updateConversionEvent('add_to_cart', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="purchase">Purchase</Label>
                      <p className="text-sm text-gray-500">Track when users complete a purchase</p>
                    </div>
                    <Switch
                      id="purchase"
                      checked={trackingConfig.conversion_events.purchase}
                      onCheckedChange={(checked) => updateConversionEvent('purchase', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Quick Setup Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://business.facebook.com/events_manager2/list/pixel', '_blank')}
                    className="justify-start"
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook Events Manager
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://analytics.google.com/', '_blank')}
                    className="justify-start"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Google Analytics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://clarity.microsoft.com/', '_blank')}
                    className="justify-start"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Microsoft Clarity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
