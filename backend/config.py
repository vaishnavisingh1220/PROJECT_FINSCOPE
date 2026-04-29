import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change_this_secret_for_dev")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///database.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change_this_jwt_secret")
