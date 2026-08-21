#include "../../include/server/http_server.hpp"
#include "../../include/database/db_connection.hpp"
#include "../../include/database/user_repository.hpp"
#include "../../include/database/problem_repository.hpp"
#include "../../include/database/settings_repository.hpp"
#include "../../include/auth/auth_service.hpp"
#include "../../include/services/leetcode_service.hpp"
#include "../../include/services/ai_insights_engine.hpp"

#include <iostream>
#include <fstream>
#include <sstream>
#include <chrono>
#include <ctime>

namespace algovault {

HttpServer::HttpServer(int port, const std::string& staticDir)
    : port_(port), staticDir_(staticDir) {}

void HttpServer::setupCors() {
    server_.set_pre_routing_handler([](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        if (req.method == "OPTIONS") {
            res.status = 204;
            return httplib::Server::HandlerResponse::Handled;
        }
        return httplib::Server::HandlerResponse::Unhandled;
    });
}

void HttpServer::setupUserRoutes() {
    server_.Get("/api/user", [](const httplib::Request& /*req*/, httplib::Response& res) {
        UserRepository repo;
        auto user = repo.getPrimaryUser();
        if (user) {
            res.set_content(user->to_json().dump(), "application/json");
        } else {
            res.status = 404;
            res.set_content(nlohmann::json({{"error", "User not found"}}).dump(), "application/json");
        }
    });

    server_.Put("/api/user", [](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = nlohmann::json::parse(req.body);
            UserRepository repo;
            auto user = repo.getPrimaryUser();
            if (!user) {
                res.status = 404;
                res.set_content(nlohmann::json({{"error", "User not found"}}).dump(), "application/json");
                return;
            }

            if (body.contains("username") && !body["username"].is_null()) user->username = body["username"].get<std::string>();
            if (body.contains("full_name") && !body["full_name"].is_null()) user->full_name = body["full_name"].get<std::string>();
            if (body.contains("email") && !body["email"].is_null()) user->email = body["email"].get<std::string>();
            if (body.contains("title") && !body["title"].is_null()) user->title = body["title"].get<std::string>();
            if (body.contains("bio") && !body["bio"].is_null()) user->bio = body["bio"].get<std::string>();
            if (body.contains("avatar_url") && !body["avatar_url"].is_null()) user->avatar_url = body["avatar_url"].get<std::string>();

            repo.updateUser(*user);
            res.set_content(user->to_json().dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json({{"error", e.what()}}).dump(), "application/json");
        }
    });
}

void HttpServer::setupAuthRoutes() {
    server_.Post("/api/auth/login", [](const httplib::Request& req, httplib::Response& res) {
        try {
            std::string terminalId = "Operator";
            if (!req.body.empty()) {
                auto body = nlohmann::json::parse(req.body);
                if (body.contains("terminalId") && !body["terminalId"].is_null()) {
                    terminalId = body["terminalId"].get<std::string>();
                }
            }

            AuthService auth;
            auto result = auth.loginWithTerminalId(terminalId);
            nlohmann::json resp = {
                {"success", result.success},
                {"token", result.token},
                {"message", result.message}
            };
            if (result.user) resp["user"] = result.user->to_json();

            res.set_content(resp.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json({{"error", e.what()}}).dump(), "application/json");
        }
    });

    server_.Post("/api/auth/leetcode", [](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = nlohmann::json::parse(req.body);
            if (!body.contains("username") || body["username"].get<std::string>().empty()) {
                res.status = 400;
                res.set_content(nlohmann::json({{"error", "LeetCode username is required"}}).dump(), "application/json");
                return;
            }

            std::string lcUser = body["username"].get<std::string>();
            auto syncResult = LeetCodeService::getInstance().syncLeetCodeProfile(lcUser);

            UserRepository uRepo;
            auto updatedUser = uRepo.getPrimaryUser();

            nlohmann::json resp = {
                {"success", syncResult.success},
                {"message", syncResult.message},
                {"user", updatedUser ? updatedUser->to_json() : nlohmann::json::object()},
                {"leetcodeData", {
                    {"username", syncResult.username},
                    {"problemsSolved", syncResult.problemsSolved},
                    {"streakDays", syncResult.streakDays},
                    {"globalRank", syncResult.globalRank},
                    {"topPercentage", syncResult.topPercentage},
                    {"successRate", syncResult.successRate}
                }}
            };
            res.set_content(resp.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content(nlohmann::json({{"error", e.what()}}).dump(), "application/json");
        }
    });

    server_.Post("/api/auth/token", [](const httplib::Request& /*req*/, httplib::Response& res) {
        AuthService auth;
        auto result = auth.generateNewApiToken();
        res.set_content(nlohmann::json({
            {"success", result.success},
            {"token", result.token},
            {"message", result.message}
        }).dump(), "application/json");
    });
}

