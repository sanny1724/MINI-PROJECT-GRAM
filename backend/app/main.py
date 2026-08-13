from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api import auth, villages, domain_data, grievances, dashboard, budget, geo

# Create tables (fine for dev; use Alembic migrations for production)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten before deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(geo.router)
app.include_router(villages.router)
app.include_router(domain_data.router)
app.include_router(grievances.router)
app.include_router(dashboard.router)
app.include_router(budget.router)


@app.get("/")
def root():
    return {"project": settings.PROJECT_NAME, "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
