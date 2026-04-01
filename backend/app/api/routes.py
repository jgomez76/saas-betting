from fastapi import APIRouter
from app.services.api_football import get_fixtures

router = APIRouter()

@router.get("/fixtures")
def fixtures():
    return get_fixtures()