import fs from "fs";

const md = `
# SaaSBets Architecture Diagram

\`\`\`mermaid
graph TD

page[app/page.tsx]

useMatches[hooks/useMatches.ts]
useAuth[hooks/useAuth.ts]
useTopPicks[hooks/useTopPicks.ts]

api1["GET /value-bets"]
api2["GET /top-picks"]
api3["POST /login"]

service1[services/value.py]
service2[services/top_picks.py]
service3[auth routes]

model1[models/value_bet.py]
model2[models/top_picks.py]
model3[models/user.py]

page --> useMatches
page --> useAuth
page --> useTopPicks

useMatches --> api1
useTopPicks --> api2
useAuth --> api3

api1 --> service1
api2 --> service2
api3 --> service3

service1 --> model1
service2 --> model2
service3 --> model3

\`\`\`
`;

fs.writeFileSync(
  "docs/architecture-diagram.md",
  md
);

console.log(
  "✅ architecture-diagram.md generated"
);