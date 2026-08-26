/**
 * End-to-end tests for the Luma MCP server, driven over real stdio JSON-RPC
 * against the mock API in mock-luma.mjs. Run with: npm test
 */
import { spawn } from 'node:child_process';
import { existsSync, rmSync, statSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SERVER = join(HERE, '..', 'luma-mcp.mjs');
let BASE; // assigned once the mock reports the port the OS gave it

const work = mkdtempSync(join(tmpdir(), 'luma-mcp-test-'));
const SAVE_OK = join(work, 'nested', 'deeper', 'img.png');
const BLOCKER = join(work, 'blocker');
writeFileSync(BLOCKER, 'a file, not a directory');
const SAVE_BAD = join(BLOCKER, 'child.png'); // parent is a file -> ENOTDIR

let pass = 0;
let fail = 0;
const check = (label, ok, extra = '') => {
  if (ok) { pass += 1; console.log(`  PASS  ${label}`); }
  else { fail += 1; console.log(`  FAIL  ${label} ${extra}`); }
};

function client(env) {
  const kid = spawn('node', [SERVER], { env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'] });
  const pending = new Map();
  let buf = '';
  let id = 0;
  let stderr = '';
  kid.stderr.on('data', (d) => { stderr += d; });
  kid.stdout.on('data', (chunk) => {
    buf += chunk;
    let i;
    while ((i = buf.indexOf('\n')) !== -1) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      const msg = JSON.parse(line);
      if (pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    }
  });
  const rpc = (method, params) => new Promise((resolve) => {
    const mine = (id += 1);
    pending.set(mine, resolve);
    kid.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: mine, method, params })}\n`);
  });
  return {
    rpc,
    raw: (obj) => kid.stdin.write(`${JSON.stringify(obj)}\n`),
    kill: () => kid.kill(),
    stderr: () => stderr,
    async call(name, args) {
      const r = await rpc('tools/call', { name, arguments: args });
      const text = r.result?.content?.[0]?.text;
      let data;
      try { data = JSON.parse(text); } catch { data = text; }
      return { isError: Boolean(r.result?.isError), text, data };
    },
  };
}

const mock = spawn('node', [join(HERE, 'mock-luma.mjs')], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((resolve, reject) => {
  mock.stdout.on('data', (d) => {
    const m = String(d).match(/ready (\d+)/);
    if (m) { BASE = `http://127.0.0.1:${m[1]}/v1`; resolve(); }
  });
  setTimeout(() => reject(new Error('mock did not start')), 5000);
});

const GOOD = { LUMAAI_API_KEY: 'test-key-123', LUMAAI_BASE_URL: BASE };

