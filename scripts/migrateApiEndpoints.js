const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const TARGET_DIRECTORIES = [
  path.join(PROJECT_ROOT, 'client', 'src'),
  path.join(PROJECT_ROOT, 'server')
];

const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'logs', 'coverage', 'build'];

let filesUpdated = 0;
let replacementsMade = 0;

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return FILE_EXTENSIONS.includes(ext);
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('/api/dev/')) {
      return;
    }

    const updatedContent = content.replace(/\/api\/dev\//g, '/api/');

    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      filesUpdated += 1;

      const occurrences = (content.match(/\/api\/dev\//g) || []).length;
      replacementsMade += occurrences;

      console.log(`✅ Updated ${occurrences} occurrence(s) in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
}

function walkDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (EXCLUDE_DIRS.includes(entry.name)) continue;

    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      walkDirectory(entryPath);
    } else if (shouldProcessFile(entryPath)) {
      processFile(entryPath);
    }
  }
}

(function runMigration() {
  console.log('🔄 Migrating legacy /api/dev/ endpoints to /api/ ...');

  TARGET_DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
      walkDirectory(dir);
    }
  });

  console.log('\n📊 Migration Summary');
  console.log(`Files updated: ${filesUpdated}`);
  console.log(`Total replacements: ${replacementsMade}`);
})();
