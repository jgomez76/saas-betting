# SaaSBets Backend Architecture

# ../backend/app/api/routes.py

Type: Routes

## Routes

- GET /fixtures/save/{league_id}/{season}
- GET /value-bets
- GET /odds/save/{league_id}/{season}
- GET /odds/update
- GET /team/{team_id}/matches
- GET /injuries/update
- GET /top-value
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

## Imports

- fastapi
- fastapi.responses
- sqlalchemy
- sqlalchemy.orm
- datetime
- jose
- authlib.integrations.starlette_client
- starlette.config
- collections
- pydantic
- app.core.database
- app.core.config
- app.core.auth
- app.core.security
- app.core.email
- app.models.fixture
- app.models.user
- app.models.analysis
- app.models.top_picks
- app.models.bet
- app.models.favorite
- app.models.value_bet
- app.schemas.auth
- app.services.api_football
- app.services.export
- app.services.format
- app.services.injuries
- app.services.notifications
- app.services.odds
- app.services.value
- app.services.top_picks
- app.services.stats
- uuid
- datetime
- datetime

---

# ../backend/app/core/auth.py

Type: Core

## Imports

- jose
- datetime

---

# ../backend/app/core/config.py

Type: Core

## Imports

- dotenv

---

# ../backend/app/core/database.py

Type: Core

## Imports

- sqlalchemy
- sqlalchemy.orm
- app.core.config

---

# ../backend/app/core/email.py

Type: Core

---

# ../backend/app/core/security.py

Type: Core

## Imports

- datetime
- jose
- passlib.context

---

# ../backend/app/main.py

Type: Python

## Imports

- fastapi
- fastapi.middleware.cors
- fastapi.staticfiles
- app.api.routes
- app.core.database
- starlette.middleware.sessions
- app.core.config

---

# ../backend/app/models/analysis.py

Type: Model

## Imports

- sqlalchemy
- app.core.database
- datetime

---

# ../backend/app/models/bet.py

Type: Model

## Imports

- sqlalchemy
- sqlalchemy.orm
- app.core.database
- datetime
- typing
- app.models.user

---

# ../backend/app/models/favorite.py

Type: Model

## Imports

- sqlalchemy
- app.core.database

---

# ../backend/app/models/fixture.py

Type: Model

## Imports

- sqlalchemy
- app.core.database

---

# ../backend/app/models/injury.py

Type: Model

## Imports

- sqlalchemy
- app.core.database

---

# ../backend/app/models/odds.py

Type: Model

## Imports

- sqlalchemy
- app.core.database

---

# ../backend/app/models/standings.py

Type: Model

## Imports

- sqlalchemy
- app.core.database

---

# ../backend/app/models/top_picks.py

Type: Model

## Imports

- sqlalchemy
- app.core.database
- datetime

---

# ../backend/app/models/top_picks_history.py

Type: Model

## Imports

- sqlalchemy
- app.core.database
- datetime

---

# ../backend/app/models/user.py

Type: Model

## Imports

- sqlalchemy
- sqlalchemy.orm
- app.core.database
- typing
- app.models.bet

---

# ../backend/app/models/value_bet.py

Type: Model

## Imports

- sqlalchemy
- datetime
- app.core.database

---

# ../backend/app/models/__init__.py

Type: Model

## Imports

- .analysis
- .bet
- .favorite
- .fixture
- .injury
- .odds
- .standings
- .top_picks
- .user
- .value_bet

---

# ../backend/app/schemas/auth.py

Type: Schema

## Imports

- pydantic

---

# ../backend/app/services/analysis.py

Type: Service

## Imports

- sqlalchemy.orm
- app.models.fixture

---

# ../backend/app/services/api_football.py

Type: Service

## Imports

- datetime
- sqlalchemy.orm
- app.core.config
- app.models.fixture

---

# ../backend/app/services/context.py

Type: Service

## Imports

- datetime
- app.models.fixture
- app.models.standings

---

