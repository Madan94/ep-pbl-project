"""
RenewCred - Module 5: PDF Certificate Generator
Produces native binary PDF files (.pdf) using ReportLab and printable HTML documents
with auto-print triggers for Digital Carbon Certificates.
"""

from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def generate_certificate_pdf_bytes(cert: dict) -> bytes:
    """
    Generates a native binary .pdf document for the carbon credit certificate.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CertTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0f172a'),
        alignment=1
    )

    subtitle_style = ParagraphStyle(
        'CertSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=14,
        textColor=colors.HexColor('#10b981'),
        alignment=1
    )

    label_style = ParagraphStyle(
        'CertLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor('#64748b')
    )

    val_style = ParagraphStyle(
        'CertVal',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0f172a')
    )

    hash_style = ParagraphStyle(
        'CertHash',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#334155')
    )

    disclaimer_style = ParagraphStyle(
        'CertDisclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#b45309'),
        alignment=1
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("RenewCred", title_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("DIGITAL CARBON CERTIFICATE", subtitle_style))
    elements.append(Spacer(1, 15))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#10b981'), spaceAfter=20))

    # Grid Data Table
    table_data = [
        [
            Paragraph("CERTIFICATE ID", label_style),
            Paragraph("PROJECT ID", label_style)
        ],
        [
            Paragraph(cert.get('certificate_id', 'RCC-2026-88102'), val_style),
            Paragraph(cert.get('project_id', 'SOLAR-ESP32-001'), val_style)
        ],
        [Paragraph("", label_style), Paragraph("", label_style)],
        [
            Paragraph("CLEAN ENERGY GENERATED", label_style),
            Paragraph("CO₂ REDUCED", label_style)
        ],
        [
            Paragraph(f"{cert.get('energy_kwh', 125.4):.2f} kWh", val_style),
            Paragraph(f"{cert.get('co2_reduced_kg', 102.83):.2f} kg", val_style)
        ],
        [Paragraph("", label_style), Paragraph("", label_style)],
        [
            Paragraph("CARBON CREDITS ISSUED", label_style),
            Paragraph("AI VERIFICATION (dMRV)", label_style)
        ],
        [
            Paragraph(f"{cert.get('carbon_credits', 0.10283):.6f}", val_style),
            Paragraph(cert.get('verification_status', 'AI VERIFIED ✓'), val_style)
        ]
    ]

    t = Table(table_data, colWidths=[260, 260])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))

    # Cryptographic Hashes
    elements.append(Paragraph("SHA-256 CERTIFICATE HASH", label_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(cert.get('certificate_hash', '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'), hash_style))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph("POLYGON AMOY BLOCKCHAIN TX HASH", label_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(cert.get('tx_hash', '0x83A92F45B3d1912A098Efa92C912bF5C45B932F1'), hash_style))
    elements.append(Spacer(1, 25))

    # Disclaimer Box
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#f59e0b'), spaceAfter=10))
    elements.append(Paragraph("COMPLIANCE NOTICE: Prototype certificate generated for academic project demonstration. Not an independently certified Verra/Gold Standard carbon credit.", disclaimer_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()


def generate_certificate_html(cert: dict) -> str:
    """
    Renders an HTML printable page with automatic window.print() trigger to save as PDF.
    """
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RenewCred Certificate - {cert['certificate_id']}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    body {{
      font-family: 'Inter', sans-serif;
      background-color: #090d16;
      color: #e2e8f0;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }}
    .cert-card {{
      max-width: 800px;
      width: 100%;
      background: #0f172a;
      border: 2px solid #10b981;
      border-radius: 24px;
      padding: 48px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }}
    .header {{
      text-align: center;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }}
    .brand {{
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
    }}
    .title {{
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #10b981;
      font-weight: 700;
      margin-top: 8px;
    }}
    .meta-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 32px;
    }}
    .meta-box {{
      background: #020617;
      border: 1px solid #1e293b;
      padding: 16px;
      border-radius: 12px;
    }}
    .label {{
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
    }}
    .value {{
      font-size: 18px;
      font-weight: 700;
      color: #f8fafc;
      margin-top: 4px;
    }}
    .hash-box {{
      background: #020617;
      border: 1px solid #1e293b;
      padding: 12px;
      border-radius: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #94a3b8;
      word-break: break-all;
      margin-bottom: 16px;
    }}
    .disclaimer-box {{
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      padding: 14px;
      font-size: 12px;
      color: #fbbf24;
      text-align: center;
      margin-top: 24px;
    }}
    @media print {{
      body {{ background-color: #ffffff; color: #000000; padding: 0; }}
      .cert-card {{ border-color: #000000; box-shadow: none; background: #ffffff; color: #000000; }}
      .meta-box, .hash-box {{ background: #f8fafc; border-color: #cbd5e1; color: #000000; }}
      .value {{ color: #000000; }}
    }}
  </style>
</head>
<body>
  <div class="cert-card">
    <div class="header">
      <div class="brand">🌱 RenewCred</div>
      <div class="title">Digital Carbon Certificate</div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <div class="label">Certificate ID</div>
        <div class="value">{cert['certificate_id']}</div>
      </div>
      <div class="meta-box">
        <div class="label">Project ID</div>
        <div class="value">{cert['project_id']}</div>
      </div>
      <div class="meta-box">
        <div class="label">Clean Energy Generated</div>
        <div class="value">{cert['energy_kwh']:.2f} kWh</div>
      </div>
      <div class="meta-box">
        <div class="label">CO₂ Reduced</div>
        <div class="value" style="color: #10b981;">{cert['co2_reduced_kg']:.2f} kg</div>
      </div>
      <div class="meta-box">
        <div class="label">Carbon Credits Issued</div>
        <div class="value" style="color: #10b981;">{cert['carbon_credits']:.6f}</div>
      </div>
      <div class="meta-box">
        <div class="label">AI Verification</div>
        <div class="value">{cert['verification_status']}</div>
      </div>
    </div>

    <div class="label">SHA-256 Certificate Hash</div>
    <div class="hash-box">{cert['certificate_hash']}</div>

    <div class="label">Polygon Amoy Blockchain Tx Hash</div>
    <div class="hash-box">{cert.get('tx_hash', '0x83A92F45B3d1912A098Efa92C912bF5C45B932F1')}</div>

    <div class="disclaimer-box">
      <strong>⚠️ COMPLIANCE NOTICE:</strong> Prototype certificate generated for academic project demonstration. Not an independently certified Verra/Gold Standard carbon credit.
    </div>
  </div>

  <script>
    // Auto-trigger browser print dialog on load
    window.addEventListener('DOMContentLoaded', () => {{
      setTimeout(() => {{
        window.print();
      }}, 500);
    }});
  </script>
</body>
</html>"""
