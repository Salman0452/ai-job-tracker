from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    OTP_EXPIRE_MINUTES: int = 10
    GROQ_API_KEY: str
    MAILTRAP_TOKEN: str = ""

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
    )

settings = Settings()



# Settings Configuration Explanation
# This is a configuration management class using Pydantic v2's BaseSettings. It loads environment variables and defines your application's settings.

# Key Components
# Class Definition

# Settings(BaseSettings) – Inherits from Pydantic's BaseSettings, which automatically reads environment variables
# Environment Variables (required by default)

# DATABASE_URL – Database connection string
# SECRET_KEY – Used for encryption/signing
# GROQ_API_KEY – API key for Groq service
# Settings with Defaults (optional)

# ALGORITHM: str = "HS256" – JWT signing algorithm
# ACCESS_TOKEN_EXPIRE_MINUTES: int = 15 – Session token lifetime
# REFRESH_TOKEN_EXPIRE_DAYS: int = 30 – Refresh token lifetime
# OTP_EXPIRE_MINUTES: int = 10 – One-time password validity
# MAILTRAP_TOKEN: str = "" – Email service token (defaults to empty string)
# Configuration Dictionary

# Tells Pydantic to load variables from a .env file two directories up from this file
# Specifies UTF-8 encoding for the file
# How It Works
# When you instantiate Settings(), Pydantic:

# Reads your .env file
# Validates that required variables are present
# Casts values to correct types (e.g., 15 → integer)
# Raises errors if required variables are missing
# Usage Example
