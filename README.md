# SafeSteps — Frontend

**Community-Powered Accessibility & Road Safety Platform**

SafeSteps is a React-based web application that empowers communities to share, explore, and act on real-world accessibility and road safety reports. Users can pin hazard locations on an interactive map, rate road conditions, browse community-generated reports, and discover safer travel routes — all within a modern, theme-aware interface.

---

## Tech Stack

| Layer         | Technology                                                     |
| ------------- | -------------------------------------------------------------- |
| Framework     | React 19 + Vite 8                                              |
| Routing       | React Router v7                                                |
| Styling       | Vanilla CSS with CSS custom properties (light/dark theme)      |
| Maps          | Google Maps JavaScript API via `@react-google-maps/api`        |
| Auth          | Firebase Authentication (email/password)                       |
| HTTP Client   | Axios                                                          |
| AI Chatbot    | OpenRouter API (LLM-powered safety assistant)                  |
| Backend       | Django REST Framework (`trusthut_backend/`)                    |

---

## Project Structure

```
trusthut_frontend/
├── public/
│   ├── skyline_hero.png        # Dark-mode hero background (night cityscape)
│   ├── sunny_hero.png          # Light-mode hero background (daytime cityscape)
│   ├── favicon.svg             # App favicon
│   └── icons.svg               # Shared SVG sprite sheet
│
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Root component – routing, providers, layout
│   ├── index.css               # Global styles, theme variables, utility classes
│   ├── firebase.js             # Firebase SDK initialization
│   │
│   ├── context/                # React Context providers
│   │   ├── AuthContext.jsx     #   Firebase auth state (user, loading)
│   │   └── ThemeContext.jsx    #   Light/dark theme toggle, persisted to localStorage
│   │
│   ├── services/               # API & external service integrations
│   │   ├── api.js              #   Axios instance + CRUD helpers (posts, likes, etc.)
│   │   ├── auth.js             #   Firebase sign-in, sign-up, logout wrappers
│   │   └── chatbot.js          #   OpenRouter LLM integration for the safety chatbot
│   │
│   ├── components/             # Reusable UI components
│   │   ├── Navbar.jsx          #   App-wide navigation bar with theme toggle
│   │   ├── Hero.jsx            #   Animated hero section (theme-aware background)
│   │   ├── PostCard.jsx        #   Report card with risk badge, votes, comments
│   │   ├── PostGrid.jsx        #   Filtered & searchable report feed
│   │   ├── CreatePost.jsx      #   New report form with map-based location picker
│   │   ├── EditPostModal.jsx   #   Edit modal for existing reports
│   │   ├── MapView.jsx         #   Shared Google Map wrapper with custom markers
│   │   ├── Chatbot.jsx         #   Full-page chatbot interface
│   │   ├── MessageBubble.jsx   #   Styled chat message bubble
│   │   └── chatbot/            #   Chatbot widget sub-components
│   │       ├── ChatbotWidget.jsx   # Floating chatbot toggle button
│   │       ├── ChatWindow.jsx      # Chat window container
│   │       ├── ChatInput.jsx       # Message input bar
│   │       └── MessageBubble.jsx   # Chat bubble (widget variant)
│   │
│   └── pages/                  # Route-level page components
│       ├── Home.jsx            #   Landing page (Hero + PostGrid)
│       ├── Login.jsx           #   Email/password sign-in
│       ├── Register.jsx        #   Account creation
│       ├── Profile.jsx         #   User profile, own posts, liked posts
│       ├── Map.jsx             #   Full-screen accessibility map (search + filter)
│       ├── PostDetail.jsx      #   Single report view with comments & voting
│       ├── HighwaySafety.jsx   #   Highway risk heatmap with route filtering
│       ├── RouteOptimizer.jsx  #   Origin → Destination safest route finder
│       ├── Admin.jsx           #   Admin dashboard (manage all reports)
│       └── Chatbot.jsx         #   Standalone safety chatbot page
│
├── .env                        # Environment variables (see below)
├── package.json
├── vite.config.js
└── index.html
```

---

## Key Features

### 🗺️ Interactive Accessibility Map
Browse community-submitted safety reports pinned on a Google Map. Filter by risk level (Safe / Moderate / Unsafe) and search by city or landmark.

### 📝 Community Reports
Create, edit, and delete accessibility reports with location, category (e.g., footpath, ramp, crossing), risk level, and photos. Each report supports upvotes, downvotes, and threaded comments.

### 🛣️ Highway Safety Overlay
View highway-specific risk data overlaid on a map. Filter by hazard type — accidents, sharp turns, bad road, poor lighting, congestion — with visual risk indicators.

