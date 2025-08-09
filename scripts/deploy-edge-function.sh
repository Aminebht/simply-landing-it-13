#!/bin/bash

# Deploy the optimized landing page deployment edge function

echo "🚀 Deploying optimized landing page deployment edge function..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase status | grep -q "API URL"; then
    echo "❌ Not connected to Supabase. Please run 'supabase login' first"
    exit 1
fi

# Deploy the edge function
echo "📦 Deploying deploy-landing-page edge function..."
supabase functions deploy deploy-landing-page

if [ $? -eq 0 ]; then
    echo "✅ Edge function deployed successfully!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Update your client code to use OptimizedDeploymentService"
    echo "2. Test the deployment with a sample landing page"
    echo "3. Monitor performance improvements in your application"
    echo ""
    echo "📖 See DEPLOYMENT_OPTIMIZATION_MIGRATION.md for detailed migration guide"
else
    echo "❌ Deployment failed. Please check the logs above for details."
    exit 1
fi
