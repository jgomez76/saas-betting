import fs from "fs";
import path from "path";

const BACKEND_ROOT =
  "../backend";

const OUTPUT =
  "docs/backend-map.md";

function getAllPyFiles(dir, arr = []) {

  const files =
    fs.readdirSync(dir);

  const ignored = [
    "venv",
    "_pycache_",
    ".git",
  ];

  if (
    ignored.some((i) =>
      dir.includes(i)
    )
  ) {
    return arr;
  }

  for (const file of files) {

    const full =
      path.join(dir, file);

    const stat =
      fs.statSync(full);

    if (stat.isDirectory()) {
      getAllPyFiles(full, arr);
    } else if (file.endsWith(".py")) {
      arr.push(full);
    }
  }

  return arr;
}

function extractRoutes(content) {

  const regex =
    /@router\.(get|post|put|delete)\("([^"]+)"/g;

  const routes = [];

  let match;

  while ((match = regex.exec(content))) {

    routes.push({
      method:
        match[1].toUpperCase(),

      path:
        match[2],
    });
  }

  return routes;
}

function extractImports(content) {

  const regex =
    /from\s+([A-Za-z0-9_\.]+)\s+import/g;

  const imports = [];

  let match;

  while ((match = regex.exec(content))) {
    imports.push(match[1]);
  }

  return imports;
}

function getFileType(file) {

  if (file.includes("/routes")) {
    return "Routes";
  }

  if (file.includes("/services")) {
    return "Service";
  }

  if (file.includes("/models")) {
    return "Model";
  }

  if (file.includes("/schemas")) {
    return "Schema";
  }

  if (file.includes("/core")) {
    return "Core";
  }

  return "Python";
}

const files =
  getAllPyFiles(BACKEND_ROOT);

let md =
  "# SaaSBets Backend Architecture\n\n";

for (const file of files) {

  const relative =
    file.replace(
      /\\/g,
      "/"
    );

  const content =
    fs.readFileSync(file, "utf8");

  const routes =
    extractRoutes(content);

  const imports =
    extractImports(content);

  md += `# ${relative}\n\n`;

  md += `Type: ${getFileType(relative)}\n\n`;

  if (routes.length) {

    md += "## Routes\n\n";

    for (const r of routes) {

      md += `- ${r.method} ${r.path}\n`;
    }

    md += "\n";
  }

  if (imports.length) {

    md += "## Imports\n\n";

    for (const imp of imports) {
      md += `- ${imp}\n`;
    }

    md += "\n";
  }

  md += "---\n\n";
}

fs.writeFileSync(
  OUTPUT,
  md
);

console.log(
  "✅ docs/backend-map.md generated"
);