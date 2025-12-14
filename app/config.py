import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", 600))
    RATE_LIMIT_MAX = int(os.getenv("RATE_LIMIT_MAX", 3))
    BELIO_API_URL = os.getenv("BELIO_API_URL")
    BELIO_CLIENT_ID = os.getenv("BELIO_CLIENT_ID")
    BELIO_CLIENT_SECRET = os.getenv("BELIO_CLIENT_SECRET")

class DevelopmentConfig(Config):
    DEBUG = True

config_by_name = {
    "development": DevelopmentConfig,
}