"""
Reddit Crawler — fetches posts and comments mentioning the brand.
Requires Reddit API credentials (PRAW).
Add to .env:
    REDDIT_CLIENT_ID=your_client_id
    REDDIT_CLIENT_SECRET=your_client_secret
    REDDIT_USERNAME=your_username
    REDDIT_PASSWORD=your_password
"""
import os
from datetime import datetime
from crawler.base_crawler import BaseCrawler
from sqlalchemy.orm import Session

REDDIT_CLIENT_ID     = os.getenv("REDDIT_CLIENT_ID", "")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "")
REDDIT_USERNAME      = os.getenv("REDDIT_USERNAME", "")
REDDIT_PASSWORD      = os.getenv("REDDIT_PASSWORD", "")


class RedditCrawler(BaseCrawler):
    def __init__(self, db: Session, platform_id: int, brand_id: int, keywords: list):
        super().__init__(db, platform_id, brand_id, keywords)
        self.reddit = None
        self._init_reddit()

    def _init_reddit(self):
        if not REDDIT_CLIENT_ID:
            print("[Reddit] No credentials found — skipping Reddit crawler")
            return
        try:
            import praw
            self.reddit = praw.Reddit(
                client_id=REDDIT_CLIENT_ID,
                client_secret=REDDIT_CLIENT_SECRET,
                username=REDDIT_USERNAME,
                password=REDDIT_PASSWORD,
                user_agent="BrandAid/1.0 brand monitoring tool"
            )
            print("[Reddit] Connected successfully")
        except Exception as e:
            print(f"[Reddit] Connection error: {e}")

    def fetch(self) -> list:
        if not self.reddit:
            print("[Reddit] Skipped — no credentials configured")
            return []

        results = []

        for keyword in self.keywords:
            print(f"[Reddit] Searching for: {keyword}")
            try:
                # Search all of Reddit
                for submission in self.reddit.subreddit("all").search(
                    keyword, sort="new", limit=25
                ):
                    # Add post title + selftext
                    text = f"{submission.title}. {submission.selftext}".strip()
                    if text and len(text) > 10:
                        results.append({
                            "text": text[:2000],
                            "source_url": f"https://reddit.com{submission.permalink}",
                            "author": str(submission.author),
                            "created_at": datetime.utcfromtimestamp(submission.created_utc),
                        })

                    # Add top comments
                    submission.comments.replace_more(limit=0)
                    for comment in submission.comments.list()[:10]:
                        if not comment.body or len(comment.body) < 10:
                            continue
                        results.append({
                            "text": comment.body[:2000],
                            "source_url": f"https://reddit.com{comment.permalink}",
                            "author": str(comment.author),
                            "created_at": datetime.utcfromtimestamp(comment.created_utc),
                        })

            except Exception as e:
                print(f"[Reddit] Error searching '{keyword}': {e}")

        print(f"[Reddit] Total items: {len(results)}")
        return results