try {
  console.log('\nprotocol');
  {
    const c = client(GOOD);
    const init = await c.rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '1' } });
    check('initialize echoes a supported protocol version', init.result?.protocolVersion === '2025-06-18');
    check('advertises the tools capability', Boolean(init.result?.capabilities?.tools));
    check('reports serverInfo.name', init.result?.serverInfo?.name === 'luma');

    const old = await c.rpc('initialize', { protocolVersion: '1999-01-01', capabilities: {}, clientInfo: { name: 't', version: '1' } });
    check('unsupported protocol falls back to latest', old.result?.protocolVersion === '2025-11-25');

    c.raw({ jsonrpc: '2.0', method: 'notifications/initialized' });
    c.raw('this is not json');
    await new Promise((r) => setTimeout(r, 150));
    check('survives a notification and malformed input', (await c.rpc('ping', {})).result !== undefined);

    const list = await c.rpc('tools/list', {});
    const tools = list.result?.tools ?? [];
    check('lists all 9 tools', tools.length === 9, `got ${tools.length}`);
    check('each tool has a description and object schema', tools.every((t) => t.description && t.inputSchema?.type === 'object'));
    check('handlers are not leaked onto the wire', tools.every((t) => !('handler' in t)));
    check('unknown method returns -32601', (await c.rpc('nope/nope', {})).error?.code === -32601);
    check('unknown tool returns isError', (await c.call('luma_nope', {})).isError === true);
    c.kill();
  }

  console.log('\ngeneration flow');
  {
    const c = client(GOOD);
    await c.rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '1' } });

    const img = await c.call('luma_generate_image', {
      prompt: 'a test', aspect_ratio: '9:16', model: 'photon-flash-1',
      character_ref_images: ['http://a/1.png', 'http://a/2.png'], save_to: SAVE_OK,
    });
    check('image generation reaches completed', img.data?.state === 'completed', JSON.stringify(img.data));
    check('polls through dreaming to completed', String(img.data?.asset_url).includes('asset.png'));
    check('downloads the asset, creating parent dirs', existsSync(SAVE_OK) && statSync(SAVE_OK).size > 0);
    check('reports saved_to', Boolean(img.data?.saved_to));

    const echoed = await c.call('luma_get_generation', { id: img.data.id });
    check('get_generation returns the id and state', echoed.data?.id === img.data.id && echoed.data?.state === 'completed');

    const nowait = await c.call('luma_generate_video', { prompt: 'x', wait: false });
    check('wait:false returns the id without polling', Boolean(nowait.data?.id) && /Poll with/.test(nowait.data?.note ?? ''));

    const vid = await c.call('luma_generate_video', { prompt: 'y', start_image_url: 'http://a/s.png', end_generation_id: 'gen-1', concepts: ['push_in'], duration: '9s' });
    check('video with keyframes and concepts completes', vid.data?.state === 'completed', JSON.stringify(vid.data));

    const listed = await c.call('luma_list_generations', { limit: 1 });
    check('list maps rows to id/state/prompt', listed.data?.[0]?.id === 'old1' && listed.data?.[0]?.prompt === 'a prior prompt');
    check('credits pass through', (await c.call('luma_credits', {})).data?.credit_balance === 4242);
    check('camera motions pass through', (await c.call('luma_camera_motions', {})).data?.includes('push_in'));

    const badSave = await c.call('luma_generate_image', { prompt: 'z', save_to: SAVE_BAD });
    check('an unwritable save_to degrades instead of failing', badSave.data?.state === 'completed' && Boolean(badSave.data?.save_error), JSON.stringify(badSave.data));

    const t0 = Date.now();
    const slow = await c.call('luma_generate_video', { prompt: 'slow', wait: true, wait_seconds: 0 });
    check('a wait timeout returns promptly', Date.now() - t0 < 8000);
    check('a wait timeout still returns the id and how to resume', Boolean(slow.data?.id) && /luma_get_generation/.test(slow.data?.note ?? ''));
    c.kill();
  }

  console.log('\ncredentials');
  {
    const c = client({ LUMAAI_API_KEY: '', LUMA_API_KEY: '', LUMAAI_BASE_URL: BASE });
    check('starts and lists tools with no key', ((await c.rpc('tools/list', {})).result?.tools ?? []).length === 9);
    const r = await c.call('luma_credits', {});
    check('a keyless call is a clean isError', r.isError === true);
    check('the error names LUMAAI_API_KEY and where to get one', /LUMAAI_API_KEY/.test(r.text) && /lumalabs\.ai\/api\/keys/.test(r.text));
    await new Promise((res) => setTimeout(res, 150));
    check('the key warning goes to stderr, not stdout', /LUMAAI_API_KEY is not set/.test(c.stderr()));
    c.kill();
  }
  {
    const c = client({ LUMAAI_API_KEY: 'wrong-key', LUMAAI_BASE_URL: BASE });
    await c.rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '1' } });
    const r = await c.call('luma_credits', {});
    check('a rejected key surfaces the 401', r.isError === true && /401/.test(r.text));
    check('the key is redacted from error text', !/wrong-key/.test(r.text), r.text);
    c.kill();
  }
} finally {
  mock.kill();
  rmSync(work, { recursive: true, force: true });
}

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
