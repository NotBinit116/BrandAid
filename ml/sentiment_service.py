import re
import joblib
import numpy as np
import os

BASE_DIR        = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH      = os.path.join(BASE_DIR, "model", "sentiment_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "model", "tfidf_vectorizer.pkl")
METADATA_PATH   = os.path.join(BASE_DIR, "model", "metadata.pkl")

print("Loading sentiment model...")
model      = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)
metadata   = joblib.load(METADATA_PATH)

NEUTRAL_THRESHOLD = metadata.get("neutral_threshold", 0.65)
print(f"Model loaded — accuracy: {metadata.get('accuracy', 'N/A'):.4f}")


def clean_text(text: str) -> str:
    text = str(text)
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#(\w+)", r"\1", text)
    text = re.sub(r"(.)\1{2,}", r"\1\1", text)
    text = re.sub(r"[^a-zA-Z\s!?]", "", text)
    return text.lower().strip()


def get_risk_level(sentiment: str, confidence: float, text: str = "", risk_keywords: list = None) -> str:
    """
    Determine risk level.
    If text contains any risk keyword → always high risk.
    Otherwise based on sentiment + confidence.
    """
    # Risk keyword override
    if risk_keywords:
        text_lower = text.lower()
        if any(kw.lower() in text_lower for kw in risk_keywords):
            return "high"

    if sentiment == "negative":
        if confidence >= 0.85:
            return "high"
        elif confidence >= 0.70:
            return "medium"
        else:
            return "low"
    return "low"


def analyse(text: str, risk_keywords: list = None) -> dict:
    cleaned = clean_text(text)

    if not cleaned:
        return {"sentiment": "neutral", "score": 0.5, "risk_level": "low"}

    vec   = vectorizer.transform([cleaned])
    proba = model.predict_proba(vec)[0]

    classes  = model.classes_
    max_idx  = int(np.argmax(proba))
    max_conf = float(proba[max_idx])
    predicted = classes[max_idx]

    if max_conf < NEUTRAL_THRESHOLD:
        sentiment = "neutral"
    else:
        sentiment = predicted

    score      = round(max_conf, 4)
    risk_level = get_risk_level(sentiment, score, text, risk_keywords)

    return {
        "sentiment":  sentiment,
        "score":      score,
        "risk_level": risk_level,
    }


def analyse_batch(texts: list, risk_keywords: list = None) -> list:
    cleaned   = [clean_text(t) for t in texts]
    results   = []
    non_empty = [i for i, t in enumerate(cleaned) if t]
    empty     = [i for i, t in enumerate(cleaned) if not t]

    if non_empty:
        batch  = [cleaned[i] for i in non_empty]
        vecs   = vectorizer.transform(batch)
        probas = model.predict_proba(vecs)

        batch_results = {}
        for j, idx in enumerate(non_empty):
            proba     = probas[j]
            max_idx   = int(np.argmax(proba))
            max_conf  = float(proba[max_idx])
            predicted = model.classes_[max_idx]
            sentiment = "neutral" if max_conf < NEUTRAL_THRESHOLD else predicted
            score     = round(float(max_conf), 4)
            batch_results[idx] = {
                "sentiment":  sentiment,
                "score":      score,
                "risk_level": get_risk_level(sentiment, score, texts[idx], risk_keywords),
            }

        for idx in empty:
            batch_results[idx] = {"sentiment": "neutral", "score": 0.5, "risk_level": "low"}

        results = [batch_results[i] for i in range(len(texts))]

    return results