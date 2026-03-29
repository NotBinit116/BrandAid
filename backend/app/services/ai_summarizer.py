"""
AI Summarizer — uses Claude API to generate brand sentiment summaries.
"""
import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def summarize_brand_report(
    brand_name: str,
    metrics: dict,
    top_positive: list,
    top_negative: list,
    top_neutral: list,
    filters: dict = None,
) -> str:
    """
    Generate an AI summary of brand sentiment data.
    Returns a plain text summary paragraph.
    """

    # Build context for Claude
    pos = metrics.get("positive_mentions", 0)
    neg = metrics.get("negative_mentions", 0)
    neu = metrics.get("neutral_mentions", 0)
    total = metrics.get("total_mentions", 0)
    health = round((pos / total * 100)) if total > 0 else 0

    # Sample posts for context
    pos_samples = "\n".join([f"- {p['text'][:150]}" for p in top_positive[:3]])
    neg_samples = "\n".join([f"- {p['text'][:150]}" for p in top_negative[:3]])

    prompt = f"""You are a brand analyst. Analyze the following brand monitoring data for "{brand_name}" and write a concise executive summary (3-4 sentences) that:
1. States the overall sentiment health
2. Highlights key positive themes
3. Flags any concerns from negative mentions
4. Gives a brief recommendation

Brand: {brand_name}
Total Mentions: {total}
Positive: {pos} ({round(pos/total*100) if total else 0}%)
Neutral: {neu} ({round(neu/total*100) if total else 0}%)
Negative: {neg} ({round(neg/total*100) if total else 0}%)
Health Score: {health}%

Sample positive mentions:
{pos_samples if pos_samples else "None"}

Sample negative mentions:
{neg_samples if neg_samples else "None"}

Write only the executive summary paragraph, no headers or bullet points."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text.strip()
    except Exception as e:
        print(f"[AI Summarizer] Error: {e}")
        return f"{brand_name} has {total} total mentions with a {health}% positive sentiment rate. {pos} positive, {neu} neutral, and {neg} negative mentions were recorded during this period."
