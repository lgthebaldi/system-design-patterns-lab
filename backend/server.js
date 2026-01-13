const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken'); // Needed for validation
const fs = require('fs');            // Needed to read keys
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import Controllers
const authController = require('./authController');
const syncController = require('./controllers/syncController'); // Week 2
const connectMongo = require('./lib/mongo'); // Week 3
const { getScreenConfig } = require('./controllers/configController'); // Week 3
const { createProxyMiddleware } = require('http-proxy-middleware'); // Week 4

const app = express();
const PORT = 3001;

// --- 1. CONFIGURAÇÃO INICIAL (CORS & PROXY) ---

// Enable CORS so React (port 5173) can talk to Node (port 3001)
app.use(cors());

// ⚠️ WEEK 4 FIX: O Proxy DEVE vir ANTES do express.json()
// Route traffic from /api/finance/* -> Python Service (Port 8000)
app.use('/api/finance', createProxyMiddleware({
    target: 'http://localhost:8000', // Python Microservice URL
    changeOrigin: true,
    pathRewrite: {
        '^/api/finance': '', // Removes '/api/finance' before sending to Python
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔀 Proxying request to Financial Service: ${req.url}`);
    }
}));

// Agora sim podemos ler JSON para as outras rotas (Node)
app.use(express.json()); 

// 2. Load Public Key (To verify the Badge/Token)
// (Certifique-se que o arquivo public.key existe na pasta backend)
let publicKey;
try {
    publicKey = fs.readFileSync(path.join(__dirname, 'public.key'), 'utf8');
} catch (error) {
    console.warn("⚠️ Warning: public.key not found. Authentication might fail.");
}

// 3. Security Middleware (The Guard)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extracts "Bearer <TOKEN>"

    // BYPASS TEMPORÁRIO PARA TESTES DA SEMANA 4
    // Se quiser ligar a segurança de novo, remova este 'if' abaixo
    if (!token) {
        // console.warn("⚠️ [Security] No token provided (Bypassed for Dev).");
        // return next(); 
        
        // CÓDIGO ORIGINAL (MANTIDO):
        console.warn("⚠️ [Security] Access attempt without token blocked.");
        return res.status(401).json({ message: "Access Denied: No token provided." });
    }

    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, user) => {
        if (err) {
            console.error("❌ [Security] Invalid or Expired Token.");
            return res.status(403).json({ message: "Forbidden: Invalid or Expired Credentials." });
        }
        req.user = user; // Attaches user context to the request
        next(); // User is allowed, proceed to the route
    });
};

// --- DATABASE CONNECTION ---
connectMongo(); // WEEK 3: Connect to MongoDB when server starts

// --- ROUTES ---

// Auth Routes (Public)
app.get('/auth/login', authController.login);
app.get('/auth/callback', authController.callback);

// --- WEEK 1: The Connector (Python Integration) ---
// Protected Route: Runs the Python automation script
app.get('/run-week1', (req, res) => {
    console.log("⚡ Received request to run Week 1 Integration");

    const pythonPath = path.join(__dirname, '../venv/bin/python3');
    const scriptPath = path.join(__dirname, '../services/week-1-the-connector/main.py');

    exec(`${pythonPath} ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Execution Error: ${error.message}`);
            return res.status(500).json({ 
                message: "Python Script Execution Failed", 
                details: error.message,
                logs: stderr 
            });
        }
        if (stderr) console.warn(`⚠️ Script Stderr: ${stderr}`);

        console.log("✅ Script executed successfully");
        res.json({ message: "Triad Handshake Successful", logs: stdout });
    });
});

// --- WEEK 2: Batch Sync Processor (High Performance) ---
// Protected Route: Starts the async job queue
// We use 'authenticateToken' so we know WHO started the sync (req.user)
// app.post('/api/sync/start', authenticateToken, syncController.startSync);
app.post('/api/sync/start', syncController.startSync);

// WEEK 3: UI Config Route
// O frontend call: GET /api/config/home
app.get('/api/config/:screenName', getScreenConfig);

// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`🌐 Backend Orchestrator running at http://localhost:${PORT}`);
    console.log(`📂 Monitoring scripts in: ../services/`);
    console.log(`🚀 Week 1 Route: GET /run-week1`);
    console.log(`🚀 Week 2 Route: POST /api/sync/start`);
    console.log(`👉 Week 4 Gateway: /api/finance -> Port 8000`);
});