from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SaaS Betting API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.137:3000",  # opcional
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔥 en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 CORS limpio
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.include_router(router)

@app.get("/")
def root():
    return {"message": "API running 🚀"}