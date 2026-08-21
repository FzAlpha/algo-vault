#include "../../include/database/problem_repository.hpp"
#include "../../include/database/db_connection.hpp"
#include <iostream>
#include <sstream>
#include <map>

namespace algovault {

std::vector<Problem> ProblemRepository::getProblems(const ProblemFilter& filter) {
    std::vector<Problem> list;
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return list;

    std::stringstream sql;
    sql << "SELECT id, name, difficulty, language, time_complexity, space_complexity, runtime_ms, solved_at, code, notes, tags, is_favorite, created_at FROM problems WHERE 1=1";

    std::vector<std::string> params;

    if (!filter.search.empty()) {
        sql << " AND (name LIKE ? OR tags LIKE ? OR notes LIKE ?)";
        std::string s = "%" + filter.search + "%";
        params.push_back(s);
        params.push_back(s);
        params.push_back(s);
    }

    if (!filter.difficulty.empty() && filter.difficulty != "All" && filter.difficulty != "Difficulty: All") {
        sql << " AND difficulty = ?";
        params.push_back(filter.difficulty);
    }

    if (!filter.language.empty() && filter.language != "All" && filter.language != "Language: All") {
        sql << " AND language = ?";
        params.push_back(filter.language);
    }

    if (filter.sort == "Oldest") {
        sql << " ORDER BY created_at ASC";
    } else if (filter.sort == "Difficulty") {
        sql << " ORDER BY CASE difficulty WHEN 'Hard' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Easy' THEN 3 ELSE 4 END ASC";
    } else if (filter.sort == "Most Efficient") {
        sql << " ORDER BY runtime_ms ASC";
    } else {
        sql << " ORDER BY created_at DESC";
    }

    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql.str().c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        return list;
    }

    for (size_t i = 0; i < params.size(); ++i) {
        sqlite3_bind_text(stmt, static_cast<int>(i + 1), params[i].c_str(), -1, SQLITE_TRANSIENT);
    }

    while (sqlite3_step(stmt) == SQLITE_ROW) {
        Problem p;
        auto getText = [&](int col) -> std::string {
            const unsigned char* txt = sqlite3_column_text(stmt, col);
            return txt ? reinterpret_cast<const char*>(txt) : "";
        };

        p.id = getText(0);
        p.name = getText(1);
        p.difficulty = getText(2);
        p.language = getText(3);
        p.time_complexity = getText(4);
        p.space_complexity = getText(5);
        p.runtime_ms = sqlite3_column_int(stmt, 6);
        p.solved_at = getText(7);
        p.code = getText(8);
        p.notes = getText(9);
        p.tags = getText(10);
        p.is_favorite = sqlite3_column_int(stmt, 11);
        p.created_at = getText(12);
        list.push_back(p);
    }

    sqlite3_finalize(stmt);
    return list;
}

std::optional<Problem> ProblemRepository::getProblemById(const std::string& id) {
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return std::nullopt;

    sqlite3_stmt* stmt = nullptr;
    const char* sql = "SELECT id, name, difficulty, language, time_complexity, space_complexity, runtime_ms, solved_at, code, notes, tags, is_favorite, created_at FROM problems WHERE id = ?;";
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return std::nullopt;

    sqlite3_bind_text(stmt, 1, id.c_str(), -1, SQLITE_TRANSIENT);
    std::optional<Problem> result = std::nullopt;

    if (sqlite3_step(stmt) == SQLITE_ROW) {
        Problem p;
        auto getText = [&](int col) -> std::string {
            const unsigned char* txt = sqlite3_column_text(stmt, col);
            return txt ? reinterpret_cast<const char*>(txt) : "";
        };

        p.id = getText(0);
        p.name = getText(1);
        p.difficulty = getText(2);
        p.language = getText(3);
        p.time_complexity = getText(4);
        p.space_complexity = getText(5);
        p.runtime_ms = sqlite3_column_int(stmt, 6);
        p.solved_at = getText(7);
        p.code = getText(8);
        p.notes = getText(9);
        p.tags = getText(10);
        p.is_favorite = sqlite3_column_int(stmt, 11);
        p.created_at = getText(12);
        result = p;
    }

    sqlite3_finalize(stmt);
    return result;
}

