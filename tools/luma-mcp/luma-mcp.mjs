#!/usr/bin/env node
/**
 * Luma AI MCP server.
 *
 * A zero-dependency stdio MCP server wrapping the Luma Dream Machine API
 * (https://api.lumalabs.ai/dream-machine/v1). Luma ships no MCP server of its
 * own, so this exposes the REST API as MCP tools usable from any project.
 *
 * Requires Node 18+ (global fetch). Set LUMAAI_API_KEY in the environment.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const SERVER_NAME = 'luma';
const SERVER_VERSION = '1.0.0';

const LATEST_PROTOCOL = '2025-11-25';
const SUPPORTED_PROTOCOLS = new Set([LATEST_PROTOCOL, '2025-06-18', '2025-03-26', '2024-11-05']);

const BASE_URL = (process.env.LUMAAI_BASE_URL || 'https://api.lumalabs.ai/dream-machine/v1').replace(/\/+$/, '');
const API_KEY = process.env.LUMAAI_API_KEY || process.env.LUMA_API_KEY;

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9', '9:21'];
const RESOLUTIONS = ['540p', '720p', '1080p', '4k'];
// Known model ids, advertised as hints rather than enforced — see openProp().
const IMAGE_MODELS = ['photon-1', 'photon-flash-1'];
const VIDEO_MODELS = ['ray-2', 'ray-flash-2'];
const TERMINAL_STATES = new Set(['completed', 'failed']);

/* ------------------------------------------------------------------ API -- */

const compact = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const truncate = (s, n) => (s.length > n ? `${s.slice(0, n)}…` : s);

/** Strip the API key out of any text headed for the client. Upstream error
 *  bodies can echo the Authorization header back, and these land in transcripts. */
const MIN_SECRET_LENGTH = 8;
const redact = (text) => {
  const s = typeof text === 'string' ? text : String(text);
  // A short value can't be a real key, and blindly substituting it would shred
  // unrelated words in the message. Real Luma keys are far longer than this.
  if (!API_KEY || API_KEY.length < MIN_SECRET_LENGTH) return s;
  return s.split(API_KEY).join('[redacted]');
};

