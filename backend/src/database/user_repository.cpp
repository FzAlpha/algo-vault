#include "../../include/database/user_repository.hpp"
#include "../../include/database/db_connection.hpp"
#include <iostream>

namespace algovault {

std::optional<User> UserRepository::getPrimaryUser() {
    std::optional<User> user = std::nullopt;
    {
        auto& dbConn = DBConnection::getInstance();
        std::lock_guard<std::mutex> lock(dbConn.getMutex());
        sqlite3* db = dbConn.getRawDb();
        if (!db) return std::nullopt;

        sqlite3_stmt* stmt = nullptr;
        const char* sql = "SELECT id, username, full_name, email, avatar_url, title, bio, level, streak_days, problems_solved, easy_solved, medium_solved, hard_solved, language_stats, global_rank, global_rank_num, avg_time, total_time, avg_runtime_percentile, success_rate, code_efficiency, leetcode_username, leetcode_synced_at, api_token, created_at FROM users WHERE id = 'usr_primary';";
        
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) {
            return std::nullopt;
        }

        if (sqlite3_step(stmt) == SQLITE_ROW) {
            User u;
            auto getText = [&](int col) -> std::string {
                const unsigned char* txt = sqlite3_column_text(stmt, col);
                return txt ? reinterpret_cast<const char*>(txt) : "";
            };

            u.id = getText(0);
            u.username = getText(1);
            u.full_name = getText(2);
            u.email = getText(3);
            u.avatar_url = getText(4);
            u.title = getText(5);
            u.bio = getText(6);
            u.level = sqlite3_column_int(stmt, 7);
            u.streak_days = sqlite3_column_int(stmt, 8);
            u.problems_solved = sqlite3_column_int(stmt, 9);
            u.easy_solved = sqlite3_column_int(stmt, 10);
            u.medium_solved = sqlite3_column_int(stmt, 11);
            u.hard_solved = sqlite3_column_int(stmt, 12);
            u.language_stats = getText(13);
            u.global_rank = getText(14);
            u.global_rank_num = getText(15);
            u.avg_time = getText(16);
            u.total_time = getText(17);
            u.avg_runtime_percentile = sqlite3_column_int(stmt, 18);
            u.success_rate = sqlite3_column_double(stmt, 19);
            u.code_efficiency = sqlite3_column_int(stmt, 20);
            u.leetcode_username = getText(21);
            u.leetcode_synced_at = getText(22);
            u.api_token = getText(23);
            u.created_at = getText(24);
            user = u;
        }
        sqlite3_finalize(stmt);
    }

    if (user) {
        int computedStreak = calculateCurrentStreak();
        user->streak_days = computedStreak;
    }
    return user;
}

