#include "../../include/auth/token_manager.hpp"
#include <openssl/hmac.h>
#include <openssl/sha.h>
#include <openssl/rand.h>
#include <sstream>
#include <iomanip>
#include <chrono>

namespace algovault {

TokenManager::TokenManager() {
    // Generate random internal secret if not set
    unsigned char buf[32];
    RAND_bytes(buf, sizeof(buf));
    std::stringstream ss;
    for (int i = 0; i < 32; ++i) {
        ss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(buf[i]);
    }
    secretKey_ = ss.str();
}

TokenManager& TokenManager::getInstance() {
    static TokenManager instance;
    return instance;
}

std::string TokenManager::sha256Hex(const std::string& input) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256(reinterpret_cast<const unsigned char*>(input.c_str()), input.length(), hash);
    std::stringstream ss;
    for (int i = 0; i < SHA256_DIGEST_LENGTH; ++i) {
        ss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(hash[i]);
    }
    return ss.str();
}

std::string TokenManager::generateSessionToken(const std::string& userId) {
    auto now = std::chrono::duration_cast<std::chrono::seconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();
    
    std::string payload = userId + ":" + std::to_string(now);
    std::string sig = sha256Hex(payload + secretKey_);
    return "av_session_" + payload + "." + sig.substr(0, 16);
}

bool TokenManager::validateToken(const std::string& token, std::string& outUserId) {
    if (token.rfind("av_session_", 0) != 0) {
        // Fallback for API token
        if (token.rfind("av_live_", 0) == 0) {
            outUserId = "usr_primary";
            return true;
        }
        return false;
    }

    std::string content = token.substr(11); // remove "av_session_"
    size_t dotPos = content.find('.');
    if (dotPos == std::string::npos) return false;

    std::string payload = content.substr(0, dotPos);
    std::string sig = content.substr(dotPos + 1);

    std::string expectedSig = sha256Hex(payload + secretKey_).substr(0, 16);
    if (sig != expectedSig) return false;

    size_t colonPos = payload.find(':');
    if (colonPos == std::string::npos) return false;

    outUserId = payload.substr(0, colonPos);
    return true;
}

std::string TokenManager::generateApiToken() {
    unsigned char buf[16];
    RAND_bytes(buf, sizeof(buf));
    std::stringstream ss;
    ss << "av_live_";
    for (int i = 0; i < 16; ++i) {
        ss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(buf[i]);
    }
    return ss.str();
}

} // namespace algovault
