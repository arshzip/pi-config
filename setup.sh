#!/usr/bin/env bash
# Setup for arshzip/pi-config — install packages, extensions, and skills.
# Custom extensions/skills are vendored here; everything with an upstream
# (pi examples, npm packages, gtasks CLI) is pulled at latest, never vendored.
set -euo pipefail

PI_AGENT="$HOME/.pi/agent"
PI_EXT="$PI_AGENT/extensions"
SKILLS_DIR="${PI_SKILLS_DIR:-$HOME/.agents/skills}"
PI_RAW="https://raw.githubusercontent.com/earendil-works/pi/main/packages/coding-agent/examples/extensions"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

command -v pi >/dev/null || { echo "error: pi not found — install it first (https://pi.dev)"; exit 1; }

echo "==> pi-config setup"

# ---------------------------------------------------------------- packages (latest; mirrors settings.json)
PACKAGES=(
	npm:pi-effort
	npm:pi-web-access
	npm:@juicesharp/rpiv-todo
	npm:pi-free
	npm:pi-image-paste
	npm:pi-context-view
	npm:pi-mcp-adapter
	npm:zai-tools-lite
	npm:@juicesharp/rpiv-ask-user-question
	npm:@narumitw/pi-plan-mode
	npm:pi-tool-display
	npm:@juanibiapina/pi-tokyonight
	npm:@pi-kaush/pi-welcome-screen
	git:github.com/arshzip/no-vertical-padding
	https://github.com/nicobailon/pi-powerline-footer
	https://github.com/hasit/pi-community-themes
)
echo "==> installing packages"
for p in "${PACKAGES[@]}"; do
	pi install "$p" >/dev/null 2>&1 && echo "  installed  $p" || echo "  present    $p"
done

# ---------------------------------------------------------------- custom extensions (vendored)
echo "==> installing custom extensions"
mkdir -p "$PI_EXT"
for ext in date-footprint.ts zai-statusline.ts; do
	if [ -f "$SCRIPT_DIR/extensions/$ext" ]; then
		cp "$SCRIPT_DIR/extensions/$ext" "$PI_EXT/$ext"
		echo "  $ext"
	fi
done

# ---------------------------------------------------------------- skills
# gtasks-cli is vendored here (custom wrapper for BRO3886/gtasks).
# android-reverse-engineering comes from its upstream (a Claude Code plugin);
# CC plugins nest the skill under plugins/<name>/skills/<name>/ — pi wants
# just that inner SKILL.md folder, so we extract it into the skills dir.
echo "==> installing skills to $SKILLS_DIR"
mkdir -p "$SKILLS_DIR"
cp -R "$SCRIPT_DIR/skills/." "$SKILLS_DIR/"
ARE_REPO="SimoneAvogadro/android-reverse-engineering-skill"
ARE_DST="$SKILLS_DIR/android-reverse-engineering"
if [ -d "$ARE_DST" ]; then
	echo "  android-reverse-engineering present (rm -rf it to re-fetch latest)"
else
	tmp="$(mktemp -d)"
	if curl -fsSL "https://github.com/$ARE_REPO/archive/refs/heads/master.tar.gz" | tar -xz -C "$tmp"; then
		cp -R "$tmp"/*-master/plugins/android-reverse-engineering/skills/android-reverse-engineering "$ARE_DST"
		echo "  android-reverse-engineering fetched from $ARE_REPO (latest)"
	else
		echo "  warning: could not fetch $ARE_REPO — install manually:" >&2
		echo "    git clone https://github.com/$ARE_REPO && cp -R $ARE_REPO/plugins/android-reverse-engineering/skills/android-reverse-engineering $ARE_DST" >&2
	fi
	rm -rf "$tmp"
fi
ls "$SKILLS_DIR" | sed 's/^/  /'

# ---------------------------------------------------------------- gtasks CLI (upstream: BRO3886/gtasks)
if ! command -v gtasks >/dev/null 2>&1; then
	if command -v go >/dev/null 2>&1; then
		echo "==> installing gtasks CLI (go install @latest)"
		go install github.com/BRO3886/gtasks@latest && echo "  gtasks installed"
	else
		echo "  skipping gtasks CLI (no go toolchain) — see https://github.com/BRO3886/gtasks" >&2
	fi
else
	echo "==> gtasks CLI present"
fi

echo ""
echo "✅ Setup complete. Restart pi to pick up changes."
