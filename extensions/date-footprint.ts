// date-footprint: injects the current date into the system prompt.
// ~15 tokens per turn; rebuilt fresh each turn (no accumulation) so it stays
// correct even in sessions that cross midnight. Portable: pure Intl, no
// subprocesses, follows the system timezone (TZ env / OS setting).
export default function (pi) {
	pi.on("before_agent_start", async (event) => {
		const now = new Date();
		const off = -now.getTimezoneOffset(); // minutes east of UTC
		const sign = off < 0 ? "-" : "+";
		const abs = Math.abs(off);
		const offset = `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
		const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || offset;
		const date = new Intl.DateTimeFormat("en-CA", {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "2-digit",
		}).format(now);
		const line = `Current date: ${date} (${tzName}, ${offset}).`;
		const base = event.systemPrompt ?? "";
		return { systemPrompt: base ? `${base}\n\n${line}` : line };
	});
}
