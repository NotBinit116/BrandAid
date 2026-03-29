"""
Content Filter — filters crawled content by:
1. Language (English only)
2. Relevance (brand + business/tech context required)
"""
import re
from langdetect import detect, LangDetectException


# ── Business / tech context words ─────────────────────────────
BUSINESS_CONTEXT_WORDS = {
    # Company/product terms
    "company", "brand", "product", "service", "software", "app", "platform",
    "startup", "business", "enterprise", "corporation", "inc", "ltd", "corp",
    "technology", "tech", "solution", "tool", "system", "device", "hardware",

    # Business actions
    "launch", "release", "update", "announce", "partner", "acquire", "merge",
    "invest", "fund", "revenue", "profit", "growth", "market", "industry",
    "strategy", "roadmap", "feature", "integration", "api", "cloud",

    # Review/opinion terms
    "review", "rating", "recommend", "experience", "customer", "user", "client",
    "support", "feedback", "complaint", "issue", "bug", "fix", "version",
    "pricing", "plan", "subscription", "license", "trial", "demo",

    # Social/media terms
    "ceo", "founder", "team", "employee", "hiring", "job", "career",
    "news", "report", "article", "blog", "podcast", "interview",
    "competitor", "alternative", "comparison", "versus", "vs",

    # Sentiment indicators
    "love", "hate", "terrible", "amazing", "great", "awful", "excellent",
    "worst", "best", "recommend", "avoid", "disappointed", "impressed",
    "expensive", "cheap", "worth", "value", "quality",
}


def is_english(text: str) -> bool:
    """Returns True if text is detected as English."""
    if not text or len(text.strip()) < 20:
        return True  # Too short to detect — let it through
    try:
        lang = detect(text)
        return lang == "en"
    except LangDetectException:
        return True  # If detection fails, let it through


def is_relevant(text: str, brand_name: str, threshold: int = 1) -> bool:
    """
    Returns True if text is relevant to the brand in a business context.
    Requires:
    - Brand name mentioned in text
    - At least `threshold` business/tech context words present
    """
    if not text or not brand_name:
        return False

    text_lower = text.lower()
    brand_lower = brand_name.lower()

    # Must contain brand name
    if brand_lower not in text_lower:
        # Try partial match for multi-word brands
        brand_words = brand_lower.split()
        if not any(word in text_lower for word in brand_words if len(word) > 3):
            return False

    # Count business context words
    context_count = sum(1 for word in BUSINESS_CONTEXT_WORDS if word in text_lower)

    return context_count >= threshold


def filter_content(text: str, brand_name: str) -> tuple[bool, str]:
    """
    Main filter function.
    Returns (should_include, reason).
    """
    if not text or len(text.strip()) < 10:
        return False, "too_short"

    # Language check
    if not is_english(text):
        return False, "non_english"

    # Relevance check
    if not is_relevant(text, brand_name):
        return False, "not_relevant"

    return True, "ok"


def filter_batch(items: list, brand_name: str) -> list:
    """
    Filter a list of content items.
    Each item must have a 'text' key.
    Returns filtered list with stats printed.
    """
    total = len(items)
    filtered = []
    reasons = {"non_english": 0, "not_relevant": 0, "too_short": 0}

    for item in items:
        text = item.get("text", "")
        include, reason = filter_content(text, brand_name)
        if include:
            filtered.append(item)
        else:
            reasons[reason] = reasons.get(reason, 0) + 1

    print(f"[Filter] {total} items → {len(filtered)} kept "
          f"(removed: {reasons['non_english']} non-English, "
          f"{reasons['not_relevant']} not relevant, "
          f"{reasons['too_short']} too short)")

    return filtered
