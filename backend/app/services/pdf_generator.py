"""
PDF Report Generator — creates a simple branded PDF report.
"""
import os
import re
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT

BRAND_CYAN = colors.HexColor("#06b6d4")
BRAND_DARK = colors.HexColor("#0e7490")
SLATE_900  = colors.HexColor("#0f172a")
SLATE_600  = colors.HexColor("#475569")
SLATE_200  = colors.HexColor("#e2e8f0")
EMERALD    = colors.HexColor("#10b981")
RED        = colors.HexColor("#ef4444")
AMBER      = colors.HexColor("#f59e0b")
WHITE      = colors.white


def clean_for_pdf(text: str) -> str:
    """Strip HTML and clean text for ReportLab."""
    if not text:
        return ""
    text = re.sub(r'<br\s*/?>', ' ', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    text = text.replace('&', '&amp;')
    return text


def generate_pdf_report(
    brand_name: str,
    metrics: dict,
    ai_summary: str,
    top_positive: list,
    top_negative: list,
    filters: dict,
    output_path: str,
) -> str:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
    )

    styles = getSampleStyleSheet()
    story  = []

    title_style = ParagraphStyle(
        "Title", parent=styles["Normal"],
        fontSize=24, fontName="Helvetica-Bold",
        textColor=SLATE_900, spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle", parent=styles["Normal"],
        fontSize=11, fontName="Helvetica",
        textColor=SLATE_600, spaceAfter=2,
    )
    section_style = ParagraphStyle(
        "Section", parent=styles["Normal"],
        fontSize=13, fontName="Helvetica-Bold",
        textColor=BRAND_DARK, spaceBefore=16, spaceAfter=8,
    )
    body_style = ParagraphStyle(
        "Body", parent=styles["Normal"],
        fontSize=10, fontName="Helvetica",
        textColor=SLATE_600, spaceAfter=6, leading=16,
    )
    post_style = ParagraphStyle(
        "Post", parent=styles["Normal"],
        fontSize=9, fontName="Helvetica",
        textColor=SLATE_600, spaceAfter=4, leading=14, leftIndent=10,
    )
    small_style = ParagraphStyle(
        "Small", parent=styles["Normal"],
        fontSize=8, fontName="Helvetica",
        textColor=SLATE_600,
    )
    meta_style_neg = ParagraphStyle(
        "MetaNeg", parent=styles["Normal"],
        fontSize=8, fontName="Helvetica",
        textColor=RED, spaceAfter=2,
    )
    meta_style_pos = ParagraphStyle(
        "MetaPos", parent=styles["Normal"],
        fontSize=8, fontName="Helvetica",
        textColor=EMERALD, spaceAfter=2,
    )

    # ── Header ────────────────────────────────────────────────
    story.append(Paragraph("BrandAid", ParagraphStyle(
        "Brand", parent=styles["Normal"],
        fontSize=11, fontName="Helvetica-Bold",
        textColor=BRAND_CYAN, spaceAfter=8,
    )))
    story.append(Paragraph(f"Brand Monitoring Report — {clean_for_pdf(brand_name)}", title_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M')}", subtitle_style))

    filter_parts = []
    if filters.get("filter_platform")   and filters["filter_platform"]   != "All": filter_parts.append(f"Platform: {filters['filter_platform']}")
    if filters.get("filter_sentiment")  and filters["filter_sentiment"]  != "All": filter_parts.append(f"Sentiment: {filters['filter_sentiment']}")
    if filters.get("filter_risk_level") and filters["filter_risk_level"] != "All": filter_parts.append(f"Risk: {filters['filter_risk_level']}")
    if filters.get("date_from"): filter_parts.append(f"From: {filters['date_from']}")
    if filters.get("date_to"):   filter_parts.append(f"To: {filters['date_to']}")
    if filter_parts:
        story.append(Paragraph(f"Filters: {' | '.join(filter_parts)}", small_style))

    story.append(Spacer(1, 0.3*cm))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_CYAN, spaceAfter=16))

    # ── Metrics ───────────────────────────────────────────────
    total    = metrics.get("total_mentions", 0)
    positive = metrics.get("positive_mentions", 0)
    neutral  = metrics.get("neutral_mentions", 0)
    negative = metrics.get("negative_mentions", 0)
    health   = round((positive / total * 100)) if total > 0 else 0

    story.append(Paragraph("Sentiment Overview", section_style))

    metrics_data = [
        ["Total Mentions", "Positive", "Neutral", "Negative", "Health Score"],
        [str(total), str(positive), str(neutral), str(negative), f"{health}%"],
    ]
    metrics_table = Table(metrics_data, colWidths=[3.4*cm]*5)
    metrics_table.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,0), BRAND_CYAN),
        ("TEXTCOLOR",    (0,0), (-1,0), WHITE),
        ("FONTNAME",     (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",     (0,0), (-1,0), 10),
        ("ALIGN",        (0,0), (-1,-1), "CENTER"),
        ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
        ("FONTNAME",     (0,1), (-1,1), "Helvetica-Bold"),
        ("FONTSIZE",     (0,1), (-1,1), 14),
        ("ROWBACKGROUNDS",(0,1),(-1,1),[colors.HexColor("#f8fafc")]),
        ("TEXTCOLOR",    (1,1), (1,1), EMERALD),
        ("TEXTCOLOR",    (3,1), (3,1), RED),
        ("TEXTCOLOR",    (4,1), (4,1), BRAND_CYAN),
        ("BOX",          (0,0), (-1,-1), 1, SLATE_200),
        ("INNERGRID",    (0,0), (-1,-1), 0.5, SLATE_200),
        ("TOPPADDING",   (0,0), (-1,-1), 8),
        ("BOTTOMPADDING",(0,0), (-1,-1), 8),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 0.4*cm))

    # ── Intent breakdown ──────────────────────────────────────
    intents = metrics.get("intents", {})
    if intents:
        story.append(Paragraph("Intent Breakdown", section_style))
        intent_rows = [["Intent", "Count", "% of Total"]]
        for intent, count in sorted(intents.items(), key=lambda x: x[1], reverse=True):
            pct = f"{round(count/total*100)}%" if total > 0 else "0%"
            intent_rows.append([clean_for_pdf(intent or "Unknown"), str(count), pct])

        intent_table = Table(intent_rows, colWidths=[9*cm, 4*cm, 4*cm])
        intent_table.setStyle(TableStyle([
            ("BACKGROUND",   (0,0), (-1,0), BRAND_DARK),
            ("TEXTCOLOR",    (0,0), (-1,0), WHITE),
            ("FONTNAME",     (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE",     (0,0), (-1,-1), 9),
            ("ALIGN",        (1,0), (-1,-1), "CENTER"),
            ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.HexColor("#f8fafc"), WHITE]),
            ("BOX",          (0,0), (-1,-1), 1, SLATE_200),
            ("INNERGRID",    (0,0), (-1,-1), 0.5, SLATE_200),
            ("TOPPADDING",   (0,0), (-1,-1), 6),
            ("BOTTOMPADDING",(0,0), (-1,-1), 6),
            ("LEFTPADDING",  (0,0), (-1,-1), 8),
        ]))
        story.append(intent_table)
        story.append(Spacer(1, 0.4*cm))

    # ── AI Summary ────────────────────────────────────────────
    story.append(Paragraph("AI Executive Summary", section_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=SLATE_200, spaceAfter=8))

    summary_table = Table(
        [[Paragraph(clean_for_pdf(ai_summary), body_style)]],
        colWidths=[17*cm]
    )
    summary_table.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), colors.HexColor("#f0f9ff")),
        ("BOX",          (0,0), (-1,-1), 1, BRAND_CYAN),
        ("TOPPADDING",   (0,0), (-1,-1), 10),
        ("BOTTOMPADDING",(0,0), (-1,-1), 10),
        ("LEFTPADDING",  (0,0), (-1,-1), 12),
        ("RIGHTPADDING", (0,0), (-1,-1), 12),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 0.4*cm))

    # ── Negative Posts ────────────────────────────────────────
    if top_negative:
        story.append(Paragraph("High Risk & Negative Mentions", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=SLATE_200, spaceAfter=8))
        for i, post in enumerate(top_negative[:5], 1):
            text     = clean_for_pdf(post.get("text", ""))[:300]
            platform = clean_for_pdf(post.get("platform", ""))
            risk     = clean_for_pdf(post.get("risk_level", "")).upper()
            date     = clean_for_pdf(post.get("date", ""))
            intent   = clean_for_pdf(post.get("intent", ""))
            story.append(Paragraph(f"{i}. [{platform}] [{risk}] {date} — {intent}", meta_style_neg))
            story.append(Paragraph(f"{text}", post_style))
            story.append(Spacer(1, 0.1*cm))

    # ── Positive Posts ────────────────────────────────────────
    if top_positive:
        story.append(Paragraph("Top Positive Mentions", section_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=SLATE_200, spaceAfter=8))
        for i, post in enumerate(top_positive[:5], 1):
            text     = clean_for_pdf(post.get("text", ""))[:300]
            platform = clean_for_pdf(post.get("platform", ""))
            date     = clean_for_pdf(post.get("date", ""))
            intent   = clean_for_pdf(post.get("intent", ""))
            story.append(Paragraph(f"{i}. [{platform}] {date} — {intent}", meta_style_pos))
            story.append(Paragraph(f"{text}", post_style))
            story.append(Spacer(1, 0.1*cm))

    # ── Footer ────────────────────────────────────────────────
    story.append(Spacer(1, 0.5*cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=SLATE_200, spaceAfter=8))
    story.append(Paragraph(
        f"Generated by BrandAid — Brand Monitoring & Sentiment Analysis Platform | {datetime.now().strftime('%Y')}",
        ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=SLATE_600, alignment=TA_CENTER)
    ))

    doc.build(story)
    return output_path
