#pragma once

#include <string>
#include "../../third_party/json.hpp"

namespace algovault {

struct HeatmapEntry {
    std::string date;
    int count = 0;
    int level = 0;

    nlohmann::json to_json() const {
        return {
            {"date", date},
            {"count", count},
            {"level", level}
        };
    }
};

} // namespace algovault
