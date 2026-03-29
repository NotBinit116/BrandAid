"""
Crawler Service — orchestrates all crawlers for a brand.
"""
import os
import sys
from sqlalchemy.orm import Session
from app.models.brand import Brand
from app.models.keyword import BrandKeyword
from app.models.platform import Platform

from crawler.youtube_crawler import YouTubeCrawler
from crawler.google_news_crawler import GoogleNewsCrawler
from crawler.hackernews_crawler import HackerNewsCrawler
from crawler.trustpilot_crawler import TrustpilotCrawler
from crawler.reddit_crawler import RedditCrawler


def get_or_create_platform(db: Session, name: str, type: str) -> int:
    platform = db.query(Platform).filter(Platform.name == name).first()
    if not platform:
        platform = Platform(name=name, type=type, enabled=True)
        db.add(platform)
        db.commit()
        db.refresh(platform)
    return platform.id


def run_crawlers_for_brand(db: Session, brand_id: int) -> dict:
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        return {"error": "Brand not found"}

    keywords = db.query(BrandKeyword).filter(
        BrandKeyword.brand_id == brand_id,
        BrandKeyword.keyword_type == "monitor"
    ).all()

    keyword_list = [kw.keyword for kw in keywords] if keywords else [brand.brand_name]
    brand_name = brand.brand_name

    print(f"\n[CrawlerService] Running crawlers for brand: {brand_name}")
    print(f"[CrawlerService] Keywords: {keyword_list}")

    summary = {
        "brand_id": brand_id,
        "brand_name": brand_name,
        "keywords": keyword_list,
        "results": {}
    }

    # ── YouTube ───────────────────────────────────────────────
    if os.getenv("YOUTUBE_API_KEY"):
        yt_id = get_or_create_platform(db, "YouTube", "video")
        try:
            crawler = YouTubeCrawler(db, yt_id, brand_id, keyword_list, brand_name)
            result = crawler.run()
            summary["results"]["YouTube"] = result
            print(f"[YouTube] Done — saved: {result['saved']}, skipped: {result['skipped']}")
        except Exception as e:
            summary["results"]["YouTube"] = {"error": str(e)}
            print(f"[YouTube] Error: {e}")
    else:
        summary["results"]["YouTube"] = {"skipped": "No API key"}

    # ── Google News ───────────────────────────────────────────
    gn_id = get_or_create_platform(db, "Google News", "news")
    try:
        crawler = GoogleNewsCrawler(db, gn_id, brand_id, keyword_list, brand_name)
        result = crawler.run()
        summary["results"]["Google News"] = result
        print(f"[GoogleNews] Done — saved: {result['saved']}, skipped: {result['skipped']}")
    except Exception as e:
        summary["results"]["Google News"] = {"error": str(e)}
        print(f"[GoogleNews] Error: {e}")

    # ── Hacker News ───────────────────────────────────────────
    hn_id = get_or_create_platform(db, "HackerNews", "forum")
    try:
        crawler = HackerNewsCrawler(db, hn_id, brand_id, keyword_list, brand_name)
        result = crawler.run()
        summary["results"]["HackerNews"] = result
        print(f"[HackerNews] Done — saved: {result['saved']}, skipped: {result['skipped']}")
    except Exception as e:
        summary["results"]["HackerNews"] = {"error": str(e)}
        print(f"[HackerNews] Error: {e}")

    # ── Trustpilot ────────────────────────────────────────────
    tp_id = get_or_create_platform(db, "Trustpilot", "review")
    try:
        crawler = TrustpilotCrawler(db, tp_id, brand_id, keyword_list, brand_name)
        result = crawler.run()
        summary["results"]["Trustpilot"] = result
        print(f"[Trustpilot] Done — saved: {result['saved']}, skipped: {result['skipped']}")
    except Exception as e:
        summary["results"]["Trustpilot"] = {"error": str(e)}
        print(f"[Trustpilot] Error: {e}")

    # ── X / Twitter ───────────────────────────────────────────
    if os.getenv("X_USERNAME"):
        x_id = get_or_create_platform(db, "X", "social")
        try:
            from crawler.x_crawler import XCrawler
            crawler = XCrawler(db, x_id, brand_id, keyword_list, brand_name)
            result = crawler.run()
            summary["results"]["X"] = result
            print(f"[X] Done — saved: {result['saved']}, skipped: {result['skipped']}")
        except Exception as e:
            summary["results"]["X"] = {"error": str(e)}
            print(f"[X] Error: {e}")
    else:
        summary["results"]["X"] = {"skipped": "No X credentials"}

    # ── Reddit ────────────────────────────────────────────────
    if os.getenv("REDDIT_CLIENT_ID"):
        rd_id = get_or_create_platform(db, "Reddit", "forum")
        try:
            crawler = RedditCrawler(db, rd_id, brand_id, keyword_list, brand_name)
            result = crawler.run()
            summary["results"]["Reddit"] = result
            print(f"[Reddit] Done — saved: {result['saved']}, skipped: {result['skipped']}")
        except Exception as e:
            summary["results"]["Reddit"] = {"error": str(e)}
            print(f"[Reddit] Error: {e}")
    else:
        summary["results"]["Reddit"] = {"skipped": "No credentials"}

    total_saved = sum(
        r.get("saved", 0) for r in summary["results"].values()
        if isinstance(r, dict)
    )
    summary["total_saved"] = total_saved
    print(f"\n[CrawlerService] Complete — total saved: {total_saved}")

    return summary
