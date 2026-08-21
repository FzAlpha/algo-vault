#pragma once

#include <sqlite3.h>
#include <string>
#include <memory>
#include <mutex>
#include <functional>
#include <vector>
#include "../../third_party/json.hpp"

namespace algovault {

class DBConnection {
public:
    static DBConnection& getInstance();
    
    bool open(const std::string& dbPath);
    void close();
    
    bool execute(const std::string& sql);
    
    // Low level SQLite handle access (thread-safe under dbMutex)
    sqlite3* getRawDb();
    std::mutex& getMutex();
    
    void initSchema();
    void seedDefaultsIfEmpty();
    void resetToDefaults();

private:
    DBConnection() = default;
    ~DBConnection();
    DBConnection(const DBConnection&) = delete;
    DBConnection& operator=(const DBConnection&) = delete;

    sqlite3* db_ = nullptr;
    std::string dbPath_;
    std::mutex dbMutex_;
};

} // namespace algovault
