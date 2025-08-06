# CORS Solution Guide for Netlify Deployment

## Problem Description

You encountered a CORS (Cross-Origin Resource Sharing) error when trying to deploy to Netlify from your local development environment:

```
Access to fetch at 'https://api.netlify.com/api/v1/sites/...' from origin 'http://localhost:8080' 
has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header contains multiple values '*, *', 
but only one is allowed.
```

This error occurs because:
1. Browsers enforce CORS security policies when making requests from one domain (localhost) to another (api.netlify.com)
2. Netlify's API seems to be sending duplicate CORS headers, which browsers reject
3. Direct API calls from client-side JavaScript in development environments are restricted

## Solutions Implemented

### 1. Proxy Configuration (Primary Solution)

Added a proxy configuration in `vite.config.ts` to route Netlify API calls through your development server:

```typescript
server: {
  proxy: {
    '/api/netlify': {
      target: 'https://api.netlify.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/netlify/, ''),
      configure: (proxy, options) => {
        proxy.on('proxyRes', (proxyRes, req, res) => {
          // Fix CORS header duplication issue
          const headers = proxyRes.headers;
          if (headers['access-control-allow-origin']) {
            if (Array.isArray(headers['access-control-allow-origin'])) {
              headers['access-control-allow-origin'] = headers['access-control-allow-origin'][0];
            }
          }
        });
      }
    }
  }
}
```

### 2. Dynamic URL Selection

Updated `NetlifyService` to automatically use the proxy in development:

```typescript
constructor(accessToken: string) {
  this.accessToken = accessToken;
  // Use proxy in development to avoid CORS issues
  this.baseUrl = this.isLocalDevelopment() 
    ? '/api/netlify/api/v1' 
    : 'https://api.netlify.com/api/v1';
}
```

### 3. Enhanced Error Handling

Added retry logic and better error handling for network issues:

```typescript
private async request(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> {
  // Retry on CORS errors and network failures
  // Better error logging and debugging information
}
```

### 4. Manual Deployment Fallback

Implemented a manual deployment approach for cases where CORS cannot be resolved:

```typescript
private async deployWithManualApproach(siteId: string, files: Record<string, string>): Promise<NetlifyDeployment> {
  // Creates a downloadable ZIP file
  // Provides instructions for manual upload to Netlify
  // Works around all CORS restrictions
}
```

## How to Test the Fix

### Step 1: Restart Development Server

The development server is now running on port 8082. Make sure to use the new URL:
- **Local:** http://localhost:8082/
- **Network:** http://192.168.1.8:8082/

### Step 2: Test Deployment

1. Navigate to your landing page builder
2. Try to deploy a landing page
3. The system will now:
   - First try the proxy approach (should work)
   - Fall back to manual deployment if needed

### Step 3: Verify Proxy is Working

Check the browser's Network tab when deploying:
- API calls should go to `/api/netlify/...` instead of `https://api.netlify.com/...`
- No CORS errors should appear

## Alternative Solutions (If Issues Persist)

### Option 1: Browser Extensions

For development, you can use browser extensions that disable CORS:
- **Chrome:** "CORS Unblock" or "Disable CORS"
- **Firefox:** "CORS Everywhere"

**Warning:** Only use for development, never in production.

### Option 2: Server-Side Proxy

If client-side solutions don't work, consider:
1. Creating a backend API that proxies Netlify requests
2. Using Netlify Functions to handle deployments
3. Using GitHub Actions for automated deployments

### Option 3: Production Build

CORS issues only affect development. In production:
1. Build your app: `npm run build`
2. Deploy the built files directly to Netlify
3. CORS restrictions don't apply to same-origin requests

## Debugging Tips

### Check Console Logs

The enhanced error handling provides detailed logs:
```javascript
console.log('Making Netlify API request:', method, url);
console.log('Netlify API request successful:', method, endpoint);
```

### Verify Proxy Configuration

Check if proxy is working:
1. Open browser DevTools
2. Go to Network tab
3. Look for requests to `/api/netlify/...`
4. Should show 200 status instead of CORS errors

### Test Different Approaches

The deployment service will automatically:
1. Try ZIP deployment (with builds)
2. Fall back to file deployment
3. Offer manual deployment if CORS persists

## Current Status

✅ **Proxy configured** - Routes API calls through development server
✅ **Retry logic added** - Handles temporary network issues  
✅ **Manual fallback ready** - Works around any CORS restrictions
✅ **Better error handling** - Provides detailed debugging information

The development server is now running on port 8082 with the new proxy configuration. Try deploying a landing page to test if the CORS issue is resolved.

## Next Steps

1. **Test the deployment** on http://localhost:8082/
2. **Check for CORS errors** in browser console
3. **Report results** - If issues persist, we can implement additional solutions
4. **Consider production deployment** - CORS won't be an issue in production builds

Remember: This CORS issue is specific to development environments. Once deployed to production, your app won't have these restrictions.
