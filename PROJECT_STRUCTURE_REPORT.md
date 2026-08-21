# Algo-Vault: Detailed Project Structure & File Guide

This document provides a simple, easy-to-understand breakdown of every single file and folder in the **Algo-Vault** codebase, explaining what each file does, why it exists, and how they all work together.

---

## 📁 Project Overview & Architecture

Algo-Vault is a full-stack developer web application. It connects a **React + Vite** frontend with an **Express + SQLite** backend, and interfaces with **LeetCode's public GraphQL API** to synchronize live problem-solving data.

```
algovault/
├── package.json              # Project dependencies and startup scripts
├── vite.config.js            # Frontend build and proxy settings
├── tailwind.config.js        # Styling and color theme definitions
├── postcss.config.js         # CSS processing plugins
├── index.html                # Main HTML entry point
├── algovault.db              # Local SQLite database file
│
├── server/                   # 🖥️ BACKEND (Node.js + Express + SQLite)
│   ├── db.js                 # Database setup and schema creation
│   ├── leetcode.js           # LeetCode API sync engine & streak calculator
│   └── index.js              # REST API server & endpoints
│
└── src/                      # 🎨 FRONTEND (React + Tailwind CSS)
    ├── main.jsx              # React mounting root
    ├── App.jsx               # Master layout and screen router
    ├── index.css             # Global styling, glow effects & animations
    │
    ├── context/
    │   └── AppContext.jsx    # Global state management & API actions
    │
    ├── components/           # 🧩 REUSABLE UI COMPONENTS
    │   ├── Sidebar.jsx       # Left navigation sidebar with tabs
    │   ├── TopHeader.jsx     # Top bar with search and quick actions
    │   ├── NewSnippetModal.jsx # Popup modal to add a new problem to SQLite
    │   ├── LeetCodeModal.jsx # Popup modal to sync with a LeetCode username
    │   └── Toast.jsx         # Floating notification popups
    │
    └── screens/              # 📺 THE 7 MAIN SCREENS
        ├── DashboardScreen.jsx  # Main overview: stats, heatmap, AI alert, weekly goal
        ├── VaultScreen.jsx      # Problem repository with filters and code viewer
        ├── StatisticsScreen.jsx # Speed chart, language donut chart, difficulty bars
        ├── AiInsightsScreen.jsx # Code analysis, O(N^2) detector & sliding window fix
        ├── SignInScreen.jsx     # Retro CRT terminal authentication window
        ├── ProfileScreen.jsx    # Developer bio, badges, rank & profile editor
        └── SettingsScreen.jsx   # Configuration, API token generator & DB export
```

---

## 🛠️ Root Configuration Files

### 1. [`package.json`](file:///home/alpha/algovault/package.json)
- **What it does:** Lists all the software libraries (packages) required to run the application, such as React, Express, Vite, Tailwind CSS, and SQLite.
- **Key scripts:**
  - `npm run dev`: Starts both the backend API server and the frontend client simultaneously.
  - `npm run server`: Starts only the Express backend on port `3001`.
  - `npm run client`: Starts only the Vite frontend on port `5173`.
  - `npm run build`: Compiles the React code for production.

### 2. [`vite.config.js`](file:///home/alpha/algovault/vite.config.js)
- **What it does:** Configures Vite (the fast frontend development and build tool).
- **Special role:** It sets up an API proxy so that any frontend request sent to `/api/...` is automatically forwarded to the backend server running on port `3001`.

### 3. [`tailwind.config.js`](file:///home/alpha/algovault/tailwind.config.js)
- **What it does:** Defines the entire design system and color palette matching the Stitch design specifications:
  - Deep dark background colors (`#000000`, `#121212`, `#0e150f`).
  - Luminous neon green accent (`#4ADE80` / `#6BFB9A`) for buttons and progress.
  - Electric purple accent (`#A855F7`) for AI insights.
  - Typography settings for `Inter` (UI text) and `JetBrains Mono` (code and numbers).

### 4. [`postcss.config.js`](file:///home/alpha/algovault/postcss.config.js)
- **What it does:** Tells the CSS compiler to use Tailwind CSS and Autoprefixer to generate optimized browser styles.

