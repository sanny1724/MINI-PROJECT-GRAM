import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if db_url.startswith("sqlite"):
    if "./gram.db" in db_url:
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        candidate_db = os.path.join(backend_dir, "gram.db")
        if os.path.exists(candidate_db):
            db_url = f"sqlite:///{candidate_db}"

    engine = create_engine(
        db_url, 
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        db_url, 
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
