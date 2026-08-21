#include "../../include/database/db_connection.hpp"
#include <iostream>
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>

namespace algovault {

DBConnection& DBConnection::getInstance() {
    static DBConnection instance;
    return instance;
}

DBConnection::~DBConnection() {
    close();
}

bool DBConnection::open(const std::string& dbPath) {
    std::lock_guard<std::mutex> lock(dbMutex_);
    dbPath_ = dbPath;
    
    if (sqlite3_open(dbPath.c_str(), &db_) != SQLITE_OK) {
        std::cerr << "[DBConnection] Failed to open SQLite database: " << sqlite3_errmsg(db_) << std::endl;
        return false;
    }
    
    sqlite3_exec(db_, "PRAGMA journal_mode=WAL;", nullptr, nullptr, nullptr);
    sqlite3_exec(db_, "PRAGMA synchronous=NORMAL;", nullptr, nullptr, nullptr);
    return true;
}

void DBConnection::close() {
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (db_) {
        sqlite3_close(db_);
        db_ = nullptr;
    }
}

sqlite3* DBConnection::getRawDb() {
    return db_;
}

std::mutex& DBConnection::getMutex() {
    return dbMutex_;
}

bool DBConnection::execute(const std::string& sql) {
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) return false;
    
    char* errmsg = nullptr;
    int rc = sqlite3_exec(db_, sql.c_str(), nullptr, nullptr, &errmsg);
    if (rc != SQLITE_OK) {
        std::cerr << "[DBConnection] SQL Error in execute: " << (errmsg ? errmsg : "unknown") << "\nQuery: " << sql << std::endl;
        sqlite3_free(errmsg);
        return false;
    }
    return true;
}

