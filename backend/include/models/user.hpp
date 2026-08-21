#pragma once

#include <string>
#include <vector>
#include "../../third_party/json.hpp"

namespace algovault {

struct User {
    std::string id = "usr_primary";
    std::string username = "CipherByte";
    std::string full_name = "Alex Vance";
    std::string email = "alex.vance@algovault.io";
    std::string avatar_url = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
    std::string title = "Senior Systems Architect";
    std::string bio = "Passionate about zero-allocation algorithmic systems, distributed consensus, and competitive programming.";
    int level = 99;
    int streak_days = 26;
    int problems_solved = 54;
    int easy_solved = 21;
    int medium_solved = 26;
    int hard_solved = 7;
    std::string language_stats = "{\"C++\":28,\"Python\":18,\"Java\":6,\"Rust\":2}";
    std::string global_rank = "Top 12%";
    std::string global_rank_num = "#42";
    std::string avg_time = "14m 20s";
    std::string total_time = "142h 32m";
    int avg_runtime_percentile = 88;
    double success_rate = 94.2;
    int code_efficiency = 92;
    std::string leetcode_username = "";
    std::string leetcode_synced_at = "";
    std::string api_token = "";
    std::string created_at = "";

    nlohmann::json to_json() const {
        return {
            {"id", id},
            {"username", username},
            {"full_name", full_name},
            {"email", email},
            {"avatar_url", avatar_url},
            {"title", title},
            {"bio", bio},
            {"level", level},
            {"streak_days", streak_days},
            {"problems_solved", problems_solved},
            {"easy_solved", easy_solved},
            {"medium_solved", medium_solved},
            {"hard_solved", hard_solved},
            {"language_stats", language_stats},
            {"global_rank", global_rank},
            {"global_rank_num", global_rank_num},
            {"avg_time", avg_time},
            {"total_time", total_time},
            {"avg_runtime_percentile", avg_runtime_percentile},
            {"success_rate", success_rate},
            {"code_efficiency", code_efficiency},
            {"leetcode_username", leetcode_username},
            {"leetcode_synced_at", leetcode_synced_at},
            {"api_token", api_token},
            {"created_at", created_at}
        };
    }
};

} // namespace algovault
