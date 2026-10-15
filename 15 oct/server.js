/**
 * PulseFlow Web Application Server
 * Built with Node.js native HTTP module (zero external dependencies required)
 * Provides static asset serving, REST API endpoints, input validation, and live telemetry.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// In-memory data store for demonstration
const leads = [];
const newsletterSubscribers = new Set();
const systemStartTime = Date.now();

// MIME type map for static asset serving
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Helper: send JSON response
function sendJSON(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

// Helper: parse JSON request body safely
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1e6) { // 1MB limit for security
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Simple email validation
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // API Routes
  if (pathname.startsWith('/api/')) {
    // 1. Health check
    if (pathname === '/api/health' && method === 'GET') {
      return sendJSON(res, 200, {
        status: 'online',
        version: '2.0.4',
        uptimeSeconds: Math.floor((Date.now() - systemStartTime) / 1000),
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Real-time telemetry metrics
    if (pathname === '/api/metrics' && method === 'GET') {
      // Dynamic simulated fluctuations around steady baseline
      const variance = (Math.random() - 0.5) * 8;
      const latencyVariance = (Math.random() - 0.5) * 4;
      return sendJSON(res, 200, {
        activeAgents: Math.floor(1420 + variance * 4),
        requestsPerSec: Math.floor(8450 + variance * 25),
        p99LatencyMs: Math.max(12, +(18.4 + latencyVariance).toFixed(1)),
        tokenEfficiencyPct: +(99.1 + (Math.random() * 0.4)).toFixed(1),
        costSavedTotalUsd: Math.floor(48250 + (Date.now() - systemStartTime) * 0.005),
        anomalyScore: 0.02,
        healthyNodes: 48,
        totalNodes: 48,
        status: 'optimal'
      });
    }

    // 3. Lead submission / Demo booking
    if (pathname === '/api/leads' && method === 'POST') {
      try {
        const body = await parseBody(req);
        const { name, email, companySize, interest, message } = body;

        // Validation
        const errors = [];
        if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters long.');
        if (!email || !isValidEmail(email)) errors.push('A valid business email address is required.');
        if (!companySize) errors.push('Please select your team size.');

        if (errors.length > 0) {
          return sendJSON(res, 400, { success: false, errors });
        }

        const newLead = {
          id: 'lead_' + Math.random().toString(36).substring(2, 9),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          companySize,
          interest: interest || 'General Platform',
          message: message ? message.trim() : '',
          createdAt: new Date().toISOString()
        };

        leads.push(newLead);
        console.log(`[PulseFlow API] New Demo Booking: ${newLead.name} (${newLead.email})`);

        return sendJSON(res, 201, {
          success: true,
          message: `Thank you, ${newLead.name}! Your demo request has been reserved. Our engineering team will contact you at ${newLead.email}.`,
          leadId: newLead.id
        });
      } catch (err) {
        return sendJSON(res, 400, { success: false, error: err.message });
      }
    }

    // 4. Newsletter Subscription
    if (pathname === '/api/newsletter' && method === 'POST') {
      try {
        const body = await parseBody(req);
        const { email } = body;

        if (!email || !isValidEmail(email)) {
          return sendJSON(res, 400, { success: false, error: 'Please enter a valid email address.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        newsletterSubscribers.add(normalizedEmail);
        console.log(`[PulseFlow API] Newsletter signup: ${normalizedEmail}`);

        return sendJSON(res, 200, {
          success: true,
          message: 'Welcome aboard! You have successfully subscribed to PulseFlow developer updates.'
        });
      } catch (err) {
        return sendJSON(res, 400, { success: false, error: err.message });
      }
    }

    // 5. AI Prompt & Workflow Optimization Simulation
    if (pathname === '/api/optimize-prompt' && method === 'POST') {
      try {
        const body = await parseBody(req);
        const { prompt = '', goal = 'efficiency' } = body;

        if (!prompt || prompt.trim().length < 5) {
          return sendJSON(res, 400, { success: false, error: 'Prompt must contain at least 5 characters to analyze.' });
        }

        const originalTokens = Math.max(12, Math.floor(prompt.trim().split(/\s+/).length * 1.35));
        const tokenSavingsPct = Math.floor(35 + Math.random() * 25);
        const optimizedTokens = Math.max(8, Math.floor(originalTokens * (1 - tokenSavingsPct / 100)));
        const latencyMs = Math.floor(180 + Math.random() * 80);

        // Simulated optimized prompt transformation
        let optimizedText = '';
        if (goal === 'latency') {
          optimizedText = `[SYSTEM: STRICT_EXECUTION mode=low_latency format=compact_json]\nTarget: ${prompt.trim()}\nOutput: Direct actionable schema with zero conversational boilerplate. Cache validation active.`;
        } else if (goal === 'cost') {
          optimizedText = `[OPTIMIZED PIPELINE - COMPRESSED CONTEXT (-${tokenSavingsPct}% TOKENS)]\nExecute task: "${prompt.trim()}". Prioritize deterministic batching and prune redundant semantic tokens. Return structured markdown.`;
        } else {
          optimizedText = `[DIRECTIVE: AUTONOMOUS_WORKFLOW_V2]\nTask Context: "${prompt.trim()}"\nConstraints: Enforce P99 latency <20ms, validate input schema, stream structured JSON response with telemetry traces.`;
        }

        return sendJSON(res, 200, {
          success: true,
          originalTokens,
          optimizedTokens,
          reductionPct: tokenSavingsPct,
          latencyMs,
          estimatedCostSavings: `$${(originalTokens * 0.00003 * 10000).toFixed(2)} / 10k calls`,
          optimizedPrompt: optimizedText
        });
      } catch (err) {
        return sendJSON(res, 400, { success: false, error: err.message });
      }
    }

    // 404 for unknown API routes
    return sendJSON(res, 404, { success: false, error: 'API endpoint not found' });
  }

  // Static File Serving
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA-style routing if not an asset
      const ext = path.extname(filePath);
      if (!ext || ext === '.html') {
        const indexPath = path.join(PUBLIC_DIR, 'index.html');
        fs.readFile(indexPath, (indexErr, content) => {
          if (indexErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(content);
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('File Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Add cache headers for static assets
    const headers = { 'Content-Type': contentType };
    if (ext === '.css' || ext === '.js' || ext === '.svg' || ext === '.png') {
      headers['Cache-Control'] = 'public, max-age=3600';
    }

    res.writeHead(200, headers);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 PulseFlow Web Server running on http://localhost:${PORT}`);
  console.log(`📡 REST API endpoints active:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/metrics`);
  console.log(`   - POST /api/leads`);
  console.log(`   - POST /api/newsletter`);
  console.log(`   - POST /api/optimize-prompt`);
  console.log(`======================================================\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down PulseFlow server...');
  server.close(() => {
    console.log('Server terminated cleanly.');
    process.exit(0);
  });
});
