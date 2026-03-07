from fastapi import FastAPI
from app.database.connection import engine
from sqlalchemy import text

app = FastAPI(title="BrandAid API")

@app.get("/")
def root():
    return {"message": "BrandAid backend running"}

@app.get("/db-test")
def test_db():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
    return {"database": "connected"}