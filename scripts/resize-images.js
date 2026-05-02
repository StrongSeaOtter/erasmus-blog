const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const staticImgDir = path.join(__dirname, "../static/img");

const SIZES = [400, 800, 1200, 2560];
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const GIF_EXTENSIONS = new Set([".gif"]);
const GENERATED_SUFFIX_REGEX = /-(400|800|1200|2560)\.(jpe?g|png|webp|avif)$/i;

// Support --force flag to regenerate all variants, overwriting existing files
const FORCE = process.argv.includes("--force");

function walkDir(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

function isProcessableImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext) || GIF_EXTENSIONS.has(ext);
}

function isGeneratedVariant(filePath) {
  return GENERATED_SUFFIX_REGEX.test(path.basename(filePath));
}

function makeVariantPath(filePath, size) {
  const ext = path.extname(filePath);
  const base = filePath.slice(0, -ext.length);
  return `${base}-${size}${ext}`;
}

async function resizeStillImage(filePath) {
  const metadata = await sharp(filePath).metadata();

  if (!metadata.width || !metadata.height) {
    console.warn(`⚠️ Could not read dimensions: ${filePath}`);
    return;
  }

  const longEdge = Math.max(metadata.width, metadata.height);

  for (const size of SIZES) {
    if (longEdge <= size) {
      continue;
    }

    const outputPath = makeVariantPath(filePath, size);

    if (!FORCE && fs.existsSync(outputPath)) {
      console.log(
        `⏭ Exists, skipping: ${path.relative(staticImgDir, outputPath)}`
      );
      continue;
    }

    const resizeOptions =
      metadata.width >= metadata.height
        ? { width: size, withoutEnlargement: true }
        : { height: size, withoutEnlargement: true };

    // Auto-orient based on EXIF metadata, then resize
    // .rotate() without angle reads EXIF Orientation and rotates pixels correctly
    let pipeline = sharp(filePath).rotate().resize(resizeOptions);

    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
    } else if (ext === ".png") {
      pipeline = pipeline.png({ compressionLevel: 9 });
    } else if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: 80 });
    } else if (ext === ".avif") {
      pipeline = pipeline.avif({ quality: 60 });
    }

    await pipeline.toFile(outputPath);
    console.log(`✅ Wrote: ${path.relative(staticImgDir, outputPath)}`);
  }
}

async function main() {
  const files = walkDir(staticImgDir).filter(isProcessableImage);

  const mode = FORCE ? "force (overwrite all)" : "normal (skip existing)";

  console.log(`🔎 Found ${files.length} image files under static/img`);
  console.log(`   Mode: ${mode}`);

  for (const filePath of files) {
    if (isGeneratedVariant(filePath)) {
      continue;
    }

    const ext = path.extname(filePath).toLowerCase();

    if (GIF_EXTENSIONS.has(ext)) {
      console.log(
        `🎞 Skipping GIF (no processing): ${path.relative(staticImgDir, filePath)}`
      );
      continue;
    }

    try {
      await resizeStillImage(filePath);
    } catch (error) {
      console.error(`❌ Failed: ${filePath}`);
      console.error(error);
    }
  }

  console.log("🏁 Done generating image variants.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
