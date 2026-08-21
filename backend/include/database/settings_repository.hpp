#pragma once

#include "../models/settings.hpp"
#include <optional>

namespace algovault {

class SettingsRepository {
public:
    std::optional<Settings> getSettings();
    bool updateSettings(const Settings& settings);
};

} // namespace algovault
