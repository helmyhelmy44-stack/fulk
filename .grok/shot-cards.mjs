import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { mkdirSync } from "node:fs";

const shots = [
  {
    html: "/workspace/.grok/og-card.html",
    out: "/workspace/.grok/og-raw.png",
    width: 1200,
    height: 630,
  },
  {
    html: "/workspace/.grok/x-banner.html",
    out: "/workspace/.grok/x-banner-raw.png",
    width: 1200,
    height: 264,
  },
];

mkdirSync("/workspace/.grok", { recursive: true });

const browser = await chromium.launch({
  args: ["--font-render-hinting=none", "--disable-lcd-text"],
});

for (const shot of shots) {
  const page = await browser.newPage({
    viewport: { width: shot.width, height: shot.height },
    deviceScaleFactor: 2,
  });
  await page.goto(pathToFileURL(shot.html).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(120);
  await page.screenshot({
    path: shot.out,
    type: "png",
    omitBackground: false,
  });
  await page.close();
  console.log("shot", shot.out);
}

await browser.close();
