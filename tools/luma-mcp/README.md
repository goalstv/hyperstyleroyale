# Luma MCP

An MCP server for [Luma AI](https://lumalabs.ai)'s Dream Machine API. Luma ships
a REST API but no MCP server, so this fills the gap: register it once and Luma
image/video generation is available as tools in **every** project, not just this one.

- **Zero dependencies.** One file, nothing to `npm install`.
- **Node 18+** (uses global `fetch`).

## Setup

1. Create an API key at <https://lumalabs.ai/api/keys>.
2. Register the server with Claude Code at **user scope**, so it loads in every project:

```bash
claude mcp add --scope user luma \
  -e LUMAAI_API_KEY=your_key_here \
  -- node /absolute/path/to/tools/luma-mcp/luma-mcp.mjs
```

Verify with `claude mcp list`. To scope a key per-project instead, use
`--scope project`; to keep the key out of config entirely, export
`LUMAAI_API_KEY` in your shell and drop the `-e` flag.

The server reads `LUMAAI_API_KEY` (or `LUMA_API_KEY`). `LUMAAI_BASE_URL`
overrides the API base, which is how the test suite points at a mock.

## Tools

| Tool | What it does |
|---|---|
| `luma_generate_image` | Generate an image with Photon. Style, composition and character references. |
| `luma_generate_video` | Generate a video with Ray, from a prompt and/or start/end keyframes. |
| `luma_reframe_image` | Outpaint an image into a new aspect ratio. |
| `luma_upscale_video` | Upscale a finished video to a higher resolution. |
| `luma_add_audio` | Generate and attach an audio track to a finished video. |
| `luma_get_generation` | Look up one generation by id; optionally poll and download. |
| `luma_list_generations` | List recent generations, to recover ids and asset URLs. |
| `luma_camera_motions` | List camera motion keys valid for `concepts`. |
| `luma_credits` | Check the remaining credit balance. |

## Things worth knowing

**Luma's asset URLs expire.** Pass `save_to` with a local path on any generating
tool and the finished file is downloaded there (parent directories are created).
If you don't save it, you may not be able to fetch it later.

**Videos take minutes.** Generating tools wait by default and return the asset
when it's ready. If the wait window elapses the call still returns the generation
id plus instructions to poll — the job keeps running on Luma's side either way.
Pass `wait: false` to fire off a batch and collect results afterwards.

**Character consistency.** `character_ref_images` takes up to 4 URLs of the same
person and treats them as one identity. That is far more reliable than describing
a character in the prompt when you need the same face across many images.

**Cost.** Credits are consumed per generation; `photon-flash-1` and `ray-flash-2`
are the cheaper, faster variants. Call `luma_credits` before a large batch.

## Tests

```bash
npm test
```

Runs the server over real stdio JSON-RPC against a mock Luma API
(`test/mock-luma.mjs`) — no credits spent, no network needed. Covers the MCP
handshake and protocol negotiation, the submit → poll → download → save flow,
keyframes and reference payloads, wait timeouts, and credential handling
(including that the API key is redacted from error output).