### 5. [`index.html`](file:///home/alpha/algovault/index.html)
- **What it does:** The single HTML page loaded by the browser. It imports Google Fonts (`Inter` and `JetBrains Mono`) and Google Material Symbols (icons), and mounts the React application into the `<div id="root"></div>`.

### 6. [`algovault.db`](file:///home/alpha/algovault/algovault.db)
- **What it does:** The local SQLite database file that stores all your problems, user profile data, 365-day submission heatmap history, and application settings on your disk.

---

## 🖥️ Backend Server Files (`/server`)

### 1. [`server/db.js`](file:///home/alpha/algovault/server/db.js)
- **What it does:** Sets up and manages the SQLite database using `sql.js`.
- **Key functions:**
  - Creates the required database tables: `users`, `problems`, `activity_heatmap`, `settings`, and `submissions`.
  - Automatically loads and saves changes to the disk file `algovault.db`.
  - Seeds the database with default problems and statistics if it's empty so the app is instantly usable out-of-the-box.

### 2. [`server/leetcode.js`](file:///home/alpha/algovault/server/leetcode.js)
- **What it does:** The bridge between Algo-Vault and LeetCode.
- **Key functions:**
  - **`fetchLeetCodeProfile(username)`**: Queries LeetCode's public GraphQL API for real user data: total problems solved, difficulty counts, ranking, contest rating, and recent accepted submissions.
  - **`parseCalendarAndCalculateStreak()`**: Reads the LeetCode `submissionCalendar` timestamps and accurately calculates the continuous active streak (number of days) and the 365-day heatmap intensity levels.
  - **`fetchQuestionMeta(titleSlug)`**: Retrieves problem difficulty, algorithm tags (e.g., Dynamic Programming, Two Pointers), and starter code templates for problems synced into The Vault.

### 3. [`server/index.js`](file:///home/alpha/algovault/server/index.js)
- **What it does:** The Express REST API server running on port `3001`.
- **Key endpoints:**
  - `GET /api/user` & `PUT /api/user`: Get or update the active developer profile.
  - `POST /api/auth/leetcode`: Syncs a LeetCode username and saves all the streak, heatmap, problems, and stats into SQLite.
  - `POST /api/auth/login`: Handles manual terminal ID login.
  - `GET /api/problems` & `POST /api/problems` & `DELETE /api/problems/:id`: Manage problems in The Vault.
  - `GET /api/stats`: Returns aggregated stats, language breakdown, and heatmap data.
  - `GET /api/ai/insights`: Returns AI analysis on code complexity and problem recommendations.
  - `GET /api/settings` & `PUT /api/settings`: Read and write user preferences.
  - `GET /api/db/export` & `POST /api/db/reset`: Backup database to JSON or reset to default seeds.

---

## 🎨 Frontend Core Files (`/src`)

### 1. [`src/main.jsx`](file:///home/alpha/algovault/src/main.jsx)
- **What it does:** The entry point for the React application. It wraps the app with `AppProvider` and mounts it into the browser DOM.

### 2. [`src/App.jsx`](file:///home/alpha/algovault/src/App.jsx)
- **What it does:** The master screen router and layout frame.
- **Key functions:**
  - If the user is on the `signin` screen, it renders the full-screen CRT terminal window.
  - For all other screens, it renders the fixed `Sidebar` on the left, the `TopHeader` on the top, and displays the currently selected screen (`Dashboard`, `The Vault`, `Statistics`, `AI Insights`, `Profile`, or `Settings`).
  - Renders global popup modals (`NewSnippetModal`, `LeetCodeModal`, and `Toast` notifications).

### 3. [`src/index.css`](file:///home/alpha/algovault/src/index.css)
- **What it does:** The global stylesheet containing all custom CSS classes and animations:
  - Custom scrollbar styling.
  - Glowing box shadows (`neon-glow-primary`, `neon-glow-secondary`).
  - CRT scanline effect for the sign-in terminal.
  - Animated purple scan beam for the AI Intelligence Core.
  - Heatmap square color levels (`level-0` to `level-4`).

---

## 🌐 Context & State Management (`/src/context`)

