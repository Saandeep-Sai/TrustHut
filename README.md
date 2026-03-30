# TrustHut Frontend

> React + Vite SPA for the TrustHut accessibility reporting platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Auth | Firebase Auth (Email/Password) |
| Maps | Google Maps JavaScript API (`@react-google-maps/api`) |
| HTTP | Axios |
| Deployment | Vercel |

---

## Project Structure

```
trusthut_frontend/
├── public/
├── src/
│   ├── pages/
│   │   ├── Login.jsx        # Login form + Forgot Password OTP modal
│   │   ├── Register.jsx     # Registration + password strength checker
│   │   ├── Home.jsx         # Feed (PostGrid)
│   │   ├── Map.jsx          # Interactive map + location search + side panel
│   │   ├── PostDetail.jsx   # Individual report view
│   │   ├── Profile.jsx      # User profile + post management
│   │   ├── Admin.jsx        # Admin dashboard (login-gated)
│   │   └── Chatbot.jsx      # AI assistant page
│   ├── components/
│   │   ├── Navbar.jsx        # Top navigation bar
│   │   ├── Hero.jsx          # Landing hero section
│   │   ├── PostCard.jsx      # Report card with like, edit, delete
│   │   ├── PostGrid.jsx      # Responsive grid of PostCards
│   │   ├── CreatePost.jsx    # Create report modal (map, media capture)
│   │   ├── EditPostModal.jsx # Edit report modal
│   │   ├── MapView.jsx       # Google Map with Data layer boundaries
│   │   ├── Chatbot.jsx       # Floating chatbot button
│   │   └── chatbot/          # ChatWindow, ChatInput, MessageBubble
│   ├── context/
│   │   └── AuthContext.jsx   # Firebase auth state provider
│   ├── services/
│   │   ├── api.js            # Axios instance + all API calls
│   │   ├── auth.js           # Firebase signup/login/logout
│   │   └── chatbot.js        # Chatbot service logic
│   ├── firebase.js           # Firebase app initialization
│   ├── App.jsx               # Routes + layout
│   └── index.css             # Global styles + design tokens
├── vercel.json               # SPA rewrite rule
├── .env                      # Environment variables
└── vite.config.js
```

---

## Pages & Routes

| Route | Page | Auth | Description |
|---|---|---|---|
| `/` | Home | ❌ | Report feed with search |
| `/login` | Login | ❌ | Sign in + Forgot Password |
| `/register` | Register | ❌ | Sign up + password strength |
| `/profile` | Profile | ✅ | User info + own posts |
| `/map` | Map | ❌ | Interactive accessibility map |
| `/post/:id` | PostDetail | ❌ | Full report view |
| `/admin` | Admin | ✅ | Admin dashboard (credential-gated) |

---

## Key Features

### Password Strength Checker (Register)
- 5 criteria: length ≥8, uppercase, lowercase, number, special character
- Visual 5-segment bar colored by strength (Very Weak → Very Strong)
- Rejects registration if score < 3 (Fair)

### Forgot Password (Login)
- Step 1: Enter email → backend sends 6-digit OTP via SMTP
- Step 2: Enter OTP + new password → backend verifies and resets in Firebase Auth

### Create Post with Camera Capture
- Drag & drop or file picker upload
- **Take Photo** button — opens device rear camera (mobile)
- **Record Video** button — opens native camera recorder (mobile)
- Images auto-compressed to 800px / 70% quality
- Videos validated < 750 KB

### Map Page
- Nominatim-powered location search with 3-step India-first fallback
- `fitBounds` auto-pan/zoom to searched location
- Native Google Maps Data layer for administrative boundary rendering (dashed red outline)
- Single boundary at a time — previous cleared before new drawn
- Side panel shows all reports within selected area

### Admin Dashboard
- Login-gated with `VITE_ADMIN_USERNAME` / `VITE_ADMIN_PASSWORD` env vars
- Session persisted via `sessionStorage`
- View all posts, all users; delete posts

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_GOOGLE_MAPS_KEY` | Google Maps JavaScript API key |
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_ADMIN_USERNAME` | Admin panel username |
| `VITE_ADMIN_PASSWORD` | Admin panel password |

---

## Local Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env    # fill in your Firebase + API keys

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Deployment (Vercel)

- Auto-deploys on push to `main`
- `vercel.json` rewrites all routes to `index.html` (SPA support)
- Set all `VITE_*` env vars in Vercel dashboard
