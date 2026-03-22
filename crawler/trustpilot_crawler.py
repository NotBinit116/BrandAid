"""
Trustpilot Crawler — scrapes public reviews for a brand.
No API key required — uses public pages.
"""
import requests
import re
from datetime import datetime
from crawler.base_crawler import BaseCrawler
from sqlalchemy.orm import Session

TRUSTPILOT_BASE = "https://www.trustpilot.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}


class TrustpilotCrawler(BaseCrawler):
    def __init__(self, db: Session, platform_id: int, brand_id: int, keywords: list, trustpilot_slug: str = None):
        super().__init__(db, platform_id, brand_id, keywords)
        # trustpilot_slug is the brand's Trustpilot URL slug e.g. "apple.com"
        self.slug = trustpilot_slug

    def _search_brand(self, keyword: str) -> str | None:
        """Search Trustpilot for the brand and return its slug."""
        try:
            url = f"{TRUSTPILOT_BASE}/search?query={requests.utils.quote(keyword)}"
            res = requests.get(url, headers=HEADERS, timeout=10)
            res.raise_for_status()

            # Find business links in response
            matches = re.findall(r'/review/([a-zA-Z0-9.\-]+)', res.text)
            if matches:
                return matches[0]
            return None
        except Exception as e:
            print(f"[Trustpilot] Search error: {e}")
            return None

    def _fetch_reviews(self, slug: str, page: int = 1) -> list:
        """Fetch reviews from a Trustpilot business page."""
        try:
            url = f"{TRUSTPILOT_BASE}/review/{slug}?page={page}&languages=en"
            res = requests.get(url, headers=HEADERS, timeout=10)
            res.raise_for_status()

            reviews = []

            # Extract review text
            review_blocks = re.findall(
                r'data-service-review-text-typography[^>]*>([^<]+)<',
                res.text
            )

            # Extract dates
            dates = re.findall(
                r'<time[^>]*datetime="([^"]+)"',
                res.text
            )

            # Extract authors
            authors = re.findall(
                r'consumer-information__name[^>]*>\s*([^<]+)\s*<',
                res.text
            )

            for i, text in enumerate(review_blocks):
                text = text.strip()
                if not text or len(text) < 10:
                    continue

                try:
                    created_at = datetime.fromisoformat(dates[i].replace("Z", "+00:00")).replace(tzinfo=None)
                except Exception:
                    created_at = datetime.utcnow()

                author = authors[i].strip() if i < len(authors) else ""
                source_url = f"{TRUSTPILOT_BASE}/review/{slug}#review-{i}"

                reviews.append({
                    "text": text,
                    "source_url": source_url,
                    "author": author,
                    "created_at": created_at,
                })

            return reviews

        except Exception as e:
            print(f"[Trustpilot] Fetch error for {slug}: {e}")
            return []

    def fetch(self) -> list:
        results = []

        # Use provided slug or search for it using first keyword
        slug = self.slug
        if not slug and self.keywords:
            print(f"[Trustpilot] Searching for brand: {self.keywords[0]}")
            slug = self._search_brand(self.keywords[0])

        if not slug:
            print("[Trustpilot] Could not find brand on Trustpilot")
            return []

        print(f"[Trustpilot] Fetching reviews for: {slug}")

        # Fetch first 3 pages
        for page in range(1, 4):
            reviews = self._fetch_reviews(slug, page)
            if not reviews:
                break
            results.extend(reviews)
            print(f"[Trustpilot] Page {page}: {len(reviews)} reviews")

        print(f"[Trustpilot] Total reviews: {len(results)}")
        return results
