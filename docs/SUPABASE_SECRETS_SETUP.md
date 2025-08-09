# 🔐 Setting Up Supabase Secrets for Optimized Deployment

## Overview

For security, the Netlify access token is stored as a Supabase secret instead of being passed from the client-side. This prevents token exposure and improves security.

## Quick Setup

### Option 1: Using Supabase CLI (Recommended)

```bash
# Set the Netlify access token as a secret
supabase secrets set NETLIFY_ACCESS_TOKEN=your_netlify_token_here
```

### Option 2: Using Supabase Dashboard

1. Open your Supabase project dashboard
2. Go to **Project Settings** → **Edge Functions**
3. Scroll down to **Secrets** section
4. Click **Add new secret**
5. Set:
   - **Name**: `NETLIFY_ACCESS_TOKEN`
   - **Value**: Your Netlify access token
6. Click **Save**

## Getting Your Netlify Access Token

If you don't have a Netlify access token:

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click on your profile (top right) → **User settings**
3. Go to **Applications** tab
4. Scroll down to **Personal access tokens**
5. Click **New access token**
6. Give it a name (e.g., "Landing Page Builder")
7. Copy the generated token
8. Use this token in the secret setup above

## Verification

To verify the secret is set correctly:

```bash
# List all secrets (values are hidden for security)
supabase secrets list
```

You should see `NETLIFY_ACCESS_TOKEN` in the list.

## Security Benefits

✅ **No Client Exposure**: Token never appears in client-side code  
✅ **Encrypted Storage**: Token is encrypted and stored securely  
✅ **Server-Side Only**: Only accessible to edge functions  
✅ **No Bundle Leakage**: Token won't be included in client bundles  
✅ **Environment Isolation**: Different tokens for different environments  

## Troubleshooting

### Secret Not Found Error
If you get "Netlify access token not configured" error:
1. Verify the secret is set: `supabase secrets list`
2. Ensure the name is exactly: `NETLIFY_ACCESS_TOKEN`
3. Redeploy the edge function after setting the secret

### Invalid Token Error
If deployments fail with authentication errors:
1. Verify your Netlify token is valid
2. Check token permissions in Netlify dashboard
3. Try regenerating the token if needed

### Permission Issues
Make sure your Netlify token has these permissions:
- Create and manage sites
- Deploy to sites
- Manage DNS (if using custom domains)

## Environment Management

For different environments (dev/staging/prod), set different secrets:

```bash
# Development
supabase secrets set NETLIFY_ACCESS_TOKEN=dev_token_here

# Production (when deploying to production)
supabase secrets set NETLIFY_ACCESS_TOKEN=prod_token_here
```

## Migration from Client-Side Token

If you're migrating from client-side token usage:

1. **Set the secret** (as described above)
2. **Remove token from client code**:
   ```typescript
   // ❌ Before
   const service = new OptimizedDeploymentService(netlifyToken);
   
   // ✅ After
   const service = new OptimizedDeploymentService();
   ```
3. **Update hook usage**:
   ```typescript
   // ❌ Before
   const { deployLandingPage } = useOptimizedDeployment(netlifyToken);
   
   // ✅ After
   const { deployLandingPage } = useOptimizedDeployment();
   ```
4. **Deploy the updated edge function**
5. **Test the deployment**

## Best Practices

- 🔄 **Rotate tokens regularly** for security
- 📝 **Document token permissions** for team members
- 🔒 **Use different tokens** for different environments
- 📊 **Monitor token usage** in Netlify dashboard
- 🚨 **Revoke tokens immediately** if compromised

## Next Steps

After setting up the secret:
1. Deploy the edge function: `supabase functions deploy deploy-landing-page`
2. Update your client code to remove token parameters
3. Test a deployment to verify everything works
4. Monitor the performance improvements!
