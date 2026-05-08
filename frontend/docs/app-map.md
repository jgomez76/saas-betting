# SaaSBets Architecture

## Most Used Files

- lib/i18n/LanguageProvider.tsx (22 imports)
- lib/api.ts (6 imports)
- types/bet.ts (6 imports)
- lib/stake.ts (5 imports)
- types/match.ts (5 imports)
- context/SubscriptionContext.tsx (4 imports)
- lib/config/leagues.ts (4 imports)
- components/ui/match-ui.tsx (3 imports)
- lib/i18n/translations.ts (3 imports)
- context/ThemeContext.tsx (2 imports)

---

# app/account/page.tsx

Type: App

## Dependencies

- lib/api.ts
- lib/i18n/LanguageProvider.tsx

---

# app/globals.css

Type: App

## Used By

- app/layout.tsx

---

# app/layout.tsx

Type: App

## Dependencies

- app/globals.css
- app/providers.tsx
- context/SubscriptionContext.tsx
- context/ThemeContext.tsx
- lib/i18n/LanguageProvider.tsx

---

# app/oauth-disabled/page.tsx

Type: App

---

# app/oauth-success/page.tsx

Type: App

---

# app/page.tsx

Type: App

## Dependencies

- components/AnalysisModal.tsx
- components/BetsModal.tsx
- components/LoginModal.tsx
- components/Navbar.tsx
- components/ProfileModal.tsx
- components/ResultsView.tsx
- components/SettingsView.tsx
- components/Sidebar.tsx
- components/StandingsView.tsx
- components/TopValueModal.tsx
- components/cards/MatchCard.tsx
- components/dashboard/DashboardHeader.tsx
- components/dashboard/LeagueSection.tsx
- components/modals/PendingBetModal.tsx
- components/modals/TeamModal.tsx
- components/ui/match-ui.tsx
- context/SubscriptionContext.tsx
- hooks/useAuth.ts
- hooks/useBets.ts
- hooks/useFavorites.ts
- hooks/useFilters.ts
- hooks/useMatches.ts
- hooks/useTopPicks.ts
- lib/i18n/LanguageProvider.tsx
- lib/stake.ts
- types/bet.ts
- types/match.ts

---

# app/profile/page.tsx

Type: App

## Dependencies

- lib/api.ts
- lib/i18n/LanguageProvider.tsx

---

# app/providers.tsx

Type: App

## Used By

- app/layout.tsx

---

# app/reactivate/page.tsx

Type: App

---

# app/reset/page.tsx

Type: App

## Dependencies

- lib/api.ts
- lib/i18n/LanguageProvider.tsx

---

# app/verify/page.tsx

Type: App

## Dependencies

- lib/api.ts
- lib/i18n/LanguageProvider.tsx

---

# components/AnalysisModal.tsx

Type: Component

## Dependencies

- lib/i18n/LanguageProvider.tsx

## Used By

- app/page.tsx

---

# components/BetsModal.tsx

Type: Component

## Dependencies

- lib/format.ts
- lib/i18n/LanguageProvider.tsx
- lib/i18n/config.ts
- lib/i18n/translations.ts
- types/bet.ts

## Used By

- app/page.tsx

---

# components/DeleteAccountModal.tsx

Type: Component

## Dependencies

- lib/i18n/LanguageProvider.tsx

## Used By

- components/SettingsView.tsx

---

# components/FavoriteLeagues.tsx

Type: Component

## Dependencies

- lib/config/leagues.ts
- lib/i18n/LanguageProvider.tsx

## Used By

- components/SettingsView.tsx

---

# components/LoginModal.tsx

Type: Component

## Dependencies

- lib/i18n/LanguageProvider.tsx

## Used By

- app/page.tsx

---

# components/Navbar.tsx

Type: Component

## Dependencies

- lib/config/leagues.ts
- lib/i18n/LanguageProvider.tsx

## Used By

- app/page.tsx

---

# components/PremiumLock.tsx

Type: Component

## Dependencies

- lib/i18n/LanguageProvider.tsx

## Used By

- components/TopPicksCard.tsx

---

# components/ProfileModal.tsx

Type: Component

## Dependencies

- lib/i18n/LanguageProvider.tsx

## Used By

- app/page.tsx
- components/SettingsView.tsx

---

# components/ProfileSettingsModal.tsx

Type: Component

---

# components/ResultsView.tsx

Type: Component

## Dependencies

- lib/config/leagues.ts
- lib/i18n/LanguageProvider.tsx

## Used By

- app/page.tsx

---

# components/SettingsView.tsx

Type: Component

## Dependencies

- components/DeleteAccountModal.tsx
- components/FavoriteLeagues.tsx
- components/ProfileModal.tsx
- components/StakeSettings.tsx
- context/SubscriptionContext.tsx
- context/ThemeContext.tsx
- lib/i18n/LanguageProvider.tsx
- types/user.ts

## Used By

- app/page.tsx

---

# components/Sidebar.tsx

Type: Component

## Dependencies

- lib/i18n/LanguageProvider.tsx

## Used By

- app/page.tsx

---

# components/StakeSettings.tsx

Type: Component

## Dependencies

- lib/i18n/LanguageProvider.tsx
- lib/stake.ts

## Used By

- components/SettingsView.tsx

---

# components/StandingsView.tsx

Type: Component

## Dependencies

- lib/config/leagues.ts
- lib/i18n/LanguageProvider.tsx

## Used By

- app/page.tsx

---

# components/TopPicksCard.tsx

Type: Component

## Dependencies

- components/PremiumLock.tsx
- lib/i18n/LanguageProvider.tsx
- lib/i18n/config.ts