void HttpServer::setupProblemRoutes() {
    server_.Get("/api/problems", [](const httplib::Request& req, httplib::Response& res) {
        ProblemFilter filter;
        if (req.has_param("search")) filter.search = req.get_param_value("search");
        if (req.has_param("difficulty")) filter.difficulty = req.get_param_value("difficulty");
        if (req.has_param("language")) filter.language = req.get_param_value("language");
        if (req.has_param("sort")) filter.sort = req.get_param_value("sort");

        ProblemRepository repo;
        auto problems = repo.getProblems(filter);
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& p : problems) arr.push_back(p.to_json());
        res.set_content(arr.dump(), "application/json");
    });

    server_.Get(R"(/api/problems/([^/]+))", [](const httplib::Request& req, httplib::Response& res) {
        std::string id = req.matches[1];
        ProblemRepository repo;
        auto p = repo.getProblemById(id);
        if (p) {
            res.set_content(p->to_json().dump(), "application/json");
        } else {
            res.status = 404;
            res.set_content(nlohmann::json({{"error", "Problem not found"}}).dump(), "application/json");
        }
    });

    server_.Post("/api/problems", [](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = nlohmann::json::parse(req.body);
            if (!body.contains("name") || body["name"].get<std::string>().empty()) {
                res.status = 400;
                res.set_content(nlohmann::json({{"error", "Problem name is required"}}).dump(), "application/json");
                return;
            }

            auto now = std::chrono::duration_cast<std::chrono::milliseconds>(
                std::chrono::system_clock::now().time_since_epoch()).count();

            Problem p;
            p.id = "prob-" + std::to_string(now);
            p.name = body["name"].get<std::string>();
            p.difficulty = body.value("difficulty", "Medium");
            p.language = body.value("language", "C++");
            p.time_complexity = body.value("time_complexity", "O(n)");
            p.space_complexity = body.value("space_complexity", "O(1)");
            p.runtime_ms = body.value("runtime_ms", 12);
            p.solved_at = "Just now";
            p.code = body.value("code", "");
            p.notes = body.value("notes", "");
            p.tags = body.value("tags", "Algorithms");
            p.is_favorite = body.value("is_favorite", 0);

            ProblemRepository repo;
            repo.insertProblem(p);

            UserRepository uRepo;
            uRepo.incrementProblemsSolved();

            auto todayNow = std::chrono::system_clock::now();
            time_t today_c = std::chrono::system_clock::to_time_t(todayNow);
            char dateBuf[32];
            struct tm tm_today;
            gmtime_r(&today_c, &tm_today);
            strftime(dateBuf, sizeof(dateBuf), "%Y-%m-%d", &tm_today);

            auto heatmap = uRepo.getActivityHeatmap();
            int curCount = 0;
            for (const auto& h : heatmap) {
                if (h.date == dateBuf) {
                    curCount = h.count;
                    break;
                }
            }
            int newCount = curCount + 1;
            int newLevel = (newCount > 4 ? 4 : (newCount > 2 ? 3 : (newCount > 1 ? 2 : 1)));
            uRepo.insertOrUpdateHeatmapEntry(dateBuf, newCount, newLevel);

            res.status = 201;
            res.set_content(p.to_json().dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json({{"error", e.what()}}).dump(), "application/json");
        }
    });

    server_.Put(R"(/api/problems/([^/]+))", [](const httplib::Request& req, httplib::Response& res) {
        try {
            std::string id = req.matches[1];
            ProblemRepository repo;
            auto existing = repo.getProblemById(id);
            if (!existing) {
                res.status = 404;
                res.set_content(nlohmann::json({{"error", "Problem not found"}}).dump(), "application/json");
                return;
            }

            auto body = nlohmann::json::parse(req.body);
            if (body.contains("name")) existing->name = body["name"].get<std::string>();
            if (body.contains("difficulty")) existing->difficulty = body["difficulty"].get<std::string>();
            if (body.contains("language")) existing->language = body["language"].get<std::string>();
            if (body.contains("time_complexity")) existing->time_complexity = body["time_complexity"].get<std::string>();
            if (body.contains("space_complexity")) existing->space_complexity = body["space_complexity"].get<std::string>();
            if (body.contains("runtime_ms")) existing->runtime_ms = body["runtime_ms"].get<int>();
            if (body.contains("code")) existing->code = body["code"].get<std::string>();
            if (body.contains("notes")) existing->notes = body["notes"].get<std::string>();
            if (body.contains("tags")) existing->tags = body["tags"].get<std::string>();
            if (body.contains("is_favorite")) existing->is_favorite = body["is_favorite"].get<int>();

            repo.updateProblem(*existing);
            res.set_content(existing->to_json().dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json({{"error", e.what()}}).dump(), "application/json");
        }
    });

    server_.Delete(R"(/api/problems/([^/]+))", [](const httplib::Request& req, httplib::Response& res) {
        std::string id = req.matches[1];
        ProblemRepository repo;
        if (repo.deleteProblem(id)) {
            UserRepository uRepo;
            uRepo.decrementProblemsSolved();
            res.set_content(nlohmann::json({{"success", true}, {"message", "Problem deleted"}}).dump(), "application/json");
        } else {
            res.status = 404;
            res.set_content(nlohmann::json({{"error", "Problem not found"}}).dump(), "application/json");
        }
    });
}

