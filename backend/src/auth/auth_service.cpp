#include "../../include/auth/auth_service.hpp"
#include "../../include/auth/token_manager.hpp"
#include "../../include/database/user_repository.hpp"

namespace algovault {

AuthResult AuthService::loginWithTerminalId(const std::string& terminalId) {
    AuthResult result;
    std::string handle = terminalId.empty() ? "Operator" : terminalId;

    UserRepository userRepo;
    userRepo.updateUsername(handle);

    auto user = userRepo.getPrimaryUser();
    if (!user) {
        result.success = false;
        result.message = "Failed to load operator credentials";
        return result;
    }

    std::string token = TokenManager::getInstance().generateSessionToken(user->id);
    result.success = true;
    result.token = token;
    result.user = user;
    result.message = "Terminal operator " + handle + " authenticated successfully.";
    return result;
}

AuthResult AuthService::generateNewApiToken() {
    AuthResult result;
    std::string newToken = TokenManager::getInstance().generateApiToken();
    
    UserRepository userRepo;
    auto user = userRepo.getPrimaryUser();
    if (user) {
        user->api_token = newToken;
        userRepo.updateUser(*user);
        result.success = true;
        result.token = newToken;
        result.user = user;
        result.message = "Generated new live API token";
    } else {
        result.success = false;
        result.message = "User not found";
    }
    return result;
}

bool AuthService::authenticateRequest(const std::string& authHeader, std::string& outUserId) {
    if (authHeader.empty()) {
        outUserId = "usr_primary"; // Default open fallback for local developer dashboard
        return true;
    }

    std::string token = authHeader;
    if (token.rfind("Bearer ", 0) == 0) {
        token = token.substr(7);
    }

    return TokenManager::getInstance().validateToken(token, outUserId);
}

} // namespace algovault
