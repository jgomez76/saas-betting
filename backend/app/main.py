from fastapi import FastAPI
from app.api.routes import router
from app.core.database import Base, engine
from app.models.fixture import Fixture

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SaaS Betting API")

app.include_router(router)

@app.get("/")
def root():
    return {"message": "API running 🚀"}