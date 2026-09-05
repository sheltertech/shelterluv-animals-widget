export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/v1\/animals\/([^/]+)\/?$/);
    if (!match) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    if (!env.SHELTERLUV_API_TOKEN) {
      return Response.json(
        { error: 'SHELTERLUV_API_TOKEN is not configured' },
        { status: 500 }
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
        'Content-Type': 'application/json',
      },
    });
  },
};
