const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = 3001;

// Enable CORS so React (port 5173) can talk to Node (port 3001)
app.use(cors());
app.use(express.json());

app.get('/run-week1', (req, res) => {
    console.log("⚡ Received request to run Week 1 Integration");

    // Define paths to the Virtual Environment and the Python Script
    // Using relative paths to navigate the Monorepo structure
    const pythonPath = path.join(__dirname, '../venv/bin/python3');
    const scriptPath = path.join(__dirname, '../services/week-1-the-connector/main.py');

    // Execute the Python script
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
        
        // Return the 'stdout' (Python prints) to the React Frontend
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