"""
Sentiment-Intent Arbitration
Corrects mismatches between sentiment model and intent classifier.

Rules:
- Praise → positive (override if sentiment was negative/neutral)
- Customer Complaint → negative
- Data Leak → negative + high risk
- Legal Issue → negative + high risk
- PR Issue → negative + high risk
- Product Feedback → keep sentiment (could be pos or neg)
- General Mention → keep sentiment

Additionally: if sentiment confidence < 0.65, defer to intent mapping
"""

# Intent → forced sentiment mapping
INTENT_SENTIMENT_MAP = {
    "Praise":             "positive",
    "Customer Complaint": "negative",
    "Data Leak":          "negative",
    "Legal Issue":        "negative",
    "PR Issue":           "negative",
    # Product Feedback and General Mention are neutral — don't override
}

# Intent → forced risk level (when intent strongly implies risk)
INTENT_RISK_MAP = {
    "Data Leak":  "high",
    "Legal Issue": "high",
    "PR Issue":    "medium",
}

# Confidence threshold below which intent overrides sentiment
CONFIDENCE_THRESHOLD = 0.65


def arbitrate(
    sentiment: str,
    sentiment_score: float,
    risk_level: str,
    intent: str,
    intent_confidence: float,
) -> dict:
    """
    Takes raw sentiment + intent results and returns corrected values.

    Returns:
        {
            "sentiment": str,
            "score": float,
            "risk_level": str,
            "corrected": bool  # whether a correction was applied
        }
    """
    corrected = False
    final_sentiment  = sentiment
    final_risk_level = risk_level

    # ── Rule 1: Strong intent overrides ──────────────────────
    # If intent has a clear sentiment mapping, apply it
    if intent in INTENT_SENTIMENT_MAP:
        forced_sentiment = INTENT_SENTIMENT_MAP[intent]

        # Always override for Praise/Complaint regardless of confidence
        if intent in ("Praise", "Customer Complaint"):
            if final_sentiment != forced_sentiment:
                print(f"[Arbitration] {intent} override: {final_sentiment} → {forced_sentiment}")
                final_sentiment = forced_sentiment
                corrected = True

        # For high-risk intents, override only if intent confidence is reasonable
        elif intent in ("Data Leak", "Legal Issue", "PR Issue"):
            if intent_confidence >= 0.40 and final_sentiment != forced_sentiment:
                print(f"[Arbitration] {intent} risk override: {final_sentiment} → {forced_sentiment}")
                final_sentiment = forced_sentiment
                corrected = True

    # ── Rule 2: Low confidence deferral ──────────────────────
    # If sentiment model is not confident AND intent has a clear mapping
    elif sentiment_score < CONFIDENCE_THRESHOLD and intent in INTENT_SENTIMENT_MAP:
        forced_sentiment = INTENT_SENTIMENT_MAP[intent]
        if final_sentiment != forced_sentiment:
            print(f"[Arbitration] Low confidence ({sentiment_score:.2f}) deferral: {final_sentiment} → {forced_sentiment}")
            final_sentiment = forced_sentiment
            corrected = True

    # ── Rule 3: Intent-based risk override ───────────────────
    if intent in INTENT_RISK_MAP:
        forced_risk = INTENT_RISK_MAP[intent]
        if final_risk_level != forced_risk:
            # Only upgrade risk, never downgrade
            risk_priority = {"low": 0, "medium": 1, "high": 2}
            if risk_priority.get(forced_risk, 0) > risk_priority.get(final_risk_level, 0):
                print(f"[Arbitration] Risk upgrade for {intent}: {final_risk_level} → {forced_risk}")
                final_risk_level = forced_risk
                corrected = True

    return {
        "sentiment":  final_sentiment,
        "score":      sentiment_score,
        "risk_level": final_risk_level,
        "corrected":  corrected,
    }
