# Luma MCP

An MCP server for [Luma AI](https://lumalabs.ai)'s Dream Machine API. Luma ships
a REST API but no MCP server, so this fills the gap: register it once and Luma
image/video generation is available as tools in **every** project, not just this one.

- **Zero dependencies.** One file, nothing to `npm install`.
- **Node 18+** (uses global `fetch`).

## Setup

Requires **Node 18+** on the machine running the Claude client (`node -v` to check).

1. Create an API key at <https://lumalabs.ai/api/keys>.
2. Note the absolute path to `luma-mcp.mjs` in your clone of this repo.
3. Register it with whichever client you use, below.
4. Restart the client, then confirm it works by asking Claude to check your Luma credits.

### Claude Desktop

Settings → Developer → Edit Config, and merge this in:

```json
{
  "mcpServers": {
    "luma": {
      "command": "node",
      "args": ["/absolute/path/to/tools/luma-mcp/luma-mcp.mjs"],
      "env": { "LUMAAI_API_KEY": "your_key_here" }
    }
  }
}
```

That config file lives at `~/Library/Application Support/Claude/claude_desktop_config.json`
on macOS and `%APPDATA%\Claude\claude_desktop_config.json` on Windows.

### Claude Code

Register at **user scope** so the server loads in every project, not just this one:

```bash
claude mcp add --scope user luma \
  -e LUMAAI_API_KEY=your_key_here \
  -- node /absolute/path/to/tools/luma-mcp/luma-mcp.mjs
```

Verify with `claude mcp list`. Use `--scope project` instead to limit it to one
project, or export `LUMAAI_API_KEY` in your shell and drop the `-e` flag to keep
the key out of config files entirely.

### Check it before wiring it up

```bash
LUMAAI_API_KEY=your_key_here node luma-mcp.mjs --check
```

This verifies your Node version, that the key is set, and that the API answers —
printing the credit balance on success and a specific reason on failure. It exits
non-zero if anything is wrong, and never prints your key.

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

**Every generating tool returns a direct `asset_url`** you can open and save by
hand. Optionally pass `save_to` with a local path and the file is downloaded
there instead (parent directories are created). Either way, save what you want
to keep — Luma's asset URLs expire.

**Model ids are not enforced.** Luma has shipped models faster than they update
their own SDK and OpenAPI spec, so `model`, `resolution` and `duration` accept
any string and forward it to the API unchanged. The known ids are listed in each
tool's schema as hints; if Luma releases something newer, name it directly and it
will work without touching this server.

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