## Used By

- components/dashboard/DashboardHeader.tsx

---

# components/TopValueModal.tsx

Type: Component

## Dependencies

- lib/api.ts
- lib/i18n/LanguageProvider.tsx

## Used By

- app/page.tsx

---

# components/TopValueTable.tsx

Type: Component

## Dependencies

- lib/api.ts
- lib/i18n/LanguageProvider.tsx

---

# components/cards/MatchCard.tsx

Type: Component

## Dependencies

- components/ui/format-match-date.ts
- components/ui/match-ui.tsx
- lib/stake.ts
- types/bet.ts
- types/match.ts

## Used By

- app/page.tsx
- components/dashboard/LeagueSection.tsx

---

# components/dashboard/DashboardHeader.tsx

Type: Component

## Dependencies

- components/TopPicksCard.tsx

## Used By

- app/page.tsx

---

# components/dashboard/LeagueSection.tsx

Type: Component

## Dependencies

- components/cards/MatchCard.tsx
- types/bet.ts
- types/match.ts

## Used By

- app/page.tsx

---

# components/modals/PendingBetModal.tsx

Type: Component

## Dependencies

- lib/stake.ts
- types/bet.ts

## Used By

- app/page.tsx

---

# components/modals/TeamModal.tsx

Type: Component

## Dependencies

- components/ui/match-ui.tsx
- types/stats.ts

## Used By

- app/page.tsx

---

# components/ui/format-match-date.ts

Type: Component

## Used By

- components/cards/MatchCard.tsx

---

# components/ui/match-ui.tsx

Type: Component

## Used By

- app/page.tsx
- components/cards/MatchCard.tsx
- components/modals/TeamModal.tsx

---

# context/SubscriptionContext.tsx

Type: Context

## Used By

- app/layout.tsx
- app/page.tsx
- components/SettingsView.tsx
- hooks/useAuth.ts

---

# context/ThemeContext.tsx

Type: Context

## Used By

- app/layout.tsx
- components/SettingsView.tsx

---

# hooks/useAuth.ts

Type: Hook

## Dependencies

- context/SubscriptionContext.tsx

## Used By

- app/page.tsx

---

# hooks/useBets.ts

Type: Hook

## Dependencies

- types/bet.ts

## Used By

- app/page.tsx

---

# hooks/useFavorites.ts

Type: Hook

## Used By

- app/page.tsx

---

# hooks/useFilters.ts

Type: Hook

## Used By

- app/page.tsx

---

# hooks/useMatches.ts

Type: Hook

## Dependencies

- types/match.ts

## Used By

- app/page.tsx

---

# hooks/useTopPicks.ts

Type: Hook

## Used By

- app/page.tsx

---

# lib/api.ts

Type: Library

## Used By

- app/account/page.tsx
- app/profile/page.tsx
- app/reset/page.tsx
- app/verify/page.tsx
- components/TopValueModal.tsx
- components/TopValueTable.tsx

---

# lib/config/leagues.ts

Type: Library

## Used By

- components/FavoriteLeagues.tsx
- components/Navbar.tsx
- components/ResultsView.tsx
- components/StandingsView.tsx

---

# lib/format.ts

Type: Library

## Dependencies

- lib/i18n/translations.ts

## Used By

- components/BetsModal.tsx

---

# lib/i18n/LanguageProvider.tsx

Type: Library

## Dependencies

- lib/i18n/translations.ts

## Used By

- app/account/page.tsx
- app/layout.tsx
- app/page.tsx
- app/profile/page.tsx
- app/reset/page.tsx
- app/verify/page.tsx
- components/AnalysisModal.tsx
- components/BetsModal.tsx
- components/DeleteAccountModal.tsx
- components/FavoriteLeagues.tsx
- components/LoginModal.tsx
- components/Navbar.tsx
- components/PremiumLock.tsx
- components/ProfileModal.tsx
- components/ResultsView.tsx
- components/SettingsView.tsx
- components/Sidebar.tsx
- components/StakeSettings.tsx
- components/StandingsView.tsx
- components/TopPicksCard.tsx
- components/TopValueModal.tsx
- components/TopValueTable.tsx

---

# lib/i18n/config.ts

Type: Library

## Used By

- components/BetsModal.tsx
- components/TopPicksCard.tsx

---

# lib/i18n/translations.ts

Type: Library

## Used By

- components/BetsModal.tsx
- lib/format.ts
- lib/i18n/LanguageProvider.tsx

---

# lib/stake.ts

Type: Library

## Used By

- app/page.tsx
- components/StakeSettings.tsx
- components/cards/MatchCard.tsx
- components/modals/PendingBetModal.tsx
- lib/topPicks.ts

---

# lib/topPicks.ts

Type: Library

## Dependencies

- lib/stake.ts
- types/match.ts

---

# types/bet.ts

Type: Type

## Used By

- app/page.tsx
- components/BetsModal.tsx
- components/cards/MatchCard.tsx
- components/dashboard/LeagueSection.tsx
- components/modals/PendingBetModal.tsx
- hooks/useBets.ts

---

# types/match.ts

Type: Type

## Dependencies

- types/stats.ts

## Used By

- app/page.tsx
- components/cards/MatchCard.tsx
- components/dashboard/LeagueSection.tsx
- hooks/useMatches.ts
- lib/topPicks.ts

---

# types/next-auth.d.ts

Type: Type

---

# types/stats.ts

Type: Type

## Used By

- components/modals/TeamModal.tsx
- types/match.ts

---

# types/user.ts

Type: Type

## Used By

- components/SettingsView.tsx

---

