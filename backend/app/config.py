from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://checkin:checkin@localhost:5432/checkin"
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
