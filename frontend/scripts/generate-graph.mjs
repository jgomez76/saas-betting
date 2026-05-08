import fs from "fs";
import { execSync } from "child_process";

const deps = JSON.parse(
  fs.readFileSync(
    "docs/dependencies.json",
    "utf8"
  ).replace(/^\uFEFF/, "")
);

let dot = `
digraph SaaSBets {

  rankdir=LR;
  splines=true;
  overlap=false;

  node [
    shape=box,
    style=filled,
    fontname="Arial",
    fontsize=10
  ];

  edge [
    color="#666666"
  ];

  subgraph cluster_frontend {

    label="Frontend (Next.js)";
    color="#3b82f6";

`;

function sanitize(name) {

  return name
    .replace(/[^\w]/g, "_");
}

for (const file of Object.keys(deps)) {

  const id =
    sanitize(file);

  let color =
    "#dbeafe";

  if (file.startsWith("hooks/")) {
    color = "#bfdbfe";
  }

  if (file.startsWith("components/")) {
    color = "#93c5fd";
  }

  if (file.startsWith("context/")) {
    color = "#60a5fa";
  }

  dot += `
    ${id} [
      label="${file}",
      fillcolor="${color}"
    ];
  `;
}

dot += `
  }

  subgraph cluster_backend {

    label="Backend (FastAPI)";
    color="#22c55e";

`;

const backendFiles = [

  "routes.py",
  "services/value.py",
  "services/top_picks.py",
  "services/odds.py",

  "models/value_bet.py",
  "models/user.py",
  "models/top_picks.py",

];

backendFiles.forEach((file) => {

  const id =
    sanitize(file);

  dot += `
    ${id} [
      label="${file}",
      fillcolor="#bbf7d0"
    ];
  `;
});

dot += `
  }
`;

for (const [file, imports] of Object.entries(deps)) {

  const from =
    sanitize(file);

  imports.forEach((imp) => {

    const to =
      sanitize(imp);

    dot += `
      ${from} -> ${to};
    `;
  });
}

dot += `

  hooks_useMatches_ts
    -> services_value_py
    [color="#ef4444", penwidth=2];

  hooks_useTopPicks_ts
    -> services_top_picks_py
    [color="#f59e0b", penwidth=2];

  hooks_useAuth_ts
    -> routes_py
    [color="#8b5cf6", penwidth=2];

`;

dot += `
}
`;

fs.writeFileSync(
  "docs/architecture.dot",
  dot
);

console.log(
  "✅ architecture.dot generated"
);

execSync(
  `dot -Tsvg docs/architecture.dot -o docs/architecture.svg`
);

console.log(
  "✅ architecture.svg generated"
);