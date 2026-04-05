"""
Intent Classifier — uses zero-shot classification with BART-MNLI
to classify brand mentions into intent categories.

Categories:
- PR Issue
- Customer Complaint
- Product Feedback
- Data Leak
- Legal Issue
- Praise
- General Mention

Run once to download model (~1.6GB):
    python intent_classifier.py --download
"""

import os
import sys
import joblib
import argparse
from pathlib import Path

MODEL_NAME = "facebook/bart-large-mnli"
MODEL_CACHE = os.path.join(os.path.dirname(__file__), "model", "intent_model")

# ── Intent categories with descriptions ──────────────────────
INTENT_LABELS = [
    "PR Issue",
    "Customer Complaint",
    "Product Feedback",
    "Data Leak",
    "Legal Issue",
    "Praise",
    "General Mention",
]

# Hypothesis template — crucial for accuracy
HYPOTHESIS_TEMPLATE = "This text is about a {}."

# ── Detailed descriptions for better zero-shot accuracy ──────
LABEL_DESCRIPTIONS = {
    "PR Issue":           "public relations crisis, brand reputation damage, controversy, scandal, or negative press coverage",
    "Customer Complaint": "customer complaint, bad experience, poor service, refund request, dissatisfied customer, or support issue",
    "Product Feedback":   "product review, feature request, bug report, product suggestion, or user experience feedback",
    "Data Leak":          "data breach, privacy violation, security incident, leaked information, or unauthorized data access",
    "Legal Issue":        "lawsuit, legal action, court case, regulatory violation, compliance issue, or legal threat",
    "Praise":             "positive review, compliment, recommendation, success story, or satisfied customer experience",
    "General Mention":    "general brand mention, news article, press release, or neutral reference without strong sentiment",
}

# Build enriched labels for better classification
ENRICHED_LABELS = [LABEL_DESCRIPTIONS[label] for label in INTENT_LABELS]


class IntentClassifier:
    _instance = None
    _classifier = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self._classifier = None
        self._load_model()

    def _load_model(self):
        """Load the zero-shot classification pipeline."""
        print("[IntentClassifier] Loading BART-MNLI model...")
        try:
            from transformers import pipeline
            self._classifier = pipeline(
                "zero-shot-classification",
                model=MODEL_NAME,
                cache_dir=MODEL_CACHE,
                device=-1,  # CPU
            )
            print("[IntentClassifier] Model loaded successfully")
        except Exception as e:
            print(f"[IntentClassifier] Error loading model: {e}")
            print("[IntentClassifier] Run: pip install transformers torch")
            self._classifier = None

    def classify(self, text: str) -> dict:
        """
        Classify a single text into intent categories.
        Returns dict with intent, confidence, and all scores.
        """
        if not self._classifier:
            return self._fallback(text)

        if not text or len(text.strip()) < 10:
            return {
                "intent": "General Mention",
                "confidence": 0.5,
                "scores": {label: 0.0 for label in INTENT_LABELS},
            }

        try:
            result = self._classifier(
                text[:512],  # BART max length
                candidate_labels=ENRICHED_LABELS,
                hypothesis_template="This text is about {}.",
                multi_label=False,
            )

            # Map enriched labels back to original labels
            scores = {}
            for label, score in zip(result["labels"], result["scores"]):
                original_label = next(
                    (k for k, v in LABEL_DESCRIPTIONS.items() if v == label),
                    "General Mention"
                )
                scores[original_label] = round(float(score), 4)

            # Get top intent
            top_intent = max(scores, key=scores.get)
            top_confidence = scores[top_intent]

            # If confidence too low → General Mention
            if top_confidence < 0.15:
                top_intent = "General Mention"

            return {
                "intent":     top_intent,
                "confidence": round(top_confidence, 4),
                "scores":     scores,
            }

        except Exception as e:
            print(f"[IntentClassifier] Classification error: {e}")
            return self._fallback(text)

    def classify_batch(self, texts: list) -> list:
        """Classify multiple texts efficiently."""
        results = []
        for text in texts:
            results.append(self.classify(text))
        return results

    def _fallback(self, text: str) -> dict:
        """Rule-based fallback if model fails."""
        text_lower = text.lower()

        rules = [
            ("Data Leak",          ["data breach", "data leak", "leaked", "hack", "security breach", "privacy violation", "unauthorized access"]),
            ("Legal Issue",        ["lawsuit", "legal action", "court", "sue", "litigation", "regulatory", "compliance", "violation", "attorney"]),
            ("PR Issue",           ["scandal", "controversy", "backlash", "outrage", "crisis", "pr disaster", "reputation"]),
            ("Customer Complaint", ["terrible", "awful", "worst", "disappointed", "refund", "complaint", "support", "unacceptable", "broken"]),
            ("Praise",             ["amazing", "excellent", "love", "fantastic", "highly recommend", "best", "outstanding", "great"]),
            ("Product Feedback",   ["feature", "bug", "update", "version", "improvement", "suggestion", "review", "feedback"]),
        ]

        for intent, keywords in rules:
            if any(kw in text_lower for kw in keywords):
                return {
                    "intent":     intent,
                    "confidence": 0.6,
                    "scores":     {label: 0.0 for label in INTENT_LABELS},
                }

        return {
            "intent":     "General Mention",
            "confidence": 0.5,
            "scores":     {label: 0.0 for label in INTENT_LABELS},
        }


# ── Singleton access ──────────────────────────────────────────
_classifier_instance = None


def get_classifier() -> IntentClassifier:
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = IntentClassifier()
    return _classifier_instance


def classify_intent(text: str) -> dict:
    """Main function — classify a single text."""
    return get_classifier().classify(text)


def classify_intents_batch(texts: list) -> list:
    """Main function — classify multiple texts."""
    return get_classifier().classify_batch(texts)


# ── CLI test ──────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--download", action="store_true", help="Download model")
    parser.add_argument("--test",     action="store_true", help="Run test cases")
    args = parser.parse_args()

    classifier = get_classifier()

    if args.test or True:
        test_cases = [
            "The company suffered a massive data breach exposing 10 million user records",
            "I have been waiting 3 weeks for my refund and customer support is useless",
            "The new dashboard feature is really intuitive, love the dark mode",
            "A lawsuit has been filed against the company for misleading advertising",
            "Amazing product, highly recommend to everyone looking for a solution",
            "Itonics was mentioned in a Forbes article about innovation management",
            "The CEO resigned amid growing controversy over company practices",
            "The app crashes every time I try to export a report, please fix this",
        ]

        print("\n" + "="*60)
        print("Intent Classification Test Results")
        print("="*60)

        for text in test_cases:
            result = classifier.classify(text)
            print(f"\nText:       {text[:70]}...")
            print(f"Intent:     {result['intent']} ({result['confidence']:.2%})")