async function api(method, path, body) {
  if (!API_KEY) {
    throw new Error(
      'No Luma API key found. Set LUMAAI_API_KEY in this MCP server\'s environment ' +
        '(e.g. `claude mcp add --scope user luma -e LUMAAI_API_KEY=... -- node /path/to/luma-mcp.mjs`). ' +
        'Create a key at https://lumalabs.ai/api/keys'
    );
  }
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: compact({
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
        'Content-Type': body === undefined ? undefined : 'application/json',
      }),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    // Node's fetch reports every transport failure as a bare "fetch failed";
    // the useful detail is on the cause.
    const cause = err?.cause?.code ?? err?.cause?.message ?? err?.message ?? 'unknown error';
    throw new Error(
      `Could not reach the Luma API at ${BASE_URL} (${cause}). ` +
        'Check network access to api.lumalabs.ai, and any proxy or firewall in front of it.'
    );
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Luma API ${method} ${path} failed: ${res.status} ${res.statusText}` +
        (text ? ` — ${truncate(text, 600)}` : '')
    );
  }
  return text ? JSON.parse(text) : null;
}

const assetUrl = (gen) => gen?.assets?.image || gen?.assets?.video || undefined;

/** Poll a generation until it reaches a terminal state or the deadline passes. */
async function pollGeneration(id, waitSeconds, intervalMs = 4000) {
  const deadline = Date.now() + waitSeconds * 1000;
  for (;;) {
    const gen = await api('GET', `/generations/${id}`);
    if (TERMINAL_STATES.has(gen?.state)) return gen;
    const left = deadline - Date.now();
    if (left <= 0) return { ...gen, _timedOut: true };
    await sleep(Math.min(intervalMs, left));
  }
}

async function download(url, saveTo) {
  const dest = resolve(saveTo);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
}

/**
 * Submit a generation, optionally wait for it, optionally save the asset.
 * Always returns the generation id so a timed-out call can be resumed.
 */
async function run({ path, body, wait = true, waitSeconds, saveTo }) {
  const submitted = await api('POST', path, compact(body));
  if (!submitted?.id) throw new Error(`Luma did not return a generation id: ${JSON.stringify(submitted)}`);
  if (!wait) {
    return {
      id: submitted.id,
      state: submitted.state,
      note: `Submitted. Poll with luma_get_generation id="${submitted.id}".`,
    };
  }
  return summarize(await pollGeneration(submitted.id, waitSeconds), saveTo);
}

async function summarize(gen, saveTo) {
  const out = compact({
    id: gen.id,
    state: gen.state,
    generation_type: gen.generation_type,
    failure_reason: gen.failure_reason,
    asset_url: assetUrl(gen),
  });
  if (gen._timedOut) {
    out.state = gen.state ?? 'unknown';
    out.note = `Still generating past the wait window. Poll with luma_get_generation id="${gen.id}".`;
  }
  if (out.asset_url && saveTo) {
    try {
      out.saved_to = await download(out.asset_url, saveTo);
    } catch (err) {
      out.save_error = err?.message ?? String(err);
    }
  }
  return out;
}

/* ---------------------------------------------------------------- schema -- */

const enumProp = (values, description, fallback) =>
  compact({ type: 'string', enum: values, description, default: fallback });

/**
 * A string field whose known-good values are advertised but NOT enforced.
 * Luma ships models faster than they update their SDK and OpenAPI spec, so a
 * closed enum here would block newer models until this file is edited. Unknown
 * values are forwarded to the API, which is the real source of truth.
 */
const openProp = (values, description, fallback) =>
  compact({
    type: 'string',
    description: `${description} Known values: ${values.join(', ')}. A newer value is passed through unchanged.`,
    default: fallback,
  });

const refArray = (description) => ({
  type: 'array',
  description,
  items: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'Publicly reachable image URL.' },
      weight: { type: 'number', description: 'Influence, 0–1.' },
    },
    required: ['url'],
  },
});

const saveToProp = (what) => ({
  type: 'string',
  description: `Optional local path to download the finished ${what} to (parent dirs are created). Luma asset URLs expire, so save anything you want to keep.`,
});

const waitProps = (defaultSeconds) => ({
  wait: {
    type: 'boolean',
    default: true,
    description: 'Wait for the generation to finish. Set false to return the id immediately and poll later.',
  },
  wait_seconds: {
    type: 'number',
    default: defaultSeconds,
    description: 'How long to wait before returning the id instead. The generation keeps running on Luma either way.',
  },
});

/** Build the `character_ref` payload from a flat list of image URLs. */
const characterRef = (images) =>
  Array.isArray(images) && images.length ? { identity0: { images } } : undefined;

/** Build `keyframes` from flat start/end arguments. */
function buildKeyframes(a) {
  const kf = {};
  if (a.start_image_url) kf.frame0 = { type: 'image', url: a.start_image_url };
  else if (a.start_generation_id) kf.frame0 = { type: 'generation', id: a.start_generation_id };
  if (a.end_image_url) kf.frame1 = { type: 'image', url: a.end_image_url };
  else if (a.end_generation_id) kf.frame1 = { type: 'generation', id: a.end_generation_id };
  return Object.keys(kf).length ? kf : undefined;
}

/* ----------------------------------------------------------------- tools -- */

const TOOLS = [
  {
    name: 'luma_generate_image',
    description:
      'Generate an image with Luma Photon. Supports style, composition and character references for consistent looks across a series of images. Returns the asset URL and can save the file locally.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'What to generate. Luma renders text poorly — prefer textless art.' },
        model: openProp(IMAGE_MODELS, 'Image model. photon-1 is higher quality; photon-flash-1 is faster and cheaper.', 'photon-1'),
        aspect_ratio: enumProp(ASPECT_RATIOS, 'Output aspect ratio.', '16:9'),
        format: enumProp(['jpg', 'png'], 'Output file format.'),
        image_ref: refArray('Reference images guiding overall composition and content.'),
        style_ref: refArray('Reference images guiding style only.'),
        character_ref_images: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Up to 4 URLs of the SAME person, used as one identity. The reliable way to keep a character consistent across many images.',
        },
        modify_image_ref: {
          type: 'object',
          description: 'An existing image to modify rather than generate from scratch.',
          properties: {
            url: { type: 'string' },
            weight: { type: 'number', description: 'Lower = further from the original.' },
          },
          required: ['url'],
        },
        save_to: saveToProp('image'),
        ...waitProps(180),
      },
      required: ['prompt'],
    },
    handler: (a) =>
      run({
        path: '/generations/image',
        body: {
          prompt: a.prompt,
          model: a.model ?? 'photon-1',
          aspect_ratio: a.aspect_ratio ?? '16:9',
          format: a.format,
          image_ref: a.image_ref,
          style_ref: a.style_ref,
          character_ref: characterRef(a.character_ref_images),
          modify_image_ref: a.modify_image_ref,
        },
        wait: a.wait ?? true,
        waitSeconds: a.wait_seconds ?? 180,
        saveTo: a.save_to,
      }),
  },

  {
    name: 'luma_generate_video',
    description:
      'Generate a video with Luma Ray, from a text prompt and/or start/end keyframes (image URLs or earlier generation ids). Use keyframes for image-to-video and for chaining shots into a continuous sequence. Videos take minutes.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Describe the motion and the scene, not just the subject.' },
        model: openProp(VIDEO_MODELS, 'Video model. ray-2 is higher quality; ray-flash-2 is faster and cheaper. Newer Ray models can be named here directly.', 'ray-2'),
        aspect_ratio: enumProp(ASPECT_RATIOS, 'Output aspect ratio.', '16:9'),
        resolution: openProp(RESOLUTIONS, 'Output resolution.', '720p'),
        duration: { type: 'string', description: 'Clip length, e.g. "5s" or "9s". Newer Ray models accept longer clips.' },
        loop: { type: 'boolean', description: 'Make the clip loop seamlessly.' },
        start_image_url: { type: 'string', description: 'Image URL to start from (image-to-video).' },
        end_image_url: { type: 'string', description: 'Image URL to end on.' },
        start_generation_id: { type: 'string', description: 'Start from an earlier Luma generation. Use the previous clip to extend a sequence.' },
        end_generation_id: { type: 'string', description: 'End on an earlier Luma generation.' },
        concepts: {
          type: 'array',
          items: { type: 'string' },
          description: 'Camera motion keys, e.g. "push_in". List valid keys with luma_camera_motions.',
        },
        save_to: saveToProp('video'),
        ...waitProps(600),
      },
    },
    handler: (a) =>
      run({
        path: '/generations/video',
        body: {
          prompt: a.prompt,
          model: a.model ?? 'ray-2',
          aspect_ratio: a.aspect_ratio ?? '16:9',
          resolution: a.resolution ?? '720p',
          duration: a.duration,
          loop: a.loop,
          keyframes: buildKeyframes(a),
          concepts: Array.isArray(a.concepts) ? a.concepts.map((key) => ({ key })) : undefined,
        },
        wait: a.wait ?? true,
        waitSeconds: a.wait_seconds ?? 600,
        saveTo: a.save_to,
      }),
  },

  {
    name: 'luma_reframe_image',
    description:
      'Re-aspect an existing image to a new ratio, generating new content to fill the added space (outpainting). Useful for turning one piece of art into 16:9, 9:16 and 1:1 variants.',
    inputSchema: {
      type: 'object',
      properties: {
        image_url: { type: 'string', description: 'Publicly reachable URL of the image to reframe.' },
        aspect_ratio: enumProp(ASPECT_RATIOS, 'Target aspect ratio.'),
        model: openProp(IMAGE_MODELS, 'Image model to use.', 'photon-1'),
        prompt: { type: 'string', description: 'Optional guidance for the newly generated areas.' },
        format: enumProp(['jpg', 'png'], 'Output file format.'),
        save_to: saveToProp('image'),
        ...waitProps(180),
      },
      required: ['image_url', 'aspect_ratio'],
    },
    handler: (a) =>
      run({
        path: '/generations/image/reframe',
        body: {
          generation_type: 'reframe_image',
          media: { url: a.image_url },
          aspect_ratio: a.aspect_ratio,
          model: a.model ?? 'photon-1',
          prompt: a.prompt,
          format: a.format,
        },
        wait: a.wait ?? true,
        waitSeconds: a.wait_seconds ?? 180,
        saveTo: a.save_to,
      }),
  },

  {
    name: 'luma_upscale_video',
    description: 'Upscale a completed Luma video generation to a higher resolution.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Id of a completed video generation.' },
        resolution: openProp(RESOLUTIONS, 'Target resolution.', '1080p'),
        save_to: saveToProp('video'),
        ...waitProps(600),
      },
      required: ['id'],
    },
    handler: (a) =>
      run({
        path: `/generations/${a.id}/upscale`,
        body: { generation_type: 'upscale_video', resolution: a.resolution ?? '1080p' },
        wait: a.wait ?? true,
        waitSeconds: a.wait_seconds ?? 600,
        saveTo: a.save_to,
      }),
  },

  {
    name: 'luma_add_audio',
    description: 'Generate and attach an audio track to a completed Luma video generation.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Id of a completed video generation.' },
        prompt: { type: 'string', description: 'The audio to generate, e.g. "rain on a metal roof, distant thunder".' },
        negative_prompt: { type: 'string', description: 'Sounds to avoid.' },
        save_to: saveToProp('video'),
        ...waitProps(600),
      },
      required: ['id'],
    },
    handler: (a) =>
      run({
        path: `/generations/${a.id}/audio`,
        body: { generation_type: 'add_audio', prompt: a.prompt, negative_prompt: a.negative_prompt },
        wait: a.wait ?? true,
        waitSeconds: a.wait_seconds ?? 600,
        saveTo: a.save_to,
      }),
  },

  {
    name: 'luma_get_generation',
    description:
      'Look up one generation by id: its state (queued, dreaming, completed, failed), failure reason, and asset URL. Optionally download the asset.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The generation id.' },
        save_to: saveToProp('asset'),
        wait: { type: 'boolean', default: false, description: 'Keep polling until it finishes.' },
        wait_seconds: { type: 'number', default: 300, description: 'How long to poll when wait is true.' },
      },
      required: ['id'],
    },
    handler: async (a) => {
      const gen = a.wait
        ? await pollGeneration(a.id, a.wait_seconds ?? 300)
        : await api('GET', `/generations/${a.id}`);
      return summarize(gen, a.save_to);
    },
  },

  {
    name: 'luma_list_generations',
    description: 'List recent generations on the Luma account, newest first. Use to recover ids and asset URLs from earlier work.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', default: 20, description: 'How many to return.' },
        offset: { type: 'number', default: 0, description: 'How many to skip.' },
      },
    },
    handler: async (a) => {
      const params = new URLSearchParams({ limit: String(a.limit ?? 20), offset: String(a.offset ?? 0) });
      const list = await api('GET', `/generations?${params}`);
      const rows = Array.isArray(list) ? list : (list?.generations ?? []);
      return rows.map((g) =>
        compact({
          id: g.id,
          state: g.state,
          generation_type: g.generation_type,
          created_at: g.created_at,
          prompt: g.request?.prompt ? truncate(g.request.prompt, 120) : undefined,
          asset_url: assetUrl(g),
        })
      );
    },
  },

  {
    name: 'luma_camera_motions',
    description: 'List the camera motion concept keys accepted by luma_generate_video (e.g. push_in, orbit_left).',
    inputSchema: { type: 'object', properties: {} },
    handler: () => api('GET', '/generations/concepts/list'),
  },

  {
    name: 'luma_credits',
    description: 'Check the remaining credit balance on the Luma account. Worth calling before a large batch of generations.',
    inputSchema: { type: 'object', properties: {} },
    handler: () => api('GET', '/credits'),
  },
];

/* ------------------------------------------------------------ selfcheck -- */

// `node luma-mcp.mjs --check` verifies the environment and credentials without
// starting the server, so setup problems surface as one clear answer.
if (process.argv.includes('--check')) {
  const line = (ok, text) => console.log(`${ok ? 'ok  ' : 'FAIL'}  ${text}`);
  const major = Number(process.versions.node.split('.')[0]);
  let healthy = true;

  line(major >= 18, `Node ${process.versions.node} (needs 18 or newer)`);
  if (major < 18) healthy = false;

  if (!API_KEY) {
    line(false, 'LUMAAI_API_KEY is not set in this environment');
    healthy = false;
  } else {
    line(true, `LUMAAI_API_KEY is set (ends ...${API_KEY.slice(-4)})`);
    try {
      const credits = await api('GET', '/credits');
      line(true, `Luma API reachable - credit balance: ${credits?.credit_balance ?? 'unknown'}`);
    } catch (err) {
      line(false, redact(err?.message ?? String(err)));
      healthy = false;
    }
  }

  console.log(
    healthy
      ? '\nReady. Register this file as an MCP server, then restart your Claude client.'
      : '\nNot ready - fix the FAIL lines above.'
  );
  process.exit(healthy ? 0 : 1);
}

/* ------------------------------------------------------------ transport -- */

const send = (msg) => process.stdout.write(`${JSON.stringify(msg)}\n`);
const reply = (id, result) => {
  if (id !== undefined && id !== null) send({ jsonrpc: '2.0', id, result });
};
const toolError = (message) => ({ content: [{ type: 'text', text: redact(message) }], isError: true });

async function dispatch(msg) {
  const { id, method, params } = msg ?? {};
  if (!method) return; // a response to something we sent; nothing to do
  const isRequest = id !== undefined && id !== null;

  try {
    switch (method) {
      case 'initialize': {
        const requested = params?.protocolVersion;
        return reply(id, {
          protocolVersion: SUPPORTED_PROTOCOLS.has(requested) ? requested : LATEST_PROTOCOL,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        });
      }
      case 'ping':
        return reply(id, {});
      case 'tools/list':
        return reply(id, {
          tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
        });
      case 'tools/call': {
        const tool = TOOLS.find((t) => t.name === params?.name);
        if (!tool) return reply(id, toolError(`Unknown tool: ${params?.name}`));
        try {
          const out = await tool.handler(params?.arguments ?? {});
          return reply(id, {
            content: [{ type: 'text', text: typeof out === 'string' ? out : JSON.stringify(out, null, 2) }],
          });
        } catch (err) {
          return reply(id, toolError(err?.message ?? String(err)));
        }
      }
      default:
        if (!isRequest) return; // unknown notification — ignore per spec
        return send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
    }
  } catch (err) {
    if (isRequest) {
      send({ jsonrpc: '2.0', id, error: { code: -32603, message: redact(err?.message ?? String(err)) } });
    }
  }
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  let idx;
  while ((idx = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
      continue;
    }
    if (Array.isArray(msg)) for (const m of msg) await dispatch(m);
    else await dispatch(msg);
  }
});
process.stdin.on('end', () => process.exit(0));

if (!API_KEY) {
  process.stderr.write('[luma-mcp] Warning: LUMAAI_API_KEY is not set; tool calls will fail until it is.\n');
}
