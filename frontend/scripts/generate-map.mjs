import fs from "fs";
import path from "path";

const jsonPath =
  path.join("docs", "dependencies.json");

const outputPath =
  path.join("docs", "app-map.md");

const raw = fs
  .readFileSync(jsonPath, "utf8")
  .replace(/^\uFEFF/, "");

const deps =
  JSON.parse(raw);

function getFileType(file) {

  if (file.startsWith("hooks/")) {
    return "Hook";
  }

  if (file.startsWith("components/")) {
    return "Component";
  }

  if (file.startsWith("context/")) {
    return "Context";
  }

  if (file.startsWith("lib/")) {
    return "Library";
  }

  if (file.startsWith("types/")) {
    return "Type";
  }

  if (file.startsWith("app/")) {
    return "App";
  }

  return "Unknown";
}

function extractEndpoints(file) {

  const fullPath =
    path.join(process.cwd(), file);

  if (!fs.existsSync(fullPath)) {
    return [];
  }

  const content =
    fs.readFileSync(fullPath, "utf8");

  const regex =
    /fetch\(?\$\{?.*?\/([A-Za-z0-9-_\/]+)?/g;

  const endpoints = [];

  let match;

  while ((match = regex.exec(content))) {
    endpoints.push("/" + match[1]);
  }

  return [...new Set(endpoints)];
}

function getUsedBy(target) {

  const usedBy = [];

  for (const [file, imports] of Object.entries(deps)) {

    if (imports.includes(target)) {
      usedBy.push(file);
    }
  }

  return usedBy;
}

function getMostUsedFiles() {

  const usageMap = {};

  for (const imports of Object.values(deps)) {

    for (const imp of imports) {

      usageMap[imp] =
        (usageMap[imp] || 0) + 1;
    }
  }

  return Object.entries(usageMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}

let md =
  "# SaaSBets Architecture\n\n";

md +=
  "## Most Used Files\n\n";

const mostUsed =
  getMostUsedFiles();

for (const [file, count] of mostUsed) {

  md += `- ${file} (${count} imports)\n`;
}

md += "\n---\n\n";

for (const [file, imports] of Object.entries(deps)) {

  md += `# ${file}\n\n`;

  md += `Type: ${getFileType(file)}\n\n`;

  const endpoints =
    extractEndpoints(file);

  if (endpoints.length) {

    md += "## API Endpoints\n\n";

    for (const ep of endpoints) {
      md += `- ${ep}\n`;
    }

    md += "\n";
  }

  if (imports.length) {

    md += "## Dependencies\n\n";

    for (const imp of imports) {
      md += `- ${imp}\n`;
    }

    md += "\n";
  }

  const usedBy =
    getUsedBy(file);

  if (usedBy.length) {

    md += "## Used By\n\n";

    for (const u of usedBy) {
      md += `- ${u}\n`;
    }

    md += "\n";
  }

  md += "---\n\n";
}

fs.writeFileSync(outputPath, md);

console.log(
  "✅ docs/app-map.md generated"
);