void HttpServer::setupStatsRoutes() {
    server_.Get("/api/stats", [](const httplib::Request& /*req*/, httplib::Response& res) {
        UserRepository uRepo;
        ProblemRepository pRepo;

        auto user = uRepo.getPrimaryUser();
        auto heatmap = uRepo.getActivityHeatmap();
        auto submissions = uRepo.getRecentSubmissions(10);

        nlohmann::json langJson = nlohmann::json::object();
        if (user && !user->language_stats.empty() && user->language_stats != "{}") {
            try {
                langJson = nlohmann::json::parse(user->language_stats);
            } catch (...) {}
        }
        if (langJson.empty()) {
            auto langDist = pRepo.getLanguageDistribution();
            for (const auto& [lang, count] : langDist) {
                langJson[lang] = count;
            }
        }
        if (langJson.empty()) {
            langJson = {{"C++", 28}, {"Python", 18}, {"Java", 12}, {"Rust", 6}};
        }

        int totalSolved = user ? user->problems_solved : 0;
        int easySolved = user ? user->easy_solved : 0;
        int medSolved = user ? user->medium_solved : 0;
        int hardSolved = user ? user->hard_solved : 0;

        if (easySolved == 0 && medSolved == 0 && hardSolved == 0) {
            auto [easy, medium, hard] = pRepo.getDifficultyBreakdown();
            easySolved = easy;
            medSolved = medium;
            hardSolved = hard;
        }

        if (totalSolved <= 0) {
            totalSolved = easySolved + medSolved + hardSolved;
            if (totalSolved <= 0) totalSolved = 54;
        }

        nlohmann::json heatJson = nlohmann::json::array();
        for (const auto& h : heatmap) heatJson.push_back(h.to_json());

        nlohmann::json subJson = nlohmann::json::array();
        for (const auto& s : submissions) subJson.push_back(s.to_json());

        int weeklyGoalTarget = std::max(15, static_cast<int>(std::ceil(totalSolved * 0.1)));
        int weeklySolved = std::min(weeklyGoalTarget, static_cast<int>(weeklyGoalTarget * 0.72));

        nlohmann::json resp = {
            {"user", user ? user->to_json() : nlohmann::json::object()},
            {"totalProblems", totalSolved},
            {"difficultyBreakdown", {
                {"Easy", easySolved},
                {"Medium", medSolved},
                {"Hard", hardSolved}
            }},
            {"languageDistribution", langJson},
            {"heatmap", heatJson},
            {"recentSubmissions", subJson},
            {"weeklyGoal", {
                {"solved", weeklySolved},
                {"total", weeklyGoalTarget},
                {"percentage", static_cast<int>((static_cast<double>(weeklySolved) / weeklyGoalTarget) * 100)}
            }}
        };

        res.set_content(resp.dump(), "application/json");
    });
}

