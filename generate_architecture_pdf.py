import sys
import os
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.colors import HexColor

def create_architecture_pdf(output_path):
    # Dimensions for Landscape A4: 841.89 x 595.27 points
    width, height = landscape(A4)
    c = canvas.Canvas(output_path, pagesize=landscape(A4))
    c.setTitle("Surplus-to-Shelter System Architecture")
    c.setAuthor("Surplus-to-Shelter Architecture Team")

    # Palette
    C_BG = HexColor("#0f172a")         # Slate 900
    C_CARD_BG = HexColor("#1e293b")    # Slate 800
    C_CARD_BORDER = HexColor("#334155")# Slate 700
    C_EMERALD = HexColor("#10b981")    # Emerald 500
    C_EMERALD_BG = HexColor("#064e3b") # Emerald 900
    C_BLUE = HexColor("#3b82f6")       # Blue 500
    C_BLUE_BG = HexColor("#1e3a8a")    # Blue 900
    C_AMBER = HexColor("#f59e0b")      # Amber 500
    C_AMBER_BG = HexColor("#78350f")   # Amber 900
    C_PURPLE = HexColor("#8b5cf6")     # Purple 500
    C_PURPLE_BG = HexColor("#4c1d95")  # Purple 900
    C_ROSE = HexColor("#f43f5e")       # Rose 500
    C_TEXT_MAIN = HexColor("#f8fafc")  # Slate 50
    C_TEXT_MUTED = HexColor("#94a3b8") # Slate 400
    C_LINE = HexColor("#475569")       # Slate 600

    # -------------------------------------------------------------
    # PAGE 1: FULL STACK LOGICAL & INFRASTRUCTURE ARCHITECTURE
    # -------------------------------------------------------------

    # Background
    c.setFillColor(C_BG)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # Top Header Banner
    c.setFillColor(HexColor("#022c22"))
    c.rect(0, height - 60, width, 60, fill=1, stroke=0)
    c.setStrokeColor(C_EMERALD)
    c.setLineWidth(1.5)
    c.line(0, height - 60, width, height - 60)

    # Title & Subtitle
    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(30, height - 32, "SURPLUS-TO-SHELTER  |  SYSTEM ARCHITECTURE SPECIFICATION")
    c.setFont("Helvetica", 10)
    c.setFillColor(C_EMERALD)
    c.drawString(30, height - 48, "Real-Time Algorithmic Food Rescue & Logistics Routing Platform (Production Architecture)")

    # Right Header Metadata Badge
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(HexColor("#34d399"))
    c.drawRightString(width - 30, height - 30, "PRODUCTION GRADE  *  ALL-IN-ONE & SERVERLESS")
    c.setFont("Helvetica", 8)
    c.setFillColor(C_TEXT_MUTED)
    c.drawRightString(width - 30, height - 46, "MongoDB Atlas  *  Node.js / Express  *  React 18 SPA  *  Socket.IO Mesh")

    # Grid Dimensions (4 main horizontal tiers)
    margin_x = 30
    content_w = width - (margin_x * 2) # 781.89 pt
    tier_w = content_w
    
    # Tier 1: Client Application Layer
    # Tier 2: API Gateway & Real-Time Transport Layer
    # Tier 3: Core Domain Services & Business Logic Layer
    # Tier 4: Persistence, Infrastructure & External Services Layer

    def draw_tier_box(x, y, w, h, title, tag, tag_color):
        c.setFillColor(C_CARD_BG)
        c.setStrokeColor(C_CARD_BORDER)
        c.setLineWidth(1)
        c.roundRect(x, y, w, h, 8, fill=1, stroke=1)
        
        # Header strip inside tier
        c.setFillColor(HexColor("#0f172a"))
        c.roundRect(x, y + h - 24, w, 24, 6, fill=1, stroke=0)
        c.rect(x, y + h - 24, w, 10, fill=1, stroke=0) # square off bottom corners
        
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(C_TEXT_MAIN)
        c.drawString(x + 12, y + h - 16, title)
        
        # Tag badge
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(tag_color)
        c.drawRightString(x + w - 12, y + h - 16, tag)

    # 1. CLIENT LAYER
    t1_y = height - 170
    t1_h = 100
    draw_tier_box(margin_x, t1_y, tier_w, t1_h, "1. PRESENTATION LAYER: REACT 18 SPA + VITE (CLIENT PORTAL MESH)", "BROWSER CLIENTS (PORT 5000 / EDGE CDN)", C_EMERALD)

    # 4 Modules in Tier 1
    col_w = (tier_w - 30) / 4
    mod_h = 60
    mod_y = t1_y + 10

    # Module 1: Food Donor
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_AMBER)
    c.setLineWidth(1)
    c.roundRect(margin_x + 6, mod_y, col_w, mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(C_AMBER)
    c.drawString(margin_x + 14, mod_y + mod_h - 14, "🍲 Donor Portal")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 14, mod_y + mod_h - 26, "* Post Surplus Food (Qty, Expiry, Veg)")
    c.drawString(margin_x + 14, mod_y + mod_h - 38, "* Real-Time GPS Geolocation Detection")
    c.drawString(margin_x + 14, mod_y + mod_h - 50, "* Edit/Delete Active Rescues (Full CRUD)")

    # Module 2: NGO / Shelter
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_EMERALD)
    c.roundRect(margin_x + 12 + col_w, mod_y, col_w, mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(C_EMERALD)
    c.drawString(margin_x + 20 + col_w, mod_y + mod_h - 14, "🏠 NGO & Shelter Portal")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 20 + col_w, mod_y + mod_h - 26, "* Algorithmic Match Candidate Feed")
    c.drawString(margin_x + 20 + col_w, mod_y + mod_h - 38, "* Live Dynamic Capacity Slider / Intake")
    c.drawString(margin_x + 20 + col_w, mod_y + mod_h - 50, "* Turnkey Accept / Justified Reject")

    # Module 3: Volunteer Driver
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_BLUE)
    c.roundRect(margin_x + 18 + col_w * 2, mod_y, col_w, mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(C_BLUE)
    c.drawString(margin_x + 26 + col_w * 2, mod_y + mod_h - 14, "🛵 Volunteer Driver Hub")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 26 + col_w * 2, mod_y + mod_h - 26, "* Nearest Rescue Radar (Haversine km)")
    c.drawString(margin_x + 26 + col_w * 2, mod_y + mod_h - 38, "* Turn-by-Turn Delivery State Machine")
    c.drawString(margin_x + 26 + col_w * 2, mod_y + mod_h - 50, "* Web Audio Dispatch Synthesizer Chime")

    # Module 4: Admin / Auditing & Map Engine
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_PURPLE)
    c.roundRect(margin_x + 24 + col_w * 3, mod_y, col_w, mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(C_PURPLE)
    c.drawString(margin_x + 32 + col_w * 3, mod_y + mod_h - 14, "📊 Admin & Impact Observability")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 32 + col_w * 3, mod_y + mod_h - 26, "* Leaflet / OpenStreetMap Real-Time Mesh")
    c.drawString(margin_x + 32 + col_w * 3, mod_y + mod_h - 38, "* Live CO2e Avoided & Meals Rescued Audit")
    c.drawString(margin_x + 32 + col_w * 3, mod_y + mod_h - 50, "* Account Settings & Security Management")

    # 2. API GATEWAY & REAL-TIME TRANSPORT LAYER
    t2_y = height - 280
    t2_h = 95
    draw_tier_box(margin_x, t2_y, tier_w, t2_h, "2. API GATEWAY & TRANSPORT LAYER (NODE.JS EXPRESS 4 / VERCEL SERVERLESS)", "RESTFUL API & WEBSOCKET ENGINE", C_BLUE)

    gw_col_w = (tier_w - 30) / 4
    gw_mod_h = 55
    gw_mod_y = t2_y + 10

    # Gateway Box 1: Reverse Proxy / Serving
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_CARD_BORDER)
    c.roundRect(margin_x + 6, gw_mod_y, gw_col_w, gw_mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(margin_x + 14, gw_mod_y + gw_mod_h - 14, "Unified Server & Static SPA")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 14, gw_mod_y + gw_mod_h - 26, "* Statically serves client/dist on port 5000")
    c.drawString(margin_x + 14, gw_mod_y + gw_mod_h - 37, "* SPA Fallback Wildcard app.get('*')")
    c.drawString(margin_x + 14, gw_mod_y + gw_mod_h - 48, "* Vercel serverless /api/index.js entry")

    # Gateway Box 2: Auth & Guard
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_CARD_BORDER)
    c.roundRect(margin_x + 12 + gw_col_w, gw_mod_y, gw_col_w, gw_mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(margin_x + 20 + gw_col_w, gw_mod_y + gw_mod_h - 14, "Security & Auth Guard")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 20 + gw_col_w, gw_mod_y + gw_mod_h - 26, "* JWT Bearer Token validation (protect)")
    c.drawString(margin_x + 20 + gw_col_w, gw_mod_y + gw_mod_h - 37, "* RBAC (DONOR, NGO, DRIVER, ADMIN)")
    c.drawString(margin_x + 20 + gw_col_w, gw_mod_y + gw_mod_h - 48, "* Bcrypt password hashing & salt (rounds 10)")

    # Gateway Box 3: REST Controller Endpoints
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_CARD_BORDER)
    c.roundRect(margin_x + 18 + gw_col_w * 2, gw_mod_y, gw_col_w, gw_mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(margin_x + 26 + gw_col_w * 2, gw_mod_y + gw_mod_h - 14, "RESTful API Controllers")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 26 + gw_col_w * 2, gw_mod_y + gw_mod_h - 26, "* /api/donations (Full CRUD, Expiry filter)")
    c.drawString(margin_x + 26 + gw_col_w * 2, gw_mod_y + gw_mod_h - 37, "* /api/ngos (Capacity & match acceptance)")
    c.drawString(margin_x + 26 + gw_col_w * 2, gw_mod_y + gw_mod_h - 48, "* /api/drivers & /api/deliveries state APIs")

    # Gateway Box 4: Socket.IO Transport Mesh
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_CARD_BORDER)
    c.roundRect(margin_x + 24 + gw_col_w * 3, gw_mod_y, gw_col_w, gw_mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(margin_x + 32 + gw_col_w * 3, gw_mod_y + gw_mod_h - 14, "Socket.IO Real-Time Mesh")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 32 + gw_col_w * 3, gw_mod_y + gw_mod_h - 26, "* WebSocket & Long-Polling Transports")
    c.drawString(margin_x + 32 + gw_col_w * 3, gw_mod_y + gw_mod_h - 37, "* Room isolated events: user_{id}, feed")
    c.drawString(margin_x + 32 + gw_col_w * 3, gw_mod_y + gw_mod_h - 48, "* Event broadcast on matching & dispatch")

    # 3. CORE DOMAIN SERVICES LAYER
    t3_y = height - 400
    t3_h = 105
    draw_tier_box(margin_x, t3_y, tier_w, t3_h, "3. CORE DOMAIN SERVICES & ALGORITHMIC ENGINE", "BUSINESS LOGIC & STATE MACHINES", C_PURPLE)

    srv_col_w = (tier_w - 30) / 4
    srv_mod_h = 65
    srv_mod_y = t3_y + 10

    # Service 1: Matching Engine
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_EMERALD)
    c.roundRect(margin_x + 6, srv_mod_y, srv_col_w, srv_mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(C_EMERALD)
    c.drawString(margin_x + 14, srv_mod_y + srv_mod_h - 14, "Multi-Factor Matching Engine")
    c.setFont("Helvetica", 7)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 14, srv_mod_y + srv_mod_h - 25, "1. Proximity: Haversine distance (<= 15 km)")
    c.drawString(margin_x + 14, srv_mod_y + srv_mod_h - 35, "2. Capacity: Shelter Available Intake >= Meals")
    c.drawString(margin_x + 14, srv_mod_y + srv_mod_h - 45, "3. Expiry Safety Buffer: Transit duration calc")
    c.drawString(margin_x + 14, srv_mod_y + srv_mod_h - 55, "Score = (w_dist * S_d) + (w_cap * S_c) + ...")

    # Service 2: Delivery Dispatch State Machine
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_BLUE)
    c.roundRect(margin_x + 12 + srv_col_w, srv_mod_y, srv_col_w, srv_mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(C_BLUE)
    c.drawString(margin_x + 20 + srv_col_w, srv_mod_y + srv_mod_h - 14, "Delivery Lifecycle State Machine")
    c.setFont("Helvetica", 7)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 20 + srv_col_w, srv_mod_y + srv_mod_h - 25, "* ASSIGNED: Driver claims rescue")
    c.drawString(margin_x + 20 + srv_col_w, srv_mod_y + srv_mod_h - 35, "* PICKUP_STARTED: Navigation initiated")
    c.drawString(margin_x + 20 + srv_col_w, srv_mod_y + srv_mod_h - 45, "* PICKED_UP: Food handover verified")
    c.drawString(margin_x + 20 + srv_col_w, srv_mod_y + srv_mod_h - 55, "* DELIVERED: Capacity deducted & logged")

    # Service 3: Environmental Impact Engine
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_AMBER)
    c.roundRect(margin_x + 18 + srv_col_w * 2, srv_mod_y, srv_col_w, srv_mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(C_AMBER)
    c.drawString(margin_x + 26 + srv_col_w * 2, srv_mod_y + srv_mod_h - 14, "Impact & Carbon Calculator")
    c.setFont("Helvetica", 7)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 26 + srv_col_w * 2, srv_mod_y + srv_mod_h - 25, "* Conversion: 1 Meal = 0.42 kg edible food")
    c.drawString(margin_x + 26 + srv_col_w * 2, srv_mod_y + srv_mod_h - 35, "* Landfill Methane Abatement Model")
    c.drawString(margin_x + 26 + srv_col_w * 2, srv_mod_y + srv_mod_h - 45, "* Factor: 2.5 kg CO2e avoided per kg food")
    c.drawString(margin_x + 26 + srv_col_w * 2, srv_mod_y + srv_mod_h - 55, "* Instant ESG aggregated metrics calculation")

    # Service 4: Notification & Dispatch Engine
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_ROSE)
    c.roundRect(margin_x + 24 + srv_col_w * 3, srv_mod_y, srv_col_w, srv_mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(C_ROSE)
    c.drawString(margin_x + 32 + srv_col_w * 3, srv_mod_y + srv_mod_h - 14, "Notification & Alert Broadcaster")
    c.setFont("Helvetica", 7)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 32 + srv_col_w * 3, srv_mod_y + srv_mod_h - 25, "* Targeted recipient routing (DB stored)")
    c.drawString(margin_x + 32 + srv_col_w * 3, srv_mod_y + srv_mod_h - 35, "* Emergency High-Priority Volunteer Push")
    c.drawString(margin_x + 32 + srv_col_w * 3, srv_mod_y + srv_mod_h - 45, "* Web Audio synthesized dispatch chime")
    c.drawString(margin_x + 32 + srv_col_w * 3, srv_mod_y + srv_mod_h - 55, "* Read/unread & deletion lifecycle CRUD")

    # 4. DATA PERSISTENCE & INFRASTRUCTURE LAYER
    t4_y = height - 520
    t4_h = 105
    draw_tier_box(margin_x, t4_y, tier_w, t4_h, "4. DATA PERSISTENCE & INFRASTRUCTURE LAYER (MONGODB ATLAS CLOUD & DEPLOYMENT)", "DATABASE & CLUSTER REPLICA SET", HexColor("#14b8a6"))

    data_col_w = (tier_w - 30) / 4
    data_mod_h = 65
    data_mod_y = t4_y + 10

    # Data Box 1: MongoDB Atlas Cluster
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(HexColor("#14b8a6"))
    c.roundRect(margin_x + 6, data_mod_y, data_col_w, data_mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(HexColor("#14b8a6"))
    c.drawString(margin_x + 14, data_mod_y + data_mod_h - 14, "MongoDB Atlas Cloud Cluster")
    c.setFont("Helvetica", 7)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 14, data_mod_y + data_mod_h - 25, "* Cluster: cluster0.i2iv3xy.mongodb.net")
    c.drawString(margin_x + 14, data_mod_y + data_mod_h - 35, "* DB: surplus_to_shelter (3-node replica)")
    c.drawString(margin_x + 14, data_mod_y + data_mod_h - 45, "* SSL/TLS encrypted connection pool")
    c.drawString(margin_x + 14, data_mod_y + data_mod_h - 55, "* Serverless connection caching (readyState)")

    # Data Box 2: Schemas & Collections
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_CARD_BORDER)
    c.roundRect(margin_x + 12 + data_col_w, data_mod_y, data_col_w, data_mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(margin_x + 20 + data_col_w, data_mod_y + data_mod_h - 14, "Mongoose Data Schemas")
    c.setFont("Helvetica", 7)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 20 + data_col_w, data_mod_y + data_mod_h - 25, "* Users & Roles (DONOR, NGO, DRIVER)")
    c.drawString(margin_x + 20 + data_col_w, data_mod_y + data_mod_h - 35, "* DonorProfile, NGOProfile, DriverProfile")
    c.drawString(margin_x + 20 + data_col_w, data_mod_y + data_mod_h - 45, "* Donation (category, quantity, expiry)")
    c.drawString(margin_x + 20 + data_col_w, data_mod_y + data_mod_h - 55, "* Delivery (status, timestamps, audit)")

    # Data Box 3: Geospatial & Indices
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(C_CARD_BORDER)
    c.roundRect(margin_x + 18 + data_col_w * 2, data_mod_y, data_col_w, data_mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(margin_x + 26 + data_col_w * 2, data_mod_y + data_mod_h - 14, "Indexing & Query Optimization")
    c.setFont("Helvetica", 7)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 26 + data_col_w * 2, data_mod_y + data_mod_h - 25, "* 2dsphere Geospatial Index on Coordinates")
    c.drawString(margin_x + 26 + data_col_w * 2, data_mod_y + data_mod_h - 35, "* Compound index: status + createdAt")
    c.drawString(margin_x + 26 + data_col_w * 2, data_mod_y + data_mod_h - 45, "* Unique index on User email & Donor profile")
    c.drawString(margin_x + 26 + data_col_w * 2, data_mod_y + data_mod_h - 55, "* Dynamic aggregations for dashboard metrics")

    # Data Box 4: Multi-Cloud Deployment
    c.setFillColor(HexColor("#1e293b"))
    c.setStrokeColor(HexColor("#38bdf8"))
    c.roundRect(margin_x + 24 + data_col_w * 3, data_mod_y, data_col_w, data_mod_h, 6, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(HexColor("#38bdf8"))
    c.drawString(margin_x + 32 + data_col_w * 3, data_mod_y + data_mod_h - 14, "Multi-Target Deployment")
    c.setFont("Helvetica", 7)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(margin_x + 32 + data_col_w * 3, data_mod_y + data_mod_h - 25, "* Render (render.yaml): Persistent Web Svc")
    c.drawString(margin_x + 32 + data_col_w * 3, data_mod_y + data_mod_h - 35, "* Vercel (vercel.json): Edge CDN + Lambda")
    c.drawString(margin_x + 32 + data_col_w * 3, data_mod_y + data_mod_h - 45, "* All-in-One: Express serving client/dist")
    c.drawString(margin_x + 32 + data_col_w * 3, data_mod_y + data_mod_h - 55, "* Zero dummy data; strict Atlas data source")

    # Connecting Flow Annotations (Bottom footer)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(HexColor("#64748b"))
    footer_text = "DATA FLOW: Client UI (REST & WebSockets)  -->  API Gateway & Auth Guards  -->  Domain Services & State Machines  -->  MongoDB Atlas Cloud"
    c.drawCentredString(width / 2, 28, footer_text)
    c.setFont("Helvetica", 7)
    c.drawCentredString(width / 2, 16, "Document generated for Surplus-to-Shelter Production Deployment  |  Security Classification: Public  |  Page 1 of 2")

    c.showPage()

    # -------------------------------------------------------------
    # PAGE 2: RESCUE WORKFLOW, MATCHING FORMULA & STATE MACHINES
    # -------------------------------------------------------------

    # Background
    c.setFillColor(C_BG)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # Top Header Banner
    c.setFillColor(HexColor("#022c22"))
    c.rect(0, height - 60, width, 60, fill=1, stroke=0)
    c.setStrokeColor(C_EMERALD)
    c.setLineWidth(1.5)
    c.line(0, height - 60, width, height - 60)

    # Title & Subtitle
    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(30, height - 32, "SURPLUS-TO-SHELTER  |  WORKFLOWS & ALGORITHMIC SPECIFICATIONS")
    c.setFont("Helvetica", 10)
    c.setFillColor(C_EMERALD)
    c.drawString(30, height - 48, "Algorithmic Matching Scoring, Delivery State Machine, and Disaster-Proof Rescue Cycle")

    # Right Header Metadata
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(HexColor("#34d399"))
    c.drawRightString(width - 30, height - 30, "SYSTEM WORKFLOWS & LOGIC")
    c.setFont("Helvetica", 8)
    c.setFillColor(C_TEXT_MUTED)
    c.drawRightString(width - 30, height - 46, "Haversine Distance  *  Capacity Balancing  *  Cold Chain Safety")

    # Left Column (Width = 47%): 5-Stage Food Rescue Lifecycle
    left_w = (width - 75) * 0.52
    right_w = (width - 75) * 0.48
    col1_x = 30
    col2_x = 30 + left_w + 15

    # Box 1: 5-Stage Sequential Lifecycle
    box1_y = 50
    box1_h = height - 125
    c.setFillColor(C_CARD_BG)
    c.setStrokeColor(C_CARD_BORDER)
    c.roundRect(col1_x, box1_y, left_w, box1_h, 8, fill=1, stroke=1)

    c.setFillColor(HexColor("#0f172a"))
    c.roundRect(col1_x, box1_y + box1_h - 26, left_w, 26, 6, fill=1, stroke=0)
    c.rect(col1_x, box1_y + box1_h - 26, left_w, 10, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(col1_x + 14, box1_y + box1_h - 18, "END-TO-END FOOD RESCUE WORKFLOW LIFECYCLE")

    stages = [
        ("STAGE 1: DONOR POSTING", C_AMBER, [
            "Food Donor (restaurant, caterer, cafeteria) creates rescue post via /donor/post.",
            "Captures Food Type, Quantity, Unit, Meal Count, Usable Expiry, and GPS Coordinates.",
            "Initial Status set to POSTED; triggers automated execution of Matching Engine."
        ]),
        ("STAGE 2: ALGORITHMIC MATCHING", C_EMERALD, [
            "Matching Engine scans all active shelters within 15 km using Haversine calculation.",
            "Filters candidate shelters with availableCapacity >= incoming meals.",
            "Validates transit duration < safe expiry buffer; ranks shelters by compatibility score.",
            "Status transitions to MATCHED; targeted socket alert dispatched to matched shelter."
        ]),
        ("STAGE 3: SHELTER ACCEPTANCE", HexColor("#14b8a6"), [
            "Shelter receives real-time alert and reviews match score breakdown in NGO Dashboard.",
            "Shelter accepts donation (/api/ngos/donations/:id/accept).",
            "System immediately dispatches an urgent broadcast to nearby volunteer drivers."
        ]),
        ("STAGE 4: VOLUNTEER DISPATCH & TRANSIT", C_BLUE, [
            "Volunteer Driver accepts pickup request from Nearest Radar feed.",
            "Delivery entity generated with status ASSIGNED; audio chime alert triggers on driver UI.",
            "Driver navigates turn-by-turn route, advances status: PICKUP_STARTED -> PICKED_UP.",
            "Driver transports food under temperature buffer: transitions status to IN_TRANSIT."
        ]),
        ("STAGE 5: DELIVERY VERIFICATION & IMPACT", C_PURPLE, [
            "Driver arrives at shelter and confirms delivery (/api/deliveries/:id/status -> DELIVERED).",
            "Shelter available intake capacity updates dynamically.",
            "Automated impact calculator computes: Meals Rescued + CO2e avoided.",
            "Live landing page and Admin ESG counters update dynamically via Socket.IO."
        ])
    ]

    curr_y = box1_y + box1_h - 38
    for stage_title, badge_color, points in stages:
        c.setFillColor(badge_color)
        c.roundRect(col1_x + 12, curr_y - 14, 190, 14, 3, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 7.5)
        c.setFillColor(HexColor("#ffffff"))
        c.drawString(col1_x + 16, curr_y - 10, stage_title)
        
        curr_y -= 26
        c.setFont("Helvetica", 7.5)
        c.setFillColor(C_TEXT_MAIN)
        for pt in points:
            c.drawString(col1_x + 16, curr_y, "> " + pt)
            curr_y -= 12
        curr_y -= 8

    # Right Column: Algorithms, State Machine & Metrics
    # Box 2: Matching Scoring Formula Box
    box2_y = height - 290
    box2_h = 165
    c.setFillColor(C_CARD_BG)
    c.setStrokeColor(C_CARD_BORDER)
    c.roundRect(col2_x, box2_y, right_w, box2_h, 8, fill=1, stroke=1)

    c.setFillColor(HexColor("#0f172a"))
    c.roundRect(col2_x, box2_y + box2_h - 26, right_w, 26, 6, fill=1, stroke=0)
    c.rect(col2_x, box2_y + box2_h - 26, right_w, 10, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(col2_x + 14, box2_y + box2_h - 18, "MATCHING ENGINE SCORING ALGORITHM")

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(C_EMERALD)
    c.drawString(col2_x + 14, box2_y + box2_h - 40, "Total Score = (w_d * S_dist) + (w_c * S_cap) + (w_u * S_urg) + (w_e * S_exp)")

    formula_lines = [
        ("Distance Score (S_dist, w=0.35):", "1 - (Distance / MaxRadius 15km). Rewards close proximity."),
        ("Capacity Match (S_cap, w=0.30):", "IncomingMeals / AvailableCapacity. Optimal utilization."),
        ("Urgency Need (S_urg, w=0.20):", "Critical = 1.0, High = 0.8, Medium = 0.5, Low = 0.2."),
        ("Transit Safety (S_exp, w=0.15):", "(HoursRemaining - EstTransit) / HoursRemaining.")
    ]
    fy = box2_y + box2_h - 56
    for title, desc in formula_lines:
        c.setFont("Helvetica-Bold", 7.5)
        c.setFillColor(C_AMBER)
        c.drawString(col2_x + 14, fy, title)
        c.setFont("Helvetica", 7.5)
        c.setFillColor(C_TEXT_MUTED)
        c.drawString(col2_x + 155, fy, desc)
        fy -= 15

    c.setFont("Helvetica-Oblique", 7)
    c.setFillColor(HexColor("#38bdf8"))
    c.drawString(col2_x + 14, fy - 2, "* Fallback: If no shelter scores >= 40, broadcast alert triggers to regional food banks.")

    # Box 3: Delivery State Machine & Verification Diagram
    box3_y = 50
    box3_h = height - 355
    c.setFillColor(C_CARD_BG)
    c.setStrokeColor(C_CARD_BORDER)
    c.roundRect(col2_x, box3_y, right_w, box3_h, 8, fill=1, stroke=1)

    c.setFillColor(HexColor("#0f172a"))
    c.roundRect(col2_x, box3_y + box3_h - 26, right_w, 26, 6, fill=1, stroke=0)
    c.rect(col2_x, box3_y + box3_h - 26, right_w, 10, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(C_TEXT_MAIN)
    c.drawString(col2_x + 14, box3_y + box3_h - 18, "DELIVERY TRANSITION FINITE STATE MACHINE (FSM)")

    # Visual State Flow Nodes
    fsm_nodes = [
        ("POSTED", "Donor Posts Surplus", C_AMBER, col2_x + 18, box3_y + box3_h - 60),
        ("MATCHED", "Shelter Algorithmic Match", C_EMERALD, col2_x + 135, box3_y + box3_h - 60),
        ("ASSIGNED", "Driver Claims Request", C_BLUE, col2_x + 252, box3_y + box3_h - 60),
        ("PICKUP_STARTED", "Route Navigation On", HexColor("#0284c7"), col2_x + 18, box3_y + box3_h - 110),
        ("PICKED_UP", "Food Handover Verified", HexColor("#6366f1"), col2_x + 135, box3_y + box3_h - 110),
        ("DELIVERED", "Beneficiary Distributed", HexColor("#10b981"), col2_x + 252, box3_y + box3_h - 110)
    ]

    for label, desc, color, nx, ny in fsm_nodes:
        c.setFillColor(HexColor("#0f172a"))
        c.setStrokeColor(color)
        c.setLineWidth(1)
        c.roundRect(nx, ny, 105, 34, 4, fill=1, stroke=1)
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(color)
        c.drawString(nx + 6, ny + 22, label)
        c.setFont("Helvetica", 6.5)
        c.setFillColor(C_TEXT_MUTED)
        c.drawString(nx + 6, ny + 9, desc)

    # Environmental Impact Formula Box inside Box 3
    c.setFillColor(HexColor("#0f172a"))
    c.setStrokeColor(HexColor("#334155"))
    c.roundRect(col2_x + 14, box3_y + 12, right_w - 28, 62, 5, fill=1, stroke=1)

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(HexColor("#34d399"))
    c.drawString(col2_x + 24, box3_y + 58, "ENVIRONMENTAL IMPACT & CARBON AVOIDANCE MODEL")
    c.setFont("Helvetica", 7)
    c.setFillColor(C_TEXT_MUTED)
    c.drawString(col2_x + 24, box3_y + 44, "* 1 Meal = 0.42 kg edible food (UN Food & Agriculture Org standard benchmark)")
    c.drawString(col2_x + 24, box3_y + 32, "* CO2e Avoided = Food Rescued (kg) * 2.5 kg CO2e / kg diverted from landfills")
    c.drawString(col2_x + 24, box3_y + 20, "* Direct Impact: Prevents anaerobic landfill decomposition yielding potent methane gas (CH4)")

    # Page 2 Footer
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(HexColor("#64748b"))
    c.drawCentredString(width / 2, 28, "SURPLUS-TO-SHELTER SPECIFICATION  |  REAL-TIME RESCUE ROUTING  |  PAGE 2 OF 2")
    c.setFont("Helvetica", 7)
    c.drawCentredString(width / 2, 16, "All rights reserved  |  Architecture verified against live MongoDB Atlas production cluster")

    c.showPage()
    c.save()
    print(f"PDF successfully generated at: {output_path}")

if __name__ == "__main__":
    out = os.path.abspath("Surplus_to_Shelter_Architecture_Diagram.pdf")
    create_architecture_pdf(out)
