#pragma once

#include <string>
#include <vector>
#include <map>
#include "../../third_party/json.hpp"
#include "../models/user.hpp"
#include "../models/heatmap_entry.hpp"
#include "../models/problem.hpp"
#include "../models/submission.hpp"

namespace algovault {

struct LeetCodeSyncResult {
    bool success = false;
    std::string message;
    std::string username;
    int problemsSolved = 0;
    int easySolved = 0;
    int mediumSolved = 0;
    int hardSolved = 0;
    int streakDays = 0;
    std::string topPercentage = "Top 15%";
    std::string globalRank = "#84,210";
    double successRate = 91.5;
    std::string avatarUrl;
    std::map<std::string, int> languageDistribution;
    std::vector<HeatmapEntry> heatmap;
    std::vector<Problem> vaultProblems;
    std::vector<Submission> recentSubmissions;
    nlohmann::json rawData;
};

class LeetCodeService {
public:
    static LeetCodeService& getInstance();

    LeetCodeSyncResult syncLeetCodeProfile(const std::string& username);

private:
    LeetCodeService() = default;
    std::string executeGraphQLQuery(const std::string& query, const nlohmann::json& variables);
};

} // namespace algovault
