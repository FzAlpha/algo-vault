#pragma once

#include "../models/problem.hpp"
#include <vector>
#include <string>
#include <optional>

namespace algovault {

struct ProblemFilter {
    std::string search;
    std::string difficulty;
    std::string language;
    std::string sort; // "Newest", "Oldest", "Difficulty", "Most Efficient"
};

class ProblemRepository {
public:
    std::vector<Problem> getProblems(const ProblemFilter& filter = {});
    std::optional<Problem> getProblemById(const std::string& id);
    bool insertProblem(const Problem& problem);
    bool updateProblem(const Problem& problem);
    bool deleteProblem(const std::string& id);
    int getTotalProblemCount();
    std::vector<std::pair<std::string, int>> getLanguageDistribution();
    std::tuple<int, int, int> getDifficultyBreakdown(); // Easy, Medium, Hard
};

} // namespace algovault
