import os
import requests
from datetime import datetime
from crawler.base_crawler import BaseCrawler
from sqlalchemy.orm import Session

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_COMMENTS_URL = "https://www.googleapis.com/youtube/v3/commentThreads"


class YouTubeCrawler(BaseCrawler):
    def __init__(self, db: Session, platform_id: int, brand_id: int, keywords: list, brand_name: str = ""):
        super().__init__(db, platform_id, brand_id, keywords, brand_name)
        self.api_key = YOUTUBE_API_KEY

    def _search_videos(self, keyword: str, max_results: int = 10) -> list:
        try:
            params = {
                "part": "snippet", "q": keyword, "type": "video",
                "maxResults": max_results, "order": "date",
                "relevanceLanguage": "en", "key": self.api_key,
            }
            res = requests.get(YOUTUBE_SEARCH_URL, params=params, timeout=10)
            res.raise_for_status()
            return res.json().get("items", [])
        except Exception as e:
            print(f"[YouTube] Search error for '{keyword}': {e}")
            return []

    def _get_comments(self, video_id: str, max_results: int = 20) -> list:
        try:
            params = {
                "part": "snippet", "videoId": video_id,
                "maxResults": max_results, "order": "relevance", "key": self.api_key,
            }
            res = requests.get(YOUTUBE_COMMENTS_URL, params=params, timeout=10)
            if res.status_code == 403:
                return []
            res.raise_for_status()
            return res.json().get("items", [])
        except Exception as e:
            print(f"[YouTube] Comments error for video {video_id}: {e}")
            return []

    def fetch(self) -> list:
        results = []
        for keyword in self.keywords:
            print(f"[YouTube] Searching for: {keyword}")
            videos = self._search_videos(keyword, max_results=5)
            for video in videos:
                snippet = video.get("snippet", {})
                video_id = video.get("id", {}).get("videoId")
                if not video_id:
                    continue
                video_url = f"https://www.youtube.com/watch?v={video_id}"
                title = snippet.get("title", "")
                description = snippet.get("description", "")
                text = f"{title}. {description}".strip()
                if text and len(text) > 10:
                    try:
                        created_at = datetime.fromisoformat(snippet.get("publishedAt", "").replace("Z", "+00:00"))
                    except Exception:
                        created_at = datetime.utcnow()
                    results.append({
                        "text": text, "source_url": video_url,
                        "author": snippet.get("channelTitle", ""), "created_at": created_at,
                    })
                comments = self._get_comments(video_id, max_results=10)
                for comment in comments:
                    top = comment.get("snippet", {}).get("topLevelComment", {})
                    c_snippet = top.get("snippet", {})
                    comment_text = c_snippet.get("textDisplay", "")
                    if not comment_text or len(comment_text) < 5:
                        continue
                    try:
                        created_at = datetime.fromisoformat(c_snippet.get("publishedAt", "").replace("Z", "+00:00"))
                    except Exception:
                        created_at = datetime.utcnow()
                    results.append({
                        "text": comment_text,
                        "source_url": f"{video_url}&lc={top.get('id', '')}",
                        "author": c_snippet.get("authorDisplayName", ""),
                        "created_at": created_at,
                    })
        print(f"[YouTube] Total items fetched: {len(results)}")
        return results
