import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const ROOT = path.join(__dirname, "..");
const DOCS_DIR = path.join(ROOT, "docs");

const FRONTEND_DIRS = [
  "app",
  "components",
  "hooks",
  "context",
  "lib",
];

function getAllFiles(dir, arr = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getAllFiles(fullPath, arr);
    } else {
      arr.push(fullPath);
    }
  }

  return arr;
}

function extractImports(content) {
  const regex =
    /import\s+.?from\s+["'](.?)["']/g;

  const imports = [];

  let match;

  while ((match = regex.exec(content))) {
    imports.push(match[1]);
  }

  return imports;
}

function extractExports(content) {
  const regex =
    /export\s+(?:default\s+)?(?:function|const|class)\s+([A-Za-z0-9_]+)/g;

  const exports = [];

  let match;

  while ((match = regex.exec(content))) {
    exports.push(match[1]);
  }

  return exports;
}

function extractEndpoints(content) {
  const regex =
    /fetch\(?\$\{?.*?\/([A-Za-z0-9-_\/]+)?/g;

  const endpoints = [];

  let match;

  while ((match = regex.exec(content))) {
    endpoints.push(match[1]);
  }

  return [...new Set(endpoints)];
}

function generate() {

  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR);
  }

  let md = `# SaaSBets App Map\n\n`;

  for (const dir of FRONTEND_DIRS) {

    const fullDir =
      path.join(ROOT, dir);

    if (!fs.existsSync(fullDir)) {
      continue;
    }

    md += `# ${dir.toUpperCase()}\n\n`;

    const files = getAllFiles(fullDir);

    for (const file of files) {

      const relative =
        path.relative(ROOT, file);

      const content =
        fs.readFileSync(file, "utf8");

      const imports =
        extractImports(content);

      const exports =
        extractExports(content);

      const endpoints =
        extractEndpoints(content);

      md += `## ${relative}\n\n`;

      if (exports.length) {
        md += `### Exports\n`;

        exports.forEach((e) => {
          md += `- ${e}\n`;
        });

        md += `\n`;
      }

      if (imports.length) {
        md += `### Imports\n`;

        imports.forEach((i) => {
          md += `- ${i}\n`;
        });

        md += `\n`;
      }

      if (endpoints.length) {
        md += `### API Endpoints\n`;

        endpoints.forEach((e) => {
          md += `- /${e}\n`;
        });

        md += `\n`;
      }
    }
  }

  fs.writeFileSync(
    path.join(DOCS_DIR, "app-map.md"),
    md
  );

  console.log(
    "✅ docs/app-map.md generated"
  );
}

generate();