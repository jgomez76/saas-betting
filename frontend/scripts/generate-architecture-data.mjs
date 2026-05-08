import fs from "fs";

const architecture = {

  frontend: {

    pages: [
      "app/page.tsx"
    ],

    hooks: [
      "useAuth.ts",
      "useMatches.ts",
      "useBets.ts",
      "useTopPicks.ts",
      "useFavorites.ts",
    ],

    components: [
      "Navbar.tsx",
      "Sidebar.tsx",
      "MatchCard.tsx",
      "DashboardHeader.tsx",
      "LeagueSection.tsx",
      "LoginModal.tsx",
    ],

    contexts: [
      "ThemeContext",
      "SubscriptionContext",
      "LanguageProvider",
    ],

    services: [
      "api.ts",
      "stake.ts",
      "format.ts",
    ],
  },

  backend: {

    routes: [
      "/value-bets",
      "/top-picks",
      "/login",
      "/favorites",
      "/bets",
    ],

    services: [
      "value.py",
      "top_picks.py",
      "odds.py",
      "analysis.py",
      "stats.py",
    ],

    models: [
      "User",
      "Bet",
      "Favorite",
      "ValueBet",
      "TopPick",
    ],

    auth: [
      "OAuth",
      "JWT",
      "Email Verification",
    ],
  },

  external: {

    oauth: [
      "Google OAuth",
      "GitHub OAuth",
    ],

    apis: [
      "API-Football",
    ],

    email: [
      "Resend",
    ],
  },

  jobs: [

    "update_data.py",
    "generate_value_bets.py",
    "build_top_picks.py",
  ],

  flows: [

    {
      title: "Authentication",
      steps: [
        "Frontend Login",
        "OAuth / Email",
        "JWT Session",
        "Backend Validation",
      ],
    },

    {
      title: "Match Data",
      steps: [
        "Dashboard",
        "useMatches",
        "/value-bets",
        "value.py",
        "Database",
      ],
    },
  ],
};

fs.writeFileSync(
  "docs/data/architecture.json",
  JSON.stringify(
    architecture,
    null,
    2
  )
);

console.log(
  "✅ architecture.json generated"
);