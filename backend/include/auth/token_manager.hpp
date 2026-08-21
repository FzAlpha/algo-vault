#pragma once

#include <string>

namespace algovault {

class TokenManager {
public:
    static TokenManager& getInstance();

    std::string generateSessionToken(const std::string& userId);
    bool validateToken(const std::string& token, std::string& outUserId);
    std::string generateApiToken();
    std::string sha256Hex(const std::string& input);

private:
    TokenManager();
    std::string secretKey_;
};

} // namespace algovault
