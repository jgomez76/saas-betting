import { execSync } from "child_process";

console.log(
  "🚀 Generating SaaSBets docs...\n"
);

try {

  console.log(
    "📦 Generating dependencies..."
  );

  execSync(
    `npx madge --ts-config tsconfig.json --extensions ts,tsx app hooks components context lib types --json > docs/dependencies.json`,
    { stdio: "inherit" }
  );

  console.log(
    "🧠 Generating app map..."
  );

  execSync(
    "node scripts/generate-map.mjs",
    { stdio: "inherit" }
  );

  console.log(
    "⚙️ Generating backend map..."
  );

  execSync(
    "node scripts/generate-backend-map.mjs",
    { stdio: "inherit" }
  );

  console.log(
    "🔌 Generating API map..."
  );

  execSync(
    "node scripts/generate-api-map.mjs",
    { stdio: "inherit" }
  );

  console.log(
    "🏗️ Generating architecture..."
  );

  execSync(
    "node scripts/generate-architecture.mjs",
    { stdio: "inherit" }
  );

  console.log(
    "🎨 Generating architecture diagram..."
  );

  execSync(
    "node scripts/generate-diagram.mjs",
    { stdio: "inherit" }
  );

  console.log(
    "🎨 Generating architecture graph..."
  );

  execSync(
    "node scripts/generate-graph.mjs",
    { stdio: "inherit" }
  );

  console.log(
    "🏗️ Generating clean architecture graph..."
  );

  execSync(
    "node scripts/generate-clean-graph.mjs",
    { stdio: "inherit" }
  );

  console.log(
    "🎨 Generating dependency graph..."
  );

  execSync(
    `npx madge --ts-config tsconfig.json --extensions ts,tsx --image docs/dependency-graph.svg app hooks components context lib types`,
    { stdio: "inherit" }
  );

  console.log(
    "🏗️ Generating architecture portal..."
  );

  execSync(
    "node scripts/generate-architecture-data.mjs",
    { stdio: "inherit" }
  );

  execSync(
    "node scripts/render-architecture.mjs",
    { stdio: "inherit" }
  );

  console.log(
    "\n✅ ALL DOCS GENERATED"
  );

} catch (err) {

  console.error(
    "💥 Docs generation failed"
  );

  console.error(err);
}