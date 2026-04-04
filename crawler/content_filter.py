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

    # Education sector
    "college", "university", "school", "institute", "education", "academic",
    "student", "faculty", "course", "program", "degree", "campus", "admission",
    "enrollment", "tuition", "scholarship", "graduation", "alumni",

    # Nepal specific
    "nepal", "kathmandu", "nepali",
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


def is_relevant(text: str, brand_name: str, threshold: int = 1, keywords: list = None) -> bool:
    if not text or not brand_name:
        return False

    text_lower = text.lower()

    # ── Tier 1: Full keyword phrase match → always include ────
    if keywords:
        for kw in keywords:
            if kw.lower() in text_lower:
                return True

    # ── Tier 2: Brand name + location context → include ───────
    brand_lower = brand_name.lower()
    brand_found = brand_lower in text_lower

    # If brand not found, try individual significant words
    if not brand_found:
        brand_words = [w for w in brand_lower.split() if len(w) > 3]
        brand_found = sum(1 for w in brand_words if w in text_lower) >= len(brand_words) // 2 + 1

    if not brand_found:
        return False

    # ── Tier 3: Brand found — check context ───────────────────
    # Extract location words from keywords
    location_words = set()
    if keywords:
        for kw in keywords:
            for word in kw.lower().split():
                if word not in brand_lower.split() and len(word) > 3:
                    location_words.add(word)

    # If location word appears anywhere in text → include
    if location_words:
        if any(loc in text_lower for loc in location_words):
            return True

    # ── Tier 4: Brand + business context only ─────────────────
    context_count = sum(1 for word in BUSINESS_CONTEXT_WORDS if word in text_lower)
    return context_count >= threshold


def filter_content(text: str, brand_name: str, keywords: list = None) -> tuple[bool, str]:
    if not text or len(text.strip()) < 10:
        return False, "too_short"
    if not is_english(text):
        return False, "non_english"
    if not is_relevant(text, brand_name, keywords=keywords):
        return False, "not_relevant"
    return True, "ok"


def filter_batch(items: list, brand_name: str, keywords: list = None) -> list:
    total = len(items)
    filtered = []
    reasons = {"non_english": 0, "not_relevant": 0, "too_short": 0}

    for item in items:
        text = item.get("text", "")
        include, reason = filter_content(text, brand_name, keywords=keywords)
        if include:
            filtered.append(item)
        else:
            reasons[reason] = reasons.get(reason, 0) + 1

    print(f"[Filter] {total} items → {len(filtered)} kept "
          f"(removed: {reasons['non_english']} non-English, "
          f"{reasons['not_relevant']} not relevant, "
          f"{reasons['too_short']} too short)")
    return filtered
