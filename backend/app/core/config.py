import os
from dotenv import load_dotenv

load_dotenv()

API_FOOTBALL_KEY = os.getenv("API_FOOTBALL_KEY")

API_KEY_EUROPE = os.getenv(
    "API_FOOTBALL_KEY_EUROPE"
)

API_KEY_AMERICA = os.getenv(
    "API_FOOTBALL_KEY_AMERICA"
)

BASE_URL = "https://v3.football.api-sports.io"
DATABASE_URL = "sqlite:///./app.db"
SEASONS = [2025]
CURRENT_SEASON = 2025
#Ligas:
# - 39: Premier League - ok
# - 61: Ligue 1 - ok
### - 71: Serie A Brasil
# - 78: Bundesliga - ok
# - 135: Seria A Italia - ok
# - 140: La Liga EA Sports - ok
# - 141: La Liga Hypermotion
# - 2: Champions League
# - 3: Europa League
# - 848 - Conference League 
# LEAGUES = [71]
# LEAGUES = [2, 3, 39, 61, 78, 135, 140, 141, 848]
# LEAGUES = [39, 61, 78, 135]
# SELECTED_LEAGUES = [39, 61, 78, 135, 140, 141]
SELECTED_LEAGUES = [140, 141, 39, 78, 135, 61, 71]

LEAGUES_ALL = {

    "Europe": {
        39: "Premier League",
        61: "Ligue 1",
        78: "Bundesliga",

        88: "Eredivisie",
        94: "Primeira Liga",
        144: "Jupiler Pro League",

        135: "Serie A",
        140: "La Liga EA Sports",
        141: "La Liga Hypermotion",
        # 2: "Champions League",
        # 3: "Europa League",
        # 848: "Conference League",
    },

    "America": {
        253: "MLS",
        262: "Liga MX", #sesion 2025
        71: "Brasileirao",
        128: "Argentina Primera",
        268: "Uruguay Primera",
        
        # 13: "Copa Libertadores",
        # 11: "Copa Sudamericana",
    },

    "International": {

        1: "FIFA World Cup 2026",
    }
}

LEAGUES_EUROPE = list(
    LEAGUES_ALL["Europe"].keys()
)

LEAGUES_AMERICA = list(
    LEAGUES_ALL["America"].keys()
)

LEAGUES = (
    LEAGUES_EUROPE +
    LEAGUES_AMERICA
)

LEAGUES_BY_TOKEN = {

    "EUROPE": [
        39,
        61,
        78,
        135,
        140,
        141,
        2,
        3,
        848,
    ],

    "AMERICA": [
        253,
        262,
        71,
        128,
        13,
        11,
    ]
}

# ---------------- OAUTH ----------------

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000"
)

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "http://localhost:8000"
)

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "super-secret-key"
)
