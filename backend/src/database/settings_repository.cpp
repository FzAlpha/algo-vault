#include "../../include/database/settings_repository.hpp"
#include "../../include/database/db_connection.hpp"
#include <iostream>

namespace algovault {

std::optional<Settings> SettingsRepository::getSettings() {
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return std::nullopt;

    sqlite3_stmt* stmt = nullptr;
    const char* sql = "SELECT id, theme, font_family, font_size, vim_mode, leetcode_auto_sync, sync_frequency, ai_model, complexity_threshold, ai_severity, sound_effects, telemetry FROM settings WHERE id = 'config_primary';";
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return std::nullopt;

    std::optional<Settings> settings = std::nullopt;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        Settings s;
        auto getText = [&](int col) -> std::string {
            const unsigned char* txt = sqlite3_column_text(stmt, col);
            return txt ? reinterpret_cast<const char*>(txt) : "";
        };

        s.id = getText(0);
        s.theme = getText(1);
        s.font_family = getText(2);
        s.font_size = sqlite3_column_int(stmt, 3);
        s.vim_mode = sqlite3_column_int(stmt, 4);
        s.leetcode_auto_sync = sqlite3_column_int(stmt, 5);
        s.sync_frequency = getText(6);
        s.ai_model = getText(7);
        s.complexity_threshold = getText(8);
        s.ai_severity = getText(9);
        s.sound_effects = sqlite3_column_int(stmt, 10);
        s.telemetry = sqlite3_column_int(stmt, 11);
        settings = s;
    }
    sqlite3_finalize(stmt);
    return settings;
}

bool SettingsRepository::updateSettings(const Settings& s) {
    auto& dbConn = DBConnection::getInstance();
    std::lock_guard<std::mutex> lock(dbConn.getMutex());
    sqlite3* db = dbConn.getRawDb();
    if (!db) return false;

    const char* sql = R"(
        UPDATE settings 
        SET theme = ?, font_family = ?, font_size = ?, vim_mode = ?,
            leetcode_auto_sync = ?, sync_frequency = ?, ai_model = ?,
            complexity_threshold = ?, ai_severity = ?, sound_effects = ?, telemetry = ?
        WHERE id = 'config_primary';
    )";

    sqlite3_stmt* stmt = nullptr;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;

    sqlite3_bind_text(stmt, 1, s.theme.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, s.font_family.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 3, s.font_size);
    sqlite3_bind_int(stmt, 4, s.vim_mode);
    sqlite3_bind_int(stmt, 5, s.leetcode_auto_sync);
    sqlite3_bind_text(stmt, 6, s.sync_frequency.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 7, s.ai_model.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 8, s.complexity_threshold.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 9, s.ai_severity.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 10, s.sound_effects);
    sqlite3_bind_int(stmt, 11, s.telemetry);

    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE;
}

} // namespace algovault
