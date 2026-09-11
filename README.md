# pi-config

My [pi](https://pi.dev) coding agent config


<img width="75%" alt="Screenshot of Pi Coding Agent" src="https://github.com/user-attachments/assets/74c1f5f7-6b6e-4cfb-9d38-b0a154b3601e" />

## Install

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
| `settings.json` | Reference settings — packages I use (no secrets) |
| `setup.sh` | Full setup — pulls everything at latest |

Fetched at latest by `setup.sh`, not vendored:
- [@narumitw/pi-plan-mode](https://www.npmjs.com/package/@narumitw/pi-plan-mode) — /plan read-only planning mode
- [android-reverse-engineering](https://github.com/SimoneAvogadro/android-reverse-engineering-skill) — Claude Code plugin; `setup.sh` extracts the inner skill folder into `~/.agents/skills/`
- All npm packages in `settings.json` + the [gtasks CLI](https://github.com/BRO3886/gtasks)
