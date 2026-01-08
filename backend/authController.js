const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');

// 1. Connect to Redis
const redis = new Redis();

redis.on('connect', () => {
    console.log("✅ [Redis] Connection established successfully!");
});

redis.on('error', (err) => {
    console.error("❌ [Redis] Connection Error:", err);
});

// 2. Load Private Key
const privateKey = fs.readFileSync(path.join(__dirname, 'private.key'), 'utf8');

const { SF_CONSUMER_KEY, SF_CONSUMER_SECRET, SF_CALLBACK_URL, SF_LOGIN_URL } = process.env;

exports.login = (req, res) => {
    const authUrl = `${SF_LOGIN_URL}/services/oauth2/authorize?response_type=code&client_id=${SF_CONSUMER_KEY}&redirect_uri=${encodeURIComponent(SF_CALLBACK_URL)}`;
    console.log(`🔄 Redirecting to Salesforce...`);
    res.redirect(authUrl);
};

exports.callback = async (req, res) => {
    // DEBUG: Log everything Salesforce sent back
    console.log("🔍 [Debug] Salesforce Callback Parameters:", req.query);

    const { code, error, error_description } = req.query;

    // A. Handle Salesforce Errors explicitly
    if (error) {
        console.error(`❌ [Auth] Salesforce Error: ${error}`);
        console.error(`❌ [Auth] Description: ${error_description}`);
        return res.status(400).json({ 
            error: "Salesforce Login Failed", 
            details: error, 
            description: error_description 
        });
    }

    if (!code) {
        console.error("❌ [Auth] No code received.");
        return res.status(400).json({ error: "Missing authorization code." });
    }

    try {
        console.log("⏳ Exchanging code for token...");
        
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', SF_CONSUMER_KEY);
        params.append('client_secret', SF_CONSUMER_SECRET);
        params.append('redirect_uri', SF_CALLBACK_URL);
        params.append('code', code);

        const sfResponse = await axios.post(`${SF_LOGIN_URL}/services/oauth2/token`, params);
        
        const { access_token, instance_url, id } = sfResponse.data;

        // Fetch User Info
        const userProfile = await axios.get(id, {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const userEmail = userProfile.data.email;
        const userName = userProfile.data.display_name;

        // Create Triad Token
        const triadToken = jwt.sign(
            { 
                sub: userEmail,
                name: userName,
                sf_instance: instance_url,
                role: 'architect' 
            },
            privateKey,
            { algorithm: 'RS256', expiresIn: '1h' }
        );

        // Save to Redis
        await redis.set(`sf_token:${userEmail}`, access_token, 'EX', 3600);

        console.log(`🔐 Authentication Success: ${userEmail}`);
        
        // Redirect back to Frontend
        res.redirect(`http://localhost:5173?token=${triadToken}`);

    } catch (error) {
        console.error("❌ [Auth] Fatal Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Authentication Failed", details: error.response?.data });
    }
};