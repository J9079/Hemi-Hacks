import os
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def build_pdf(output_path):
    # Register TrueType fonts available on Windows
    font_reg = "Helvetica"
    font_bold = "Helvetica-Bold"
    try:
        if os.path.exists("C:/Windows/Fonts/segoeui.ttf"):
            pdfmetrics.registerFont(TTFont("SegoeUI", "C:/Windows/Fonts/segoeui.ttf"))
            font_reg = "SegoeUI"
        if os.path.exists("C:/Windows/Fonts/segoeuib.ttf"):
            pdfmetrics.registerFont(TTFont("SegoeUI-Bold", "C:/Windows/Fonts/segoeuib.ttf"))
            font_bold = "SegoeUI-Bold"
        if os.path.exists("C:/Windows/Fonts/consola.ttf"):
            pdfmetrics.registerFont(TTFont("Consolas", "C:/Windows/Fonts/consola.ttf"))
            pdfmetrics.registerFont(TTFont("Consolas-Bold", "C:/Windows/Fonts/consolab.ttf"))
    except Exception as e:
        print(f"Font registration notice: {e}")

    # Dimensions for Landscape A4: 841.89 x 595.27 points
    width, height = landscape(A4)
    c = canvas.Canvas(output_path, pagesize=landscape(A4))
    c.setTitle("Surplus-to-Shelter Unified System Architecture")
    c.setAuthor("Surplus-to-Shelter Platform Team")

    # High-contrast, executive palette
    C_OUTER_BG = HexColor("#070b14")      # Ultra-deep slate
    C_CONTAINER_BG = HexColor("#0d1527")  # Deep Navy Container
    C_BORDER_MAIN = HexColor("#223354")   # Subtle cyan-slate border
    C_INNER_CARD = HexColor("#131e36")    # Card body
    C_INNER_BORDER = HexColor("#1e2d4a")  # Card border
    
    C_EMERALD = HexColor("#10b981")
    C_EMERALD_LIGHT = HexColor("#34d399")
    C_BLUE = HexColor("#38bdf8")
    C_AMBER = HexColor("#fbbf24")
    C_PURPLE = HexColor("#a855f7")
    C_TEAL = HexColor("#14b8a6")
    C_ROSE = HexColor("#f43f5e")

    C_TEXT_WHITE = HexColor("#ffffff")
    C_TEXT_MAIN = HexColor("#f1f5f9")
    C_TEXT_MUTED = HexColor("#94a3b8")
    C_DIVIDER = HexColor("#223354")

    # 1. Page Background
    c.setFillColor(C_OUTER_BG)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # 2. Main Outer Container Box (Representing the outer ┌──────┐ frame)
    ox = 18
    oy = 16
    ow = width - (ox * 2)   # 805.89 pt
    oh = height - (oy * 2)  # 563.27 pt

    c.setFillColor(C_CONTAINER_BG)
    c.setStrokeColor(C_BORDER_MAIN)
    c.setLineWidth(1.2)
    c.roundRect(ox, oy, ow, oh, 8, fill=1, stroke=1)

    # =========================================================================
    # HEADER SECTION
    # =========================================================================
    head_h = 50
    head_y = oy + oh - head_h
    c.setFillColor(HexColor("#06231d")) # Rich dark emerald
    c.roundRect(ox, head_y, ow, head_h, 8, fill=1, stroke=0)
    c.rect(ox, head_y, ow, 10, fill=1, stroke=0) # square off bottom

    # Divider below header
    c.setStrokeColor(C_EMERALD)
    c.setLineWidth(1.2)
    c.line(ox, head_y, ox + ow, head_y)

    c.setFont(font_bold, 14.5)
    c.setFillColor(C_TEXT_WHITE)
    c.drawCentredString(width / 2, head_y + 28, "SURPLUS-TO-SHELTER   |   UNIFIED SYSTEM ARCHITECTURE")

    c.setFont(font_reg, 8.5)
    c.setFillColor(C_EMERALD_LIGHT)
    c.drawCentredString(width / 2, head_y + 12, "Real-Time Food Rescue Routing & Redistribution Engine   *   Full-Stack Production Blueprint")

    # =========================================================================
    # SECTION 1: PRESENTATION LAYER (React 18 SPA + Vite + Tailwind CSS + Leaflet Engine)
    # =========================================================================
    s1_top = head_y
    s1_title_y = s1_top - 18
    c.setFont(font_bold, 9.5)
    c.setFillColor(C_TEXT_WHITE)
    c.drawString(ox + 14, s1_title_y, "1. PRESENTATION LAYER (React 18 SPA + Vite + Tailwind CSS + Leaflet Engine)")

    s1_boxes_y = s1_top - 100
    s1_boxes_h = 76
    col4_w = (ow - 36) / 4

    portals = [
        ("🍲 Donor Portal", C_AMBER, [
            "• Post Surplus Food (Qty, Expiry, Veg)",
            "• GPS Coordinates (Auto-Detect)",
            "• Full Post CRUD (Edit / Cancel Post)",
            "• Active Delivery Real-Time Tracking"
        ]),
        ("🏠 NGO / Shelter", C_EMERALD, [
            "• Match Radar Feed (Candidate ranking)",
            "• Capacity Slider (Live Intake limits)",
            "• 1-Click Accept / Justified Reject",
            "• Compatibility Score Breakdown Modal"
        ]),
        ("🛵 Driver Hub", C_BLUE, [
            "• Nearest Radar (Haversine distance km)",
            "• Turn-by-Turn FSM Delivery Tracking",
            "• Web Audio Dispatch Alert Chime",
            "• Proximity Countdown & Arrival Detector"
        ]),
        ("📊 Admin Command", C_PURPLE, [
            "• Leaflet Real-Time Rescue Mesh Map",
            "• Carbon & Meal ESG Automated Audit",
            "• Role Access & RBAC Permissions",
            "• System Dispatch Queue Observability"
        ])
    ]

    for i, (title, color, bullets) in enumerate(portals):
        bx = ox + 10 + i * (col4_w + 5.3)
        c.setFillColor(C_INNER_CARD)
        c.setStrokeColor(color)
        c.setLineWidth(0.9)
        c.roundRect(bx, s1_boxes_y, col4_w, s1_boxes_h, 5, fill=1, stroke=1)

        c.setFont(font_bold, 8.2)
        c.setFillColor(color)
        c.drawString(bx + 8, s1_boxes_y + s1_boxes_h - 13, title)

        c.setFont(font_reg, 6.8)
        c.setFillColor(C_TEXT_MUTED)
        by = s1_boxes_y + s1_boxes_h - 26
        for bullet in bullets:
            c.drawString(bx + 8, by, bullet)
            by -= 12

    # Divider below Section 1
    s1_div_y = s1_boxes_y - 10
    c.setStrokeColor(C_DIVIDER)
    c.setLineWidth(1)
    c.line(ox, s1_div_y, ox + ow, s1_div_y)

    # =========================================================================
    # MIDDLE SECTION: SECTION 2 (API GATEWAY) & SECTION 3 (DOMAIN LOGIC)
    # =========================================================================
    mid_top = s1_div_y
    mid_h = 168
    mid_y = mid_top - mid_h

    # Mid vertical divider
    split_x = ox + (ow * 0.44)
    c.line(split_x, mid_top, split_x, mid_y)

    # LEFT: 2. API GATEWAY & TRANSPORT (Express 4)
    c.setFont(font_bold, 9.5)
    c.setFillColor(C_BLUE)
    c.drawString(ox + 14, mid_top - 18, "2. API GATEWAY & TRANSPORT (Express 4)")

    # Left bullet list
    c.setFont(font_reg, 7.3)
    c.setFillColor(C_TEXT_MAIN)
    left_bullets = [
        ("• Unified Serving:", "Port 5000 + SPA Wildcard Fallback app.get('*')"),
        ("• Security Guard:", "JWT 'protect' Middleware + RBAC Role Authorization"),
        ("• RESTful Endpoints:", "Full CRUD across /api/donations, /api/ngos, /api/drivers"),
        ("• Socket.IO Mesh:", "Isolated rooms (user_{id}, feed), live event push"),
        ("• Dual Architecture:", "Persistent server.js (Render) & serverless api/index.js (Vercel)"),
        ("• Public Impact API:", "Unauthenticated live metrics (/api/dashboard/public-stats)"),
        ("• Connection Pooling:", "SSL/TLS encrypted Mongoose pool with serverless caching")
    ]
    ly = mid_top - 36
    for tag, desc in left_bullets:
        c.setFont(font_bold, 7.2)
        c.setFillColor(HexColor("#bae6fd"))
        c.drawString(ox + 14, ly, tag)
        c.setFont(font_reg, 7.0)
        c.setFillColor(C_TEXT_MUTED)
        c.drawString(ox + 14 + c.stringWidth(tag, font_bold, 7.2) + 4, ly, desc)
        ly -= 18.5

    # RIGHT: 3. DOMAIN LOGIC: MATCHING ALGORITHM & DELIVERY FSM
    c.setFont(font_bold, 9.5)
    c.setFillColor(C_PURPLE)
    c.drawString(split_x + 14, mid_top - 18, "3. DOMAIN LOGIC: MATCHING ALGORITHM & DELIVERY FSM")

    # Formula Box
    c.setFillColor(C_INNER_CARD)
    c.setStrokeColor(C_EMERALD)
    c.setLineWidth(0.8)
    c.roundRect(split_x + 12, mid_top - 68, (ow - (split_x - ox)) - 24, 46, 4, fill=1, stroke=1)

    c.setFont(font_bold, 7.5)
    c.setFillColor(C_EMERALD)
    c.drawString(split_x + 20, mid_top - 33, "• Multi-Factor Matching Scoring Formula:")

    c.setFont(font_bold, 8)
    c.setFillColor(C_AMBER)
    c.drawString(split_x + 30, mid_top - 46, "Score = (0.35 * S_dist) + (0.30 * S_cap) + (0.20 * S_urg) + (0.15 * S_exp)")

    c.setFont(font_reg, 6.7)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(split_x + 30, mid_top - 58, "Distance <= 15km Haversine  |  Intake >= Meals  |  Safe Transit < Usable Expiry Buffer")

    # FSM State Machine Box
    c.setFillColor(C_INNER_CARD)
    c.setStrokeColor(C_BLUE)
    c.roundRect(split_x + 12, mid_top - 132, (ow - (split_x - ox)) - 24, 58, 4, fill=1, stroke=1)

    c.setFont(font_bold, 7.5)
    c.setFillColor(C_BLUE)
    c.drawString(split_x + 20, mid_top - 82, "• Delivery State Machine (FSM):")

    # FSM visual flow representation
    c.setFont(font_bold, 7.2)
    c.setFillColor(HexColor("#38bdf8"))
    c.drawString(split_x + 30, mid_top - 98, "[POSTED]  ──>  [MATCHED]  ──>  [ASSIGNED]")
    c.drawString(split_x + 30, mid_top - 113, "      └──>  [PICKUP_STARTED]  ──>  [PICKED_UP]  ──>  [DELIVERED]")

    c.setFont(font_reg, 6.7)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(split_x + 30, mid_top - 125, "Turnkey state advancement with proximity arrival detection and shelter capacity updates")

    # ESG Model Box
    c.setFont(font_bold, 7.2)
    c.setFillColor(HexColor("#34d399"))
    c.drawString(split_x + 14, mid_top - 146, "• ESG Carbon Model: 1 Meal = 0.42 kg Food  *  1 kg Food = 2.5 kg CO2e Avoided")
    c.setFont(font_reg, 6.8)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(split_x + 26, mid_top - 158, "Automated ESG social calculation on verified delivery (eliminates landfill methane decomposition)")

    # Divider below Middle Section
    c.setStrokeColor(C_DIVIDER)
    c.setLineWidth(1)
    c.line(ox, mid_y, ox + ow, mid_y)

    # =========================================================================
    # SECTION 4: DATA PERSISTENCE & MULTI-TARGET DEPLOYMENT INFRASTRUCTURE
    # =========================================================================
    s4_top = mid_y
    c.setFont(font_bold, 9.5)
    c.setFillColor(C_TEAL)
    c.drawString(ox + 14, s4_top - 18, "4. DATA PERSISTENCE & MULTI-TARGET DEPLOYMENT INFRASTRUCTURE")

    col3_w = (ow - 32) / 3
    s4_box_h = 100
    s4_box_y = s4_top - 128

    data_cards = [
        ("MongoDB Atlas Replica Set", HexColor("#14b8a6"), [
            "• Cluster: cluster0.i2iv3xy.mongodb.net",
            "• Database: surplus_to_shelter (3-node geo-replica)",
            "• Serverless conn caching: mongoose.readyState >= 1",
            "• Strict Zero Dummy Data policy (Manual seedData.js)",
            "• 8-second cloud handshake timeout with safe fallback",
            "• SSL/TLS encrypted connection pool (SRV protocol)"
        ]),
        ("Mongoose Schemas & Indexes", C_TEXT_WHITE, [
            "• Users & Roles: DONOR, NGO, DRIVER, ADMIN",
            "• Profiles: DonorProfile, NGOProfile, DriverProfile",
            "• Donation: Category, quantity, expiryTime, safety, match",
            "• Delivery: Driver, NGO, audit timestamps, status",
            "• 2dsphere Geospatial Index on [longitude, latitude]",
            "• Compound query indexes on: { status: 1, createdAt: -1 }"
        ]),
        ("Multi-Target Production Deployment", HexColor("#38bdf8"), [
            "• VERCEL DEPLOYMENT (vercel.json):",
            "   - Global Edge CDN frontend from client/dist",
            "   - Node.js Serverless Function entry at api/index.js",
            "• RENDER DEPLOYMENT (render.yaml):",
            "   - Persistent Web Service (Node.js + WebSockets)",
            "• ALL-IN-ONE BUILD:",
            "   - npm run build (compiles client) && npm start (port 5000)"
        ])
    ]

    for i, (title, color, bullets) in enumerate(data_cards):
        bx = ox + 10 + i * (col3_w + 6)
        c.setFillColor(C_INNER_CARD)
        c.setStrokeColor(color)
        c.setLineWidth(0.9)
        c.roundRect(bx, s4_box_y, col3_w, s4_box_h, 5, fill=1, stroke=1)

        c.setFont(font_bold, 8.2)
        c.setFillColor(color)
        c.drawString(bx + 8, s4_box_y + s4_box_h - 13, title)

        c.setFont(font_reg, 6.8)
        c.setFillColor(C_TEXT_MUTED)
        by = s4_box_y + s4_box_h - 25
        for bullet in bullets:
            c.drawString(bx + 8, by, bullet)
            by -= 12

    # =========================================================================
    # FOOTER FLOW BAR
    # =========================================================================
    foot_y = oy + 6
    foot_h = 32
    c.setStrokeColor(C_DIVIDER)
    c.setLineWidth(1)
    c.line(ox, oy + foot_h, ox + ow, oy + foot_h)

    c.setFont(font_bold, 7.8)
    c.setFillColor(HexColor("#38bdf8"))
    flow_text = "DATA FLOW: Client (REST / WebSockets)  ──>  Gateway & Security  ──>  Domain Logic & Matching Engine  ──>  MongoDB Atlas Cloud"
    c.drawString(ox + 12, foot_y + 12, flow_text)

    c.setFont(font_bold, 7.8)
    c.setFillColor(C_EMERALD)
    c.drawRightString(ox + ow - 12, foot_y + 12, "[PAGE 1 OF 1]")

    # Single page close
    c.showPage()
    c.save()
    print(f"Single page PDF successfully created at: {output_path}")

if __name__ == "__main__":
    out = os.path.abspath("Surplus_to_Shelter_Architecture_Diagram.pdf")
    build_pdf(out)
