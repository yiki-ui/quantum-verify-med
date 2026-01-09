import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
// import * as CSL from '@emurgo/cardano-serialization-lib-nodejs'; 
// Commented out CSL to avoid local WASM issues if not compiled perfectly, 
// using simplified logic for the quick local demo.

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/verify', async (req, res) => {
    console.log("Received verification request:", req.body);
    const { signature, key, message } = req.body;

    if (!signature || !key || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Mock Verification Logic for Local Demo
    // In production (Vercel), api/verify.ts would run with the full WASM library.

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log("Signature verified successfully (Mock)");

    res.json({
        success: true,
        verified: true,
        message: "Signature verified (Local)",
        userId: "local_user_" + Math.random().toString(36).substring(7)
    });
});

app.listen(port, () => {
    console.log(`Local Backend running at http://localhost:${port}`);
});
