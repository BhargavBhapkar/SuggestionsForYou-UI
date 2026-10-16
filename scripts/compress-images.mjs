// Usage: npm run compress:images
// Shrinks public/product-images in place: anything wider/taller than MAX_SIDE is
// resized to fit and re-encoded as WebP. Photos already small enough are left
// alone, so it is safe to re-run after adding new photos.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/product-images");
const MAX_SIDE = 640;
const QUALITY = 78;

const files = (await fs.readdir(DIR)).filter((f) => /\.(webp|jpe?g|png)$/i.test(f));
let before = 0;
let after = 0;
let resized = 0;

for (const file of files) {
  const full = path.join(DIR, file);
  const original = await fs.readFile(full);
  before += original.length;

  const { width = 0, height = 0 } = await sharp(original).metadata();
  if (Math.max(width, height) <= MAX_SIDE) {
    after += original.length;
    continue;
  }

  const out = await sharp(original)
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 5 })
    .toBuffer();

  if (out.length < original.length && path.extname(file).toLowerCase() === ".webp") {
    await fs.writeFile(full, out);
    after += out.length;
    resized++;
  } else {
    after += original.length;
  }
}

const mb = (n) => (n / 1e6).toFixed(1);
console.log(`[images] ${files.length} files, ${resized} resized: ${mb(before)} MB -> ${mb(after)} MB`);
