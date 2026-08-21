#pragma once

#include <string>
#include "../../third_party/json.hpp"

namespace algovault {

struct Submission {
    std::string id;
    std::string problem_id;
    std::string title;
    std::string difficulty = "Medium";
    std::string language = "C++";
    std::string status = "Accepted";
    int runtime_ms = 14;
    double memory_mb = 12.4;
    std::string submitted_at = "Just now";

    nlohmann::json to_json() const {
        return {
            {"id", id},
            {"problem_id", problem_id},
            {"title", title},
            {"difficulty", difficulty},
            {"language", language},
            {"status", status},
            {"runtime_ms", runtime_ms},
            {"memory_mb", memory_mb},
            {"submitted_at", submitted_at}
        };
    }
};

} // namespace algovault
