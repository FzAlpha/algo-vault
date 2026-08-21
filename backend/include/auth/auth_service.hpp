#pragma once

#include <string>
#include <optional>
#include "../../third_party/json.hpp"
#include "../models/user.hpp"

namespace algovault {

struct AuthResult {
    bool success = false;
    std::string token;
    std::string message;
    std::optional<User> user;
};

class AuthService {
public:
    AuthResult loginWithTerminalId(const std::string& terminalId);
    AuthResult generateNewApiToken();
    bool authenticateRequest(const std::string& authHeader, std::string& outUserId);
};

} // namespace algovault
