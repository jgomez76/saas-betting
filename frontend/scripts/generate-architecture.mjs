import fs from "fs";

const appMap =
  fs.readFileSync(
    "docs/app-map.md",
    "utf8"
  );

const backendMap =
  fs.readFileSync(
    "docs/backend-map.md",
    "utf8"
  );

function extractMatches(regex, text) {

  return [
    ...new Set(
      [...text.matchAll(regex)]
        .map((m) => m[0])
    ),
  ];
}

const hooks =
  extractMatches(
    /hooks\/[A-Za-z0-9-_]+\.ts/g,
    appMap
  );

const components =
  extractMatches(
    /components\/[A-Za-z0-9-_\/]+\.tsx/g,
    appMap
  );

const services =
  extractMatches(
    /services\/[A-Za-z0-9-_]+\.py/g,
    backendMap
  );

const models =
  extractMatches(
    /models\/[A-Za-z0-9-_]+\.py/g,
    backendMap
  );

const endpoints =
  extractMatches(
    /(GET|POST|PUT|DELETE)\s\/[A-Za-z0-9-_\/{}]+/g,
    backendMap
  );

let md =
  "# SaaSBets Architecture\n\n";

md +=
  "## Frontend Core Hooks\n\n";

hooks.forEach((h) => {
  md += `- ${h}\n`;
});

md += "\n";

md +=
  "## Frontend Components\n\n";

components
  .slice(0, 25)
  .forEach((c) => {
    md += `- ${c}\n`;
  });

md += "\n";

md +=
  "## Backend Services\n\n";

services.forEach((s) => {
  md += `- ${s}\n`;
});

md += "\n";

md +=
  "## Backend Models\n\n";

models.forEach((m) => {
  md += `- ${m}\n`;
});

md += "\n";

md +=
  "## Main API Endpoints\n\n";

endpoints.forEach((e) => {
  md += `- ${e}\n`;
});

md += "\n";

md +=
  "## Auth Flow\n\n";

md += `
Frontend:
- components/LoginModal.tsx
- hooks/useAuth.ts

Backend:
- GET /auth/google
- GET /auth/github
- POST /login
- POST /oauth-login
- POST /logout
- GET /me
`;

md += "\n";

md +=
  "## Match Flow\n\n";

md += `
Frontend:
- app/page.tsx
- hooks/useMatches.ts

Backend:
- GET /value-bets
- services/value.py
- models/value_bet.py
`;

fs.writeFileSync(
  "docs/architecture.md",
  md
);

console.log(
  "✅ docs/architecture.md generated"
);