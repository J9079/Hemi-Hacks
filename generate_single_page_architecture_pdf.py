import sys
import os
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

def create_single_page_pdf(output_path):
    # Dimensions for Landscape A4: 841.89 x 595.27 points
    width, height = landscape(A4)
    c = canvas.Canvas(output_path, pagesize=landscape(A4))
    c.setTitle("Surplus-to-Shelter System Architecture (Single Page)")
    c.setAuthor("Surplus-to-Shelter Architecture Team")

    # Dark high-contrast modern palette
    C_BG = HexColor("#090d16")          # Deep Navy/Slate
    C_CARD_BG = HexColor("#131c2e")     # Slate 850
    C_CARD_BORDER = HexColor("#22324d") # Slate 700
    C_HEADER_BG = HexColor("#0a1f1d")   # Emerald Dark
    C_EMERALD = HexColor("#10b981")     # Emerald 500
    C_EMERALD_LIGHT = HexColor("#34d399")
    C_BLUE = HexColor("#38bdf8")        # Sky Blue
    C_AMBER = HexColor("#fbbf24")       # Amber 400
    C_PURPLE = HexColor("#a855f7")      # Purple 500
    C_ROSE = HexColor("#f43f5e")        # Rose 500
    C_TEXT_MAIN = HexColor("#f8fafc")   # Slate 50
    C_TEXT_MUTED = HexColor("#94a3b8")  # Slate 400
    C_ACCENT_BAR = HexColor("#0284c7")

    # 1. Background
    c.setFillColor(C_BG)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # 2. Top Header Banner (Height: 52pt)
    c.setFillColor(C_HEADER_BG)
    c.rect(0, height - 52, width, 52, fill=1, stroke=0)
    c.setStrokeColor(C_EMERALD)
    c.setLineWidth(1.5)
    c.line(0, height - 52, width, height - 52)

    # Header Title
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(25, height - 26, "SURPLUS-TO-SHELTER  |  UNIFIED SYSTEM ARCHITECTURE")
    c.setFont("Helvetica", 8.5)
    c.setFillColor(C_EMERALD_LIGHT)
    c.drawString(25, height - 42, "Real-Time Food Rescue Routing & Redistribution Engine  *  Full-Stack Production Blueprint")

    # Header Badges (Right side)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(C_TEXT_MAIN)
    c.drawRightString(width - 25, height - 24, "SINGLE-PAGE ARCHITECTURE BLUEPRINT")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(C_TEXT_MUTED)
    c.drawRightString(width - 25, height - 40, "Node.js Express  *  React 18 SPA  *  MongoDB Atlas  *  Socket.IO  *  Render & Vercel")

    margin_x = 24
    content_w = width - (margin_x * 2) # 793.89 pt

    # Helper function for card boxes
    def draw_card(x, y, w, h, title, badge_text="", badge_color=C_EMERALD):
        c.setFillColor(C_CARD_BG)
        c.setStrokeColor(C_CARD_BORDER)
        c.setLineWidth(1)
        c.roundRect(x, y, w, h, 6, fill=1, stroke=1)

        # Card header tab
        c.setFillColor(HexColor("#0d1524"))
        c.roundRect(x, y + h - 20, w, 20, 5, fill=1, stroke=0)
        c.rect(x, y + h - 20, w, 8, fill=1, stroke=0) # flat bottom

        c.setFont("Helvetica-Bold", 8.5)
        c.setFillColor(C_TEXT_MAIN)
        c.drawString(x + 10, y + h - 14, title)

        if badge_text:
            c.setFont("Helvetica-Bold", 7)
            c.setFillColor(badge_color)
            c.drawRightString(x + w - 10, y + h - 14, badge_text)

    # =========================================================================
    # TIER 1: CLIENT PRESENTATION LAYER (Width: content_w, Height: 95pt)
    # =========================================================================
    t1_y = height - 156
    t1_h = 98
    draw_card(margin_x, t1_y, content_w, t1_h, "1. PRESENTATION LAYER: REACT 18 SPA + VITE + TAILWIND CSS", "BROWSER CLIENTS (PORT 5000 / EDGE CDN)", C_EMERALD)

    portal_w = (content_w - 24) / 4
    portal_h = 66
    portal_y = t1_y + 8

    # Portal 1: Donor
    c.setFillColor(HexColor("#162033"))
    c.setStrokeColor(C_AMBER)
    c.setLineWidth(0.8)
    c.roundRect(margin_x + 6, portal_y, portal_w, portal_h, 5, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(C_AMBER)
    c.drawString(margin_x + 12, portal_y + portal_h - 13, "🍲 Food Donor Portal")
    c.setFont("Helvetica", 6.8)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 12, portal_y + portal_h - 24, "• Post Surplus Food (Qty, Expiry, Veg)")
    c.drawString(margin_x + 12, portal_y + portal_h - 35, "• Auto-Detect Browser GPS Coordinates")
    c.drawString(margin_x + 12, portal_y + portal_h - 46, "• Donor Dashboard with Full CRUD (Edit/Del)")
    c.drawString(margin_x + 12, portal_y + portal_h - 57, "• Active Delivery Status Tracking Modal")

    # Portal 2: NGO
    c.setFillColor(HexColor("#162033"))
    c.setStrokeColor(C_EMERALD)
    c.roundRect(margin_x + 12 + portal_w, portal_y, portal_w, portal_h, 5, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(C_EMERALD)
    c.drawString(margin_x + 18 + portal_w, portal_y + portal_h - 13, "🏠 NGO & Shelter Portal")
    c.setFont("Helvetica", 6.8)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 18 + portal_w, portal_y + portal_h - 24, "• Algorithmic Match Candidate Radar")
    c.drawString(margin_x + 18 + portal_w, portal_y + portal_h - 35, "• Live Intake Capacity Slider & Threshold")
    c.drawString(margin_x + 18 + portal_w, portal_y + portal_h - 46, "• 1-Click Accept / Justified Rejection")
    c.drawString(margin_x + 18 + portal_w, portal_y + portal_h - 57, "• Match Compatibility Score Breakdown")

    # Portal 3: Driver
    c.setFillColor(HexColor("#162033"))
    c.setStrokeColor(C_BLUE)
    c.roundRect(margin_x + 18 + portal_w * 2, portal_y, portal_w, portal_h, 5, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(C_BLUE)
    c.drawString(margin_x + 24 + portal_w * 2, portal_y + portal_h - 13, "🛵 Volunteer Driver Hub")
    c.setFont("Helvetica", 6.8)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 24 + portal_w * 2, portal_y + portal_h - 24, "• Nearest Rescue Radar (Haversine km)")
    c.drawString(margin_x + 24 + portal_w * 2, portal_y + portal_h - 35, "• Turn-by-Turn FSM Route Transitions")
    c.drawString(margin_x + 24 + portal_w * 2, portal_y + portal_h - 46, "• Web Audio Dispatch Alert Chime")
    c.drawString(margin_x + 24 + portal_w * 2, portal_y + portal_h - 57, "• Proximity Countdown & Arrival Detector")

    # Portal 4: Admin
    c.setFillColor(HexColor("#162033"))
    c.setStrokeColor(C_PURPLE)
    c.roundRect(margin_x + 24 + portal_w * 3, portal_y, portal_w, portal_h, 5, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(C_PURPLE)
    c.drawString(margin_x + 30 + portal_w * 3, portal_y + portal_h - 13, "📊 Admin & Impact Command")
    c.setFont("Helvetica", 6.8)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 30 + portal_w * 3, portal_y + portal_h - 24, "• OpenStreetMap Leaflet Interactive Mesh")
    c.drawString(margin_x + 30 + portal_w * 3, portal_y + portal_h - 35, "• Dynamic Meals & CO2e Avoidance Audit")
    c.drawString(margin_x + 30 + portal_w * 3, portal_y + portal_h - 46, "• User Management & RBAC Permissions")
    c.drawString(margin_x + 30 + portal_w * 3, portal_y + portal_h - 57, "• Live Dispatch Mesh Observability")

    # =========================================================================
    # MIDDLE SECTION: SPLIT IN TWO (Width: Left 47%, Right 51%, Height: 185pt)
    # =========================================================================
    mid_y = height - 350
    mid_h = 188
    left_w = (content_w - 12) * 0.47
    right_w = (content_w - 12) * 0.53
    right_x = margin_x + left_w + 12

    # LEFT MIDDLE: API GATEWAY & SECURITY & WEBSOCKETS
    draw_card(margin_x, mid_y, left_w, mid_h, "2. API GATEWAY & TRANSPORT MESH (NODE.JS EXPRESS 4)", "REST & WEBSOCKETS", C_BLUE)

    mw_h = 42
    # Gateway Box 1: Unified Static Serving
    c.setFillColor(HexColor("#162033"))
    c.setStrokeColor(C_CARD_BORDER)
    c.roundRect(margin_x + 8, mid_y + 122, left_w - 16, mw_h, 4, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(margin_x + 14, mid_y + 122 + mw_h - 12, "Single-Port Unified Server & Static SPA Serving")
    c.setFont("Helvetica", 6.5)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 14, mid_y + 122 + mw_h - 22, "• Express statically serves client/dist on port 5000 (app.use(express.static))")
    c.drawString(margin_x + 14, mid_y + 122 + mw_h - 32, "• SPA Wildcard Route: app.get('*') returns index.html for client routing")

    # Gateway Box 2: Security & RBAC Guard
    c.setFillColor(HexColor("#162033"))
    c.setStrokeColor(C_CARD_BORDER)
    c.roundRect(margin_x + 8, mid_y + 74, left_w - 16, mw_h, 4, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(margin_x + 14, mid_y + 74 + mw_h - 12, "Security Layer: JWT Authentication & RBAC Authorization")
    c.setFont("Helvetica", 6.5)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 14, mid_y + 74 + mw_h - 22, "• Middleware 'protect': Validates Bearer Token; injects authenticated user")
    c.drawString(margin_x + 14, mid_y + 74 + mw_h - 32, "• Middleware 'authorize(ROLES)': Strict role enforcement (DONOR, NGO, DRIVER, ADMIN)")

    # Gateway Box 3: REST & Socket.IO
    c.setFillColor(HexColor("#162033"))
    c.setStrokeColor(C_CARD_BORDER)
    c.roundRect(margin_x + 8, mid_y + 8, left_w - 16, 60, 4, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(margin_x + 14, mid_y + 8 + 60 - 12, "RESTful Controllers & Socket.IO Mesh")
    c.setFont("Helvetica", 6.5)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 14, mid_y + 8 + 60 - 22, "• Controllers: /api/auth, /api/donations (CRUD), /api/ngos, /api/drivers, /api/deliveries")
    c.drawString(margin_x + 14, mid_y + 8 + 60 - 32, "• Public Impact Stats (/api/dashboard/public-stats) for unauthenticated landing counters")
    c.drawString(margin_x + 14, mid_y + 8 + 60 - 42, "• Socket.IO Rooms: user_{id}, feed; broadcast real-time match & dispatch alerts")
    c.drawString(margin_x + 14, mid_y + 8 + 60 - 52, "• Dual entry: Persistent server (server.js) + Vercel serverless (api/index.js)")

    # RIGHT MIDDLE: ALGORITHMS & STATE MACHINES & IMPACT
    draw_card(right_x, mid_y, right_w, mid_h, "3. DOMAIN LOGIC: MATCHING ALGORITHM & DELIVERY FSM", "BUSINESS LOGIC & ESG", C_PURPLE)

    # Box 3A: Matching Engine Scoring Formula
    c.setFillColor(HexColor("#162033"))
    c.setStrokeColor(C_EMERALD)
    c.roundRect(right_x + 8, mid_y + 98, right_w - 16, 66, 4, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(C_EMERALD)
    c.drawString(right_x + 14, mid_y + 98 + 66 - 12, "Multi-Factor Shelter Matching Engine & Formula")
    c.setFont("Helvetica-Bold", 7)
    c.setFillColor(C_AMBER)
    c.drawString(right_x + 14, mid_y + 98 + 66 - 23, "Score = (0.35 * S_dist) + (0.30 * S_cap) + (0.20 * S_urg) + (0.15 * S_exp)")
    c.setFont("Helvetica", 6.5)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(right_x + 14, mid_y + 98 + 66 - 34, "• Proximity (35%): Haversine distance <= 15 km. [S_dist = 1 - (Distance / 15)]")
    c.drawString(right_x + 14, mid_y + 98 + 66 - 44, "• Capacity (30%): Shelter Available Capacity >= Incoming Meals. Optimum intake ratio")
    c.drawString(right_x + 14, mid_y + 98 + 66 - 54, "• Urgency & Safety (35%): Need level priority + transit duration < safe expiry buffer")

    # Box 3B: Delivery FSM
    c.setFillColor(HexColor("#162033"))
    c.setStrokeColor(C_BLUE)
    c.roundRect(right_x + 8, mid_y + 8, right_w - 16, 84, 4, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(C_BLUE)
    c.drawString(right_x + 14, mid_y + 8 + 84 - 12, "Delivery Lifecycle Finite State Machine (FSM)")

    # Mini FSM boxes
    fsm_items = [
        ("POSTED", "Donor Posts", C_AMBER, right_x + 14, mid_y + 8 + 36),
        ("MATCHED", "Shelter Matched", C_EMERALD, right_x + 82, mid_y + 8 + 36),
        ("ASSIGNED", "Driver Claims", C_BLUE, right_x + 160, mid_y + 8 + 36),
        ("PICKUP_STARTED", "Route Active", HexColor("#0284c7"), right_x + 238, mid_y + 8 + 36),
        ("PICKED_UP", "Handover Done", HexColor("#818cf8"), right_x + 328, mid_y + 8 + 36),
        ("DELIVERED", "Shelter Intake Done", HexColor("#34d399"), right_x + 14, mid_y + 12)
    ]
    for name, desc, col, fx, fy in fsm_items:
        c.setFillColor(HexColor("#0d1524"))
        c.setStrokeColor(col)
        c.setLineWidth(0.8)
        w_box = 62 if name != "PICKUP_STARTED" and name != "DELIVERED" else 84
        if name == "DELIVERED":
            w_box = 135
        c.roundRect(fx, fy, w_box, 20, 3, fill=1, stroke=1)
        c.setFont("Helvetica-Bold", 6)
        c.setFillColor(col)
        c.drawString(fx + 4, fy + 12, name)
        c.setFont("Helvetica", 5.5)
        c.setFillColor(C_TEXT_MUTED)
        c.drawString(fx + 4, fy + 4, desc)

    # ESG note in Box 3B
    c.setFont("Helvetica-Bold", 6.5)
    c.setFillColor(HexColor("#34d399"))
    c.drawString(right_x + 160, mid_y + 22, "ESG Impact Model: 1 Meal = 0.42 kg  *  1 kg Food = 2.5 kg CO2e Avoided")
    c.setFont("Helvetica", 6)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(right_x + 160, mid_y + 13, "Automated calculation on verified delivery; eliminates landfill methane generation")

    # =========================================================================
    # TIER 4: DATA PERSISTENCE & DEPLOYMENT ARCHITECTURE (Height: 110pt)
    # =========================================================================
    t4_y = 52
    t4_h = 134
    draw_card(margin_x, t4_y, content_w, t4_h, "4. DATA PERSISTENCE & MULTI-TARGET DEPLOYMENT ARCHITECTURE", "CLOUD INFRASTRUCTURE & REPLICA SET", HexColor("#14b8a6"))

    col3_w = (content_w - 24) / 3
    col3_h = 104
    col3_y = t4_y + 6

    # Data Column 1: MongoDB Atlas
    c.setFillColor(HexColor("#162033"))
    c.setStrokeColor(HexColor("#14b8a6"))
    c.roundRect(margin_x + 6, col3_y, col3_w, col3_h, 5, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(HexColor("#14b8a6"))
    c.drawString(margin_x + 12, col3_y + col3_h - 13, "MongoDB Atlas Cloud Replica Set")
    c.setFont("Helvetica", 6.8)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 12, col3_y + col3_h - 26, "• Cluster Host: cluster0.i2iv3xy.mongodb.net")
    c.drawString(margin_x + 12, col3_y + col3_h - 38, "• Database: surplus_to_shelter (3-node geo-replica)")
    c.drawString(margin_x + 12, col3_y + col3_h - 50, "• Strict Zero Dummy Data Policy (Manual seedData.js)")
    c.drawString(margin_x + 12, col3_y + col3_h - 62, "• SSL/TLS encrypted connection pool (SRV protocol)")
    c.drawString(margin_x + 12, col3_y + col3_h - 74, "• Serverless Connection Caching (readyState >= 1)")
    c.drawString(margin_x + 12, col3_y + col3_h - 86, "• 8-second cloud handshake timeout with safe fallback")

    # Data Column 2: Mongoose Schemas & Geospatial Indexes
    c.setFillColor(HexColor("#162033"))
    c.setStrokeColor(C_CARD_BORDER)
    c.roundRect(margin_x + 12 + col3_w, col3_y, col3_w, col3_h, 5, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(margin_x + 18 + col3_w, col3_y + col3_h - 13, "Mongoose Schemas & Database Indexes")
    c.setFont("Helvetica", 6.8)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 18 + col3_w, col3_y + col3_h - 26, "• User (name, email, role, password, phone, location)")
    c.drawString(margin_x + 18 + col3_w, col3_y + col3_h - 38, "• DonorProfile (orgName, businessType, address, lat/lon)")
    c.drawString(margin_x + 18 + col3_w, col3_y + col3_h - 50, "• NGOProfile (capacity, availableCapacity, currentNeeds)")
    c.drawString(margin_x + 18 + col3_w, col3_y + col3_h - 62, "• DriverProfile (vehicleType, vehicleNumber, status)")
    c.drawString(margin_x + 18 + col3_w, col3_y + col3_h - 74, "• Donation (category, qty, unit, expiryTime, status, match)")
    c.drawString(margin_x + 18 + col3_w, col3_y + col3_h - 86, "• Delivery (driverId, donationId, status, audit timestamps)")
    c.drawString(margin_x + 18 + col3_w, col3_y + col3_h - 98, "• Indexes: 2dsphere [lon, lat], compound [status + createdAt]")

    # Data Column 3: Multi-Target Production Deployment
    c.setFillColor(HexColor("#162033"))
    c.setStrokeColor(HexColor("#38bdf8"))
    c.roundRect(margin_x + 18 + col3_w * 2, col3_y, col3_w, col3_h, 5, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(HexColor("#38bdf8"))
    c.drawString(margin_x + 24 + col3_w * 2, col3_y + col3_h - 13, "Multi-Target Production Deployment")
    c.setFont("Helvetica", 6.8)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 24 + col3_w * 2, col3_y + col3_h - 26, "• VERCEL (vercel.json):")
    c.drawString(margin_x + 30 + col3_w * 2, col3_y + col3_h - 36, "- Edge CDN frontend delivery from client/dist")
    c.drawString(margin_x + 30 + col3_w * 2, col3_y + col3_h - 46, "- Node.js Serverless Function entry (api/index.js)")
    c.drawString(margin_x + 24 + col3_w * 2, col3_y + col3_h - 58, "• RENDER (render.yaml):")
    c.drawString(margin_x + 30 + col3_w * 2, col3_y + col3_h - 68, "- Persistent Node.js Web Service on port 5000 / 10000")
    c.drawString(margin_x + 30 + col3_w * 2, col3_y + col3_h - 78, "- Native WebSocket streaming & Socket.IO real-time mesh")
    c.drawString(margin_x + 24 + col3_w * 2, col3_y + col3_h - 90, "• ALL-IN-ONE BUILD:")
    c.drawString(margin_x + 30 + col3_w * 2, col3_y + col3_h - 100, "- npm run build (builds client & server) && npm start")

    # =========================================================================
    # BOTTOM FOOTER BAR (Height: 40pt)
    # =========================================================================
    c.setStrokeColor(HexColor("#334155"))
    c.setLineWidth(1)
    c.line(margin_x, 44, width - margin_x, 44)

    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(HexColor("#64748b"))
    c.drawString(margin_x, 28, "DATA FLOW: Client UI (REST & WebSockets)  -->  API Gateway & Auth Guards  -->  Domain Logic & State Machines  -->  MongoDB Atlas Cloud")

    c.setFont("Helvetica", 7)
    c.drawRightString(width - margin_x, 28, "SURPLUS-TO-SHELTER  *  SINGLE-PAGE ARCHITECTURE BLUEPRINT  *  PAGE 1 OF 1")

    c.drawString(margin_x, 14, "Security Classification: Public Engineering Architecture  *  Verified against live MongoDB Atlas Cluster0")
    c.drawRightString(width - margin_x, 14, "Compliant with OpenStreetMap, Leaflet Engine & UN FAO Food Loss Benchmark")

    # Exactly 1 page saved!
    c.showPage()
    c.save()
    print(f"Single-page PDF successfully created at: {output_path}")

if __name__ == "__main__":
    out_file = os.path.abspath("Surplus_to_Shelter_Architecture_Diagram.pdf")
    create_single_page_pdf(out_file)
