/**
 * Cloudflare Worker - Static Site Handler for Vue/Ionic SPA
 * Serves files from KV storage with SPA fallback routing
 */

import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';

const assetManifest = JSON.parse(manifestJSON);

/**
 * Handle all incoming requests
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Determine if this is index.html (should not be cached)
    const isIndexHtml = pathname === '/' || pathname === '/index.html';
    
    try {
      // Try to serve the requested asset from KV
      const response = await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
          cacheControl: isIndexHtml ? {
            // Don't cache index.html - always serve fresh
            browserTTL: 0,
            edgeTTL: 0,
            bypassCache: true,
          } : {
            // Cache static assets (JS, CSS, images) for 1 year
            browserTTL: 60 * 60 * 24 * 365,
            edgeTTL: 60 * 60 * 24 * 365,
            bypassCache: false,
          },
        }
      );

      // Add security headers
      const headers = new Headers(response.headers);
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Add cache control headers for index.html
      if (isIndexHtml) {
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        headers.set('Pragma', 'no-cache');
        headers.set('Expires', '0');
        headers.set('Surrogate-Control', 'no-store');
        headers.set('ETag', `"${Date.now()}"`); // Force unique ETag
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });

    } catch (error) {
      // Handle 404 - serve index.html for SPA client-side routing
      if (error.status === 404 || error.message?.includes('could not find')) {
        const pathname = url.pathname;
        
        // Check if this is an asset request (JS, CSS, images, etc.)
        // These should return 404, not index.html
        const isAssetRequest = pathname.startsWith('/assets/') || 
          pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|json|wasm)$/i);
        
        if (isAssetRequest) {
          // Return 404 for missing assets - don't serve index.html
          return new Response(`Asset not found: ${pathname}`, {
            status: 404,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
        
        try {
          // For SPA navigation routes: serve index.html
          const notFoundRequest = new Request(new URL('/index.html', request.url).toString(), request);
          
          const response = await getAssetFromKV(
            {
              request: notFoundRequest,
              waitUntil: ctx.waitUntil.bind(ctx),
            },
            {
              ASSET_NAMESPACE: env.__STATIC_CONTENT,
              ASSET_MANIFEST: assetManifest,
              cacheControl: {
                // Don't cache index.html - always serve fresh for SPA routing
                browserTTL: 0,
                edgeTTL: 0, // No edge cache for index.html
                bypassCache: true,
              },
            }
          );

          return new Response(response.body, {
            status: 200, // Return 200 for SPA routes
            headers: response.headers,
          });

        } catch (e) {
          // index.html not found - return error page
          return new Response('Not Found - Please run "npm run build" first', {
            status: 404,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
      }

      // Handle method not allowed
      if (error.status === 405) {
        return new Response('Method Not Allowed', {
          status: 405,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      // Handle other errors
      console.error('Worker error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },
};