### 1. [`src/context/AppContext.jsx`](file:///home/alpha/algovault/src/context/AppContext.jsx)
- **What it does:** The central brain of the frontend. It holds the shared application state so all screens stay in sync.
- **What it manages:**
  - `currentScreen`: Which screen is currently visible.
  - `user`: The currently active user profile and LeetCode details.
  - `problems`: The list of problems loaded from the SQLite database.
  - `stats`: The heatmap matrix, language distribution, and difficulty breakdown.
  - `searchTerm`, `selectedDifficulty`, `selectedLanguage`, `sortBy`: Active search and filtering criteria.
  - Helper functions: `addProblem()`, `deleteProblem()`, `syncLeetCode()`, `loginManual()`, `updateUserProfile()`, `updateUserSettings()`, and `addToast()`.

---

## 🧩 Shared UI Components (`/src/components`)

### 1. [`src/components/Sidebar.jsx`](file:///home/alpha/algovault/src/components/Sidebar.jsx)
- **What it does:** The left-hand navigation bar.
- **Features:**
  - Terminal logo and version badge.
  - Glowing **"NEW SNIPPET"** button that opens the problem creation modal.
  - Navigation tabs with active glowing green indicator pills (Dashboard, The Vault, Statistics, AI Insights).
  - Bottom navigation links for Profile, Settings, and Auth / Sign In.
  - Bottom user summary card showing the active avatar, username, and title.

### 2. [`src/components/TopHeader.jsx`](file:///home/alpha/algovault/src/components/TopHeader.jsx)
- **What it does:** The top bar across the main content area.
- **Features:**
  - Dynamic page title and terminal path (e.g. `~/vault/dashboard`, `~/vault/analytics`).
  - Global search input connected to problem filtering.
  - Quick **"LC SYNC"** button to open the LeetCode sync modal.
  - Pulsing notification bell and terminal status button.
  - User avatar that navigates to the Profile screen when clicked.

### 3. [`src/components/NewSnippetModal.jsx`](file:///home/alpha/algovault/src/components/NewSnippetModal.jsx)
- **What it does:** A popup dialog allowing you to add a new algorithm solution directly to SQLite.
- **Inputs:** Problem Name, Difficulty (Easy/Medium/Hard), Language, Time Complexity, Space Complexity, Runtime, Tags, Source Code, and Notes.

### 4. [`src/components/LeetCodeModal.jsx`](file:///home/alpha/algovault/src/components/LeetCodeModal.jsx)
- **What it does:** A popup dialog for LeetCode synchronization.
- **Features:**
  - Text input to type any LeetCode username.
  - Quick preset buttons (e.g. `@lee215`, `@neal_wu`, `@vault_architect`).
  - **"SYNC LEETCODE"** button that triggers the live API fetch and updates all heatmaps, streaks, and vault problems in SQLite.

### 5. [`src/components/Toast.jsx`](file:///home/alpha/algovault/src/components/Toast.jsx)
- **What it does:** Displays temporary floating notification alerts in the bottom-right corner (e.g., "LeetCode synchronized successfully", "Problem stored in Vault").

---

## 📺 The 7 Main Screens (`/src/screens`)

### 1. [`src/screens/DashboardScreen.jsx`](file:///home/alpha/algovault/src/screens/DashboardScreen.jsx)
- **What it does:** The main mission-control dashboard.
- **Key components:**
  - **4 Top KPI Cards:** Current Streak, Problems Solved, Global Rank, and Avg Time.
  - **Activity Heatmap:** 52-week (365-day) interactive matrix generated from LeetCode calendar data with hover tooltips showing daily solution counts.
  - **The Vault Table:** Preview of the latest problems in the database with difficulty badges and action buttons.
  - **AI Heuristics Card:** Quick alert for detected code optimizations with a direct shortcut to the AI Core.
  - **Weekly Goal Widget:** Progress bar showing weekly problem-solving completion percentage.

### 2. [`src/screens/VaultScreen.jsx`](file:///home/alpha/algovault/src/screens/VaultScreen.jsx)
- **What it does:** The central algorithm problem repository.
- **Key components:**
  - Header showing total stored problems count.
  - Search bar, Difficulty filter dropdown, Language filter dropdown, and Sort selector (Newest, Oldest, Most Efficient, Difficulty).
  - Problem cards displaying time/space complexity, runtime in milliseconds, and date solved.
  - Expandable source code viewer with one-click **"COPY CODE"** and **"DELETE"** actions.