# ../backend/app/services/export.py

Type: Service

---

# ../backend/app/services/fixtures.py

Type: Service

## Imports

- sqlalchemy.orm
- app.models.fixture
- app.core.config
- datetime

---

# ../backend/app/services/format.py

Type: Service

---

# ../backend/app/services/injuries.py

Type: Service

## Imports

- sqlalchemy.orm
- app.models.injury
- app.core.config

---

# ../backend/app/services/notifications.py

Type: Service

## Imports

- email.mime.text

---

# ../backend/app/services/odds.py

Type: Service

## Imports

- sqlalchemy.orm
- app.models.odds
- app.core.config

---

# ../backend/app/services/probabilities.py

Type: Service

## Imports

- app.services.stats
- app.services.injuries
- app.services.context

---

# ../backend/app/services/standings_builder.py

Type: Service

## Imports

- sqlalchemy.orm
- app.models.fixture
- app.models.standings

---

# ../backend/app/services/stats.py

Type: Service

## Imports

- sqlalchemy.orm
- app.models.fixture
- app.core.config

---

# ../backend/app/services/team.py

Type: Service

## Imports

- sqlalchemy.orm
- app.models.fixture

---

# ../backend/app/services/top_picks.py

Type: Service

## Imports

- sqlalchemy.orm
- datetime
- app.models.top_picks
- app.models.top_picks_history
- app.models.fixture
- app.services.value

---

# ../backend/app/services/value.py

Type: Service

## Imports

- sqlalchemy.orm
- datetime
- app.models.fixture
- app.models.odds
- app.services.probabilities
- app.services.stats
- app.core.config
- app.services.team

---

# ../backend/scripts/build_standings.py

Type: Python

## Imports

- app.core.database
- app.services.standings_builder

---

# ../backend/scripts/build_top_picks.py

Type: Python

## Imports

- app.core.database
- app.services.top_picks

---

# ../backend/scripts/build_top_picks_v2.py

Type: Python

## Imports

- app.core.database
- app.services.top_picks

---

# ../backend/scripts/build_top_picks_v3.py

Type: Python

## Imports

- app.core.database
- app.services.top_picks

---

# ../backend/scripts/create_admin.py

Type: Python

## Imports

- app.core.database
- app.models.user

---

# ../backend/scripts/create_tables.py

Type: Python

## Imports

- app.core.database
- app.models.top_picks_history

---

# ../backend/scripts/generate_daily_analysis.py

Type: Python

## Imports

- app.core.database
- app.models.analysis
- datetime

---

# ../backend/scripts/generate_value_bets.py

Type: Python

## Imports

- app.core.database
- app.services.value
- app.services.stats
- app.models.value_bet
- datetime

---

# ../backend/scripts/send_value_report.py

Type: Python

## Imports

- app.core.database
- app.services.value
- app.services.export
- app.services.notifications

---

# ../backend/scripts/update_analysis_results.py

Type: Python

## Imports

- app.core.database
- app.models.analysis
- app.models.fixture

---

# ../backend/scripts/update_data.py

Type: Python

## Imports

- datetime
- app.core.database
- app.services.fixtures
- app.services.odds
- app.services.injuries
- app.core.config

---

# ../backend/scripts/update_data_only.py

Type: Python

## Imports

- datetime
- app.core.database
- app.services.fixtures
- app.services.odds
- app.services.injuries
- app.core.config

---

# ../backend/scripts/update_mybets_results.py

Type: Python

## Imports

- app.core.database
- app.models.bet
- app.models.fixture

---

# ../backend/scripts/update_odds_only.py

Type: Python

## Imports

- datetime
- app.core.database
- app.services.odds
- app.core.config

---

# ../backend/scripts/update_results.py

Type: Python

## Imports

- datetime
- app.core.database
- app.models.fixture
- app.core.config

---

# ../backend/scripts/update_top_pick_results.py

Type: Python

## Imports

- app.core.database
- app.services.top_picks

---

