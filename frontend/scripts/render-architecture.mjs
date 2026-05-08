import fs from "fs";

const template =
  fs.readFileSync(
    "templates/architecture.html",
    "utf8"
  );

fs.writeFileSync(
  "docs/architecture.html",
  template
);

console.log(
  "✅ architecture.html generated"
);