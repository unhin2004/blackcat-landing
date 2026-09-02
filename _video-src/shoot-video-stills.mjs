// 4K (1920x1080 @2x) dark-mode stills of the demo account for the product video.
import pw from "/home/user/airbnb-profit-dashboard/node_modules/playwright-core/index.js";
const { chromium } = pw;
import fs from "fs";

const S = "/tmp/claude-0/-home-user/3041f7cf-1bb2-5b31-ad43-70cd566ff700/scratchpad";
const OUT = `${S}/video-stills`;
fs.mkdirSync(OUT, { recursive: true });
const token = fs.readFileSync(`${S}/jar.txt`, "utf8").match(/next-auth\.session-token\s+(\S+)/)[1];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, colorScheme: "dark" });
await ctx.addCookies([{ name: "next-auth.session-token", value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }]);
await ctx.addInitScript(() => {
  localStorage.setItem("blackcat_last_seen_version", "1.4.0");
  localStorage.setItem("cookie-consent", "all");
  localStorage.setItem("onboardingStep", "-1");
  sessionStorage.setItem("verify-banner-dismissed", "1");
});
const page = await ctx.newPage();

const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
async function shot(name, url, opts = {}) {
  if (ONLY && !ONLY.includes(name)) return;
  await page.goto(`http://localhost:3000${url}`, { waitUntil: "networkidle" });
  await sleep(opts.wait ?? 2500);
  await page.addStyleTag({ content: "nextjs-portal{display:none!important} button[class*=\"bottom-6\"][class*=\"right-6\"],div[class*=\"bottom-6\"][class*=\"right-6\"]{display:none!important}" });
  if (opts.prep) await opts.prep();
  await sleep(300);
  await page.evaluate(() => { document.querySelectorAll("nextjs-portal, .fixed.bottom-6.right-6, [class*='bottom-6'][class*='right-6'], [aria-label='Send feedback'], button[aria-label*='feedback' i]").forEach((e) => e.remove()); });
  await sleep(200);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("shot", name);
}

// Overview — last 12 months so the KPIs are full.
await shot("overview", "/", { wait: 3500, prep: async () => { await page.locator("button", { hasText: "Year to Date" }).click(); await sleep(3500); } });

// Bank sync — scrolled to the review queue with merchant groups.
await shot("bank-sync", "/bank-sync", {
  prep: async () => {
    const h = page.locator("text=Review imported transactions");
    if (await h.count()) { await h.scrollIntoViewIfNeeded(); await page.mouse.wheel(0, 40); await sleep(1000); }
    const sc = page.locator("summary", { hasText: "Show individual charges" }).first();
    if (await sc.count()) { await sc.click(); await sleep(800); }
  },
});

// Occupancy calendar (current month has seeded stays).
await shot("occupancy", "/occupancy", { wait: 3000, prep: async () => { await page.locator("h2:has-text(\"September 2026\")").locator("xpath=..").locator("button").first().click(); await sleep(1200); } });

// Tax reports / Schedule E.
await shot("tax-reports", "/tax-reports", { wait: 3000 });

// Expenses + analytics for variety.
await shot("expenses", "/expenses", { wait: 3000 });
await shot("analytics", "/analytics", { wait: 3500, prep: async () => { await page.locator("button", { hasText: "All Time" }).click(); await sleep(3500); } });
await shot("ai-insights", "/ai-insights", { wait: 3500 });

await browser.close();
console.log("done");
