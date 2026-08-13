from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "GRAM - Governance Risk & Accountability Monitor"
    DATABASE_URL: str = "postgresql://gram_user:gram_pass@localhost:5432/gram_db"
    SECRET_KEY: str = "CHANGE_THIS_SECRET_KEY_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12

    class Config:
        env_file = ".env"


settings = Settings()