bool ProblemRepository::insertProblem(const Problem& p) {
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return false;

    const char* sql = R"(
        INSERT OR REPLACE INTO problems (id, name, difficulty, language, time_complexity, space_complexity, runtime_ms, solved_at, code, notes, tags, is_favorite)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    )";

    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_text(stmt, 1, p.id.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, p.name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, p.difficulty.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, p.language.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 5, p.time_complexity.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 6, p.space_complexity.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 7, p.runtime_ms);
    sqlite3_bind_text(stmt, 8, p.solved_at.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 9, p.code.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 10, p.notes.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 11, p.tags.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 12, p.is_favorite);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE;
}

bool ProblemRepository::updateProblem(const Problem& p) {
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return false;

    const char* sql = R"(
        UPDATE problems 
        SET name = ?, difficulty = ?, language = ?, time_complexity = ?, space_complexity = ?,
            runtime_ms = ?, code = ?, notes = ?, tags = ?, is_favorite = ?
        WHERE id = ?;
    )";

    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_text(stmt, 1, p.name.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, p.difficulty.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 3, p.language.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 4, p.time_complexity.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 5, p.space_complexity.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 6, p.runtime_ms);
    sqlite3_bind_text(stmt, 7, p.code.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 8, p.notes.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 9, p.tags.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 10, p.is_favorite);
    sqlite3_bind_text(stmt, 11, p.id.c_str(), -1, SQLITE_TRANSIENT);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE;
}

bool ProblemRepository::deleteProblem(const std::string& id) {
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return false;

    sqlite3_stmt* stmt = nullptr;
    const char* sql = "DELETE FROM problems WHERE id = ?;";
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_text(stmt, 1, id.c_str(), -1, SQLITE_TRANSIENT);
    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE;
}

int ProblemRepository::getTotalProblemCount() {
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return 0;

    sqlite3_stmt* stmt = nullptr;
    sqlite3_prepare_v2(db, "SELECT COUNT(*) FROM problems;", -1, &stmt, nullptr);
    int count = 0;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        count = sqlite3_column_int(stmt, 0);
    }
    sqlite3_finalize(stmt);
    return count;
}

std::vector<std::pair<std::string, int>> ProblemRepository::getLanguageDistribution() {
    std::vector<std::pair<std::string, int>> dist;
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return dist;

    sqlite3_stmt* stmt = nullptr;
    sqlite3_prepare_v2(db, "SELECT language, COUNT(*) FROM problems GROUP BY language ORDER BY COUNT(*) DESC;", -1, &stmt, nullptr);
    while (sqlite3_step(stmt) == SQLITE_ROW) {
        const unsigned char* l = sqlite3_column_text(stmt, 0);
        std::string lang = l ? reinterpret_cast<const char*>(l) : "Unknown";
        int count = sqlite3_column_int(stmt, 1);
        dist.push_back({lang, count});
    }
    sqlite3_finalize(stmt);
    return dist;
}

std::tuple<int, int, int> ProblemRepository::getDifficultyBreakdown() {
    int easy = 0, medium = 0, hard = 0;
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return {0, 0, 0};

    sqlite3_stmt* stmt = nullptr;
    sqlite3_prepare_v2(db, "SELECT difficulty, COUNT(*) FROM problems GROUP BY difficulty;", -1, &stmt, nullptr);
    while (sqlite3_step(stmt) == SQLITE_ROW) {
        const unsigned char* d = sqlite3_column_text(stmt, 0);
        std::string diff = d ? reinterpret_cast<const char*>(d) : "";
        int count = sqlite3_column_int(stmt, 1);
        if (diff == "Easy") easy = count;
        else if (diff == "Medium") medium = count;
        else if (diff == "Hard") hard = count;
    }
    sqlite3_finalize(stmt);
    return {easy, medium, hard};
}

} // namespace algovault
