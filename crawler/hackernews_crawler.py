"""
Hacker News Crawler — searches HN for brand mentions in stories and comments.
Uses the official Algolia HN Search API — no key required.
"""
import requests
from datetime import datetime
from crawler.base_crawler import BaseCrawler
from sqlalchemy.orm import Session

HN_SEARCH_URL = "https://hn.algolia.com/api/v1/search"
HN_ITEM_URL = "https://news.ycombinator.com/item?id={id}"


class HackerNewsCrawler(BaseCrawler):
    def __init__(self, db: Session, platform_id: int, brand_id: int, keywords: list):
        super().__init__(db, platform_id, brand_id, keywords)

    def _search(self, keyword: str, tags: str = "story,comment", max_results: int = 20) -> list:
        try:
            params = {
                "query": keyword,
                "tags": tags,
                "hitsPerPage": max_results,
            }
            res = requests.get(HN_SEARCH_URL, params=params, timeout=10)
            res.raise_for_status()
            return res.json().get("hits", [])
        except Exception as e:
            print(f"[HackerNews] Search error for '{keyword}': {e}")
            return []

    def fetch(self) -> list:
        results = []

        for keyword in self.keywords:
            print(f"[HackerNews] Searching for: {keyword}")
            hits = self._search(keyword, tags="story,comment", max_results=15)

            for hit in hits:
                # Get text content
                text = hit.get("comment_text") or hit.get("story_text") or hit.get("title", "")

                # Clean HTML
                import re
                text = re.sub(r"<[^>]+>", "", text)
                text = re.sub(r"\s+", " ", text).strip()

                if not text or len(text) < 10:
                    continue

                item_id = hit.get("objectID", "")
                source_url = HN_ITEM_URL.format(id=item_id)

                created_ts = hit.get("created_at_i")
                if created_ts:
                    created_at = datetime.utcfromtimestamp(created_ts)
                else:
                    created_at = datetime.utcnow()

                author = hit.get("author", "")

                results.append({
                    "text": text,
                    "source_url": source_url,
                    "author": author,
                    "created_at": created_at,
                })

        # Deduplicate
        seen = set()
        unique = []
        for item in results:
            if item["source_url"] not in seen:
                seen.add(item["source_url"])
                unique.append(item)

        print(f"[HackerNews] Total unique items: {len(unique)}")
        return unique
