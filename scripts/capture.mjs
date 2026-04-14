import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve("public/screenshots");
mkdirSync(OUT, { recursive: true });
const URL = process.env.PDV_URL || "http://localhost:3000";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

const save = (name) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false }).then(() => console.log("saved", name));
const addSome = async (n = 5) => { for (let i = 0; i < n; i++) { await page.click("[data-tour='scan']"); await wait(150); } };

await page.goto(URL, { waitUntil: "networkidle" });
await wait(800);
await addSome(5);
await wait(400);
await save("01-main-light");

// dark
await page.click("[data-tour='darkmode']");
await wait(500);
await save("02-main-dark");
await page.click("[data-tour='darkmode']");
await wait(300);

// payment modal
await page.keyboard.press("F2");
await wait(500);
await save("03-payment");
await page.keyboard.press("Escape");
await wait(400);

// fechamento
await page.keyboard.press("F6");
await wait(1200);
await save("04-fechamento");
await page.keyboard.press("Escape");
await wait(400);

// tutorial
await page.click("button[aria-label='Abrir tutorial']");
await wait(800);
await save("05-tutorial");
await page.keyboard.press("Escape");
await wait(400);

// receipt — finalize with pix
await page.keyboard.press("F2");
await wait(500);
await page.click("button:has-text('Pix')");
await wait(300);
await page.click("button:has-text('Confirmar')");
await wait(1000);
await save("06-receipt");

await browser.close();
console.log("done");
