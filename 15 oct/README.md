# ⚡ PulseFlow — Intelligent Autonomous Workspace & Analytics Platform

A modern, responsive, and visually stunning full-stack SaaS web application built with vanilla web standards (HTML5, Vanilla CSS3, modern ES6+ JavaScript) and a native Node.js HTTP/REST server with zero external dependencies.

---

## ✨ Features & Architecture

### 1. 🎨 Visual Excellence & Design System
- **Curated HSL Color Tokens**: Obsidian dark mode with deep layer elevation, radial ambient lighting orbs, and full **Light Mode** support with smooth transitions.
- **Glassmorphism & Micro-animations**: Blurred backdrops (`backdrop-filter`), glowing interactive focus rings, floating telemetry nodes, and hover-triggered button shines.
- **Fluid Typography**: Responsive scale built on Google Fonts (*Plus Jakarta Sans* & *JetBrains Mono*).

### 2. 🚀 Interactive Modules (Not Just Static UI!)
- **Live Hero Sandbox & Canvas Chart Engine**:
  - High-performance pure HTML5 Canvas chart with glowing area fills, bezier curves, and dynamic data feeds.
  - Interactive crosshair tracking displaying live latency (ms) and agent load per timestamp.
  - Interactive time range filters: `24h`, `7d`, `30d`, and `Live Stream`.
  - **"Simulate Load Spike"** button to stress-test and animate the cluster with real-time toast feedback.
- **Dynamic Telemetry Cards**:
  - Real-time polling connecting to `/api/metrics` updating *Active Agents*, *P99 Edge Latency*, *Token Efficiency*, and *Compute Saved*.
- **Interactive ROI & Productivity Calculator**:
  - Sliders for Team Size, Hourly Rate, and Manual Churn Hours.
  - Instant recalculation of recovered engineering hours, annual net dollar savings, and ROI multiples.
- **AST AI Prompt & Workflow Optimizer**:
  - Preset scenarios (*AWS Cold Starts*, *Zero-Downtime SQL*, *PR Review Swarm*).
  - Simulated streaming typewriter output, token compression metrics (-40%), and one-click copy to clipboard with toast confirmation.
- **Interactive Architecture & Capabilities Tabs**:
  - Tabbed showcase switching between *Agent Swarm*, *Edge Observability*, *Cost Governor*, and *Enterprise Guardrails*.
- **Annual / Monthly Billing Switch**:
  - Interactive pricing toggle updating tier prices ($49/mo vs $39/mo) and highlighting discount savings.
- **Fully Accessible Modals & Stackable Toast Notifications**:
  - "Book a Demo" modal with client-side validation (regex email, required dropdowns, error highlights).
  - Toast notification engine with auto-dismiss progress and icons (Success, Error, Info).

### 3. 📡 Full-Stack REST Backend (`server.js`)
- Zero external package dependencies needed — runs directly via native Node.js `http`, `fs`, `path`, and `url`.
- REST endpoints:
  - `GET  /api/health` — Cluster status, uptime, and engine version.
  - `GET  /api/metrics` — Live telemetry metrics with dynamic variation.
  - `POST /api/leads` — Validates and records lead submissions.
  - `POST /api/newsletter` — Handles developer subscription requests.
  - `POST /api/optimize-prompt` — Simulates AST token compression and latency metrics.
- High-efficiency static asset file server with MIME detection and caching headers.
- Graceful offline fallback: if opened as standalone `index.html` via `file:///`, the frontend continues to operate smoothly using simulated mock data.

---

## 🛠 Project Structure

```
├── public/
│   ├── index.html         # Semantic HTML5 structure (SEO & ARIA accessible)
│   ├── css/
│   │   ├── style.css      # Core tokens, themes (dark/light), typography & ambient lighting
│   │   ├── components.css # Navbar, hero sandbox, cards, sliders, modals & footer
│   │   └── animations.css # Keyframe animations, shimmer, glowing orbs, spinner
│   └── js/
│       ├── app.js         # Master app coordinator (themes, tabs, polling, modals)
│       ├── api.js         # REST API client with error handling & offline fallbacks
│       ├── chart.js       # Pure HTML5 Canvas reactive chart engine
│       ├── playground.js  # ROI calculator & AI Prompt Optimizer
│       └── toast.js       # Stackable notification system
├── server.js              # Native Node.js HTTP server & REST API
├── package.json           # Project metadata & npm scripts
└── README.md              # Project documentation
```

---

## 🚦 How to Run Locally

### Option 1: Native Node.js Server (Recommended)
1. Open terminal in the project directory:
   ```bash
   cd "c:\Users\admin\Desktop\15 oct"
   ```
2. Start the server (zero `npm install` needed!):
   ```bash
   npm start
   ```
   *(or run `node server.js` directly)*
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Option 2: Standalone Browser View
You can also directly open `public/index.html` in any modern web browser (Chrome, Edge, Firefox, Safari). All features, calculators, sliders, charts, and toast notifications will run in client-side fallback mode automatically.
