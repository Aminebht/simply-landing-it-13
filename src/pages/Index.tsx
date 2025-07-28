import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Users, Zap, Plus, Eye, Settings, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, LandingPage } from '@/services/supabase';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLandingPages();
  }, []);

  const fetchLandingPages = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLandingPages(data || []);
    } catch (error) {
      console.error('Error fetching landing pages:', error);
      toast({
        title: "Error",
        description: "Failed to load landing pages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLandingPage = () => {
    navigate('/onboarding');
  };

  const handlePreviewPage = (pageId: string) => {
    navigate(`/preview/${pageId}`);
  };

  const handleEditPage = (pageId: string) => {
    navigate(`/builder/${pageId}`);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'deploying': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600';
      case 'deploying': return 'text-yellow-600';
      case 'draft': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Create stunning landing pages in minutes, not hours"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Conversion Optimized",
      description: "Built-in best practices for digital product sales"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "No Design Skills Needed",
      description: "Professional templates that work out of the box"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-hero-gradient rounded-lg"></div>
              <span className="text-xl font-bold text-slate-900">PageCraft</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => alert('Pricing page coming soon!')}>Pricing</Button>
              <Button onClick={handleCreateLandingPage}>
                <Plus className="mr-2 h-4 w-4" />
                Create Landing Page
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Landing Pages Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Your Landing Pages
              </h2>
              <p className="text-lg text-slate-600">
                Manage and deploy your landing pages
              </p>
            </div>
            <Button onClick={handleCreateLandingPage} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create New Page
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : landingPages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Landing Pages Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first landing page to get started
              </p>
              <Button onClick={handleCreateLandingPage}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Landing Page
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {landingPages.map((page) => (
                <Card key={page.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg truncate">
                        {page.seo_config?.title || page.slug}
                      </CardTitle>
                      <Badge variant={getStatusBadgeVariant(page.status)} className={getStatusColor(page.status)}>
                        {page.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {page.seo_config?.description || 'No description'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Created: {new Date(page.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        {page.global_theme?.language || 'en'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handlePreviewPage(page.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditPage(page.id)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose PageCraft?
            </h2>
            <p className="text-lg text-slate-600">
              Built specifically for digital product creators who want results fast
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow border-0 bg-white/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-hero-gradient rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-hero-gradient rounded-lg"></div>
              <span className="text-xl font-bold text-slate-900">PageCraft</span>
            </div>
            <div className="flex space-x-6 text-slate-600">
              <a href="#" className="hover:text-slate-900">Pricing</a>
              <a href="#" className="hover:text-slate-900">Support</a>
              <a href="#" className="hover:text-slate-900">Blog</a>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-slate-500 text-sm">
            © 2024 PageCraft. Built for digital product creators who want to win.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
