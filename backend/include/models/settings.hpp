#pragma once

#include <string>
#include "../../third_party/json.hpp"

namespace algovault {

struct Settings {
    std::string id = "config_primary";
    std::string theme = "cyberpunk";
    std::string font_family = "JetBrains Mono";
    int font_size = 14;
    int vim_mode = 0;
    int leetcode_auto_sync = 1;
    std::string sync_frequency = "Every 6 Hours";
    std::string ai_model = "AlgoVault-Neural-O3";
    std::string complexity_threshold = "O(N^2)";
    std::string ai_severity = "Strict";
    int sound_effects = 1;
    int telemetry = 0;

    nlohmann::json to_json() const {
        return {
            {"id", id},
            {"theme", theme},
            {"font_family", font_family},
            {"font_size", font_size},
            {"vim_mode", vim_mode},
            {"leetcode_auto_sync", leetcode_auto_sync},
            {"sync_frequency", sync_frequency},
            {"ai_model", ai_model},
            {"complexity_threshold", complexity_threshold},
            {"ai_severity", ai_severity},
            {"sound_effects", sound_effects},
            {"telemetry", telemetry}
        };
    }
};

} // namespace algovault
