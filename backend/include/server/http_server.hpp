#pragma once

#include <string>
#include <memory>
#include "../../third_party/httplib.h"
#include "../../third_party/json.hpp"

namespace algovault {

class HttpServer {
public:
    HttpServer(int port = 3001, const std::string& staticDir = "./frontend");
    ~HttpServer() = default;

    void registerRoutes();
    void start();
    void stop();

private:
    int port_;
    std::string staticDir_;
    httplib::Server server_;

    void setupCors();
    void setupUserRoutes();
    void setupAuthRoutes();
    void setupProblemRoutes();
    void setupStatsRoutes();
    void setupAiRoutes();
    void setupSystemRoutes();
};

} // namespace algovault
