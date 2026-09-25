import os
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 7.5)
        self.setFillColor(HexColor("#64748b"))
        
        # Header for page 2 onwards
        if self._pageNumber > 1:
            self.drawString(40, 802, "Surplus-to-Shelter Documentation  |  GitHub: J9079/Hemi-Hacks")
            self.setStrokeColor(HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(40, 796, 555, 796)

        # Footer for all pages
        self.drawString(40, 30, "Surplus-to-Shelter  *  Real-Time Food Rescue & Redistribution Network")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(555, 30, page_str)
        self.setStrokeColor(HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(40, 40, 555, 40)
        self.restoreState()

def build_readme_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Custom styles
    C_PRIMARY = HexColor("#0f172a") # Slate 900
    C_EMERALD = HexColor("#059669") # Emerald 600
    C_MUTED = HexColor("#475569")   # Slate 600
    C_CARD_BG = HexColor("#f8fafc") # Slate 50
    C_CODE_BG = HexColor("#0f172a") # Slate 900

    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=C_PRIMARY,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica',
        fontSize=10.5,
        leading=15,
        textColor=C_EMERALD,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'H1',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=C_PRIMARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=HexColor("#1e293b"),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=C_PRIMARY,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        fontName='Helvetica',
        fontSize=8.2,
        leading=12,
        textColor=HexColor("#334155"),
        leftIndent=12,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'Code',
        fontName='Courier',
        fontSize=7.2,
        leading=10,
        textColor=HexColor("#f8fafc")
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=7.5,
        leading=10.5,
        textColor=C_PRIMARY
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=HexColor("#ffffff")
    )

    story = []

    # Title & Metadata
    story.append(Paragraph("Surplus-to-Shelter: Real-Time Food Rescue Network", title_style))
    story.append(Paragraph("GitHub Repository Specification & Documentation  *  <b>https://github.com/J9079/Hemi-Hacks</b>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_EMERALD, spaceAfter=10))

    # Badge Info Table
    badge_data = [
        [
            Paragraph("<b>Repository:</b> github.com/J9079/Hemi-Hacks", table_cell_style),
            Paragraph("<b>Runtime:</b> Node.js v20+ / Express 4", table_cell_style),
            Paragraph("<b>Frontend:</b> React 18 / Vite / Tailwind", table_cell_style)
        ],
        [
            Paragraph("<b>Database:</b> MongoDB Atlas Cloud Cluster", table_cell_style),
            Paragraph("<b>Real-Time:</b> Socket.IO Mesh Channels", table_cell_style),
            Paragraph("<b>Deploy:</b> Vercel Edge + Render Web Svc", table_cell_style)
        ]
    ]
    t_badges = Table(badge_data, colWidths=[175, 170, 170])
    t_badges.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_badges)
    story.append(Spacer(1, 10))

    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary & Problem Solved", h1_style))
    story.append(Paragraph(
        "Globally, more than one-third of all food produced is wasted, generating approximately <b>8-10% of global greenhouse gas emissions</b> while local community shelters face recurring food deficits. Traditional rescue initiatives rely on disjointed phone calls, manual spreadsheets, and ad-hoc chat groups. By the time logistical coordination takes place, perishable food spoils.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Surplus-to-Shelter</b> replaces manual coordination with an automated, capacity-aware logistics engine that connects commercial donors with nearby verified shelters and volunteer drivers through real-time algorithmic matching and turnkey dispatch.",
        body_style
    ))

    # 2. System Architecture Overview
    story.append(Paragraph("2. System Architecture & 4-Tier Blueprint", h1_style))
    arch_bullets = [
        "<b>Presentation Layer:</b> React 18 Single Page Application (SPA), Vite bundler, Tailwind CSS, OpenStreetMap Leaflet Engine, and Web Audio API synthesizer for dispatch chimes.",
        "<b>API Gateway & Transport:</b> Express 4 server hosting RESTful API controllers, JWT authentication guards, RBAC authorization, and Socket.IO real-time event broadcasting. Statically serves compiled frontend (<code>client/dist</code>) with SPA wildcard fallback.",
        "<b>Core Domain Engines:</b> Multi-Factor Shelter Matching Engine (Haversine proximity, shelter capacity, expiry buffer), Delivery State Machine (FSM), and Landfill Methane Abatement Carbon Calculator.",
        "<b>Data & Cloud Persistence:</b> MongoDB Atlas cloud replica set cluster (<code>cluster0.i2iv3xy.mongodb.net</code>), Mongoose schemas with 2dsphere geospatial indexing, and serverless connection pooling."
    ]
    for b in arch_bullets:
        story.append(Paragraph(f"• {b}", bullet_style))

    story.append(Spacer(1, 6))

    # 3. Dedicated User Portals
    story.append(Paragraph("3. 4 Dedicated Role-Based Portals", h1_style))
    portals_data = [
        [
            Paragraph("Portal", table_header_style),
            Paragraph("Target Audience", table_header_style),
            Paragraph("Key Operational Capabilities", table_header_style)
        ],
        [
            Paragraph("<b>Food Donor</b>", table_cell_style),
            Paragraph("Restaurants, Caterers, Hotels, Cafeterias", table_cell_style),
            Paragraph("Post surplus food wizard; auto-detect GPS coordinates; live expiry simulator; full CRUD to update or cancel active posts before dispatch.", table_cell_style)
        ],
        [
            Paragraph("<b>NGO / Shelter</b>", table_cell_style),
            Paragraph("Shelters, Food Banks, Community Kitchens", table_cell_style),
            Paragraph("Real-time available capacity intake slider; match candidate radar; compatibility score breakdown; 1-click accept or justified reject.", table_cell_style)
        ],
        [
            Paragraph("<b>Volunteer Driver</b>", table_cell_style),
            Paragraph("Two-wheelers, Vans, Citizen Volunteers", table_cell_style),
            Paragraph("Nearest rescue radar sorted by Haversine km; Web Audio chime alert; turn-by-turn state progression; proximity arrival detector.", table_cell_style)
        ],
        [
            Paragraph("<b>Admin Command</b>", table_cell_style),
            Paragraph("Logistics Coordinators & Auditors", table_cell_style),
            Paragraph("Interactive OpenStreetMap Leaflet mesh; live dynamic meals rescued and CO2e avoided audit counters; user management & RBAC controls.", table_cell_style)
        ]
    ]
    t_portals = Table(portals_data, colWidths=[90, 130, 295])
    t_portals.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), HexColor("#0f172a")),
        ('BOX', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_portals)
    story.append(Spacer(1, 10))

    # Page Break for clean reading
    story.append(PageBreak())

    # 4. Algorithmic Matching Formula
    story.append(Paragraph("4. Algorithmic Matching Scoring Engine", h1_style))
    story.append(Paragraph(
        "Candidate shelters within a 15 km radius are scored using a multi-factor weighted algorithm to determine the optimal shelter for each donation:",
        body_style
    ))
    story.append(Paragraph(
        "<b>Match Score = (0.35 * S<sub>dist</sub>) + (0.30 * S<sub>cap</sub>) + (0.20 * S<sub>urg</sub>) + (0.15 * S<sub>exp</sub>)</b>",
        ParagraphStyle('Formula', fontName='Helvetica-Bold', fontSize=9, textColor=C_EMERALD, spaceAfter=6)
    ))

    formula_data = [
        [Paragraph("Factor", table_header_style), Paragraph("Weight", table_header_style), Paragraph("Mathematical Logic", table_header_style), Paragraph("Logistical Impact", table_header_style)],
        [Paragraph("<b>Distance (S<sub>dist</sub>)</b>", table_cell_style), Paragraph("35%", table_cell_style), Paragraph("1 - (Distance / 15 km)", table_cell_style), Paragraph("Rewards close proximity to minimize volunteer transit time.", table_cell_style)],
        [Paragraph("<b>Capacity (S<sub>cap</sub>)</b>", table_cell_style), Paragraph("30%", table_cell_style), Paragraph("Incoming Meals / Available Capacity", table_cell_style), Paragraph("Prevents shelter food overflow and validates storage room.", table_cell_style)],
        [Paragraph("<b>Urgency Need (S<sub>urg</sub>)</b>", table_cell_style), Paragraph("20%", table_cell_style), Paragraph("Critical=1.0, High=0.8, Med=0.5", table_cell_style), Paragraph("Prioritizes shelters experiencing severe food shortages.", table_cell_style)],
        [Paragraph("<b>Transit Safety (S<sub>exp</sub>)</b>", table_cell_style), Paragraph("15%", table_cell_style), Paragraph("(Hours Left - Transit) / Hours Left", table_cell_style), Paragraph("Rejects matches if food would spoil during transit.", table_cell_style)]
    ]
    t_formula = Table(formula_data, colWidths=[90, 45, 160, 220])
    t_formula.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), HexColor("#065f46")),
        ('BOX', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_formula)
    story.append(Spacer(1, 10))

    # 5. Delivery FSM & Environmental Model
    story.append(Paragraph("5. Delivery State Machine & Environmental ESG Model", h1_style))
    fsm_text = "<b>Delivery Lifecycle FSM:</b> [POSTED] ──> [MATCHED] ──> [ASSIGNED] ──> [PICKUP_STARTED] ──> [PICKED_UP] ──> [DELIVERED]"
    story.append(Paragraph(fsm_text, ParagraphStyle('FSM', fontName='Helvetica-Bold', fontSize=8, textColor=HexColor("#0284c7"), spaceAfter=6)))

    esg_bullets = [
        "<b>Meal Conversion Benchmark:</b> 1 Meal = 0.42 kg edible food (United Nations FAO global standard).",
        "<b>Methane Avoidance Factor:</b> Landfill organic decomposition produces potent methane (CH4). Every 1 kg of edible food rescued avoids <b>2.5 kg of CO2e emissions</b>.",
        "<b>Formula:</b> <code>CO2e Avoided (kg) = Food Rescued (kg) * 2.5</code>. Computed automatically on delivery confirmation."
    ]
    for b in esg_bullets:
        story.append(Paragraph(f"• {b}", bullet_style))

    story.append(Spacer(1, 8))

    # 6. RESTful API Reference
    story.append(Paragraph("6. RESTful API Reference Summary", h1_style))
    api_data = [
        [Paragraph("Method & Route", table_header_style), Paragraph("Access", table_header_style), Paragraph("Description", table_header_style)],
        [Paragraph("<code>POST /api/auth/register</code>", table_cell_style), Paragraph("Public", table_cell_style), Paragraph("Register new Donor, NGO, or Driver with GPS coordinates.", table_cell_style)],
        [Paragraph("<code>POST /api/auth/login</code>", table_cell_style), Paragraph("Public", table_cell_style), Paragraph("Authenticate user and return signed JWT Bearer token.", table_cell_style)],
        [Paragraph("<code>PUT /api/auth/profile</code>", table_cell_style), Paragraph("Protected", table_cell_style), Paragraph("Update personal info, phone, address, coordinates, capacity.", table_cell_style)],
        [Paragraph("<code>POST /api/donations</code>", table_cell_style), Paragraph("Donor, Admin", table_cell_style), Paragraph("Post new surplus rescue; triggers automated matching engine.", table_cell_style)],
        [Paragraph("<code>PUT /api/donations/:id</code>", table_cell_style), Paragraph("Donor, Admin", table_cell_style), Paragraph("Edit meal count, packaging, temperature notes, expiry time.", table_cell_style)],
        [Paragraph("<code>DELETE /api/donations/:id</code>", table_cell_style), Paragraph("Donor, Admin", table_cell_style), Paragraph("Cancel/delete unassigned donation post.", table_cell_style)],
        [Paragraph("<code>PUT /api/ngos/:id/capacity</code>", table_cell_style), Paragraph("NGO, Admin", table_cell_style), Paragraph("Update intake capacity and available meal thresholds.", table_cell_style)],
        [Paragraph("<code>POST /api/ngos/donations/:id/accept</code>", table_cell_style), Paragraph("NGO, Admin", table_cell_style), Paragraph("Accept matching surplus food; dispatches driver alert.", table_cell_style)],
        [Paragraph("<code>POST /api/drivers/requests/:id/accept</code>", table_cell_style), Paragraph("Driver, Admin", table_cell_style), Paragraph("Claim dispatch request and initialize active delivery route.", table_cell_style)],
        [Paragraph("<code>PUT /api/deliveries/:id/status</code>", table_cell_style), Paragraph("Driver, Admin", table_cell_style), Paragraph("Transition delivery state (PICKED_UP, DELIVERED).", table_cell_style)],
        [Paragraph("<code>GET /api/dashboard/public-stats</code>", table_cell_style), Paragraph("Public", table_cell_style), Paragraph("Live community impact metrics for unauthenticated landing page.", table_cell_style)]
    ]
    t_api = Table(api_data, colWidths=[160, 75, 280])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), HexColor("#0f172a")),
        ('BOX', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_api)

    # Page Break for deployment and local setup
    story.append(PageBreak())

    # 7. Local Installation & Cloud Deployment
    story.append(Paragraph("7. Local Setup & Cloud Deployment Guide", h1_style))
    story.append(Paragraph("<b>One-Command Production Build & Run:</b>", h2_style))

    setup_code = """# 1. Clone repository
git clone https://github.com/J9079/Hemi-Hacks.git
cd Hemi-Hacks

# 2. Build React client into client/dist and install dependencies
npm run build

# 3. Start unified All-in-One server on port 5000
npm start

# Application active at http://localhost:5000 (serves SPA + APIs)
# Health check: http://localhost:5000/api/health"""

    t_code = Table([[Paragraph(f"<pre>{setup_code}</pre>", code_style)]], colWidths=[515])
    t_code.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_CODE_BG),
        ('BOX', (0,0), (-1,-1), 1, HexColor("#334155")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_code)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Cloud Deployment Options:</b>", h2_style))
    deploy_data = [
        [
            Paragraph("Platform", table_header_style),
            Paragraph("Configuration", table_header_style),
            Paragraph("Deployment Workflow", table_header_style)
        ],
        [
            Paragraph("<b>Vercel</b><br/>(Edge & Serverless)", table_cell_style),
            Paragraph("<code>vercel.json</code><br/><code>api/index.js</code>", table_cell_style),
            Paragraph("1. Import <code>J9079/Hemi-Hacks</code> in Vercel.<br/>2. Build Command: <code>npm run build</code>, Output: <code>client/dist</code>.<br/>3. Add environment variables (MONGODB_URI, JWT_SECRET).<br/>4. Deploy: Global Edge CDN for UI + Serverless API functions.", table_cell_style)
        ],
        [
            Paragraph("<b>Render</b><br/>(Persistent Server)", table_cell_style),
            Paragraph("<code>render.yaml</code>", table_cell_style),
            Paragraph("1. Create Web Service on Render connecting GitHub repo.<br/>2. Build: <code>npm run build</code>, Start: <code>npm start</code>.<br/>3. Single-port server provides native WebSockets for Socket.IO.<br/>4. Connects to MongoDB Atlas cluster with automatic HTTPS.", table_cell_style)
        ]
    ]
    t_deploy = Table(deploy_data, colWidths=[100, 110, 305])
    t_deploy.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), HexColor("#1e293b")),
        ('BOX', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_deploy)
    story.append(Spacer(1, 10))

    # 8. Repository Structure
    story.append(Paragraph("8. Project Directory Structure", h1_style))
    tree_text = """Hemi-Hacks/
├── api/
│   └── index.js                 # Vercel serverless entry point
├── client/                      # React 18 SPA Frontend (Vite + Tailwind)
│   ├── dist/                    # Compiled production build
│   ├── src/
│   │   ├── components/          # Reusable UI & Leaflet RescueMap
│   │   ├── context/             # AuthContext & SocketContext (Audio chime)
│   │   ├── pages/               # Donor, NGO, Driver, Admin, Profile
│   │   └── App.jsx              # Protected role-based routing
│   └── package.json
├── server/                      # Express Backend & Algorithmic Engines
│   ├── config/                  # MongoDB Atlas connection pooling & constants
│   ├── controllers/             # REST controllers (Full CRUD across all models)
│   ├── models/                  # Mongoose Schemas (User, Donation, Delivery)
│   ├── routes/                  # Express API routers
│   ├── services/                # Matching engine & impact calculator
│   └── server.js                # Unified Express server (Socket.IO + client/dist)
├── render.yaml                  # Render Blueprint deployment specification
├── vercel.json                  # Vercel Edge & Serverless configuration
└── README.md                    # Platform documentation"""

    t_tree = Table([[Paragraph(f"<pre>{tree_text}</pre>", code_style)]], colWidths=[515])
    t_tree.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor("#1e293b")),
        ('BOX', (0,0), (-1,-1), 1, HexColor("#334155")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_tree)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"README PDF successfully generated at: {output_path}")

if __name__ == "__main__":
    out_file = os.path.abspath("README.pdf")
    build_readme_pdf(out_file)
