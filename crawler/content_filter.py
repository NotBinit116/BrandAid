import re
from langdetect import detect, LangDetectException

BUSINESS_CONTEXT_WORDS = {
    "company", "brand", "product", "service", "software", "app", "platform",
    "startup", "business", "enterprise", "corporation", "inc", "ltd", "corp",
    "technology", "tech", "solution", "tool", "system", "device", "hardware",
    "launch", "release", "update", "announce", "partner", "acquire", "merge",
    "invest", "fund", "revenue", "profit", "growth", "market", "industry",
    "strategy", "roadmap", "feature", "integration", "api", "cloud",
    "review", "rating", "recommend", "experience", "customer", "user", "client",
    "support", "feedback", "complaint", "issue", "bug", "fix", "version",
    "pricing", "plan", "subscription", "license", "trial", "demo",
    "ceo", "founder", "team", "employee", "hiring", "job", "career",
    "news", "report", "article", "blog", "podcast", "interview",
    "competitor", "alternative", "comparison", "versus", "vs",
    "love", "hate", "terrible", "amazing", "great", "awful", "excellent",
    "worst", "best", "recommend", "avoid", "disappointed", "impressed",
    "expensive", "cheap", "worth", "value", "quality",
    "college", "university", "school", "institute", "education", "academic",
    "student", "faculty", "course", "program", "degree", "campus", "admission",
    "enrollment", "tuition", "scholarship", "graduation", "alumni",
}

BUILT_IN_BLOCKLISTS = {
    "apple":   ["fruit", "orchard", "recipe", "cider", "pie", "harvest", "tree", "juice", "farm"],
    "amazon":  ["river", "rainforest", "jungle", "brazil", "deforestation"],
    "robin":   ["bird", "batman", "hood"],
    "oracle":  ["greek", "prophecy", "ancient"],
    "sage":    ["herb", "spice", "plant", "cooking"],
    "mercury": ["planet", "element", "roman", "god", "metal"],
    "shell":   ["beach", "seashell", "tortoise", "snail"],
    "sprint":  ["run", "race", "athlete", "running", "marathon"],
}


def is_english(text: str) -> bool:
    if not text or len(text.strip()) < 20:
        return True
    try:
        return detect(text) == "en"
    except LangDetectException:
        return True


def get_blocklist_words(brand_name: str, extra_blocklist: list = None) -> list:
    words = list(extra_blocklist or [])
    brand_lower = brand_name.lower().strip()
    for word in brand_lower.split():
        if word in BUILT_IN_BLOCKLISTS:
            words.extend(BUILT_IN_BLOCKLISTS[word])
    return [w.lower() for w in words]


def is_blocked(text: str, blocklist_words: list) -> bool:
    if not blocklist_words:
        return False
    text_lower = text.lower()
    return any(word in text_lower for word in blocklist_words)


def is_relevant(text: str, brand_name: str, threshold: int = 1, keywords: list = None) -> bool:
    if not text or not brand_name:
        return False

    text_lower  = text.lower()
    brand_lower = brand_name.lower()

    # Tier 1 — full keyword phrase
    if keywords:
        for kw in keywords:
            if kw.lower() in text_lower:
                return True

    # Brand presence check
    brand_found = brand_lower in text_lower
    if not brand_found:
        brand_words = [w for w in brand_lower.split() if len(w) > 3]
        brand_found = sum(1 for w in brand_words if w in text_lower) >= max(1, len(brand_words) // 2)

    if not brand_found:
        return False

    # Tier 2 — brand + location from keywords
    if keywords:
        location_words = set()
        for kw in keywords:
            for word in kw.lower().split():
                if word not in brand_lower.split() and len(word) > 3:
                    location_words.add(word)
        if location_words and any(loc in text_lower for loc in location_words):
            return True

    # Tier 3 — brand + business context
    context_count = sum(1 for word in BUSINESS_CONTEXT_WORDS if word in text_lower)
    return context_count >= threshold


def filter_content(text: str, brand_name: str, keywords: list = None, blocklist_words: list = None) -> tuple:
    if not text or len(text.strip()) < 10:
        return False, "too_short"
    if not is_english(text):
        return False, "non_english"
    if blocklist_words and is_blocked(text, blocklist_words):
        return False, "blocklisted"
    if not is_relevant(text, brand_name, keywords=keywords):
        return False, "not_relevant"
    return True, "ok"


def filter_batch(items: list, brand_name: str, keywords: list = None, blocklist_words: list = None) -> list:
    total    = len(items)
    filtered = []
    reasons  = {"non_english": 0, "not_relevant": 0, "too_short": 0, "blocklisted": 0}

    for item in items:
        text = item.get("text", "")
        include, reason = filter_content(text, brand_name, keywords=keywords, blocklist_words=blocklist_words)
        if include:
            filtered.append(item)
        else:
            reasons[reason] = reasons.get(reason, 0) + 1

    print(
        f"[Filter] {total} items → {len(filtered)} kept "
        f"(removed: {reasons['non_english']} non-English, "
        f"{reasons['not_relevant']} not relevant, "
        f"{reasons['blocklisted']} blocklisted, "
        f"{reasons['too_short']} too short)"
    )
    return filtered
