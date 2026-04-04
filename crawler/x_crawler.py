
import os
import asyncio
import json
from datetime import datetime
from crawler.base_crawler import BaseCrawler
from sqlalchemy.orm import Session

X_EMAIL    = os.getenv("X_EMAIL", "")
X_USERNAME = os.getenv("X_USERNAME", "")
X_PASSWORD = os.getenv("X_PASSWORD", "")

# Cookies file to avoid re-login every run
COOKIES_FILE = os.path.join(os.path.dirname(__file__), ".x_cookies.json")


class XCrawler(BaseCrawler):
    def __init__(self, db: Session, platform_id: int, brand_id: int, keywords: list, brand_name: str = ""):
        super().__init__(db, platform_id, brand_id, keywords, brand_name)

    def fetch(self) -> list:
        if not X_USERNAME:
            print("[X] No credentials — skipping")
            return []
        try:
            return asyncio.run(self._fetch_async())
        except Exception as e:
            print(f"[X] Error: {e}")
            return []

    async def _fetch_async(self) -> list:
        try:
            from twikit import Client
        except ImportError:
            print("[X] twikit not installed — run: pip install twikit")
            return []

        client = Client(language="en-US")

        # Try loading saved cookies first
        if os.path.exists(COOKIES_FILE):
            try:
                client.load_cookies(COOKIES_FILE)
                print("[X] Loaded saved cookies")
            except Exception:
                pass
        else:
            # Fresh login
            try:
                print("[X] Logging in...")
                await client.login(
                    auth_info_1=X_EMAIL,
                    auth_info_2=X_USERNAME,
                    password=X_PASSWORD,
                )
                client.save_cookies(COOKIES_FILE)
                print("[X] Login successful, cookies saved")
            except Exception as e:
                print(f"[X] Login failed: {e}")
                return []

        results = []

        for keyword in self.keywords:
            print(f"[X] Searching for: {keyword}")
            try:
                # Search recent tweets in English
                tweets = await client.search_tweet(
                    f"{keyword} lang:en",
                    product="Latest",
                    count=20,
                )

                for tweet in tweets:
                    text = tweet.full_text or tweet.text or ""

                    # Skip retweets
                    if text.startswith("RT "):
                        continue

                    # Skip very short tweets
                    if len(text) < 20:
                        continue

                    tweet_url = f"https://x.com/{tweet.user.screen_name}/status/{tweet.id}"

                    try:
                        created_at = datetime.strptime(
                            tweet.created_at, "%a %b %d %H:%M:%S +0000 %Y"
                        )
                    except Exception:
                        created_at = datetime.utcnow()

                    results.append({
                        "text": text,
                        "source_url": tweet_url,
                        "author": f"@{tweet.user.screen_name}",
                        "created_at": created_at,
                    })

            except Exception as e:
                print(f"[X] Search error for '{keyword}': {e}")

        print(f"[X] Total items fetched: {len(results)}")
        return results
