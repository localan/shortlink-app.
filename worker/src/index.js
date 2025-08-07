// Cloudflare Worker for URL Shortener with D1 Database

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API Routes
      if (path.startsWith('/api/')) {
        const response = await handleAPI(path, method, request, env);
        return new Response(response.body, {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Redirect short URLs
      if (path !== '/' && path !== '/favicon.ico') {
        const shortCode = path.substring(1);
        const redirect = await handleRedirect(shortCode, env);
        
        if (redirect) {
          // Increment click count
          await env.DB.prepare(
            'UPDATE links SET clicks = clicks + 1 WHERE short = ?'
          ).bind(shortCode).run();
          
          return Response.redirect(redirect, 302);
        }
      }

      // Default response
      return new Response('URL Shortener API - Ready!', {
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleAPI(path, method, request, env) {
  // Get all links
  if (path === '/api/links' && method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT * FROM links ORDER BY created_at DESC LIMIT 100'
    ).all();
    
    return {
      status: 200,
      body: JSON.stringify(results || [])
    };
  }

  // Create new short link
  if (path === '/api/shorten' && method === 'POST') {
    const body = await request.json();
    const { url, title, description, customShort } = body;

    if (!url) {
      return {
        status: 400,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return {
        status: 400,
        body: JSON.stringify({ error: 'Invalid URL format' })
      };
    }

    let shortCode;

    // Handle custom short URL
    if (customShort) {
      // Validate custom short URL format
      const shortUrlPattern = /^[a-zA-Z0-9_-]+$/;
      if (!shortUrlPattern.test(customShort)) {
        return {
          status: 400,
          body: JSON.stringify({ error: 'Custom short URL can only contain letters, numbers, hyphens, and underscores' })
        };
      }

      if (customShort.length < 2 || customShort.length > 50) {
        return {
          status: 400,
          body: JSON.stringify({ error: 'Custom short URL must be between 2-50 characters' })
        };
      }

      // Check if custom short URL already exists
      const { results: existingLinks } = await env.DB.prepare(
        'SELECT short FROM links WHERE short = ?'
      ).bind(customShort).all();

      if (existingLinks.length > 0) {
        return {
          status: 409,
          body: JSON.stringify({ error: 'This custom short URL is already taken' })
        };
      }

      shortCode = customShort;
    } else {
      // Generate random short code
      shortCode = generateShortCode();
      
      // Check for duplicates with random code (retry if needed)
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        const { results: existingLinks } = await env.DB.prepare(
          'SELECT short FROM links WHERE short = ?'
        ).bind(shortCode).all();

        if (existingLinks.length === 0) {
          break; // Short code is unique
        }
        
        shortCode = generateShortCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return {
          status: 500,
          body: JSON.stringify({ error: 'Unable to generate unique short code. Please try again.' })
        };
      }
    }
    
    try {
      await env.DB.prepare(
        'INSERT INTO links (short, url, title, description) VALUES (?, ?, ?, ?)'
      ).bind(shortCode, url, title || null, description || null).run();

      return {
        status: 200,
        body: JSON.stringify({
          short: shortCode,
          url: url,
          title: title,
          description: description,
          isCustom: !!customShort
        })
      };
    } catch (error) {
      console.error('Database insert error:', error);
      return {
        status: 500,
        body: JSON.stringify({ error: 'Failed to create short link' })
      };
    }
  }

  // Update link
  if (path.startsWith('/api/links/') && method === 'PUT') {
    const linkId = path.split('/')[3];
    const body = await request.json();
    const { url, title, description, short } = body;

    if (!url) {
      return {
        status: 400,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return {
        status: 400,
        body: JSON.stringify({ error: 'Invalid URL format' })
      };
    }

    // Validate short URL if provided
    if (short) {
      const shortUrlPattern = /^[a-zA-Z0-9_-]+$/;
      if (!shortUrlPattern.test(short)) {
        return {
          status: 400,
          body: JSON.stringify({ error: 'Short URL can only contain letters, numbers, hyphens, and underscores' })
        };
      }

      if (short.length < 2 || short.length > 50) {
        return {
          status: 400,
          body: JSON.stringify({ error: 'Short URL must be between 2-50 characters' })
        };
      }

      // Check if short URL already exists (excluding current link)
      const { results: existingLinks } = await env.DB.prepare(
        'SELECT id FROM links WHERE short = ? AND id != ?'
      ).bind(short, linkId).all();

      if (existingLinks.length > 0) {
        return {
          status: 409,
          body: JSON.stringify({ error: 'This short URL is already taken' })
        };
      }
    }

    try {
      let query, params;
      
      if (short) {
        query = 'UPDATE links SET url = ?, title = ?, description = ?, short = ? WHERE id = ?';
        params = [url, title || null, description || null, short, linkId];
      } else {
        query = 'UPDATE links SET url = ?, title = ?, description = ? WHERE id = ?';
        params = [url, title || null, description || null, linkId];
      }

      const result = await env.DB.prepare(query).bind(...params).run();

      if (result.changes === 0) {
        return {
          status: 404,
          body: JSON.stringify({ error: 'Link not found' })
        };
      }

      return {
        status: 200,
        body: JSON.stringify({ message: 'Link updated successfully' })
      };
    } catch (error) {
      console.error('Update error:', error);
      return {
        status: 500,
        body: JSON.stringify({ error: 'Failed to update link' })
      };
    }
  }

  // Delete link
  if (path.startsWith('/api/links/') && method === 'DELETE') {
    const linkId = path.split('/')[3];

    try {
      const result = await env.DB.prepare(
        'DELETE FROM links WHERE id = ?'
      ).bind(linkId).run();

      if (result.changes === 0) {
        return {
          status: 404,
          body: JSON.stringify({ error: 'Link not found' })
        };
      }

      return {
        status: 200,
        body: JSON.stringify({ message: 'Link deleted successfully' })
      };
    } catch (error) {
      throw error;
    }
  }

  // Get link stats
  if (path.startsWith('/api/stats/') && method === 'GET') {
    const shortCode = path.split('/')[3];
    const { results } = await env.DB.prepare(
      'SELECT * FROM links WHERE short = ?'
    ).bind(shortCode).all();

    if (results.length === 0) {
      return {
        status: 404,
        body: JSON.stringify({ error: 'Link not found' })
      };
    }

    return {
      status: 200,
      body: JSON.stringify(results[0])
    };
  }

  // Admin login validation
  if (path === '/api/admin/login' && method === 'POST') {
    const body = await request.json();
    const { password } = body;

    const adminPassword = env.ADMIN_PASSWORD || 'Arema123';

    if (password === adminPassword) {
      return {
        status: 200,
        body: JSON.stringify({ 
          success: true, 
          message: 'Login successful' 
        })
      };
    } else {
      return {
        status: 401,
        body: JSON.stringify({ 
          success: false, 
          message: 'Invalid password' 
        })
      };
    }
  }

  // Get analytics/dashboard data
  if (path === '/api/analytics' && method === 'GET') {
    const { results } = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_links,
        SUM(clicks) as total_clicks,
        AVG(clicks) as avg_clicks,
        MAX(clicks) as max_clicks
      FROM links
    `).all();

    const { results: recentLinks } = await env.DB.prepare(
      'SELECT * FROM links ORDER BY created_at DESC LIMIT 5'
    ).all();

    const { results: topLinks } = await env.DB.prepare(
      'SELECT * FROM links ORDER BY clicks DESC LIMIT 5'
    ).all();

    return {
      status: 200,
      body: JSON.stringify({
        stats: results[0],
        recentLinks,
        topLinks
      })
    };
  }

  return {
    status: 404,
    body: JSON.stringify({ error: 'API endpoint not found' })
  };
}

async function handleRedirect(shortCode, env) {
  const { results } = await env.DB.prepare(
    'SELECT url FROM links WHERE short = ?'
  ).bind(shortCode).all();

  return results.length > 0 ? results[0].url : null;
}

function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
