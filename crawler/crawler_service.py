"""
Crawler Service — orchestrates all crawlers for a brand.
Called by the API route or the scheduler.
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


# Platform name → crawler class mapping
CRAWLER_MAP = {
    "YouTube":     YouTubeCrawler,
    "Reddit":      RedditCrawler,
    "HackerNews":  HackerNewsCrawler,
    "Google News": GoogleNewsCrawler,
    "Trustpilot":  TrustpilotCrawler,
}


def get_platform_id(db: Session, name: str) -> int | None:
    platform = db.query(Platform).filter(Platform.name == name).first()
    return platform.id if platform else None


def run_crawlers_for_brand(db: Session, brand_id: int) -> dict:
    """
    Runs all available crawlers for a brand.
    Fetches keywords from DB, runs each crawler, returns summary.
    """
    # Get brand
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        return {"error": "Brand not found"}

    # Get monitor keywords for this brand
    keywords = db.query(BrandKeyword).filter(
        BrandKeyword.brand_id == brand_id,
        BrandKeyword.keyword_type == "monitor"
    ).all()

    if not keywords:
        # Fall back to brand name as keyword
        keyword_list = [brand.brand_name]
    else:
        keyword_list = [kw.keyword for kw in keywords]

    print(f"\n[CrawlerService] Running crawlers for brand: {brand.brand_name}")
    print(f"[CrawlerService] Keywords: {keyword_list}")

    summary = {
        "brand_id": brand_id,
        "brand_name": brand.brand_name,
        "keywords": keyword_list,
        "results": {}
    }

    # ── YouTube ───────────────────────────────────────────────
    yt_platform_id = get_platform_id(db, "YouTube")
    if yt_platform_id and os.getenv("YOUTUBE_API_KEY"):
        try:
            crawler = YouTubeCrawler(db, yt_platform_id, brand_id, keyword_list)
            result = crawler.run()
            summary["results"]["YouTube"] = result
            print(f"[YouTube] Done — saved: {result['saved']}, skipped: {result['skipped']}")
        except Exception as e:
            summary["results"]["YouTube"] = {"error": str(e)}
            print(f"[YouTube] Error: {e}")
    else:
        summary["results"]["YouTube"] = {"skipped": "No API key or platform not found"}

    # ── Google News ───────────────────────────────────────────
    gn_platform_id = get_platform_id(db, "Google News")
    if not gn_platform_id:
        # Create it if not seeded
        from app.models.platform import Platform
        gn = Platform(name="Google News", type="news", enabled=True)
        db.add(gn)
        db.commit()
        db.refresh(gn)
        gn_platform_id = gn.id

    try:
        crawler = GoogleNewsCrawler(db, gn_platform_id, brand_id, keyword_list)
        result = crawler.run()
        summary["results"]["Google News"] = result
        print(f"[GoogleNews] Done — saved: {result['saved']}, skipped: {result['skipped']}")
    except Exception as e:
        summary["results"]["Google News"] = {"error": str(e)}
        print(f"[GoogleNews] Error: {e}")

    # ── Hacker News ───────────────────────────────────────────
    hn_platform_id = get_platform_id(db, "HackerNews")
    if not hn_platform_id:
        from app.models.platform import Platform
        hn = Platform(name="HackerNews", type="forum", enabled=True)
        db.add(hn)
        db.commit()
        db.refresh(hn)
        hn_platform_id = hn.id

    try:
        crawler = HackerNewsCrawler(db, hn_platform_id, brand_id, keyword_list)
        result = crawler.run()
        summary["results"]["HackerNews"] = result
        print(f"[HackerNews] Done — saved: {result['saved']}, skipped: {result['skipped']}")
    except Exception as e:
        summary["results"]["HackerNews"] = {"error": str(e)}
        print(f"[HackerNews] Error: {e}")

    # ── Trustpilot ────────────────────────────────────────────
    tp_platform_id = get_platform_id(db, "Trustpilot")
    if not tp_platform_id:
        from app.models.platform import Platform
        tp = Platform(name="Trustpilot", type="review", enabled=True)
        db.add(tp)
        db.commit()
        db.refresh(tp)
        tp_platform_id = tp.id

    try:
        crawler = TrustpilotCrawler(db, tp_platform_id, brand_id, keyword_list)
        result = crawler.run()
        summary["results"]["Trustpilot"] = result
        print(f"[Trustpilot] Done — saved: {result['saved']}, skipped: {result['skipped']}")
    except Exception as e:
        summary["results"]["Trustpilot"] = {"error": str(e)}
        print(f"[Trustpilot] Error: {e}")

    # ── Reddit (if credentials available) ────────────────────
    rd_platform_id = get_platform_id(db, "Reddit")
    if rd_platform_id and os.getenv("REDDIT_CLIENT_ID"):
        try:
            crawler = RedditCrawler(db, rd_platform_id, brand_id, keyword_list)
            result = crawler.run()
            summary["results"]["Reddit"] = result
            print(f"[Reddit] Done — saved: {result['saved']}, skipped: {result['skipped']}")
        except Exception as e:
            summary["results"]["Reddit"] = {"error": str(e)}
            print(f"[Reddit] Error: {e}")
    else:
        summary["results"]["Reddit"] = {"skipped": "No credentials configured"}

    total_saved = sum(
        r.get("saved", 0) for r in summary["results"].values()
        if isinstance(r, dict)
    )
    summary["total_saved"] = total_saved
    print(f"\n[CrawlerService] Complete — total saved: {total_saved}")

    return summary
