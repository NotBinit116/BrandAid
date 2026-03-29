import re
import requests
from datetime import datetime
from crawler.base_crawler import BaseCrawler
from sqlalchemy.orm import Session

HN_SEARCH_URL = "https://hn.algolia.com/api/v1/search"
HN_ITEM_URL = "https://news.ycombinator.com/item?id={id}"


class HackerNewsCrawler(BaseCrawler):
    def __init__(self, db: Session, platform_id: int, brand_id: int, keywords: list, brand_name: str = ""):
        super().__init__(db, platform_id, brand_id, keywords, brand_name)

    def _search(self, keyword: str, max_results: int = 20) -> list:
        try:
            params = {"query": keyword, "tags": "story,comment", "hitsPerPage": max_results}
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
            hits = self._search(keyword, max_results=15)
            for hit in hits:
                text = hit.get("comment_text") or hit.get("story_text") or hit.get("title", "")
                text = re.sub(r"<[^>]+>", "", text)
                text = re.sub(r"\s+", " ", text).strip()
                if not text or len(text) < 10:
                    continue
                item_id = hit.get("objectID", "")
                source_url = HN_ITEM_URL.format(id=item_id)
                created_ts = hit.get("created_at_i")
                created_at = datetime.utcfromtimestamp(created_ts) if created_ts else datetime.utcnow()
                results.append({"text": text, "source_url": source_url, "author": hit.get("author", ""), "created_at": created_at})
        seen = set()
        unique = [item for item in results if item["source_url"] not in seen and not seen.add(item["source_url"])]
        print(f"[HackerNews] Total unique items: {len(unique)}")
        return unique