### 3. [`src/screens/StatisticsScreen.jsx`](file:///home/alpha/algovault/src/screens/StatisticsScreen.jsx)
- **What it does:** Detailed performance analytics and breakdowns.
- **Key components:**
  - **Performance Trend [Speed]:** Interactive SVG line graph showing runtime percentile progress with `1W`, `1M`, and `3M` view filters.
  - **Language Distribution Donut Chart:** Visual breakdown of solved problems by language (Python, Java, C++, Rust, JavaScript) synced from LeetCode.
  - **Difficulty Mastery:** Progress bars for Easy, Medium, and Hard solved counts and percentages.
  - **Recent Submission Log:** Table of recently accepted LeetCode submissions with runtime latency and timestamps.

### 4. [`src/screens/AiInsightsScreen.jsx`](file:///home/alpha/algovault/src/screens/AiInsightsScreen.jsx)
- **What it does:** The AI optimization terminal ("Intelligence Core").
- **Key components:**
  - Glowing purple header with an animated horizontal scanning beam and engine status indicators.
  - **Deep Dive Analysis:** Inspects a code snippet, highlights redundant $O(N^2)$ loops with red annotations, and provides an **"APPLY FIX"** button that dynamically reveals the linearized $O(N)$ sliding window solution.
  - **Complexity Delta Panel:** Side-by-side comparison of Time Complexity, Space Trade-offs, and empirical speedups.
  - **Heuristic Query Engine:** Interactive prompt allowing users to enter custom algorithm queries for instant AI suggestions.
  - **Recommended Next Problems:** Tailored practice recommendations based on algorithm pattern reinforcement.

### 5. [`src/screens/SignInScreen.jsx`](file:///home/alpha/algovault/src/screens/SignInScreen.jsx)
- **What it does:** Retro CRT terminal authentication interface.
- **Key components:**
  - Background grid with animated CRT scanline effect.
  - Terminal window header with macOS-style red, yellow, and green status dots.
  - **"AUTHENTICATE VIA LEETCODE"** primary action button.
  - **Manual Override Form:** Terminal ID (operator handle) and Access Key inputs with an **"EXECUTE LOGIN"** button.
  - Live pulsing green connection LED with latency indicator.

### 6. [`src/screens/ProfileScreen.jsx`](file:///home/alpha/algovault/src/screens/ProfileScreen.jsx)
- **What it does:** The developer identity and achievements page.
- **Key components:**
  - Cyberpunk portrait avatar with neon glow and **"Lvl 99"** badge.
  - Operator handle with verified checkmark, specialist subtitle, and terminal bio quote.
  - Language skill chips (Python, Rust, Go, C++).
  - Quick metric cards for Problems Solved, Global Rank, and synced LeetCode handle.
  - **Acquired Badges & Honors Showcase:** Cards for *O(1) Purist*, *Sliding Master*, *Streak Legend*, and *Heap Champion*.
  - **Edit Profile:** In-place editor allowing users to modify handle, full name, title, and bio, instantly saving them to SQLite.

### 7. [`src/screens/SettingsScreen.jsx`](file:///home/alpha/algovault/src/screens/SettingsScreen.jsx)
- **What it does:** Configuration control room.
- **Key components:**
  - **Account Profile:** Handle, primary email, and API Access Token with a **"Regenerate"** button.
  - **LeetCode Integration:** Auto-sync toggle and sync frequency selector.
  - **Terminal Preferences:** Font family picker (JetBrains Mono, Fira Code), font size selector, and Vim keybindings toggle.
  - **AI Heuristic Controls:** Complexity alert threshold selector and AI model architecture choice.
  - **SQLite Database Management:** Buttons to export all database records to a downloadable JSON file or reset the database back to factory seeds.

---

## 🔄 Summary of Data Flow

1. When you sync a LeetCode username:
   - `server/leetcode.js` fetches the user's data from LeetCode GraphQL.
   - `server/index.js` writes the updated streak, solved counts, 365-day calendar, and accepted problems into `algovault.db` (SQLite).
   - `src/context/AppContext.jsx` receives the updated data and distributes it to all screens.
   - The **Dashboard**, **The Vault**, **Statistics**, and **Profile** screens update immediately.