void DBConnection::initSchema() {
    const std::string schemaSql = R"(
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            full_name TEXT,
            email TEXT,
            avatar_url TEXT,
            title TEXT,
            bio TEXT,
            level INTEGER DEFAULT 99,
            streak_days INTEGER DEFAULT 26,
            problems_solved INTEGER DEFAULT 54,
            easy_solved INTEGER DEFAULT 21,
            medium_solved INTEGER DEFAULT 26,
            hard_solved INTEGER DEFAULT 7,
            language_stats TEXT DEFAULT '{}',
            global_rank TEXT DEFAULT 'Top 12%',
            global_rank_num TEXT DEFAULT '#42',
            avg_time TEXT DEFAULT '14m 20s',
            total_time TEXT DEFAULT '142h 32m',
            avg_runtime_percentile INTEGER DEFAULT 88,
            success_rate REAL DEFAULT 94.2,
            code_efficiency INTEGER DEFAULT 92,
            leetcode_username TEXT,
            leetcode_synced_at TEXT,
            api_token TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS problems (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            language TEXT NOT NULL,
            time_complexity TEXT,
            space_complexity TEXT,
            runtime_ms INTEGER,
            solved_at TEXT,
            code TEXT,
            notes TEXT,
            tags TEXT,
            is_favorite INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS activity_heatmap (
            date TEXT PRIMARY KEY,
            count INTEGER DEFAULT 0,
            level INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS settings (
            id TEXT PRIMARY KEY,
            theme TEXT DEFAULT 'cyberpunk',
            font_family TEXT DEFAULT 'JetBrains Mono',
            font_size INTEGER DEFAULT 14,
            vim_mode INTEGER DEFAULT 0,
            leetcode_auto_sync INTEGER DEFAULT 1,
            sync_frequency TEXT DEFAULT 'Every 6 Hours',
            ai_model TEXT DEFAULT 'AlgoVault-Neural-O3',
            complexity_threshold TEXT DEFAULT 'O(N^2)',
            ai_severity TEXT DEFAULT 'Strict',
            sound_effects INTEGER DEFAULT 1,
            telemetry INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS submissions (
            id TEXT PRIMARY KEY,
            problem_id TEXT,
            title TEXT,
            difficulty TEXT,
            language TEXT,
            status TEXT,
            runtime_ms INTEGER,
            memory_mb REAL,
            submitted_at TEXT
        );
    )";
    
    execute(schemaSql);
    execute("ALTER TABLE users ADD COLUMN easy_solved INTEGER DEFAULT 0;");
    execute("ALTER TABLE users ADD COLUMN medium_solved INTEGER DEFAULT 0;");
    execute("ALTER TABLE users ADD COLUMN hard_solved INTEGER DEFAULT 0;");
    execute("ALTER TABLE users ADD COLUMN language_stats TEXT DEFAULT '{}';");
}

void DBConnection::seedDefaultsIfEmpty() {
    std::lock_guard<std::mutex> lock(dbMutex_);
    if (!db_) return;

    // Check if user exists
    sqlite3_stmt* stmt = nullptr;
    sqlite3_prepare_v2(db_, "SELECT COUNT(*) FROM users WHERE id = 'usr_primary';", -1, &stmt, nullptr);
    int userCount = 0;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        userCount = sqlite3_column_int(stmt, 0);
    }
    sqlite3_finalize(stmt);

    if (userCount == 0) {
        // Insert primary user
        const char* userInsert = R"(
            INSERT INTO users (
                id, username, full_name, email, avatar_url, title, bio,
                level, streak_days, problems_solved, global_rank, global_rank_num,
                avg_time, total_time, avg_runtime_percentile, success_rate,
                code_efficiency, leetcode_username, api_token
            ) VALUES (
                'usr_primary', 'CipherByte', 'Alex Vance', 'alex.vance@algovault.io',
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'Senior Systems Architect', 'Passionate about zero-allocation algorithmic systems, distributed consensus, and competitive programming.',
                99, 26, 54, 'Top 12%', '#42',
                '14m 20s', '142h 32m', 88, 94.2,
                92, 'alexvance_dev', 'av_live_99f018a38c204938d01b1990'
            );
        )";
        sqlite3_exec(db_, userInsert, nullptr, nullptr, nullptr);
    }

    // Check settings
    sqlite3_prepare_v2(db_, "SELECT COUNT(*) FROM settings WHERE id = 'config_primary';", -1, &stmt, nullptr);
    int settingsCount = 0;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        settingsCount = sqlite3_column_int(stmt, 0);
    }
    sqlite3_finalize(stmt);

    if (settingsCount == 0) {
        const char* settingsInsert = R"(
            INSERT INTO settings (id, theme, font_family, font_size, vim_mode, leetcode_auto_sync, sync_frequency, ai_model, complexity_threshold, ai_severity, sound_effects, telemetry)
            VALUES ('config_primary', 'cyberpunk', 'JetBrains Mono', 14, 0, 1, 'Every 6 Hours', 'AlgoVault-Neural-O3', 'O(N^2)', 'Strict', 1, 0);
        )";
        sqlite3_exec(db_, settingsInsert, nullptr, nullptr, nullptr);
    }

    // Check problems
    sqlite3_prepare_v2(db_, "SELECT COUNT(*) FROM problems;", -1, &stmt, nullptr);
    int probCount = 0;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        probCount = sqlite3_column_int(stmt, 0);
    }
    sqlite3_finalize(stmt);

    if (probCount == 0) {
        const char* p1 = R"(
            INSERT INTO problems (id, name, difficulty, language, time_complexity, space_complexity, runtime_ms, solved_at, code, notes, tags, is_favorite)
            VALUES (
                'prob-1', 'Two Sum IV - Input is a BST', 'Easy', 'C++', 'O(n)', 'O(h)', 8, '2 hours ago',
                '#include <unordered_set>\n\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n};\n\nclass Solution {\npublic:\n    bool findTarget(TreeNode* root, int k) {\n        std::unordered_set<int> set;\n        return dfs(root, k, set);\n    }\nprivate:\n    bool dfs(TreeNode* node, int k, std::unordered_set<int>& set) {\n        if (!node) return false;\n        if (set.count(k - node->val)) return true;\n        set.insert(node->val);\n        return dfs(node->left, k, set) || dfs(node->right, k, set);\n    }\n};',
                'Inorder traversal + HashSet lookup allows O(N) time with O(H) recursion stack.',
                'Trees, Hash Table, DFS', 1
            );
        )";
        const char* p2 = R"(
            INSERT INTO problems (id, name, difficulty, language, time_complexity, space_complexity, runtime_ms, solved_at, code, notes, tags, is_favorite)
            VALUES (
                'prob-2', 'Longest Substring Without Repeating Characters', 'Medium', 'C++', 'O(n)', 'O(min(m,n))', 4, 'Yesterday',
                '#include <string>\n#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(std::string s) {\n        std::vector<int> charIndex(256, -1);\n        int left = 0, maxLen = 0;\n        for (int right = 0; right < s.length(); ++right) {\n            if (charIndex[s[right]] >= left) {\n                left = charIndex[s[right]] + 1;\n            }\n            charIndex[s[right]] = right;\n            maxLen = std::max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n};',
                'Direct array hash map provides 0 allocation sliding window with 100% runtime efficiency.',
                'Sliding Window, String, Hash Map', 1
            );
        )";
        const char* p3 = R"(
            INSERT INTO problems (id, name, difficulty, language, time_complexity, space_complexity, runtime_ms, solved_at, code, notes, tags, is_favorite)
            VALUES (
                'prob-3', 'Trapping Rain Water', 'Hard', 'C++', 'O(n)', 'O(1)', 0, '3 days ago',
                '#include <vector>\n#include <algorithm>\n\nclass Solution {\npublic:\n    int trap(std::vector<int>& height) {\n        int left = 0, right = height.size() - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (left < right) {\n            if (height[left] < height[right]) {\n                if (height[left] >= leftMax) leftMax = height[left];\n                else water += leftMax - height[left];\n                left++;\n            } else {\n                if (height[right] >= rightMax) rightMax = height[right];\n                else water += rightMax - height[right];\n                right--;\n            }\n        }\n        return water;\n    }\n};',
                'Two-pointer approach avoids auxiliary DP arrays for O(1) auxiliary space.',
                'Two Pointers, Dynamic Programming, Stack', 1
            );
        )";
        const char* p4 = R"(
            INSERT INTO problems (id, name, difficulty, language, time_complexity, space_complexity, runtime_ms, solved_at, code, notes, tags, is_favorite)
            VALUES (
                'prob-4', 'Course Schedule II', 'Medium', 'Python', 'O(V + E)', 'O(V + E)', 28, '5 days ago',
                'from collections import deque, defaultdict\n\nclass Solution:\n    def findOrder(self, numCourses: int, prerequisites: list[list[int]]) -> list[int]:\n        adj = defaultdict(list)\n        in_degree = [0] * numCourses\n        for dest, src in prerequisites:\n            adj[src].append(dest)\n            in_degree[dest] += 1\n            \n        q = deque([i for i in range(numCourses) if in_degree[i] == 0])\n        order = []\n        while q:\n            node = q.popleft()\n            order.append(node)\n            for neighbor in adj[node]:\n                in_degree[neighbor] -= 1\n                if in_degree[neighbor] == 0:\n                    q.append(neighbor)\n                    \n        return order if len(order) == numCourses else []',
                'Kahn algorithm for topological sorting via indegree queue.',
                'Graph, Topological Sort, BFS', 0
            );
        )";
        sqlite3_exec(db_, p1, nullptr, nullptr, nullptr);
        sqlite3_exec(db_, p2, nullptr, nullptr, nullptr);
        sqlite3_exec(db_, p3, nullptr, nullptr, nullptr);
        sqlite3_exec(db_, p4, nullptr, nullptr, nullptr);
    }

    // Check heatmap
    sqlite3_prepare_v2(db_, "SELECT COUNT(*) FROM activity_heatmap;", -1, &stmt, nullptr);
    int heatCount = 0;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        heatCount = sqlite3_column_int(stmt, 0);
    }
    sqlite3_finalize(stmt);

    if (heatCount == 0) {
        // Generate last 365 days of activity
        auto now = std::chrono::system_clock::now();
        time_t now_c = std::chrono::system_clock::to_time_t(now);
        
        sqlite3_stmt* heatStmt = nullptr;
        sqlite3_prepare_v2(db_, "INSERT OR REPLACE INTO activity_heatmap (date, count, level) VALUES (?, ?, ?);", -1, &heatStmt, nullptr);
        
        for (int i = 364; i >= 0; --i) {
            time_t day_c = now_c - (i * 86400);
            struct tm tm_day;
            gmtime_r(&day_c, &tm_day);
            char dateBuf[32];
            strftime(dateBuf, sizeof(dateBuf), "%Y-%m-%d", &tm_day);

            int count = 0;
            int level = 0;
            // Generate realistic streak pattern
            if (i < 30) {
                count = (i % 7 == 0) ? 0 : ((i * 3 + 1) % 6) + 1;
                level = (count == 0) ? 0 : (count > 4 ? 4 : (count > 2 ? 3 : (count > 1 ? 2 : 1)));
            } else if (i % 3 != 0) {
                count = ((i * 7) % 5);
                level = (count == 0) ? 0 : (count > 3 ? 3 : (count > 1 ? 2 : 1));
            }

            sqlite3_bind_text(heatStmt, 1, dateBuf, -1, SQLITE_TRANSIENT);
            sqlite3_bind_int(heatStmt, 2, count);
            sqlite3_bind_int(heatStmt, 3, level);
            sqlite3_step(heatStmt);
            sqlite3_reset(heatStmt);
        }
        sqlite3_finalize(heatStmt);
    }

    // Check submissions
    sqlite3_prepare_v2(db_, "SELECT COUNT(*) FROM submissions;", -1, &stmt, nullptr);
    int subCount = 0;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        subCount = sqlite3_column_int(stmt, 0);
    }
    sqlite3_finalize(stmt);

    if (subCount == 0) {
        const char* s1 = "INSERT INTO submissions (id, problem_id, title, difficulty, language, status, runtime_ms, memory_mb, submitted_at) VALUES ('sub-1', 'prob-1', 'Two Sum IV - Input is a BST', 'Easy', 'C++', 'Accepted', 8, 14.2, '10 mins ago');";
        const char* s2 = "INSERT INTO submissions (id, problem_id, title, difficulty, language, status, runtime_ms, memory_mb, submitted_at) VALUES ('sub-2', 'prob-2', 'Longest Substring Without Repeating Characters', 'Medium', 'C++', 'Accepted', 4, 11.5, '2 hours ago');";
        const char* s3 = "INSERT INTO submissions (id, problem_id, title, difficulty, language, status, runtime_ms, memory_mb, submitted_at) VALUES ('sub-3', 'prob-3', 'Trapping Rain Water', 'Hard', 'C++', 'Accepted', 0, 16.8, 'Yesterday');";
        sqlite3_exec(db_, s1, nullptr, nullptr, nullptr);
        sqlite3_exec(db_, s2, nullptr, nullptr, nullptr);
        sqlite3_exec(db_, s3, nullptr, nullptr, nullptr);
    }
}

void DBConnection::resetToDefaults() {
    execute(R"(
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS problems;
        DROP TABLE IF EXISTS activity_heatmap;
        DROP TABLE IF EXISTS settings;
        DROP TABLE IF EXISTS submissions;
    )");
    initSchema();
    seedDefaultsIfEmpty();
}

} // namespace algovault
