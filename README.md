# pi-config

My [pi](https://pi.dev) coding agent config, published as a pi package.

```bash
pi install git:github.com/arshzip/pi-config
```

## What's inside

| Path | What |
|---|---|
| `extensions/date-footprint.ts` | Injects current date + timezone into the system prompt (~15 tokens) |
| `extensions/zai-statusline.ts` | Statusline: z.ai cache hit rate + 5hr limit usage |
| `extensions/plan-mode/` | Plan-mode extension |
| `skills/android-reverse-engineering/` | APK/XAPK decompilation, API endpoint extraction (jadx/Vineflower) |
| `skills/gtasks-cli/` | Google Tasks CLI management (upstream: [BRO3886/gtasks](https://github.com/BRO3886/gtasks)) |
| `AGENTS.md` | Global instructions |
| `settings.json` / `mcp.json` | Reference settings — packages I use + MCP servers (no secrets) |

Secrets (`auth.json`, `models-store.json`, sessions, tokens) stay local — never commit those.
