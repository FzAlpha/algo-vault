#pragma once

#include <string>
#include "../../third_party/json.hpp"

namespace algovault {

struct Problem {
    std::string id;
    std::string name;
    std::string difficulty = "Medium";
    std::string language = "C++";
    std::string time_complexity = "O(n)";
    std::string space_complexity = "O(1)";
    int runtime_ms = 12;
    std::string solved_at = "Just now";
    std::string code = "";
    std::string notes = "";
    std::string tags = "Algorithms";
    int is_favorite = 0;
    std::string created_at = "";

    nlohmann::json to_json() const {
        return {
            {"id", id},
            {"name", name},
            {"difficulty", difficulty},
            {"language", language},
            {"time_complexity", time_complexity},
            {"space_complexity", space_complexity},
            {"runtime_ms", runtime_ms},
            {"solved_at", solved_at},
            {"code", code},
            {"notes", notes},
            {"tags", tags},
            {"is_favorite", is_favorite},
            {"created_at", created_at}
        };
    }
};

} // namespace algovault
