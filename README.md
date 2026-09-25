# Surplus-to-Shelter: Real-Time Food Rescue Routing

> **AmiHacks Hackathon Problem Statement Solution**  
> An algorithmic, real-time food rescue dispatch platform connecting commercial food donors with nearby shelters and volunteer drivers before edible food perishes.

---

## 🌟 Executive Summary & Problem Solved
Currently, surplus food rescue relies on disjointed phone calls, manual spreadsheets, and ad-hoc chat groups. Food perishes while shelters remain hungry.

**Surplus-to-Shelter** transforms this into a real-time, capacity-aware logistics engine:
$$\text{Food Donor} \longrightarrow \text{Post Surplus} \longrightarrow \text{Matching Engine} \longrightarrow \text{NGO Shelter} \longrightarrow \text{Driver Volunteer} \longrightarrow \text{Pickup} \longrightarrow \text{Delivery} \longrightarrow \text{Impact Audit}$$

---

## 🚀 Key Highlights & Architecture

- **Multi-Factor Weighted Matching Engine:** Does not just pick the nearest NGO. Computes Distance (30%), Capacity (25%), Need Urgency (20%), Food Compatibility (15%), and Expiry Buffer Feasibility (10%).
- **Strict State Machine Pipeline:** `POSTED` $\to$ `MATCHED` $\to$ `DRIVER_ASSIGNED` $\to$ `PICKUP_STARTED` $\to$ `PICKED_UP` $\to$ `IN_TRANSIT` $\to$ `DELIVERED`.
- **Food Safety & Real-Time Expiry Countdown:** Dynamic risk categorization (`SAFE`, `WARNING`, `CRITICAL`, `EXPIRED`) with automatic rejection if transit buffer is insufficient.
- **Geospatial & Turn-by-Turn Routing:** Haversine urban matrix with intermediate route polyline waypoints centered around **Ajmer, Rajasthan**.
- **Real-Time Mesh:** Socket.IO events update dashboards and in-app notifications instantly without browser refresh.
- **Scientifically-Grounded Impact Tracking:** Computes kilograms rescued, meals fed ($1\text{ meal} = 0.42\text{ kg}$), and $\text{CO}_2\text{e}$ emissions prevented ($2.5\text{ kg CO}_2\text{e} / \text{kg food}$).
- **Judge Quick-Switcher:** 1-click persona switching in the navigation bar to evaluate all 4 roles immediately.

---

## 👥 Roles & Demo Credentials

All test accounts use the default password: **`password123`** (or click the **"Demo Switcher"** in the top navigation).

| Role | Persona / Organization | Email | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Donor** | Chef Rajesh Sharma (*Royal Spice Banquet*) | `donor@royalspice.com` | Post surplus, live expiry simulator, track rescue |
| **NGO / Shelter** | Sister Teresa Maria (*Helping Hands Shelter*) | `ngo@helpinghands.org` | Capacity manager, accept/reject, incoming dispatches |
| **Driver** | Vikram Singh (*Three-Wheeler RJ-01*) | `driver@rescueteam.com` | Browse requests, accept pickup, turn-by-turn route |
| **Admin** | System Admin (*Ajmer Command Center*) | `admin@surplustoshelter.org` | System KPIs, category breakdown, live logistics map |

---

## 🗺️ Step-by-Step Hackathon Demo Walkthrough (Section 26)

1. **Open the Application:** Navigate to `http://localhost:5173`.
2. **Switch to Food Donor:**
   - In the top navbar, click **"Demo Switcher"** $\to$ **"Food Donor"** (or click **"Donate Food Now"**).
   - Click **"+ Post Surplus Food"**.
   - Click the orange banner button: **"Autofill Demo Food"** (loads 30kg Cooked Rice + Dal, 2hr expiry, Civil Lines Ajmer).
   - Click **"Submit & Run Real-Time Matching Engine"**.
3. **Inspect the Algorithmic Match:**
   - The system immediately scores all nearby shelters.
   - Click **"Why Chosen?"** to inspect the mathematical score breakdown (Distance, Capacity, Need, Compatibility, Expiry Safety).
4. **Switch to NGO / Shelter:**
   - Click **"Demo Switcher"** $\to$ **"NGO / Shelter"**.
   - Notice the incoming card with the match score ($95.4 / 100$).
   - Click **"ACCEPT SURPLUS"**.
5. **Switch to Volunteer Driver:**
   - Click **"Demo Switcher"** $\to$ **"Volunteer Driver"**.
   - Under available pickup requests, click **"ACCEPT RESCUE PICKUP"**.
   - Execute the 4-step transit workflow:
     1. **"START PICKUP →"** (Status: `PICKUP_STARTED`)
     2. **"CONFIRM PICKUP (FOOD LOADED) →"** (Status: `PICKED_UP`, timestamp logged)
     3. **"START DELIVERY TO SHELTER →"** (Status: `IN_TRANSIT`)
     4. **"CONFIRM DELIVERY COMPLETE ✓"** (Status: `DELIVERED`)
6. **View Impact Dashboard:**
   - The completion celebration modal displays: **71 Meals Rescued**, **30 kg Saved**, **75 kg $\text{CO}_2\text{e}$ Avoided**.
   - Click **"Demo Switcher"** $\to$ **"System Admin"** to view the live Ajmer logistics map, category distribution, and updated KPIs!

---

## 🛠️ Technology Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose with auto in-memory fallback), Socket.IO, JWT, Bcrypt.
- **Frontend:** React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons, Leaflet & React-Leaflet, Recharts.
- **Environment:** Windows, PowerShell compatible.

---

## 🏃 Running the Application

### 1. Start Backend API & Real-Time Server
```powershell
cd server
npm install
npm start
# Server listens on http://localhost:5000 (auto-seeds database on first boot)
```

### 2. Start Frontend Web Client
```powershell
cd client
npm install
npm run dev
# Web application active on http://localhost:5173
```

### 3. Run Automated Integration Test
```powershell
cd server
node test/e2e.js
# Executes all 18 steps of the AmiHacks workflow automatically
```
