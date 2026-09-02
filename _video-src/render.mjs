// Frame-by-frame render of stage.html -> frames/*.jpg, then ffmpeg -> mp4.
import pw from "/home/user/airbnb-profit-dashboard/node_modules/playwright-core/index.js";
const { chromium } = pw;
import fs from "fs";
import { execFileSync } from "child_process";

const S = "/tmp/claude-0/-home-user/3041f7cf-1bb2-5b31-ad43-70cd566ff700/scratchpad/video";
const FPS = 30;
const mode = process.argv[2] || "full"; // "preview" renders a few key frames as png
const FF = "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", headless: true, args: ["--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(`file://${S}/stage.html`);
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0));
const total = await page.evaluate(() => window.TOTAL);
console.log("total seconds", total.toFixed(2));

if (mode === "preview") {
  fs.mkdirSync(`${S}/preview`, { recursive: true });
  const ts = process.argv.slice(3).map(Number);
  for (const t of ts.length ? ts : [1.5, 3.3, 5.0, 9.5, 13.0, 17.5, 21.0, 25.5, 29.0, 33.5, 37.0, 41.5, total - 1]) {
    await page.evaluate((t) => seek(t), t);
    await page.screenshot({ path: `${S}/preview/t${t.toFixed(1)}.png` });
    console.log("preview", t);
  }
  await browser.close();
  process.exit(0);
}

const FR = `${S}/frames`;
fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR);
const n = Math.ceil(total * FPS);
const t0 = Date.now();
for (let i = 0; i < n; i++) {
  await page.evaluate((t) => seek(t), i / FPS);
  await page.screenshot({ path: `${FR}/f${String(i).padStart(5, "0")}.jpg`, type: "jpeg", quality: 92 });
  if (i % 150 === 0) console.log(`frame ${i}/${n} ${(Date.now() - t0) / 1000 | 0}s`);
}
// poster = a frame from the overview scene
await page.evaluate(() => seek(7.0));
await page.screenshot({ path: `${S}/blackcat-product-video-poster.png` });
await browser.close();

execFileSync(FF, ["-y", "-framerate", String(FPS), "-i", `${FR}/f%05d.jpg`, "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", `${S}/blackcat-product-video.mp4`], { stdio: "inherit" });
console.log("done", `${S}/blackcat-product-video.mp4`);