### 🧭 Route Optimizer
Enter an origin and destination to discover the safest route based on community-reported hazards. Compares multiple route options with risk scores.

### 🤖 AI Safety Chatbot
An LLM-powered chatbot provides travel safety tips, answers accessibility questions, and offers location-specific advice. Available as a floating widget on every page.

### 🌗 Light / Dark Theme
- **Default**: Light mode with a sunny daytime hero image
- **Toggle**: Moon/Sun icon in the navbar
- **Dark mode**: Night sky hero image, dark backgrounds, light text
- **Persistence**: Theme choice saved in `localStorage`

### 🔐 Authentication & Authorization
Firebase-based auth with email/password. Protected routes for Profile and Admin. Admin panel allows management of all community reports.

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ── Firebase Authentication ──
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# ── Google Maps ──
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key

# ── Backend API ──
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# ── AI Chatbot (OpenRouter) ──
VITE_OPENROUTER_API_KEY=your_openrouter_api_key

# ── Admin Panel ──
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=your_admin_password
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- Backend server running (`trusthut_backend/`)
- Firebase project configured
- Google Maps API key with Maps JavaScript API enabled

### Installation

```bash
# Navigate to the frontend directory
cd trusthut_frontend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# → Fill in your API keys

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**.

### Production Build

```bash
npm run build    # Output in dist/
npm run preview  # Preview the production build locally
```

---

## Theming Architecture

The app uses a **CSS-variable-based theming system** defined in `src/index.css`:

- **`:root`** — contains light-mode values (default)
- **`[data-theme="dark"]`** — contains dark-mode overrides
- **`ThemeContext.jsx`** — reads/writes the `data-theme` attribute on `<html>` and persists to `localStorage`

All components reference semantic variables like `var(--bg-base)`, `var(--text-primary)`, `var(--border)` rather than hardcoded colors, ensuring consistent theme switching across the entire application.

### Core CSS Variables

| Variable             | Purpose                               |
| -------------------- | ------------------------------------- |
| `--bg-base`          | Page background                       |
| `--bg-card`          | Card / panel backgrounds              |
| `--bg-elevated`      | Elevated surfaces (modals, dropdowns) |
| `--text-primary`     | Primary text color                    |
| `--text-secondary`   | Secondary / muted text                |
| `--text-muted`       | Dimmed text (labels, captions)        |
| `--border`           | Border color for cards and inputs     |
| `--accent`           | Primary brand accent (blue)           |
| `--nav-bg`           | Navbar background                     |
| `--nav-bg-scrolled`  | Navbar background when scrolled       |

---

## Application Routes

| Path                | Component         | Auth Required | Description                          |
| ------------------- | ----------------- | ------------- | ------------------------------------ |
| `/`                 | `Home`            | No            | Hero section + community report feed |
| `/login`            | `Login`           | No            | Sign-in form                         |
| `/register`         | `Register`        | No            | Account creation form                |
| `/profile`          | `Profile`         | Yes           | User's own posts and liked posts     |
| `/map`              | `Map`             | No            | Full-screen accessibility map        |
| `/highway-safety`   | `HighwaySafety`   | No            | Highway risk heatmap                 |
| `/route-optimizer`  | `RouteOptimizer`  | No            | Safest route finder                  |
| `/post/:postId`     | `PostDetail`      | No            | Single report detail + comments      |
| `/admin`            | `Admin`           | Yes           | Admin dashboard to manage reports    |

---

## Backend Integration

The frontend communicates with the Django backend via the Axios instance in `src/services/api.js`. All API requests include the Firebase ID token in the `Authorization` header for authenticated endpoints.

**Base URL**: Configured via `VITE_API_BASE_URL` (defaults to `http://127.0.0.1:8000/api`)

### Key API Endpoints Used

| Method   | Endpoint                     | Description                |
| -------- | ---------------------------- | -------------------------- |
| `GET`    | `/posts/`                    | List all reports           |
| `POST`   | `/posts/create/`             | Create a new report        |
| `PUT`    | `/posts/update/:id/`         | Update a report            |
| `DELETE` | `/posts/delete/:id/`         | Delete a report            |
| `POST`   | `/posts/:id/like/`           | Toggle like on a report    |
| `POST`   | `/posts/:id/dislike/`        | Toggle dislike on a report |
| `GET`    | `/posts/:id/comments/`       | Get comments for a report  |
| `POST`   | `/posts/:id/comments/`       | Add a comment              |
| `GET`    | `/highway-risks/`            | Get highway risk data      |
| `GET`    | `/users/profile/`            | Get user profile           |
| `PUT`    | `/users/profile/update/`     | Update profile             |
