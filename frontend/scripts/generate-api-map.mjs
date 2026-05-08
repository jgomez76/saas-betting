import fs from "fs";

const FRONTEND_MAP =
  "docs/app-map.md";

const BACKEND_MAP =
  "docs/backend-map.md";

const OUTPUT =
  "docs/api-map.md";

const frontend =
  fs.readFileSync(
    FRONTEND_MAP,
    "utf8"
  );

const backend =
  fs.readFileSync(
    BACKEND_MAP,
    "utf8"
  );

const endpointRegex =
  /\/[a-zA-Z0-9-_\/]+/g;

const frontendEndpoints =
  [...frontend.matchAll(endpointRegex)]
    .map((m) => m[0]);

const backendEndpoints =
  [...backend.matchAll(endpointRegex)]
    .map((m) => m[0]);

const unique =
  [...new Set([
    ...frontendEndpoints,
    ...backendEndpoints,
  ])];

let md =
  "# SaaSBets API Map\n\n";

for (const endpoint of unique) {

  md += `# ${endpoint}\n\n`;

  const frontendLines =
    frontend
      .split("\n")
      .filter((l) =>
        l.includes(endpoint)
      );

  const backendLines =
    backend
      .split("\n")
      .filter((l) =>
        l.includes(endpoint)
      );

  if (frontendLines.length) {

    md +=
      "## Frontend References\n\n";

    frontendLines.forEach((l) => {
      md += `${l}\n`;
    });

    md += "\n";
  }

  if (backendLines.length) {

    md +=
      "## Backend References\n\n";

    backendLines.forEach((l) => {
      md += `${l}\n`;
    });

    md += "\n";
  }

  md += "---\n\n";
}

fs.writeFileSync(
  OUTPUT,
  md
);

console.log(
  "✅ docs/api-map.md generated"
);