int UserRepository::calculateCurrentStreak() {
    auto heatmap = getActivityHeatmap();
    if (heatmap.empty()) return 0;

    std::map<std::string, int> dayCounts;
    for (const auto& h : heatmap) {
        dayCounts[h.date] = h.count;
    }

    auto now = std::chrono::system_clock::now();
    time_t now_c = std::chrono::system_clock::to_time_t(now);

    char todayBuf[32];
    struct tm tm_now;
    gmtime_r(&now_c, &tm_now);
    strftime(todayBuf, sizeof(todayBuf), "%Y-%m-%d", &tm_now);
    std::string todayKey(todayBuf);

    int todayCount = dayCounts.count(todayKey) ? dayCounts[todayKey] : 0;
    int startOffset = 0;

    if (todayCount > 0) {
        startOffset = 0;
    } else {
        time_t yesterday_c = now_c - 86400;
        char yBuf[32];
        struct tm tm_yesterday;
        gmtime_r(&yesterday_c, &tm_yesterday);
        strftime(yBuf, sizeof(yBuf), "%Y-%m-%d", &tm_yesterday);
        std::string yKey(yBuf);

        int yesterdayCount = dayCounts.count(yKey) ? dayCounts[yKey] : 0;
        if (yesterdayCount > 0) {
            startOffset = 1;
        } else {
            return 0;
        }
    }

    int streak = 0;
    for (int offset = startOffset; offset < 365; ++offset) {
        time_t day_c = now_c - (offset * 86400);
        struct tm tm_d;
        gmtime_r(&day_c, &tm_d);
        char dateBuf[32];
        strftime(dateBuf, sizeof(dateBuf), "%Y-%m-%d", &tm_d);
        std::string dKey(dateBuf);

        if (dayCounts.count(dKey) && dayCounts[dKey] > 0) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

bool UserRepository::updateUser(const User& u) {
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return false;

    const char* sql = R"(
        UPDATE users 
        SET username = ?, full_name = ?, email = ?, avatar_url = ?, title = ?, bio = ?,
            level = ?, streak_days = ?, problems_solved = ?,
            easy_solved = ?, medium_solved = ?, hard_solved = ?, language_stats = ?,
            global_rank = ?, global_rank_num = ?,
            avg_time = ?, total_time = ?, avg_runtime_percentile = ?, success_rate = ?,
            code_efficiency = ?, leetcode_username = ?, leetcode_synced_at = ?, api_token = ?
        WHERE id = 'usr_primary';
    )";

    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_text(stmt, 1, u.username.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, u.full_name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, u.email.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, u.avatar_url.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 5, u.title.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 6, u.bio.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 7, u.level);
    sqlite3_bind_int(stmt, 8, u.streak_days);
    sqlite3_bind_int(stmt, 9, u.problems_solved);
    sqlite3_bind_int(stmt, 10, u.easy_solved);
    sqlite3_bind_int(stmt, 11, u.medium_solved);
    sqlite3_bind_int(stmt, 12, u.hard_solved);
    sqlite3_bind_text(stmt, 13, u.language_stats.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 14, u.global_rank.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 15, u.global_rank_num.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 16, u.avg_time.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 17, u.total_time.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 18, u.avg_runtime_percentile);
    sqlite3_bind_double(stmt, 19, u.success_rate);
    sqlite3_bind_int(stmt, 20, u.code_efficiency);
    sqlite3_bind_text(stmt, 21, u.leetcode_username.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 22, u.leetcode_synced_at.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 23, u.api_token.c_str(), -1, SQLITE_TRANSIENT);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE;
}

bool UserRepository::updateUsername(const std::string& username) {
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return false;

    sqlite3_stmt* stmt = nullptr;
    const char* sql = "UPDATE users SET username = ? WHERE id = 'usr_primary';";
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE;
}

bool UserRepository::incrementProblemsSolved() {
    auto& dbConn = DBConnection::getInstance();
    return dbConn.execute("UPDATE users SET problems_solved = problems_solved + 1 WHERE id = 'usr_primary';");
}

bool UserRepository::decrementProblemsSolved() {
    auto& dbConn = DBConnection::getInstance();
    return dbConn.execute("UPDATE users SET problems_solved = MAX(0, problems_solved - 1) WHERE id = 'usr_primary';");
}

std::vector<HeatmapEntry> UserRepository::getActivityHeatmap() {
    std::vector<HeatmapEntry> entries;
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return entries;

    sqlite3_stmt* stmt = nullptr;
    const char* sql = "SELECT date, count, level FROM activity_heatmap ORDER BY date ASC;";
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return entries;

    while (sqlite3_step(stmt) == SQLITE_ROW) {
        HeatmapEntry e;
        const unsigned char* d = sqlite3_column_text(stmt, 0);
        e.date = d ? reinterpret_cast<const char*>(d) : "";
        e.count = sqlite3_column_int(stmt, 1);
        e.level = sqlite3_column_int(stmt, 2);
        entries.push_back(e);
    }
    sqlite3_finalize(stmt);
    return entries;
}

bool UserRepository::insertOrUpdateHeatmapEntry(const std::string& date, int count, int level) {
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return false;

    sqlite3_stmt* stmt = nullptr;
    const char* sql = "INSERT OR REPLACE INTO activity_heatmap (date, count, level) VALUES (?, ?, ?);";
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_text(stmt, 1, date.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 2, count);
    sqlite3_bind_int(stmt, 3, level);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE;
}

std::vector<Submission> UserRepository::getRecentSubmissions(int limit) {
    std::vector<Submission> subs;
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return subs;

    sqlite3_stmt* stmt = nullptr;
    const char* sql = "SELECT id, problem_id, title, difficulty, language, status, runtime_ms, memory_mb, submitted_at FROM submissions ORDER BY rowid DESC LIMIT ?;";
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return subs;

    sqlite3_bind_int(stmt, 1, limit);
    while (sqlite3_step(stmt) == SQLITE_ROW) {
        Submission s;
        auto getText = [&](int col) -> std::string {
            const unsigned char* txt = sqlite3_column_text(stmt, col);
            return txt ? reinterpret_cast<const char*>(txt) : "";
        };
        s.id = getText(0);
        s.problem_id = getText(1);
        s.title = getText(2);
        s.difficulty = getText(3);
        s.language = getText(4);
        s.status = getText(5);
        s.runtime_ms = sqlite3_column_int(stmt, 6);
        s.memory_mb = sqlite3_column_double(stmt, 7);
        s.submitted_at = getText(8);
        subs.push_back(s);
    }
    sqlite3_finalize(stmt);
    return subs;
}

bool UserRepository::insertSubmission(const Submission& sub) {
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return false;

    sqlite3_stmt* stmt = nullptr;
    const char* sql = "INSERT OR REPLACE INTO submissions (id, problem_id, title, difficulty, language, status, runtime_ms, memory_mb, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_text(stmt, 1, sub.id.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, sub.problem_id.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, sub.title.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, sub.difficulty.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 5, sub.language.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 6, sub.status.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 7, sub.runtime_ms);
    sqlite3_bind_double(stmt, 8, sub.memory_mb);
    sqlite3_bind_text(stmt, 9, sub.submitted_at.c_str(), -1, SQLITE_TRANSIENT);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE;
}

} // namespace algovault
