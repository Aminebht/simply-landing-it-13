# Netlify Deployment API Fix

## Problem Summary

The original deployment was failing with the following errors:
1. **404 Error**: `PUT /api/netlify/api/v1/deploys/{deploy_id}/files` endpoint not found
2. **401 Unauthorized**: Attempting to upload files to a deployment in "new" state
3. **Incorrect API Usage**: Using wrong endpoints and incorrect deployment flow

## Root Cause Analysis

Based on the Netlify API documentation research, the issues were:

1. **Wrong Upload Endpoint**: We were using `/deploys/{deploy_id}/files` instead of `/deploys/{deploy_id}/files/{file_path}`
2. **Incorrect Deployment Flow**: Creating empty deployments and trying to upload files individually
3. **Missing File Digest**: Not using the proper file digest method with SHA1 hashes
4. **Wrong Content Upload Strategy**: Uploading files by hash instead of by path

## Solution Implemented

### 1. Fixed File Digest Method (`deployAsSourceCode`)

**Before (Broken)**:
```typescript
// Created empty deployment
const deployment = await this.request(`/sites/${siteId}/deploys`, {
  method: 'POST',
  body: JSON.stringify({}), // Empty body
});

// Tried to upload to wrong endpoint
await fetch(`/deploys/${deployment.id}/files`, { ... }); // 404 Error
```

**After (Fixed)**:
```typescript
// Create file digest with SHA1 hashes
const fileDigest: Record<string, string> = {};
for (const [filePath, content] of Object.entries(files)) {
  const hash = await this.generateFileHash(content);
  fileDigest[filePath] = hash;
}

// Create deployment with file digest
const deployment = await this.request(`/sites/${siteId}/deploys`, {
  method: 'POST',
  body: JSON.stringify({
    files: fileDigest,  // Include file digest
    async: true,
    framework: 'vite',
    branch: 'main'
  }),
});

// Upload only required files to correct endpoint
await this.uploadFileByPath(deployment.id, filePath, content);
```

### 2. Fixed ZIP Upload Method (`deployWithFormDataZip`)

**Before (Broken)**:
```typescript
// Used FormData multipart upload
const formData = new FormData();
formData.append('file', blob, 'source.zip');
```

**After (Fixed)**:
```typescript
// Direct ZIP upload with correct Content-Type
const response = await fetch(`${this.baseUrl}/sites/${siteId}/deploys`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${this.accessToken}`,
    'Content-Type': 'application/zip',  // Key header!
  },
  body: zipBuffer,  // Direct binary upload
});
```

### 3. Fixed File Upload Endpoint

**Before (Broken)**:
```typescript
// Wrong endpoint - caused 404
const url = `${this.baseUrl}/deploys/${deployId}/files`;
```

**After (Fixed)**:
```typescript
// Correct endpoint with file path
const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
const encodedPath = encodeURIComponent(cleanPath);
const url = `${this.baseUrl}/deploys/${deployId}/files/${encodedPath}`;
```

### 4. Removed Obsolete Methods

Removed broken methods that were causing errors:
- `uploadSourceAsArchive()` - Used wrong `/deploys/{id}/files` endpoint
- `uploadSourceFilesForBuild()` - Incorrect individual file upload approach
- `deployWithExplicitBuild()` - Unnecessary complexity
- `deployWithBuildTrigger()` - Duplicate of fixed ZIP method

## Deployment Flow Now

### Primary Method (File Digest)
1. ✅ Generate SHA1 hashes for all files
2. ✅ Create deployment with file digest
3. ✅ Netlify returns list of required files
4. ✅ Upload only required files to `/deploys/{id}/files/{path}`
5. ✅ Netlify builds the project automatically
6. ✅ Poll deployment status until "ready"

### Fallback Method (ZIP Upload)
1. ✅ Create ZIP archive of all files
2. ✅ Upload ZIP with `Content-Type: application/zip`
3. ✅ Netlify extracts and builds automatically
4. ✅ Poll deployment status until "ready"

## Expected Results

After this fix, the deployment logs should show:

### ✅ Success Logs
```
Creating build-enabled deployment for React project
Deploying as source code using file digest method
Created file digest with X files
Deployment created with digest: {id: "...", required: X}
Uploading X required files
Uploaded: index.html
Uploaded: main.css
...
All required files uploaded, waiting for build to complete
Deployment X status: building
Deployment X status: ready
✅ Build and deployment completed successfully
```

### ❌ Previous Error Logs (Now Fixed)
```
❌ PUT /api/netlify/api/v1/deploys/68930281c715656cc270b628/files 404 (Not Found)
❌ PUT /api/netlify/api/v1/deploys/68930281c715656cc270b628/files/fd37610... 401 (Unauthorized)
❌ "Access Denied: deploy must be in , not new"
```

## Testing Instructions

1. **Start Development Server**: `npm run dev` on port 8082
2. **Access Application**: Go to `http://localhost:8082/`
3. **Deploy Landing Page**: Use the deployment feature
4. **Check Console Logs**: Should see "Deploying as source code" or "ZIP file method"
5. **Verify Netlify Logs**: Should show build process (npm install, npm run build)

## Key Learnings

1. **Netlify API Requires Specific Endpoints**: `/deploys/{id}/files/{path}` not `/deploys/{id}/files`
2. **File Digest Method is Preferred**: More efficient than ZIP for large sites
3. **ZIP Method Needs Correct Content-Type**: `application/zip` header is crucial
4. **Deployment State Matters**: Can't upload to deployments in "new" state without proper setup
5. **Build Detection**: Netlify automatically detects source code and triggers builds when using correct API patterns

## Related Documentation

- [Netlify API Documentation](https://docs.netlify.com/api/get-started/#file-based-deploys)
- [File Digest Method](https://docs.netlify.com/api/get-started/#file-digest-method)
- [ZIP File Method](https://docs.netlify.com/api/get-started/#zip-file-method)
- [OpenAPI Reference](https://open-api.netlify.com/#tag/deploy/operation/createSiteDeploy)
