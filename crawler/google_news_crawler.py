import re
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime
from crawler.base_crawler import BaseCrawler
from sqlalchemy.orm import Session

GOOGLE_NEWS_RSS = "https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"


class GoogleNewsCrawler(BaseCrawler):
    def __init__(self, db: Session, platform_id: int, brand_id: int, keywords: list, brand_name: str = ""):
        super().__init__(db, platform_id, brand_id, keywords, brand_name)

    def _fetch_rss(self, keyword: str) -> list:
        try:
            url = GOOGLE_NEWS_RSS.format(query=requests.utils.quote(keyword))
            headers = {"User-Agent": "Mozilla/5.0 (compatible; BrandAid/1.0)"}
            res = requests.get(url, headers=headers, timeout=10)
            res.raise_for_status()
            root = ET.fromstring(res.content)
            channel = root.find("channel")
            if not channel:
                return []
            items = []
            for item in channel.findall("item"):
                title = item.findtext("title", "")
                description = item.findtext("description", "")
                link = item.findtext("link", "")
                pub_date = item.findtext("pubDate", "")
                text = f"{title}. {description}".strip()
                text = re.sub(r"<[^>]+>", "", text)
                text = re.sub(r"\s+", " ", text).strip()
                if not text or len(text) < 10:
                    continue
                try:
                    created_at = parsedate_to_datetime(pub_date).replace(tzinfo=None)
                except Exception:
                    created_at = datetime.utcnow()
                author = title.split(" - ")[-1].strip() if " - " in title else ""
                items.append({"text": text, "source_url": link, "author": author, "created_at": created_at})
            return items
        except Exception as e:
            print(f"[GoogleNews] Error for '{keyword}': {e}")
            return []

    def fetch(self) -> list:
        results = []
        for keyword in self.keywords:
            print(f"[GoogleNews] Fetching news for: {keyword}")
            items = self._fetch_rss(keyword)
            results.extend(items)
            print(f"[GoogleNews] Found {len(items)} articles for '{keyword}'")
        seen = set()
        unique = []
        for item in results:
            if item["source_url"] not in seen:
                seen.add(item["source_url"])
                unique.append(item)
        print(f"[GoogleNews] Total unique items: {len(unique)}")
        return unique
