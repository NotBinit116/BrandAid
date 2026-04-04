from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base
from app.routes import auth, brands, config, reports, content, sentiment, crawler, search

import app.models  # noqa
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BrandAid API",
    description="Brand monitoring and sentiment analysis backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/auth",      tags=["Auth"])
app.include_router(brands.router,    prefix="/brands",    tags=["Brands"])
app.include_router(config.router,    prefix="/config",    tags=["Config"])
app.include_router(reports.router,   prefix="/reports",   tags=["Reports"])
app.include_router(content.router,   prefix="/content",   tags=["Content"])
app.include_router(sentiment.router, prefix="/sentiment", tags=["Sentiment"])
app.include_router(crawler.router,   prefix="/crawler",   tags=["Crawler"])
app.include_router(search.router,    prefix="/public",    tags=["Public"])


@app.get("/")
def root():
    return {"message": "BrandAid API running"}


@app.get("/health")
def health():
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}
