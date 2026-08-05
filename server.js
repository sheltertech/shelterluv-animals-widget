require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;
const SHELTERLUV_API_TOKEN = process.env.SHELTERLUV_API_TOKEN;

const shelterluvFetch = (apiPath) => {
    if (!SHELTERLUV_API_TOKEN) {
        throw new Error('SHELTERLUV_API_TOKEN is not configured');
    }

    return fetch(`https://new.shelterluv.com${apiPath}`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${SHELTERLUV_API_TOKEN}`,
        },
    });
};

app.use(express.static(__dirname));

app.get('/api/v1/animals/:id', async (req, res) => {
    try {
        const response = await shelterluvFetch(
            `/api/v1/animals/${encodeURIComponent(req.params.id)}`
        );
        const body = await response.text();

        res.status(response.status).type('application/json').send(body);
    } catch (error) {
        console.error('Failed to fetch animal details:', error);
        res.status(500).json({ error: 'Failed to fetch animal details' });
    }
});

app.get('/api/v1/animals', async (req, res) => {
    try {
        const query = new URLSearchParams(req.query).toString();
        const apiPath = query ? `/api/v1/animals?${query}` : '/api/v1/animals';
        const response = await shelterluvFetch(apiPath);
        const body = await response.text();

        res.status(response.status).type('application/json').send(body);
    } catch (error) {
        console.error('Failed to fetch animals feed:', error);
        res.status(500).json({ error: 'Failed to fetch animals feed' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'animals-widget.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
