// backend/server.js
const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 🔥 CONFIGURAÇÃO SÊNIOR: Força o ts-node a ignorar o "type: module" e tratar como CommonJS
require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
        module: "CommonJS",
        target: "ESNext",
        esModuleInterop: true
    }
});

// Import Controllers
const authController = require('./authController');
const syncController = require('./controllers/syncController'); 
const connectMongo = require('./lib/mongo'); 
const { getScreenConfig } = require('./controllers/configController'); 

const app = express();
const PORT = 3001;

// --- 1. CONFIGURAÇÃO ---
app.use(cors());
app.use(express.json()); 

// --- 2. SECURITY MIDDLEWARE ---
let publicKey;
try {
    publicKey = fs.readFileSync(path.join(__dirname, 'public.key'), 'utf8');
} catch (error) {
    console.warn("⚠️ Warning: public.key not found.");
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn("⚠️ [Security] Access attempt without token blocked.");
        return res.status(401).json({ message: "Access Denied." });
    }

    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Token." });
        req.user = user;
        next();
    });
};

// --- DATABASE CONNECTION ---
connectMongo();

// --- ROUTES ---

// Auth (Public)
app.get('/auth/login', authController.login);
app.get('/auth/callback', authController.callback);

// WEEK 1: Python Handshake
app.get('/run-week1', (req, res) => {
    const pythonPath = path.join(__dirname, '../venv/bin/python3');
    const scriptPath = path.join(__dirname, '../services/week-1-the-connector/main.py');
    exec(`${pythonPath} ${scriptPath}`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: "Handshake Successful", logs: stdout });
    });
});

// WEEK 2: Batch Sync
app.post('/api/sync/start', syncController.startSync);

// WEEK 3: UI Config
app.get('/api/config/:screenName', getScreenConfig);

// --- WEEK 4: SOQL TRANSPILER (INTEGRAÇÃO VIA REQUIRE) ---
app.post('/api/transpile', (req, res) => {
    try {
        const { sql } = req.body;
        if (!sql) return res.status(400).json({ error: "No SQL query provided" });

        // Agora o require funciona porque removemos o "type: module" e configuramos o ts-node
        const { Lexer } = require('../services/week-4-soql-transpiler/lexer.ts');
        const { Parser } = require('../services/week-4-soql-transpiler/parser.ts');
        const { Transpiler } = require('../services/week-4-soql-transpiler/transpiler.ts');

        // Fluxo do Compilador
        const tokens = new Lexer(sql).tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const transpiler = new Transpiler();
        const soql = transpiler.transpile(ast);

        console.log(`✨ Transpiled: [${sql}] -> [${soql}]`);
        res.json({ success: true, soql });
    } catch (error) {
        console.error("❌ Transpiler Error:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});

// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`\n🚀 ==========================================`);
    console.log(`🌐 ORCHESTRATOR ACTIVE AT: http://localhost:${PORT}`);
    console.log(`✅ WEEK 4: SOQL Transpiler Ready`);
    console.log(`============================================\n`);
});