void HttpServer::setupAiRoutes() {
    server_.Get("/api/ai/insights", [](const httplib::Request& /*req*/, httplib::Response& res) {
        UserRepository repo;
        auto user = repo.getPrimaryUser();
        std::string handle = user ? (user->leetcode_username.empty() ? user->username : user->leetcode_username) : "CipherByte";
        
        auto insights = AIInsightsEngine::getInstance().generateInsights(handle);
        res.set_content(insights.to_json().dump(), "application/json");
    });

    server_.Post("/api/ai/analyze", [](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = nlohmann::json::parse(req.body);
            std::string code = body.value("code", "");
            std::string lang = body.value("language", "C++");
            auto result = AIInsightsEngine::getInstance().analyzeCodeSnippet(code, lang);
            res.set_content(result.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json({{"error", e.what()}}).dump(), "application/json");
        }
    });
}

void HttpServer::setupSystemRoutes() {
    server_.Get("/api/health", [](const httplib::Request& /*req*/, httplib::Response& res) {
        res.set_content(nlohmann::json({
            {"status", "ONLINE"},
            {"engine", "AlgoVault C++ Core 2.0"},
            {"runtime", "Native C++17 / SQLite3 / OpenSSL"},
            {"timestamp", std::chrono::system_clock::now().time_since_epoch().count()}
        }).dump(), "application/json");
    });

    server_.Get("/api/settings", [](const httplib::Request& /*req*/, httplib::Response& res) {
        SettingsRepository repo;
        auto s = repo.getSettings();
        if (s) {
            res.set_content(s->to_json().dump(), "application/json");
        } else {
            res.status = 404;
            res.set_content(nlohmann::json({{"error", "Settings not found"}}).dump(), "application/json");
        }
    });

    server_.Put("/api/settings", [](const httplib::Request& req, httplib::Response& res) {
        try {
            SettingsRepository repo;
            auto existing = repo.getSettings();
            if (!existing) {
                res.status = 404;
                res.set_content(nlohmann::json({{"error", "Settings not found"}}).dump(), "application/json");
                return;
            }

            auto body = nlohmann::json::parse(req.body);
            if (body.contains("theme")) existing->theme = body["theme"].get<std::string>();
            if (body.contains("font_family")) existing->font_family = body["font_family"].get<std::string>();
            if (body.contains("font_size")) existing->font_size = body["font_size"].get<int>();
            if (body.contains("vim_mode")) existing->vim_mode = body["vim_mode"].get<int>();
            if (body.contains("leetcode_auto_sync")) existing->leetcode_auto_sync = body["leetcode_auto_sync"].get<int>();
            if (body.contains("sync_frequency")) existing->sync_frequency = body["sync_frequency"].get<std::string>();
            if (body.contains("ai_model")) existing->ai_model = body["ai_model"].get<std::string>();
            if (body.contains("complexity_threshold")) existing->complexity_threshold = body["complexity_threshold"].get<std::string>();
            if (body.contains("ai_severity")) existing->ai_severity = body["ai_severity"].get<std::string>();
            if (body.contains("sound_effects")) existing->sound_effects = body["sound_effects"].get<int>();
            if (body.contains("telemetry")) existing->telemetry = body["telemetry"].get<int>();

            repo.updateSettings(*existing);
            res.set_content(existing->to_json().dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json({{"error", e.what()}}).dump(), "application/json");
        }
    });

    server_.Get("/api/db/export", [](const httplib::Request& /*req*/, httplib::Response& res) {
        UserRepository uRepo;
        ProblemRepository pRepo;
        SettingsRepository sRepo;

        auto user = uRepo.getPrimaryUser();
        auto problems = pRepo.getProblems();
        auto heatmap = uRepo.getActivityHeatmap();
        auto settings = sRepo.getSettings();
        auto submissions = uRepo.getRecentSubmissions(100);

        nlohmann::json pArr = nlohmann::json::array();
        for (const auto& p : problems) pArr.push_back(p.to_json());

        nlohmann::json hArr = nlohmann::json::array();
        for (const auto& h : heatmap) hArr.push_back(h.to_json());

        nlohmann::json sArr = nlohmann::json::array();
        for (const auto& s : submissions) sArr.push_back(s.to_json());

        nlohmann::json backup = {
            {"exported_at", std::chrono::system_clock::now().time_since_epoch().count()},
            {"system", "AlgoVault C++ Backend"},
            {"users", user ? nlohmann::json::array({user->to_json()}) : nlohmann::json::array()},
            {"problems", pArr},
            {"heatmap", hArr},
            {"settings", settings ? nlohmann::json::array({settings->to_json()}) : nlohmann::json::array()},
            {"submissions", sArr}
        };

        res.set_header("Content-Disposition", "attachment; filename=algovault_backup.json");
        res.set_content(backup.dump(2), "application/json");
    });

    server_.Post("/api/db/reset", [](const httplib::Request& /*req*/, httplib::Response& res) {
        DBConnection::getInstance().resetToDefaults();
        res.set_content(nlohmann::json({{"success", true}, {"message", "Database reset to factory defaults"}}).dump(), "application/json");
    });
}

void HttpServer::registerRoutes() {
    setupCors();
    setupUserRoutes();
    setupAuthRoutes();
    setupProblemRoutes();
    setupStatsRoutes();
    setupAiRoutes();
    setupSystemRoutes();

    // Serve static files from static directory
    if (!staticDir_.empty()) {
        server_.set_mount_point("/", staticDir_);
    }
}

void HttpServer::start() {
    registerRoutes();
    std::cout << "\n========================================================" << std::endl;
    std::cout << "  ⚡ ALGOVAULT C++ HIGH-PERFORMANCE BACKEND ENGINE ⚡" << std::endl;
    std::cout << "========================================================" << std::endl;
    std::cout << "  -> HTTP REST API & Frontend: http://localhost:" << port_ << std::endl;
    std::cout << "  -> Database: SQLite3 (RAII Managed)" << std::endl;
    std::cout << "  -> Crypto Engine: OpenSSL HMAC-SHA256" << std::endl;
    std::cout << "  -> Static Assets: " << staticDir_ << std::endl;
    std::cout << "========================================================\n" << std::endl;

    server_.listen("0.0.0.0", port_);
}

void HttpServer::stop() {
    server_.stop();
}

} // namespace algovault
