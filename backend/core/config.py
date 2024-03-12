from pydantic_settings import BaseSettings , SettingsConfigDict
from functools import lru_cache
from pathlib import Path
from fastapi.templating import Jinja2Templates
from fastapi_mail import ConnectionConfig


class Settings(BaseSettings):
    DB_URL: str = (
        "mongodb+srv://<user>:<password>@<cluster>/?retryWrites=true&w=majority&appName=<db>&tlsAllowInvalidCertificates=true"
    )
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: str | int = "demo"
    MAIL_USERNAME: str = "username"
    MAIL_PASSWORD: str = "password"
    MAIL_FROM: str = "yourEmail"
    MAIL_PORT: int = 465
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_VALIDATE_CERTS: bool = True
    DEBUG: bool | str = False
    SECRET_KEY: str = "secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRY: int = 10 # days
    REFRESH_TOKEN_EXPIRY: int = 3 # days
    ACCESS_JWT_SECRET: str = "Secret"
    REFRESH_JWT_SECRET: str = "Secret"
    VERIFICATION_JWT_SECRET: str = "Secret"
    GOOGLE_CLIENT_ID: str = "client_id"
    GOOGLE_CLIENT_SECRET : str = "client_secret"
    GOOGLE_CALLBACK_SIGNUP_URL: str = "signup"
    GOOGLE_CALLBACK_LOGIN_URL: str = "login"
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings():
    return Settings()


# HTML config
templates = Jinja2Templates(directory="templates")

# Email config
emailConf = ConnectionConfig(
    MAIL_USERNAME=get_settings().MAIL_USERNAME,
    MAIL_PASSWORD=get_settings().MAIL_PASSWORD,
    MAIL_FROM=get_settings().MAIL_FROM,
    MAIL_PORT=get_settings().MAIL_PORT,
    MAIL_SERVER=get_settings().MAIL_SERVER,
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    VALIDATE_CERTS=False,
    TEMPLATE_FOLDER=Path(__file__).resolve().parents[1] / "templates" / "email",
)
