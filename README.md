# pi-config

My [pi](https://pi.dev) coding agent config, published as a pi package.

```bash
pi install git:github.com/arshzip/pi-config
```

or run the full setup (packages + extensions + skills):

```bash
git clone https://github.com/arshzip/pi-config && cd pi-config && ./setup.sh
```

## What's inside

| Path | What |
|---|---|
| `extensions/date-footprint.ts` | Injects current date + timezone into the system prompt (~15 tokens) |
| `extensions/zai-statusline.ts` | Statusline: z.ai cache hit rate + 5hr limit usage |
| `skills/gtasks-cli/` | Google Tasks CLI skill (upstream CLI: [BRO3886/gtasks](https://github.com/BRO3886/gtasks)) |
| `AGENTS.md` | Global instructions |
| `settings.json` / `mcp.json` | Reference settings — packages I use + MCP servers (no secrets) |
| `setup.sh` | Full setup — pulls everything at latest |

Fetched at latest by `setup.sh`, not vendored:
- [plan-mode](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/plan-mode) — from pi's official examples
- [android-reverse-engineering](https://github.com/SimoneAvogadro/android-reverse-engineering-skill) — Claude Code plugin; `setup.sh` extracts the inner skill folder into `~/.agents/skills/`
- All npm packages in `settings.json` + the [gtasks CLI](https://github.com/BRO3886/gtasks)
