#include "../include/server/http_server.hpp"
#include "../include/database/db_connection.hpp"
#include <iostream>
#include <csignal>
#include <memory>
#include <filesystem>

static std::unique_ptr<algovault::HttpServer> g_server = nullptr;

void signalHandler(int signum) {
    std::cout << "\n[AlgoVault] Received signal " << signum << ", shutting down gracefully..." << std::endl;
    if (g_server) {
        g_server->stop();
    }
    algovault::DBConnection::getInstance().close();
    exit(0);
}

int main(int argc, char* argv[]) {
    int port = 3001;
    std::string dbPath = "./algovault.db";
    std::string staticDir = "./frontend";

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--port" && i + 1 < argc) {
            port = std::stoi(argv[++i]);
        } else if (arg == "--db" && i + 1 < argc) {
            dbPath = argv[++i];
        } else if (arg == "--static" && i + 1 < argc) {
            staticDir = argv[++i];
        } else if (arg == "--help" || arg == "-h") {
            std::cout << "AlgoVault C++ Server\n"
                      << "Usage: algovault_server [options]\n"
                      << "Options:\n"
                      << "  --port <port>       Port to listen on (default: 3001)\n"
                      << "  --db <path>         SQLite database path (default: ./algovault.db)\n"
                      << "  --static <path>     Frontend static directory (default: ./frontend)\n"
                      << "  --help, -h          Show this help message\n";
            return 0;
        }
    }

    std::signal(SIGINT, signalHandler);
    std::signal(SIGTERM, signalHandler);

    std::cout << "[AlgoVault] Initializing SQLite database at: " << dbPath << "..." << std::endl;
    auto& db = algovault::DBConnection::getInstance();
    if (!db.open(dbPath)) {
        std::cerr << "[AlgoVault] CRITICAL: Failed to open database!" << std::endl;
        return 1;
    }

    db.initSchema();
    db.seedDefaultsIfEmpty();
    std::cout << "[AlgoVault] Database initialized and verified." << std::endl;

    g_server = std::make_unique<algovault::HttpServer>(port, staticDir);
    g_server->start();

    return 0;
}
