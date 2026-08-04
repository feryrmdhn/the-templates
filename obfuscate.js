/**
 * obfuscate.js
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC_DIR = ROOT;
const OUT_DIR = path.join(ROOT, 'dist');

const DRY = process.argv.includes('--dry');

const TARGETS = [
  '_shared/api.js',
  '_shared/var.js',
  '_shared/var2.js',
  '_shared/var3.js',
  '_shared/var4.js',
  '_shared/var5.js',
  '_shared/var6.js',
  '_shared/var7.js',
  '_shared/var8.js',
];

fs.readdirSync(SRC_DIR).forEach(function (dir) {
  const jsPath = path.join('_assets', 'js', 'app.js');
  const candidate = path.join(dir, jsPath);
  if (fs.existsSync(path.join(SRC_DIR, candidate))) {
    TARGETS.push(candidate);
  }
});

// ── Obfuscator options ───────────────────────────────────────────────────────
const OPTIONS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.3,
  debugProtection: false,           // dont activate — can be break runtime
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,             // dont rename globals — can be break deps
  selfDefending: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.8,
  unicodeEscapeSequence: false,
  transformObjectKeys: true,
  numbersToExpressions: true,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function processFile(relPath) {
  const srcPath = path.join(SRC_DIR, relPath);
  const outPath = path.join(OUT_DIR, relPath);

  if (!fs.existsSync(srcPath)) {
    console.warn('  [SKIP] not found:', relPath);
    return;
  }

  if (DRY) {
    console.log('  [DRY]', relPath, '→', path.relative(ROOT, outPath));
    return;
  }

  const source = fs.readFileSync(srcPath, 'utf8');
  const obfuscated = JavaScriptObfuscator.obfuscate(source, OPTIONS).getObfuscatedCode();

  ensureDir(outPath);
  fs.writeFileSync(outPath, obfuscated, 'utf8');
  const savings = (((source.length - obfuscated.length) / source.length) * 100).toFixed(1);
  console.log('  [OK]', relPath, `(${source.length} → ${obfuscated.length} bytes, ${savings}%)`);
}

// ── Also copy non-JS files (HTML, CSS, images, etc.) to dist ────────────────
function copyNonJsFiles() {
  const SKIP_DIRS = ['dist', 'node_modules', '.git'];

  function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
      const fullSrc = path.join(dir, entry.name);
      const rel = path.relative(SRC_DIR, fullSrc);

      if (entry.isDirectory()) {
        if (SKIP_DIRS.includes(entry.name)) return;
        walk(fullSrc);
        return;
      }

      // Skip files already handled (JS in TARGETS) and node_modules/package files
      if (rel.endsWith('.js') && TARGETS.includes(rel)) return;
      if (rel === 'obfuscate.js') return;
      if (rel === 'package.json' || rel === 'package-lock.json') return;
      if (rel.startsWith('node_modules')) return;

      const fullOut = path.join(OUT_DIR, rel);
      if (DRY) {
        console.log('  [COPY]', rel);
        return;
      }
      ensureDir(fullOut);
      fs.copyFileSync(fullSrc, fullOut);
    });
  }

  walk(SRC_DIR);
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log('Output dir:', path.relative(ROOT, OUT_DIR) || 'dist', '\n');

TARGETS.forEach(processFile);

copyNonJsFiles();

console.log('\nDone. Deploy folder dist/ to hosting.');
