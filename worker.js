const ALLOWED_ORIGIN = 'https://sheltertech.github.io';

const corsHeaders = (origin) => {
    const headers = {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (origin === ALLOWED_ORIGIN) {
        headers['Access-Control-Allow-Origin'] = origin;
    }

    return headers;
};

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') || '';
        const cors = corsHeaders(origin);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: cors });
        }

        if (request.method !== 'GET') {
            return new Response('Method not allowed', { status: 405, headers: cors });
        }

        const url = new URL(request.url);
        const match = url.pathname.match(/^\/api\/v1\/animals\/([^/]+)\/?$/);
        if (!match) {
            return Response.json({ error: 'Not found' }, { status: 404, headers: cors });
        }

        if (!env.SHELTERLUV_API_TOKEN) {
            return Response.json(
                { error: 'SHELTERLUV_API_TOKEN is not configured' },
                { status: 500, headers: cors }
            );
        }

        const id = decodeURIComponent(match[1]);
        const upstream = await fetch(
            `https://new.shelterluv.com/api/v1/animals/${encodeURIComponent(id)}`,
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${env.SHELTERLUV_API_TOKEN}`,
                },
            }
        );

        const body = await upstream.text();
        return new Response(body, {
            status: upstream.status,
            headers: {
                ...cors,
                'Content-Type': 'application/json',
            },
        });
    },
};
