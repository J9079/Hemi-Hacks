# Surplus-to-Shelter: Real-Time Food Rescue & Redistribution Network

[![GitHub Repository](https://img.shields.io/badge/GitHub-J9079%2FHemi--Hacks-blue?logo=github)](https://github.com/J9079/Hemi-Hacks)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green?logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)](https://vitejs.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%20Cloud-47A248?logo=mongodb)](https://cloud.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time%20Mesh-black?logo=socketdotio)](https://socket.io/)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%7C%20Render-black?logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Surplus-to-Shelter** is an algorithmic, production-ready logistics and food redistribution platform connecting restaurants, hotels, cafeterias, and caterers with nearby verified shelters and volunteer drivers before edible surplus food perishes.

---

## 🌟 Executive Summary & Real-World Solution

Globally, over one-third of all food produced is wasted, generating approximately **8–10% of global greenhouse gas emissions**, while local communities and shelters face critical food deficits. Traditional rescue initiatives rely on fragmented phone calls, manual spreadsheets, and uncoordinated group messaging. By the time logistical coordination happens, perishable food spoils.

**Surplus-to-Shelter** replaces manual friction with an algorithmic, capacity-aware matching and dispatch pipeline:

$$\text{Food Donor} \xrightarrow{\text{Post Surplus}} \text{Matching Engine} \xrightarrow{\text{Score Candidates}} \text{NGO / Shelter} \xrightarrow{\text{Accept Intake}} \text{Volunteer Driver} \xrightarrow{\text{GPS Transit}} \text{Delivery Verified} \xrightarrow{\text{ESG Audit}}$$

---

## 🏗️ System Architecture & Workflow

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        SURPLUS-TO-SHELTER  |  UNIFIED SYSTEM ARCHITECTURE                              │
│             Real-Time Food Rescue Routing & Redistribution Engine  *  Full-Stack Production Blueprint  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. PRESENTATION LAYER (React 18 SPA + Vite + Tailwind CSS + Leaflet Engine)                            │
│ ┌──────────────────────┬──────────────────────┬──────────────────────┬───────────────────────────────┐ │
│ │ 🍲 Donor Portal      │ 🏠 NGO / Shelter     │ 🛵 Driver Hub        │ 📊 Admin Command              │ │
│ │ • Post Surplus Food  │ • Match Radar Feed   │ • Nearest Radar (km) │ • Leaflet Real-Time Mesh      │ │
│ │ • GPS Coordinates    │ • Capacity Slider    │ • Turn-by-Turn FSM   │ • Carbon & Meal ESG Audit     │ │
│ │ • Full Post CRUD     │ • 1-Click Accept     │ • Web Audio Chime    │ • Role Access & RBAC          │ │
│ └──────────────────────┴──────────────────────┴──────────────────────┴───────────────────────────────┘ │
├──────────────────────────────────────────┬─────────────────────────────────────────────────────────────┤
│ 2. API GATEWAY & TRANSPORT (Express 4)   │ 3. DOMAIN LOGIC: MATCHING ALGORITHM & DELIVERY FSM          │
│ • Unified Serving: Port 5000 + SPA '*'   │ • Multi-Factor Matching Scoring Formula:                    │
│ • Security: JWT 'protect' + RBAC roles   │     Score = (0.35*S_dist)+(0.30*S_cap)+(0.20*S_urg)+...     │
│ • RESTful Controllers: /api/donations    │ • Delivery State Machine:                                   │
│ • Socket.IO Mesh: user_{id} & feed rooms │     [POSTED] → [MATCHED] → [ASSIGNED]                       │
│ • Dual Entry: server.js & api/index.js   │     → [PICKUP_STARTED] → [PICKED_UP] → [DELIVERED]          │
│                                          │ • ESG Carbon Model: 1 Meal=0.42kg, 1kg Food=2.5kg CO2e      │
├──────────────────────────────────────────┴─────────────────────────────────────────────────────────────┤
│ 4. DATA PERSISTENCE & MULTI-TARGET DEPLOYMENT INFRASTRUCTURE                                           │
│ ┌──────────────────────────────┬──────────────────────────────┬──────────────────────────────────────┐ │
│ │ MongoDB Atlas Replica Set    │ Mongoose Schemas & Indexes   │ Multi-Target Deployment              │ │
│ │ • Cluster: cluster0.i2iv3xy  │ • Users, Profiles, Donations │ • Vercel: Edge CDN + Serverless Func │ │
│ │ • DB: surplus_to_shelter     │ • Delivery audit timestamps  │ • Render: Persistent Web Service     │ │
│ │ • Serverless conn caching    │ • 2dsphere [lon, lat] index  │ • All-in-One: Express client/dist    │ │
│ └──────────────────────────────┴──────────────────────────────┴──────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ DATA FLOW: Client (REST/WSS) ──> Gateway/Auth ──> Domain Engines ──> MongoDB Atlas Cloud [PAGE 1 OF 1] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 4 Dedicated Role-Based Portals

### 1. 🍲 Food Donor Portal
* **Surplus Food Wizard**: Post surplus with title, quantity, meal count, packaging type, temperature condition (Hot, Ambient, Chilled), and usable expiry window.
* **Auto-Detect GPS**: One-click browser geolocation captures high-accuracy coordinates (`[latitude, longitude]`).
* **Complete CRUD**: Update meal quantities, edit delivery instructions, or cancel unassigned pickups before dispatch.

### 2. 🏠 NGO & Shelter Portal
* **Intake Capacity Balancing**: Real-time slider to adjust intake capacity (e.g., 100/150 meals available).
* **Match Candidate Radar**: Automatically evaluates incoming surplus donations ranked by mathematical compatibility.
* **Turnkey Decision**: One-click acceptance with automatic broadcast to nearby volunteer drivers, or rejection with logged justifications.

### 3. 🛵 Volunteer Driver Hub
* **Nearest Rescue Radar**: Real-time Haversine distance calculations sort active pickup requests nearest to the driver (`⚡ NEAREST TO YOU`).
* **Turn-by-Turn FSM Delivery**: Clear status progression buttons: `START PICKUP` $\to$ `CONFIRM PICKUP` $\to$ `START DELIVERY` $\to$ `CONFIRM DELIVERED`.
* **Audio Dispatch Synthesizer**: In-browser dual-tone audio chime (660Hz $\to$ 880Hz) via the Web Audio API alerts drivers without requiring audio asset downloads.

### 4. 📊 Admin & Environmental Observability
* **Live Logistics Mesh**: Interactive Leaflet / OpenStreetMap view plotting donors (orange), shelters (green), and volunteer drivers (blue).
* **Automated ESG Audit**: Real-time dynamic counters compute meals rescued, kilograms diverted, and metric tonnes of $\text{CO}_2\text{e}$ emissions prevented.

---

## 🧠 Algorithmic Matching Scoring Formula

The matching engine scores candidate shelters against a surplus donation using a multi-factor weighted equation:

$$\text{Match Score} = (0.35 \times S_{\text{dist}}) + (0.30 \times S_{\text{cap}}) + (0.20 \times S_{\text{urg}}) + (0.15 \times S_{\text{exp}})$$

| Factor | Weight | Scoring Logic | Description |
|---|:---:|---|---|
| **Distance ($S_{\text{dist}}$)** | **35%** | $1 - \left(\frac{\text{Distance}}{15\text{ km}}\right)$ | Haversine formula across Ajmer urban grid (Max radius: 15 km). |
| **Capacity ($S_{\text{cap}}$)** | **30%** | $\frac{\text{Incoming Meals}}{\text{Available Capacity}}$ | Validates $\text{Capacity} \ge \text{Meals}$ to prevent food overflow. |
| **Urgency Need ($S_{\text{urg}}$)** | **20%** | $\text{Critical}=1.0, \text{High}=0.8, \text{Med}=0.5$ | Prioritizes shelters facing acute food deficits. |
| **Expiry Transit ($S_{\text{exp}}$)** | **15%** | $\frac{\text{Hours Left} - \text{Est. Transit}}{\text{Hours Left}}$ | Enforces transit safety buffer before bacterial spoiling. |

---

## 🚚 Delivery Finite State Machine (FSM)

```text
[POSTED] ──────> [MATCHED] ──────> [ASSIGNED]
  (Donor)     (Matching Engine)    (Driver Accepts)
                                        │
                                        ▼
[DELIVERED] <─── [PICKED_UP] <─── [PICKUP_STARTED]
 (Verified)     (Food Loaded)     (Navigation On)
```

---

## 🌍 Environmental Impact & Carbon Abatement Model

* **Meal Conversion Factor**: $1\text{ Meal} = 0.42\text{ kg}$ edible food (United Nations FAO benchmark).
* **Methane Abatement Model**: When organic edible food decomposes anaerobically in municipal landfills, it produces high-potency methane gas ($\text{CH}_4$).
* **Emission Avoidance Factor**: Every $1\text{ kg}$ of food diverted from landfills avoids **$2.5\text{ kg}$ of $\text{CO}_2\text{e}$ emissions**.
* **Formula**:
  $$\text{CO}_2\text{e Avoided (kg)} = \text{Food Rescued (kg)} \times 2.5$$

---

## 🔌 RESTful API Reference

All protected routes require a Bearer JWT Token: `Authorization: Bearer <token>`.

### Authentication & Profile (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new Donor, NGO, or Driver with GPS |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/profile` | Protected | Fetch current user & role profile details |
| `PUT` | `/api/auth/profile` | Protected | Update profile, phone, address, and coordinates |
| `PUT` | `/api/auth/password` | Protected | Change password with verification |

### Donations & Food Rescue (`/api/donations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/donations` | Donor, Admin | Post new surplus food rescue |
| `GET` | `/api/donations` | Protected | List user's active/historical donations |
| `GET` | `/api/donations/:id` | Protected | Retrieve donation with matched shelter & driver |
| `PUT` | `/api/donations/:id` | Donor, Admin | Edit surplus food quantity, expiry, notes |
| `DELETE`| `/api/donations/:id` | Donor, Admin | Delete/cancel active uncollected donation |

### NGO & Intake Management (`/api/ngos`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/ngos` | Protected | List all verified partner shelters |
| `PUT` | `/api/ngos/:id/capacity`| NGO, Admin | Update intake meal capacity & available capacity |
| `POST`| `/api/ngos/donations/:id/accept` | NGO, Admin | Accept matching food rescue & notify drivers |
| `POST`| `/api/ngos/donations/:id/reject` | NGO, Admin | Reject donation with logged justification |

### Volunteer Drivers & Deliveries (`/api/drivers`, `/api/deliveries`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/drivers/requests` | Driver, Admin | Browse open pickup requests with coordinates |
| `POST`| `/api/drivers/requests/:id/accept`| Driver, Admin | Accept rescue dispatch & initialize delivery entity |
| `PUT` | `/api/drivers/location`| Driver, Admin | Update live driver GPS location |
| `GET` | `/api/drivers/active` | Driver, Admin | Fetch driver's active transit assignment |
| `PUT` | `/api/deliveries/:id/status` | Driver, Admin | Transition delivery state (`PICKED_UP` $\to$ `DELIVERED`) |

### Dashboards & Public Social Metrics (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/public-stats` | Public | Live landing page counters (meals, kg, rescues) |
| `GET` | `/api/dashboard/donor` | Donor, Admin | Donor impact stats, history, and status filters |
| `GET` | `/api/dashboard/ngo` | NGO, Admin | Shelter capacity meter and incoming delivery queue |
| `GET` | `/api/dashboard/driver` | Driver, Admin | Driver route metrics and completed deliveries |
| `GET` | `/api/dashboard/admin` | Admin | System-wide metrics, timeline chart, and logistics map |

---

## 💻 Local Installation & Setup

### Prerequisites
* **Node.js**: v20.x or higher
* **npm**: v10.x or higher
* **MongoDB Atlas Account** (or local MongoDB on port 27017)

### 1. Clone the Repository
```bash
git clone https://github.com/J9079/Hemi-Hacks.git
cd Hemi-Hacks
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/surplus_to_shelter
JWT_SECRET=your_super_secure_jwt_secret_key_prod
JWT_EXPIRES_IN=7d
```

### 3. Build & Run All-in-One
```bash
# 1. Install all dependencies & build React client into client/dist
npm run build

# 2. Start the unified production server
npm start
```
* **Application Web UI**: Open `http://localhost:5000`
* **API Health Check**: `http://localhost:5000/api/health`

### 4. Optional: Seed Sample Realistic Data
To populate sample restaurants, shelters, and rescues in your database for evaluation:
```bash
npm run seed
```

---

## ☁️ Cloud Deployment Guides

### Option A: Deploy on Vercel

The repository includes a ready-to-use [`vercel.json`](vercel.json) and serverless function entry [`api/index.js`](api/index.js):

1. Import `J9079/Hemi-Hacks` into your **[Vercel Dashboard](https://vercel.com/)**.
2. **Build Settings**:
   * **Framework Preset**: `Other` (or `Vite`)
   * **Build Command**: `npm run build`
   * **Output Directory**: `client/dist`
3. **Environment Variables**:
   * `MONGODB_URI`: Your MongoDB Atlas cluster connection string
   * `JWT_SECRET`: Secure random string
   * `JWT_EXPIRES_IN`: `7d`
   * `NODE_ENV`: `production`
4. Click **Deploy**.

### Option B: Deploy on Render

The repository includes a configured [`render.yaml`](render.yaml) for a single-port persistent Web Service:

1. Open **[Render Dashboard](https://dashboard.render.com/)** $\to$ **New +** $\to$ **Web Service**.
2. Connect `J9079/Hemi-Hacks`.
3. Set **Build Command**: `npm run build`
4. Set **Start Command**: `npm start`
5. Add your `MONGODB_URI` and `JWT_SECRET` in Environment Variables.
6. Click **Deploy Web Service**.

> [!TIP]
> Ensure MongoDB Atlas **Network Access** allows `0.0.0.0/0` (Allow Access from Anywhere) so cloud servers in Vercel or Render can connect.

---

## 📁 Repository Directory Structure

```text
Hemi-Hacks/
├── api/
│   └── index.js                 # Vercel serverless function entry point
├── client/                      # React 18 SPA Frontend (Vite + Tailwind CSS)
│   ├── dist/                    # Compiled production build
│   ├── src/
│   │   ├── components/          # Reusable UI & Leaflet RescueMap
│   │   ├── context/             # AuthContext & SocketContext (Audio chime)
│   │   ├── pages/               # Donor, NGO, Driver, Admin, Profile
│   │   ├── services/            # Axios API client with auto JWT
│   │   └── App.jsx              # Role-based protected routes
│   └── package.json
├── server/                      # Express Backend & Algorithmic Engines
│   ├── config/                  # MongoDB Atlas connection pooling & constants
│   ├── controllers/             # REST controllers for all entities (Full CRUD)
│   ├── middleware/              # JWT auth guard & RBAC authorization
│   ├── models/                  # Mongoose Schemas (User, Donation, Delivery)
│   ├── routes/                  # Express API routers
│   ├── services/                # Matching engine & impact calculation
│   └── server.js                # Unified Express server (Socket.IO + client/dist)
├── package.json                 # Root deployment & workspace build scripts
├── render.yaml                  # Render Blueprint deployment specification
├── vercel.json                  # Vercel Edge & Serverless configuration
└── README.md                    # Platform documentation
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
