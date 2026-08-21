#include "../../include/services/ai_insights_engine.hpp"
#include <regex>

namespace algovault {

AIInsightsEngine& AIInsightsEngine::getInstance() {
    static AIInsightsEngine instance;
    return instance;
}

AIAnalysisResult AIInsightsEngine::generateInsights(const std::string& userHandle) {
    AIAnalysisResult res;
    res.status = "Engine Active";
    res.model = "AlgoVault-Neural-O3";
    res.latestRun = "12 mins ago";
    res.userHandle = userHandle.empty() ? "CipherByte" : userHandle;

    res.analysis.title = "Deep Dive Analysis: Substring Matcher";
    res.analysis.language = "Python";
    res.analysis.detectedComplexity = "O(N^2) Detected";
    res.analysis.targetFunction = 
R"(def find_longest_substring(s: str) -> int:
    n = len(s)
    res = 0
    for i in range(n):
        for j in range(i, n):
            if check_repetition(s, i, j):
                res = max(res, j - i + 1)
    return res)";

    res.analysis.annotatedCode =
R"(# AI Heat Zone Annotation:
# The inner loop forces redundant checks across previously evaluated substrings.
# A sliding window approach utilizing a hash map will linearize this operation to O(N).)";

    res.analysis.optimizedFunction =
R"(def find_longest_substring_optimized(s: str) -> int:
    char_index = {}
    left = max_len = 0
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len)";

    res.analysis.timeImprovement = "O(N²) -> O(N)";
    res.analysis.spaceTradeoff = "O(1) -> O(min(m, n))";
    res.analysis.speedup = "94.8% latency reduction on N=10,000";

    res.recommendations = {
        {
            "Minimum Window Substring",
            "Hard",
            "Sliding Window",
            "Consolidates two-pointer boundary contraction logic with frequency constraint maps."
        },
        {
            "Longest Repeating Character Replacement",
            "Medium",
            "Sliding Window + Frequency Map",
            "Reinforces dynamic window expansion heuristics with max character frequency invariants."
        },
        {
            "Fruit Into Baskets",
            "Medium",
            "Sliding Window",
            "Direct application of max length at-most-k distinct element condition checks."
        }
    };

    return res;
}

nlohmann::json AIInsightsEngine::analyzeCodeSnippet(const std::string& code, const std::string& language) {
    bool hasNestedLoop = (code.find("for ") != std::string::npos && code.find("for ", code.find("for ") + 4) != std::string::npos) ||
                         (code.find("while") != std::string::npos && code.find("for") != std::string::npos);

    std::string detected = hasNestedLoop ? "O(N^2) Quadratic" : "O(N) Linear";
    std::string recommendation = hasNestedLoop ? "Consider converting nested loops into a Single-Pass Sliding Window or Hash Map lookup." : "Time complexity is optimal. Check memory allocations.";

    return {
        {"detected_complexity", detected},
        {"recommendation", recommendation},
        {"engine", "AlgoVault-Neural-O3"},
        {"language", language}
    };
}

} // namespace algovault
