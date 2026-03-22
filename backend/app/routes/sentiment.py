from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from app.services.sentiment_service import analyse, analyse_batch
from app.services.security import get_current_user
from app.models.user import User

router = APIRouter()


class AnalyseRequest(BaseModel):
    text: str


class AnalyseBatchRequest(BaseModel):
    texts: List[str]


class SentimentResult(BaseModel):
    sentiment: str
    score: float
    risk_level: str


@router.post("/analyse", response_model=SentimentResult)
def analyse_text(
    req: AnalyseRequest,
    current_user: User = Depends(get_current_user)
):
    return analyse(req.text)


@router.post("/analyse/batch", response_model=List[SentimentResult])
def analyse_batch_texts(
    req: AnalyseBatchRequest,
    current_user: User = Depends(get_current_user)
):
    return analyse_batch(req.texts)