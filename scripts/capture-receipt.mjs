import { chromium } from "playwright";
const URL = process.env.PDV_URL || "http://localhost:3000";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: "networkidle" });
await wait(700);
for (let i = 0; i < 3; i++) { await page.click("[data-tour='scan']"); await wait(140); }
await wait(300);
await page.keyboard.press("F2");
await wait(500);
await page.click("button:has-text('Pix')");
await wait(1500);
await page.screenshot({ path: "public/screenshots/06-receipt.png" });
console.log("ok");
await browser.close();
