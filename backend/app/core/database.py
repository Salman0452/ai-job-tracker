from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Use IPv4 only by default to avoid DNS resolution issues
# asyncpg will resolve IPs and connect to the first available address
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    connect_args={"server_settings": {"application_name": "ai_job_tracker"}} if "asyncpg" in settings.DATABASE_URL else {},
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

