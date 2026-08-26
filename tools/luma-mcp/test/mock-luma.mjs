/**
 * A minimal fake Luma API, so the server can be tested end to end without
 * spending credits or reaching the network. Generations report "dreaming"
 * once before completing, which exercises the polling loop.
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.MOCK_PORT || 0); // 0 = let the OS pick a free port
const KEY = 'test-key-123';
const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');

const generations = new Map();
let counter = 0;

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  const json = (code, body) => {
    res.writeHead(code, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  };

  if (pathname === '/asset.png') {
    res.writeHead(200, { 'content-type': 'image/png' });
    return res.end(PNG);
  }
  // Deliberately echoes the Authorization header, to prove the server redacts it.
  if (req.headers.authorization !== `Bearer ${KEY}`) {
    return json(401, { error: 'bad auth', got: req.headers.authorization ?? null });
  }

  // Test-only: lets the suite assert exactly what payload the server sent.
  if (pathname === '/debug/submissions') return json(200, [...generations.values()].map((g) => g.body));

  if (pathname === '/v1/credits') return json(200, { credit_balance: 4242 });
  if (pathname === '/v1/generations/concepts/list') return json(200, ['push_in', 'orbit_left']);
  if (pathname === '/v1/generations' && req.method === 'GET') {
    return json(200, [
      { id: 'old1', state: 'completed', generation_type: 'image', request: { prompt: 'a prior prompt' } },
    ]);
  }

  const isSubmit =
    pathname === '/v1/generations/image' ||
    pathname === '/v1/generations/video' ||
    pathname === '/v1/generations/image/reframe' ||
    /\/(upscale|audio)$/.test(pathname);

  if (req.method === 'POST' && isSubmit) {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const id = `gen-${++counter}`;
    generations.set(id, { polls: 0, body: raw ? JSON.parse(raw) : {}, kind: pathname.includes('video') ? 'video' : 'image' });
    return json(200, { id, state: 'queued' });
  }

  const match = pathname.match(/^\/v1\/generations\/([^/]+)$/);
  if (match && req.method === 'GET') {
    const gen = generations.get(match[1]);
    if (!gen) return json(404, { error: 'not found' });
    gen.polls += 1;
    if (gen.polls < 2) return json(200, { id: match[1], state: 'dreaming', generation_type: gen.kind });
    return json(200, {
      id: match[1],
      state: 'completed',
      generation_type: gen.kind,
      assets: { [gen.kind]: `http://127.0.0.1:${server.address().port}/asset.png` },
      request: gen.body,
    });
  }

  json(404, { error: 'no route', path: pathname });
});

server.listen(PORT, '127.0.0.1', () => process.stdout.write(`ready ${server.address().port}\n`));
