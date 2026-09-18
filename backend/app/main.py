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


import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

@app.get("/health")
def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}

# Check for production frontend build directory
_curr_dir = os.path.dirname(os.path.abspath(__file__))
_potential_dist_paths = [
    os.path.join(os.path.dirname(os.path.dirname(_curr_dir)), "frontend", "dist"),
    os.path.join(os.path.dirname(_curr_dir), "frontend", "dist"),
    os.path.join(os.getcwd(), "frontend", "dist"),
]
frontend_dist = next((p for p in _potential_dist_paths if os.path.exists(p) and os.path.isdir(p)), None)

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        target_file = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {"project": settings.PROJECT_NAME, "status": "running"}
