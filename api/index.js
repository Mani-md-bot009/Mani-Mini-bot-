// Vercel entry: serves the pairing website only (no bot process here).
// The real bot runs on Railway/Katabump/Heroku. Set BACKEND_URL in Vercel
// to that server's URL, e.g. https://your-app.up.railway.app
const express = require('express');
const path = require('path');
const app = express();

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'pair.html')));

app.use(async (req, res) => {
    const base = (process.env.BACKEND_URL || '').replace(/\/+$/, '');
    if (!base) {
        return res.status(503).json({
            error: 'BACKEND_URL is not set. Add your Railway URL in Vercel > Settings > Environment Variables.'
        });
    }
    try {
        const r = await fetch(base + req.originalUrl, { method: 'GET' });
        const body = await r.text();
        res.status(r.status).type(r.headers.get('content-type') || 'application/json').send(body);
    } catch (e) {
        res.status(502).json({ error: 'Backend not reachable: ' + e.message });
    }
});

module.exports = app;
