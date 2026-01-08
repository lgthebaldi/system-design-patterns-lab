const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken'); // Needed for validation
const fs = require('fs');            // Needed to read keys
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const authController = require('./authController');

const app = express();
const PORT = 3001;

// Enable CORS so React (port 5173) can talk to Node (port 3001)
app.use(cors());
app.use(express.json());

// 1. Load Public Key (To verify the Badge/Token)
// We use the Public key because we are only VALIDATING, not signing.
const publicKey = fs.readFileSync(path.join(__dirname, 'public.key'), 'utf8');

// 2. Security Middleware (The Guard)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extracts "Bearer <TOKEN>"

    if (!token) {
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

// --- ROUTES ---

// Auth Routes (Public)
app.get('/auth/login', authController.login);
app.get('/auth/callback', authController.callback);

// Protected Route (Requires Token)
app.get('/run-week1', authenticateToken, (req, res) => {
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

        if (stderr) {
            console.warn(`⚠️ Script Stderr: ${stderr}`);
        }

        console.log("✅ Script executed successfully");
        
        res.json({ 
            message: "Triad Handshake Successful", 
            logs: stdout 
        });
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Backend Orchestrator running at http://localhost:${PORT}`);
    console.log(`📂 Monitoring scripts in: ../services/`);
});