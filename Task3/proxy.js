/**
 * proxy.js  –  Local CORS proxy for Hugging Face Inference API
 * CodeSoft Task 3 – Image Captioning AI
 *
 * Runs on http://localhost:3001
 * POST /caption  { apiKey, imageBase64 }  →  { caption }
 *
 * Start with:  node proxy.js
 */

const http  = require('http');
const https = require('https');

const PORT     = 3001;
const HF_HOST  = 'router.huggingface.co';
const HF_PATH  = '/hf-inference/models/Salesforce/blip-image-captioning-large';

/* ── CORS headers sent on every response ── */
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
};

const server = http.createServer((req, res) => {

  /* Pre-flight request from browser */
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  /* Only accept POST /caption */
  if (req.method !== 'POST' || req.url !== '/caption') {
    res.writeHead(404, CORS);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  /* Collect request body */
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      res.writeHead(400, CORS);
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      return;
    }

    const { apiKey, imageBase64 } = payload;
    if (!apiKey || !imageBase64) {
      res.writeHead(400, CORS);
      res.end(JSON.stringify({ error: 'Missing apiKey or imageBase64' }));
      return;
    }

    /* Forward to Hugging Face */
    const hfBody = JSON.stringify({ inputs: imageBase64 });
    const options = {
      hostname: HF_HOST,
      path:     HF_PATH,
      method:   'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(hfBody),
      },
    };

    const hfReq = https.request(options, hfRes => {
      let hfData = '';
      hfRes.on('data', chunk => (hfData += chunk));
      hfRes.on('end', () => {
        // Pass HF status through; add CORS headers
        res.writeHead(hfRes.statusCode, CORS);
        res.end(hfData);
      });
    });

    hfReq.on('error', err => {
      res.writeHead(502, CORS);
      res.end(JSON.stringify({ error: `Proxy error: ${err.message}` }));
    });

    hfReq.write(hfBody);
    hfReq.end();
  });
});

server.listen(PORT, () => {
  console.log(`\n  ✅  CORS Proxy running  →  http://localhost:${PORT}`);
  console.log(`  📡  Forwarding to         https://${HF_HOST}${HF_PATH}`);
  console.log(`\n  Keep this terminal open while using the app.\n`);
});
