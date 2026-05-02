const { imageSize: sizeOf } = require('image-size');
const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../blog');
const staticDir = path.join(__dirname, '../static');
const outputFile = path.join(__dirname, '../src/data/gallery.json');

const IMAGE_REGEX = /!\[([^\]]*)\]\((\/img\/[^)]+)\)\s*\n\*([^*]+)\*/g;
const IMAGE_NO_CAPTION_REGEX = /!\[([^\]]*)\]\((\/img\/[^)]+)\)(?!\s*\n\*)/g;

const RESPONSIVE_SIZES = [400, 800, 1200];
const FULL_SIZE = 2560;

function getMdFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getMdFiles(fullPath));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      results.push(fullPath);
    }
  }
  return results;
}

function parseImages(mdPath) {
  const content = fs.readFileSync(mdPath, 'utf8');
  const found = new Map();

  let match;
  IMAGE_REGEX.lastIndex = 0;
  while ((match = IMAGE_REGEX.exec(content)) !== null) {
    const [, alt, src, description] = match;
    found.set(src, {
      src,
      title:
        alt.trim() ||
        path.basename(src, path.extname(src)).replace(/[-_]/g, ' '),
      description: description.trim(),
    });
  }

  IMAGE_NO_CAPTION_REGEX.lastIndex = 0;
  while ((match = IMAGE_NO_CAPTION_REGEX.exec(content)) !== null) {
    const [, alt, src] = match;
    if (!found.has(src)) {
      found.set(src, {
        src,
        title:
          alt.trim() ||
          path.basename(src, path.extname(src)).replace(/[-_]/g, ' '),
      });
    }
  }

  return [...found.values()];
}

function getVariantUrl(src, size) {
  const ext = path.extname(src);
  return src.replace(new RegExp(`${escapeRegExp(ext)}$`), `-${size}${ext}`);
}

function getVariantFilePath(src, size) {
  return path.join(staticDir, getVariantUrl(src, size));
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function computeScaledHeight(originalWidth, originalHeight, scaledWidth) {
  return Math.round((originalHeight / originalWidth) * scaledWidth);
}

function computeScaledWidth(originalWidth, originalHeight, scaledHeight) {
  return Math.round((originalWidth / originalHeight) * scaledHeight);
}

function buildResponsiveSources(src, originalWidth, originalHeight) {
  const srcSet = [];

  for (const size of RESPONSIVE_SIZES) {
    const variantFilePath = getVariantFilePath(src, size);
    if (!fs.existsSync(variantFilePath)) continue;

    const isLandscapeOrSquare = originalWidth >= originalHeight;
    const width = isLandscapeOrSquare
      ? size
      : computeScaledWidth(originalWidth, originalHeight, size);
    const height = isLandscapeOrSquare
      ? computeScaledHeight(originalWidth, originalHeight, size)
      : size;

    srcSet.push({
      src: getVariantUrl(src, size),
      width,
      height,
    });
  }

  const fullFilePath = getVariantFilePath(src, FULL_SIZE);
  const full = fs.existsSync(fullFilePath) ? getVariantUrl(src, FULL_SIZE) : src;

  let mainSrc = src;
  let mainWidth = originalWidth;
  let mainHeight = originalHeight;

  if (srcSet.length > 0) {
    const largest = [...srcSet].sort((a, b) => b.width - a.width)[0];
    mainSrc = largest.src;
    mainWidth = largest.width;
    mainHeight = largest.height;
  }

  return {
    src: mainSrc,
    width: mainWidth,
    height: mainHeight,
    ...(srcSet.length > 0 ? { srcSet } : {}),
    ...(full ? { full } : {}),
  };
}

function getOriginalSrcKey(photo) {
  return photo.originalSrc || photo.src;
}

let existingMap = {};
if (fs.existsSync(outputFile)) {
  const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  existingMap = Object.fromEntries(existing.map((p) => [getOriginalSrcKey(p), p]));
}

const allImages = new Map();

for (const mdFile of getMdFiles(blogDir)) {
  for (const img of parseImages(mdFile)) {
    if (!allImages.has(img.src)) {
      allImages.set(img.src, img);
    }
  }
}

const photos = [];

for (const [src, img] of allImages) {
  const filePath = path.join(staticDir, src);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found, skipping: ${filePath}`);
    continue;
  }

  const buffer = fs.readFileSync(filePath);
  const dimensions = sizeOf(buffer);

  if (!dimensions.width || !dimensions.height) {
    console.warn(`⚠️ Could not read dimensions, skipping: ${filePath}`);
    continue;
  }

  const originalWidth = dimensions.width;
  const originalHeight = dimensions.height;

  const existing = existingMap[src] || {};
  const responsive = buildResponsiveSources(src, originalWidth, originalHeight);

  const entry = {
    originalSrc: src,
    src: responsive.src,
    width: responsive.width,
    height: responsive.height,
    title: existing.title || img.title,
    ...(img.description || existing.description
      ? { description: img.description || existing.description }
      : {}),
    ...(responsive.srcSet ? { srcSet: responsive.srcSet } : {}),
    ...(responsive.full ? { full: responsive.full } : {}),
  };

  photos.push(entry);
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(photos, null, 2));

console.log(`✅ Generated gallery.json with ${photos.length} photos`);
photos.forEach((p) => {
  const desc = p.description ? ` | "${p.description}"` : '';
  const srcSetInfo = p.srcSet
    ? ` | srcSet: [${p.srcSet.map((s) => s.width).join(', ')}]`
    : '';
  const fullInfo = p.full ? ` | full: ${p.full}` : '';
  console.log(
    `   ${p.originalSrc} -> ${p.src} (${p.width}x${p.height}) — "${p.title}"${desc}${srcSetInfo}${fullInfo}`
  );
});