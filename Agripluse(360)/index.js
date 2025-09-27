// index.js - Your Secure Backend Server
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// IMPORTANT: Store your API key as a Secret environment variable
// DO NOT write your key here.
const GEMINI_API_KEY = process.env.AIzaSyBq38nw6KokPxTev7dRBZXMRpS02bHXLOk;

// API endpoint that the front-end will call
app.post('/api/gemini', async (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    const model = 'gemini-1.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseData = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("Google API Error:", responseData);
            return res.status(apiResponse.status).json({ error: 'Failed to fetch from Gemini API.' });
        }

        const text = responseData.candidates[0]?.content?.parts[0]?.text;
        if (text) {
            res.json({ text }); // Send the result back to the front-end
        } else {
             res.status(500).json({ error: 'Invalid response structure from Gemini API.' });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Serve the main HTML file for any other GET request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// To run the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});