import re
import joblib
import numpy as np
import os

# ── Paths ────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH      = os.path.join(BASE_DIR, "model", "sentiment_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "model", "tfidf_vectorizer.pkl")
METADATA_PATH   = os.path.join(BASE_DIR, "model", "metadata.pkl")

# ── Load once at import time ─────────────────────────────────
print("Loading sentiment model...")
model     = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)
metadata  = joblib.load(METADATA_PATH)

NEUTRAL_THRESHOLD = metadata.get("neutral_threshold", 0.65)

print(f"Model loaded — accuracy: {metadata.get('accuracy', 'N/A'):.4f}")


# ── Text cleaner ─────────────────────────────────────────────
def clean_text(text: str) -> str:
    text = str(text)
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#(\w+)", r"\1", text)
    text = re.sub(r"(.)\1{2,}", r"\1\1", text)
    text = re.sub(r"[^a-zA-Z\s!?]", "", text)
    return text.lower().strip()


# ── Risk level logic ─────────────────────────────────────────
def get_risk_level(sentiment: str, confidence: float) -> str:
    if sentiment == "negative":
        if confidence >= 0.85:
            return "high"
        elif confidence >= 0.70:
            return "medium"
        else:
            return "low"
    elif sentiment == "neutral":
        return "low"
    else:  # positive
        return "low"


# ── Main analyse function ────────────────────────────────────
def analyse(text: str) -> dict:
    """
    Takes raw text, returns:
    {
        "sentiment": "positive" | "neutral" | "negative",
        "score": float (0.0 - 1.0),
        "risk_level": "low" | "medium" | "high"
    }
    """
    cleaned = clean_text(text)

    if not cleaned:
        return {"sentiment": "neutral", "score": 0.5, "risk_level": "low"}

    vec = vectorizer.transform([cleaned])
    proba = model.predict_proba(vec)[0]

    # classes_ order: ['negative', 'positive']
    classes = model.classes_
    max_idx = int(np.argmax(proba))
    max_conf = float(proba[max_idx])
    predicted = classes[max_idx]

    # If confidence is below threshold → neutral
    if max_conf < NEUTRAL_THRESHOLD:
        sentiment = "neutral"
        score = float(max_conf)
    else:
        sentiment = predicted
        score = float(max_conf)

    risk_level = get_risk_level(sentiment, score)

    return {
        "sentiment": sentiment,
        "score":     round(score, 4),
        "risk_level": risk_level
    }


# ── Batch analyse ────────────────────────────────────────────
def analyse_batch(texts: list) -> list:
    """Analyse a list of texts efficiently in one vectorizer call"""
    cleaned = [clean_text(t) for t in texts]
    results = []

    # Handle empty texts
    non_empty_idx = [i for i, t in enumerate(cleaned) if t]
    empty_idx     = [i for i, t in enumerate(cleaned) if not t]

    if non_empty_idx:
        batch_texts = [cleaned[i] for i in non_empty_idx]
        vecs  = vectorizer.transform(batch_texts)
        probas = model.predict_proba(vecs)

        batch_results = {}
        for j, idx in enumerate(non_empty_idx):
            proba    = probas[j]
            max_idx  = int(np.argmax(proba))
            max_conf = float(proba[max_idx])
            predicted = model.classes_[max_idx]

            if max_conf < NEUTRAL_THRESHOLD:
                sentiment = "neutral"
            else:
                sentiment = predicted

            batch_results[idx] = {
                "sentiment":  sentiment,
                "score":      round(float(max_conf), 4),
                "risk_level": get_risk_level(sentiment, max_conf)
            }

        for idx in empty_idx:
            batch_results[idx] = {
                "sentiment": "neutral",
                "score": 0.5,
                "risk_level": "low"
            }

        results = [batch_results[i] for i in range(len(texts))]

    return results


# ── Quick test ───────────────────────────────────────────────
if __name__ == "__main__":
    tests = [
        "I absolutely love this product, it is amazing!",
        "This is the worst experience I have ever had",
        "The product arrived today",
        "Terrible service, will never buy again, complete scam",
        "Pretty good overall, nothing special",
        "LOVE IT SO MUCH!!!",
        "The sky is blue",
        "I am so disappointed, this broke after one use",   
    ]
    print("\nTest results:")
    print("-" * 60)
    for t in tests:
        result = analyse(t)
        print(f"Text:      {t[:50]}")
        print(f"Sentiment: {result['sentiment']} | Score: {result['score']} | Risk: {result['risk_level']}")
        print("-" * 60)