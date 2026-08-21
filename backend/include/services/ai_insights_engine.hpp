#pragma once

#include <string>
#include <vector>
#include "../../third_party/json.hpp"

namespace algovault {

struct AIRecommendation {
    std::string title;
    std::string difficulty;
    std::string pattern;
    std::string reason;

    nlohmann::json to_json() const {
        return {
            {"title", title},
            {"difficulty", difficulty},
            {"pattern", pattern},
            {"reason", reason}
        };
    }
};

struct AIAnalysisResult {
    std::string status = "Engine Active";
    std::string model = "AlgoVault-Neural-O3";
    std::string latestRun = "Just now";
    std::string userHandle;
    
    struct Analysis {
        std::string title;
        std::string language;
        std::string detectedComplexity;
        std::string targetFunction;
        std::string annotatedCode;
        std::string optimizedFunction;
        std::string timeImprovement;
        std::string spaceTradeoff;
        std::string speedup;

        nlohmann::json to_json() const {
            return {
                {"title", title},
                {"language", language},
                {"detectedComplexity", detectedComplexity},
                {"targetFunction", targetFunction},
                {"annotatedCode", annotatedCode},
                {"optimizedFunction", optimizedFunction},
                {"timeImprovement", timeImprovement},
                {"spaceTradeoff", spaceTradeoff},
                {"speedup", speedup}
            };
        }
    } analysis;

    std::vector<AIRecommendation> recommendations;

    nlohmann::json to_json() const {
        nlohmann::json recs = nlohmann::json::array();
        for (const auto& r : recommendations) recs.push_back(r.to_json());

        return {
            {"status", status},
            {"model", model},
            {"latestRun", latestRun},
            {"userHandle", userHandle},
            {"analysis", analysis.to_json()},
            {"recommendations", recs}
        };
    }
};

class AIInsightsEngine {
public:
    static AIInsightsEngine& getInstance();

    AIAnalysisResult generateInsights(const std::string& userHandle);
    nlohmann::json analyzeCodeSnippet(const std::string& code, const std::string& language);
};

} // namespace algovault
