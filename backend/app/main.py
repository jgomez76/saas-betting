from fastapi import FastAPI
from app.api.routes import router
from app.core.database import Base, engine
from app.models.fixture import Fixture

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SaaS Betting API")

app.include_router(router)

@app.get("/")
def root():
    return {"message": "API running 🚀"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)