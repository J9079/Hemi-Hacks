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
            self.drawString(40, 802, "Surplus-to-Shelter  |  Project Explanation & Presentation Guide")
            self.setStrokeColor(HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(40, 796, 555, 796)

        # Footer for all pages
        self.drawString(40, 28, "Surplus-to-Shelter  *  Full-Stack Food Rescue Platform  *  GitHub: J9079/Hemi-Hacks")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(555, 28, page_str)
        self.setStrokeColor(HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(40, 38, 555, 38)
        self.restoreState()

def build_presentation_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=50
    )

    C_PRIMARY = HexColor("#0f172a") # Slate 900
    C_EMERALD = HexColor("#059669") # Emerald 600
    C_BLUE = HexColor("#0284c7")    # Sky 600
    C_AMBER = HexColor("#d97706")   # Amber 600
    C_TEXT = HexColor("#1e293b")    # Slate 800
    C_CARD_BG = HexColor("#f8fafc") # Slate 50
    C_BOX_BG = HexColor("#ecfdf5")  # Emerald 50

    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=C_PRIMARY,
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=C_EMERALD,
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'H1',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=C_PRIMARY,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=HexColor("#1e293b"),
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        fontName='Helvetica',
        fontSize=8.3,
        leading=12,
        textColor=C_TEXT,
        spaceAfter=5
    )

    pitch_style = ParagraphStyle(
        'PitchText',
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12.5,
        textColor=HexColor("#065f46")
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        fontName='Helvetica',
        fontSize=8.0,
        leading=11.5,
        textColor=HexColor("#334155"),
        leftIndent=10,
        spaceAfter=2.5
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=7.5,
        leading=10.5,
        textColor=C_TEXT
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
    story.append(Paragraph("Surplus-to-Shelter: Project Explanation & Presentation Guide", title_style))
    story.append(Paragraph("Complete Presentation Script, Tech Stack Justifications, Architecture & Defense Q&A", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_EMERALD, spaceAfter=8))

    # SECTION 1: 60-SECOND ELEVATOR PITCH
    story.append(Paragraph("1. 60-Second Elevator Pitch (Opening Script for Presentation)", h1_style))
    pitch_box_content = [
        Paragraph(
            "<b>Opening Speech (Say this with confidence):</b><br/>"
            "\"Good morning/afternoon, esteemed judges and audience. Every single day, millions of tons of perfectly edible food from restaurants, hotels, and cafeterias end up in municipal landfills, producing potent methane emissions. Meanwhile, just a few kilometers away, homeless shelters and food banks struggle to feed hungry people.<br/><br/>"
            "Why does this happen? Because existing food rescue relies on slow phone calls, messy WhatsApp groups, and manual spreadsheets. By the time someone answers, the food has spoiled.<br/><br/>"
            "Our solution is <b>Surplus-to-Shelter</b>: a production-ready, real-time food rescue routing platform. In under 30 seconds, a donor posts surplus food, our <b>multi-factor matching algorithm</b> pairs it with the most suitable shelter based on proximity, capacity, and expiry transit time, and dispatches nearby volunteer drivers with turnkey navigation and audio alerts. We are turning surplus food into someone's next meal with mathematical precision.\"",
            pitch_style
        )
    ]
    t_pitch = Table([[pitch_box_content]], colWidths=[515])
    t_pitch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BOX_BG),
        ('BOX', (0,0), (-1,-1), 1, C_EMERALD),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 9),
        ('RIGHTPADDING', (0,0), (-1,-1), 9),
    ]))
    story.append(t_pitch)
    story.append(Spacer(1, 8))

    # SECTION 2: THE PROBLEM VS OUR SOLUTION
    story.append(Paragraph("2. Real-World Problem vs. Our Algorithmic Solution", h1_style))
    problem_table_data = [
        [
            Paragraph("Challenge / Traditional Reality", table_header_style),
            Paragraph("How Surplus-to-Shelter Solves It", table_header_style)
        ],
        [
            Paragraph("<b>Uncoordinated Communication:</b><br/>Donors must make 5 to 10 phone calls to find an NGO that is open and interested.", table_cell_style),
            Paragraph("<b>Automated Multi-Factor Matching:</b><br/>Our algorithmic engine instantly scores all active shelters within 15 km in under 50 milliseconds.", table_cell_style)
        ],
        [
            Paragraph("<b>Capacity Overflow:</b><br/>Shelters receive food they cannot store, resulting in food perishing on the shelter floor.", table_cell_style),
            Paragraph("<b>Real-Time Capacity Balancing:</b><br/>Matches are only routed to shelters whose <code>availableCapacity >= incomingMeals</code>, with dynamic capacity sliders.", table_cell_style)
        ],
        [
            Paragraph("<b>Perishability & Food Safety:</b><br/>Hot or cooked food spoils if transit takes longer than the remaining safe consumption window.", table_cell_style),
            Paragraph("<b>Transit Expiry Safety Buffer:</b><br/>Validates <code>(hoursRemaining - estTransitTime) > buffer</code>. If unsafe, auto-alerts emergency hot meal distribution.", table_cell_style)
        ],
        [
            Paragraph("<b>Driver Availability Bottleneck:</b><br/>Volunteers have no visibility into where pickup requests are located.", table_cell_style),
            Paragraph("<b>Volunteer Dispatch Radar:</b><br/>Volunteers see requests sorted nearest to them with audio chimes, turn-by-turn routing, and live status updates.", table_cell_style)
        ]
    ]
    t_prob = Table(problem_table_data, colWidths=[240, 275])
    t_prob.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), HexColor("#0f172a")),
        ('BOX', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_prob)
    story.append(Spacer(1, 8))

    # SECTION 3: COMPLETE TECH STACK
    story.append(Paragraph("3. Technology Stack Breakdown & Architecture Choices", h1_style))
    story.append(Paragraph("<b>Explain this to technical judges:</b> \"We chose our stack for speed, zero cold starts, real-time capabilities, and scalability:\"", body_style))

    tech_data = [
        [Paragraph("Layer", table_header_style), Paragraph("Technology Used", table_header_style), Paragraph("Architectural Rationale / Why We Used It", table_header_style)],
        [
            Paragraph("<b>Frontend Framework</b>", table_cell_style),
            Paragraph("<b>React 18 + Vite 5</b>", table_cell_style),
            Paragraph("Ultra-fast client bundling, zero lag single-page application (SPA), responsive Tailwind CSS UI, and instantaneous hot-module replacement.", table_cell_style)
        ],
        [
            Paragraph("<b>Interactive Mapping</b>", table_cell_style),
            Paragraph("<b>Leaflet & OpenStreetMap</b>", table_cell_style),
            Paragraph("Open-source, zero API cost vector mapping. Plots donors, shelters, and drivers with pulsing GPS radar circles without expensive Google Maps API billing.", table_cell_style)
        ],
        [
            Paragraph("<b>Backend Server</b>", table_cell_style),
            Paragraph("<b>Node.js + Express 4</b>", table_cell_style),
            Paragraph("Non-blocking asynchronous I/O ideal for handling concurrent rescue requests, centralized REST routing, and JWT authorization middleware.", table_cell_style)
        ],
        [
            Paragraph("<b>Real-Time Mesh</b>", table_cell_style),
            Paragraph("<b>Socket.IO (WSS)</b>", table_cell_style),
            Paragraph("Bidirectional event streaming. Broadcasts match notifications to shelters and drivers instantly without requiring users to refresh their browser.", table_cell_style)
        ],
        [
            Paragraph("<b>Audio Alerts</b>", table_cell_style),
            Paragraph("<b>Web Audio API (Synthesizer)</b>", table_cell_style),
            Paragraph("Synthesizes a dual-tone audio chime (660Hz -> 880Hz) directly in the browser. Zero external MP3 file downloads; 100% reliable on mobile and desktop.", table_cell_style)
        ],
        [
            Paragraph("<b>Database</b>", table_cell_style),
            Paragraph("<b>MongoDB Atlas Cloud</b>", table_cell_style),
            Paragraph("3-node distributed cloud replica set cluster. Flexible JSON document schema with <code>2dsphere</code> geospatial indexing for instant distance queries.", table_cell_style)
        ],
        [
            Paragraph("<b>Cloud Deployment</b>", table_cell_style),
            Paragraph("<b>Vercel Edge & Render Web Svc</b>", table_cell_style),
            Paragraph("All-in-One architecture: Single-port static serving from Express on port 5000, with Vercel serverless function (<code>api/index.js</code>) compatibility.", table_cell_style)
        ]
    ]
    t_tech = Table(tech_data, colWidths=[95, 125, 295])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), HexColor("#1e3a8a")),
        ('BOX', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_tech)

    # Page Break for Step-by-Step Presentation Script
    story.append(PageBreak())

    # SECTION 4: STEP-BY-STEP LIVE DEMO SCRIPT
    story.append(Paragraph("4. Step-by-Step Live Demo Presentation Script", h1_style))
    story.append(Paragraph("<b>Follow this exact script when presenting your screen to judges:</b>", body_style))

    demo_steps = [
        ("Step 1: The Landing Page & Live Social Metrics", [
            "<b>Action:</b> Show the homepage (<code>http://localhost:5000</code> or your live URL).",
            "<b>Say:</b> \"Notice our live impact counters: Meals Rescued, Food Diverted (kg), Total Rescues, and Partner Shelters. These are not hardcoded numbers—they are computed live from our MongoDB Atlas database via <code>/api/dashboard/public-stats</code>.\""
        ]),
        ("Step 2: Food Donor Posts Surplus Food", [
            "<b>Action:</b> Navigate to <code>/donor/post</code>.",
            "<b>Say:</b> \"As a restaurant manager, I enter 35 Meals of Cooked Rice and Dal, set the food category, and click <b>Auto-Detect GPS</b>. The browser captures my exact coordinates. I set the usable consumption window to 3 hours and click submit.\""
        ]),
        ("Step 3: The Algorithmic Matching Engine Runs", [
            "<b>Action:</b> Open the Donor Dashboard or show the Match Score modal.",
            "<b>Say:</b> \"Instantly, our multi-factor engine runs in the background. It doesn't just look for the closest building—it evaluates distance, capacity, urgency, and expiry transit time. It matches the top-scoring shelter and sends a real-time Socket.IO alert.\""
        ]),
        ("Step 4: Shelter Reviews & Accepts Intake", [
            "<b>Action:</b> Open the NGO Dashboard (<code>/ngo</code>).",
            "<b>Say:</b> \"The shelter sees the incoming rescue card with the match score breakdown. They check their current intake slider (e.g. 110/150 meals available). When they click <b>Accept Surplus</b>, the system locks the match and immediately alerts volunteer drivers.\""
        ]),
        ("Step 5: Volunteer Driver Dispatch & Route Execution", [
            "<b>Action:</b> Open Driver Dashboard (<code>/driver</code>) and active delivery (<code>/driver/active</code>).",
            "<b>Say:</b> \"The volunteer driver hears a synthesized audio chime and sees the pickup request sorted by proximity (<b>⚡ NEAREST TO YOU</b>). The driver accepts and follows a finite state machine: <code>START PICKUP</code> -> <code>CONFIRM PICKUP</code> -> <code>START DELIVERY</code> -> <code>CONFIRM DELIVERED</code>.\""
        ]),
        ("Step 6: Verified Delivery & Environmental Carbon Audit", [
            "<b>Action:</b> Click Confirm Delivered and show the completion modal / Admin dashboard.",
            "<b>Say:</b> \"Upon delivery, shelter capacity updates dynamically, and our environmental engine logs the impact: 35 meals rescued, 14.7 kg diverted, and 36.75 kg of CO2e avoided from landfill methane emissions.\""
        ])
    ]

    for title, lines in demo_steps:
        story.append(Paragraph(title, h2_style))
        for line in lines:
            story.append(Paragraph(f"• {line}", bullet_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 6))

    # SECTION 5: MATHEMATICAL FORMULA & STATE MACHINE
    story.append(Paragraph("5. Deep-Dive Technical Innovations", h1_style))
    story.append(Paragraph("<b>A. The Matching Scoring Formula:</b>", h2_style))
    story.append(Paragraph(
        "<code>Score = (0.35 * S_dist) + (0.30 * S_cap) + (0.20 * S_urg) + (0.15 * S_exp)</code><br/>"
        "• <b>S_dist (35%):</b> <code>1 - (Haversine Distance / 15 km)</code>. Solves urban proximity.<br/>"
        "• <b>S_cap (30%):</b> <code>Incoming Meals / Available Capacity</code>. Prevents shelter overflow.<br/>"
        "• <b>S_urg (20%):</b> Urgency multiplier (Critical = 1.0, High = 0.8, Medium = 0.5, Low = 0.2).<br/>"
        "• <b>S_exp (15%):</b> <code>(Hours Left - Est. Transit) / Hours Left</code>. Protects food safety.",
        ParagraphStyle('FormulaBlock', fontName='Helvetica', fontSize=7.8, leading=11, textColor=HexColor("#065f46"), leftIndent=8)
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("<b>B. Delivery Finite State Machine (FSM):</b>", h2_style))
    story.append(Paragraph(
        "<code>[POSTED] ──> [MATCHED] ──> [ASSIGNED] ──> [PICKUP_STARTED] ──> [PICKED_UP] ──> [DELIVERED]</code><br/>"
        "Strict one-way transitions prevent race conditions, double pickups, or lost food in transit.",
        ParagraphStyle('FsmBlock', fontName='Helvetica', fontSize=7.8, leading=11, textColor=HexColor("#0284c7"), leftIndent=8)
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("<b>C. ESG Environmental Carbon Formula:</b>", h2_style))
    story.append(Paragraph(
        "• <b>1 Meal = 0.42 kg</b> (United Nations Food and Agriculture Organization standard benchmark).<br/>"
        "• <b>CO2e Avoided = Food Rescued (kg) * 2.5 kg CO2e / kg</b> (Prevents anaerobic landfill decomposition yielding potent methane gas CH4).",
        ParagraphStyle('EsgBlock', fontName='Helvetica', fontSize=7.8, leading=11, textColor=HexColor("#1e293b"), leftIndent=8)
    ))

    # Page Break for Q&A Defense
    story.append(PageBreak())

    # SECTION 6: TOP 5 TOUGH QUESTIONS JUDGES WILL ASK & HOW TO ANSWER
    story.append(Paragraph("6. Top 5 Tough Questions Judges Will Ask & How to Answer Them", h1_style))
    story.append(Paragraph("<b>Study these answers so you sound like an experienced full-stack architect:</b>", body_style))

    qa_list = [
        (
            "Q1: What happens if food perishes before a volunteer driver arrives?",
            "\"Our platform has an active safety buffer. If the remaining shelf-life drops below the estimated transit duration plus a 30-minute safety buffer, the matching engine automatically halts volunteer dispatch and triggers an emergency alert for immediate nearby consumption. We also log temperature requirements (Hot, Chilled, Ambient) so drivers know if thermal bags are required.\""
        ),
        (
            "Q2: Why did you build an All-in-One deployment instead of two separate servers?",
            "\"We designed an All-in-One unified server where Express serves the compiled React Vite SPA from <code>client/dist</code> on the same port (5000) as the REST APIs and Socket.IO. This eliminates CORS configuration errors, reduces cloud hosting costs to a single container instance, and avoids latency between frontend and backend. We also support Vercel serverless deployment via <code>api/index.js</code>.\""
        ),
        (
            "Q3: How do you handle database scaling and connection limits in production?",
            "\"We connect to a distributed MongoDB Atlas cluster with SSL/TLS encryption. To ensure performance in serverless or containerized environments, we implemented <b>connection caching</b> in <code>db.js</code>: if <code>mongoose.connection.readyState >= 1</code>, we reuse the existing connection pool rather than executing a new TCP handshake on every API request. We also indexed coordinates with <code>2dsphere</code> for sub-millisecond geospatial queries.\""
        ),
        (
            "Q4: How do you prevent two drivers from accepting the same rescue request?",
            "\"We use atomic database operations in our delivery controller. When a driver clicks accept, we perform an atomic query: <code>Donation.findOneAndUpdate({ _id: id, status: 'MATCHED' }, { status: 'DRIVER_ASSIGNED', assignedDriverId: driverId })</code>. If another driver claimed it milliseconds earlier, the status is no longer MATCHED, the update returns null, and our Socket.IO mesh notifies the second driver that the request has already been claimed.\""
        ),
        (
            "Q5: Why did you use Web Audio API instead of playing an MP3 audio file?",
            "\"External MP3 or WAV files introduce network latency, can fail if the user is on poor cellular connectivity, and often get blocked by mobile browsers due to media autoplay policies. By using the browser's native <b>Web Audio API</b>, we synthesize a clean dual-tone chime (660Hz followed by 880Hz) programmatically using oscillator nodes with zero file download overhead and zero latency.\""
        )
    ]

    for q, a in qa_list:
        story.append(Paragraph(f"<b>{q}</b>", ParagraphStyle('Q', fontName='Helvetica-Bold', fontSize=8.5, leading=12, textColor=HexColor("#991b1b"), spaceBefore=4)))
        story.append(Paragraph(a, ParagraphStyle('A', fontName='Helvetica', fontSize=8.0, leading=11.5, textColor=HexColor("#1e293b"), leftIndent=8, spaceAfter=5)))

    story.append(Spacer(1, 10))

    # Summary Sign-Off Box
    summary_box = [
        Paragraph(
            "<b>Key Takeaway to Conclude Your Presentation:</b><br/>"
            "\"Surplus-to-Shelter is not just an idea or a CRUD prototype. It is a tested, production-ready, full-stack platform with real algorithmic matching, real GPS geolocation, real WebSocket communication, and live MongoDB Atlas integration. It solves a multi-billion dollar environmental and humanitarian problem with technology. Thank you!\"",
            ParagraphStyle('SummaryText', fontName='Helvetica-Bold', fontSize=8.5, leading=12.5, textColor=HexColor("#065f46"))
        )
    ]
    t_summary = Table([[summary_box]], colWidths=[515])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor("#dcfce7")),
        ('BOX', (0,0), (-1,-1), 1, HexColor("#16a34a")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_summary)

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Presentation Guide PDF successfully generated at: {output_path}")

if __name__ == "__main__":
    out_file = os.path.abspath("Project_Explanation_and_Presentation_Guide.pdf")
    build_presentation_pdf(out_file)
