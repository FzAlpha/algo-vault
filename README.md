# AlgoVault ⚡

High-Performance Algorithmic Engineering Platform & Developer Terminal.

AlgoVault provides an ultra-fast C++ backend combined with a responsive, modern HTML/CSS/JavaScript frontend to manage your algorithmic problem vault, track stats & submission heatmaps, sync with LeetCode, and analyze code heuristics.

---

## 🏗️ Architecture

```
algovault/
├── backend/                  # High-Performance C++17 Backend Engine
│   ├── include/              # Modular C++ header definitions
│   │   ├── auth/             # Authentication & session token management
│   │   ├── database/         # SQLite RAII repositories (User, Problem, Settings)
│   │   ├── models/           # Problem, User, Submission, Heatmap & Settings data models
│   │   ├── server/           # C++ HTTP REST API & static file server
│   │   └── services/         # LeetCode GraphQL sync & AI heuristic insights engine
│   ├── src/                  # C++ implementation files
│   └── third_party/          # Single-header dependencies (cpp-httplib, nlohmann/json)
│
├── frontend/                 # Clean, Modern HTML5 / CSS3 / Vanilla JS Client
│   ├── css/                  # Modular styles (variables, base, animations, components, screens)
│   ├── js/                   # Modular ES6 JavaScript (API client, state store, UI components, screens)
│   └── index.html            # Primary web application interface
│
├── algovault.db              # SQLite3 local storage database
├── CMakeLists.txt            # CMake build configuration
└── Makefile                  # Fast Make automation (build, run, clean)
```

---

## 🚀 Quick Start

### Prerequisites
- **C++17** compiler (`g++` >= 9 or `clang++`)
- **Make** or **CMake** (>= 3.16)
- **Libraries**: `libsqlite3-dev`, `libssl-dev`, `libcurl4-openssl-dev`, `pthread`

On Ubuntu/Debian:
```bash
sudo apt-get update && sudo apt-get install -y build-essential libsqlite3-dev libssl-dev libcurl4-openssl-dev
```

### Build & Run

1. **Build with Make:**
   ```bash
   make
   ```

2. **Run the Application:**
   ```bash
   make run
   ```
   Or run the binary directly:
   ```bash
   ./build/algovault_server --port 3001 --db ./algovault.db --static ./frontend
   ```

3. **Access the Web Interface:**
   Open your browser at [http://localhost:3001](http://localhost:3001)

---

## 🛠️ REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server uptime, runtime, and health status |
| `GET` | `/api/user` | Current user profile, rank, and stats |
| `PUT` | `/api/user` | Update user profile information |
| `GET` | `/api/problems` | List all problem solutions with query filters |
| `POST` | `/api/problems` | Add a new problem code snippet |
| `PUT` | `/api/problems/:id` | Update an existing problem |
| `DELETE` | `/api/problems/:id` | Delete a problem snippet |
| `GET` | `/api/stats` | Activity heatmap, language breakdown, solve speed stats |
| `POST` | `/api/leetcode/sync` | Sync problem solving stats and heatmap with LeetCode |
| `POST` | `/api/ai/analyze` | Run heuristic analysis on code (time/space complexity) |
| `GET` | `/api/settings` | Retrieve user preferences and configuration |
| `PUT` | `/api/settings` | Update settings and editor preferences |
| `GET` | `/api/db/export` | Download a complete JSON database backup |
| `POST` | `/api/db/reset` | Reset database to initial factory state |