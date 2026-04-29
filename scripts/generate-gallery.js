const { imageSize: sizeOf } = require('image-size');
const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../blog');
const staticDir = path.join(__dirname, '../static');
const outputFile = path.join(__dirname, '../src/data/gallery.json');

const IMAGE_REGEX = /!\[([^\]]*)\]\((\/img\/[^)]+)\)\s*\n\*([^*]+)\*/g;
const IMAGE_NO_CAPTION_REGEX = /!\[([^\]]*)\]\((\/img\/[^)]+)\)(?!\s*\n\*)/g;

// Walk directory recursively, return all .md/.mdx files
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

// Parse images from a single markdown file
function parseImages(mdPath) {
  const content = fs.readFileSync(mdPath, 'utf8');
  const found = new Map(); // src -> entry, to avoid duplicates within same file

  // Images with captions (italic line right after)
  let match;
  while ((match = IMAGE_REGEX.exec(content)) !== null) {
    const [, alt, src, description] = match;
    found.set(src, {
      src,
      title: alt.trim() || path.basename(src, path.extname(src)).replace(/[-_]/g, ' '),
      description: description.trim(),
    });
  }

  // Images without captions (don't overwrite ones already found with caption)
  while ((match = IMAGE_NO_CAPTION_REGEX.exec(content)) !== null) {
    const [, alt, src] = match;
    if (!found.has(src)) {
      found.set(src, {
        src,
        title: alt.trim() || path.basename(src, path.extname(src)).replace(/[-_]/g, ' '),
      });
    }
  }

  return [...found.values()];
}

// Load existing gallery to preserve manually edited fields
let existingMap = {};
if (fs.existsSync(outputFile)) {
  const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  existingMap = Object.fromEntries(existing.map(p => [p.src, p]));
}

// Collect all images from all blog markdown files, deduplicated by src
const allImages = new Map();

for (const mdFile of getMdFiles(blogDir)) {
  for (const img of parseImages(mdFile)) {
    if (!allImages.has(img.src)) {
      allImages.set(img.src, img);
    }
  }
}

// Build final photos array with dimensions
const photos = [];

for (const [src, img] of allImages) {
  const filePath = path.join(staticDir, src);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found, skipping: ${filePath}`);
    continue;
  }

  const buffer = fs.readFileSync(filePath);
  const { width, height } = sizeOf(buffer);

  const existing = existingMap[src] || {};

  const entry = {
    src,
    width,
    height,
    // Prefer existing manually-edited title, then markdown alt, then filename
    title: existing.title || img.title,
    // Prefer markdown caption, then existing, then omit
    ...(img.description || existing.description
      ? { description: img.description || existing.description }
      : {}),
  };

  photos.push(entry);
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(photos, null, 2));

console.log(`✅ Generated gallery.json with ${photos.length} photos`);
photos.forEach(p => {
  const desc = p.description ? ` | "${p.description}"` : '';
  console.log(`   ${p.src} (${p.width}x${p.height}) — "${p.title}"${desc}`);
});