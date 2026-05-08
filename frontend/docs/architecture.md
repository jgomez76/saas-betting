# SaaSBets Architecture

## Frontend Core Hooks

- hooks/useAuth.ts
- hooks/useBets.ts
- hooks/useFavorites.ts
- hooks/useFilters.ts
- hooks/useMatches.ts
- hooks/useTopPicks.ts

## Frontend Components

- components/ui/match-ui.tsx
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
- components/DeleteAccountModal.tsx
- components/FavoriteLeagues.tsx
- components/PremiumLock.tsx
- components/TopPicksCard.tsx
- components/ProfileSettingsModal.tsx
- components/StakeSettings.tsx
- components/TopValueTable.tsx

## Backend Services

- services/analysis.py
- services/api_football.py
- services/context.py
- services/export.py
- services/fixtures.py
- services/format.py
- services/injuries.py
- services/notifications.py
- services/odds.py
- services/probabilities.py
- services/standings_builder.py
- services/stats.py
- services/team.py
- services/top_picks.py
- services/value.py

## Backend Models

- models/analysis.py
- models/bet.py
- models/favorite.py
- models/fixture.py
- models/injury.py
- models/odds.py
- models/standings.py
- models/top_picks.py
- models/top_picks_history.py
- models/user.py
- models/value_bet.py
- models/__init__.py

## Main API Endpoints

- GET /fixtures/save/{league_id}/{season}
- GET /value-bets
- GET /odds/save/{league_id}/{season}
- GET /odds/update
- GET /team/{team_id}/matches
- GET /injuries/update
- GET /top-value
- GET /fixture/{fixture_id}/result
- GET /analysis
- GET /leagues
- GET /results/{league}
- GET /standings/{league}
- GET /leagues-selected
- GET /auth/google
- GET /auth/github
- GET /auth/google/callback
- GET /auth/github/callback
- POST /login
- GET /me
- POST /register
- POST /logout
- GET /verify
- POST /forgot-password
- POST /reset-password
- POST /deactivate-account
- POST /request-reactivation
- GET /reactivate-account
- POST /resend-verification
- POST /oauth-login
- PUT /update-profile
- PUT /change-password
- POST /upload-avatar
- GET /top-picks
- POST /top-picks/generate
- GET /bets
- POST /bets
- DELETE /bets/{bet_id}
- GET /favorites
- POST /favorites
- DELETE /favorites/{fixture_id}
- GET /team-stats/{team_id}
- GET /league-stats/{league_id}

## Auth Flow


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

## Match Flow


Frontend:
- app/page.tsx
- hooks/useMatches.ts

Backend:
- GET /value-bets
- services/value.py
- models/value_bet.py
