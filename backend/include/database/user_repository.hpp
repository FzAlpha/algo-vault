#pragma once

#include "../models/user.hpp"
#include "../models/heatmap_entry.hpp"
#include "../models/submission.hpp"
#include <optional>
#include <vector>

namespace algovault {

class UserRepository {
public:
    std::optional<User> getPrimaryUser();
    bool updateUser(const User& user);
    bool updateUsername(const std::string& username);
    bool incrementProblemsSolved();
    bool decrementProblemsSolved();
    int calculateCurrentStreak();
    
    std::vector<HeatmapEntry> getActivityHeatmap();
    bool insertOrUpdateHeatmapEntry(const std::string& date, int count, int level);
    
    std::vector<Submission> getRecentSubmissions(int limit = 10);
    bool insertSubmission(const Submission& sub);
};

} // namespace algovault
