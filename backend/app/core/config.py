import os
from dotenv import load_dotenv

load_dotenv()

API_FOOTBALL_KEY = os.getenv("API_FOOTBALL_KEY")
BASE_URL = "https://v3.football.api-sports.io"
DATABASE_URL = "sqlite:///./app.db"
SEASONS = [2025]
CURRENT_SEASON = 2025
#Ligas:
# - 140: La Liga EA Sports
# - 141: La Liga Hypermotion
# - 61: Ligue 1
# - 39: Premier leage
LEAGUES = [61, 140, 141]
# LEAGUES = [141]
