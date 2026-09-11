/**
 * z.ai statusline for pi
 *
 * Format: ⚡ 12% cache · 34% ctx · 5% 5hr limit · resets in 4h49m
 *
 * - cache: token-weighted prompt cache hit rate (computed from session usage)
 * - ctx: live context window usage via ctx.getContextUsage()
 * - 5hr limit: usage from the z.ai quota endpoint (cached 60s)
 *
 * All percentages are colour-coded by usage: green -> yellow -> red.
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

interface Stats {
	input: number;
	cacheRead: number;
	cacheWrite: number;
}

export default function (pi: ExtensionAPI) {
	const stats: Stats = { input: 0, cacheRead: 0, cacheWrite: 0 };
	let ctx: ExtensionContext | undefined;
	let lastQuotaText: string | null = null;
	let quotaTimer: ReturnType<typeof setTimeout> | undefined;
	let zaiActive = false;

	function isZaiModel(model: { provider?: string } | undefined | null): boolean {
		return model?.provider === "zai";
	}

	function setActiveModel(model: { provider?: string } | undefined | null) {
		zaiActive = isZaiModel(model);
		update();
		if (zaiActive) refreshQuota();
	}

	function cacheRate(): number | null {
		const total = stats.input + stats.cacheRead + stats.cacheWrite;
		if (!total) return null;
		return Math.round((stats.cacheRead / total) * 100);
	}

	function usageColor(pct: number): "success" | "warning" | "error" {
		if (pct >= 85) return "error";
		if (pct >= 60) return "warning";
		return "success";
	}

	function renderStatus(quotaText: string | null) {
		if (!ctx) return;
		if (!zaiActive) {
			ctx.ui.setStatus("zai-statusline", undefined);
			return;
		}
		const t = ctx.ui.theme;
		const parts: string[] = [];

		const cache = cacheRate();
		if (cache != null) {
			// Higher hit rate is better.
			const col = cache >= 80 ? "success" : "warning";
			parts.push(`⚡ ${t.fg(col, `${cache}%`)}${t.fg("dim", " cache")}`);
		}

		const usage = ctx.getContextUsage();
		if (usage?.percent != null) {
			const pct = Math.round(usage.percent);
			parts.push(`${t.fg(usageColor(pct), `${pct}%`)}${t.fg("dim", " ctx")}`);
		}

		if (quotaText) lastQuotaText = quotaText;
		const quota = quotaText ?? lastQuotaText;
		if (quota) parts.push(quota);

		ctx.ui.setStatus("zai-statusline", parts.length ? parts.join(t.fg("dim", " · ")) : undefined);
	}

	function applyQuota(data: any) {
		const limits: any[] = data?.limits ?? [];
		const hourly = limits.find((l) => l.unit === 3) ?? limits.find((l) => l.unit === 2) ?? limits.find((l) => l.unit === 1);
		if (!hourly || !ctx) return;
		let pct: number | undefined = hourly.percentage;
		if (pct == null && hourly.usage) pct = (100 * (hourly.currentValue ?? 0)) / hourly.usage;
		if (pct == null) return;
		const t = ctx.ui.theme;
		const col = pct < 60 ? "success" : pct < 85 ? "warning" : "error";
		let reset = "";
		if (hourly.nextResetTime) {
			const s = Math.max(0, hourly.nextResetTime / 1000 - Date.now() / 1000);
			const h = Math.floor(s / 3600);
			const m = Math.floor((s % 3600) / 60);
			reset = h ? `${h}h${String(m).padStart(2, "0")}m` : `${m}m`;
		}
		renderStatus(
			`${t.fg(usageColor(Math.round(pct)), `${Math.round(pct)}%`)}${t.fg("dim", ` 5hr limit${reset ? ` · resets in ${reset}` : ""}`)}`,
		);
	}

	function refreshQuota() {
		clearTimeout(quotaTimer);
		if (!zaiActive) return;
		quotaTimer = setTimeout(() => refreshQuota(), 60_000);

		// Only for the z.ai gateway
		let key = "";
		try {
			const auth = JSON.parse(readFileSync(join(homedir(), ".pi", "agent", "auth.json"), "utf8"));
			key = auth?.zai?.key ?? "";
		} catch {}
		if (!key || !ctx) return;

		const cacheFile = join(homedir(), ".pi", "agent", "zai-quota-cache.json");
		try {
			const stat = statSync(cacheFile);
			if (Date.now() - stat.mtimeMs < 60_000) {
				applyQuota(JSON.parse(readFileSync(cacheFile, "utf8")));
				return;
			}
		} catch {}

		fetch("https://api.z.ai/api/monitor/usage/quota/limit", {
			headers: { Authorization: `Bearer ${key}` },
			signal: AbortSignal.timeout(8000),
		})
			.then((r) => r.json())
			.then((d) => {
				if (!d?.success) return;
				try {
					writeFileSync(cacheFile, JSON.stringify(d.data));
				} catch {}
				applyQuota(d.data);
			})
			.catch(() => {});
	}

	function update() {
		renderStatus(lastQuotaText);
	}

	pi.on("session_start", async (event, sessionCtx) => {
		ctx = sessionCtx;
		zaiActive = isZaiModel(sessionCtx.model);
		// Rebuild stats from existing session entries (e.g. restored sessions)
		for (const entry of sessionCtx.sessionManager.getEntries()) {
			const msg: any = (entry as any).message;
			if (msg?.role === "assistant" && msg.usage) {
				stats.input += msg.usage.input ?? 0;
				stats.cacheRead += msg.usage.cacheRead ?? 0;
				stats.cacheWrite += msg.usage.cacheWrite ?? 0;
			}
		}
		update();
		if (zaiActive) refreshQuota();
	});

	pi.on("model_select", async (event) => {
		setActiveModel(event.model);
	});

	pi.on("message_end", async (event) => {
		if (!zaiActive) return;
		const msg: any = event.message;
		if (msg?.role === "assistant" && msg.usage) {
			stats.input += msg.usage.input ?? 0;
			stats.cacheRead += msg.usage.cacheRead ?? 0;
			stats.cacheWrite += msg.usage.cacheWrite ?? 0;
		}
		// Update on every message so the ctx percentage stays fresh.
		update();
	});
}
