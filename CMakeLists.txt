cmake_minimum_required(VERSION 3.16)
project(AlgoVault CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Optimization & warnings
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -Wall -Wextra -pthread")

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/backend/include
    ${CMAKE_CURRENT_SOURCE_DIR}/backend/third_party
)

# Source files
set(SOURCES
    backend/src/main.cpp
    backend/src/database/db_connection.cpp
    backend/src/database/user_repository.cpp
    backend/src/database/problem_repository.cpp
    backend/src/database/settings_repository.cpp
    backend/src/auth/token_manager.cpp
    backend/src/auth/auth_service.cpp
    backend/src/services/leetcode_service.cpp
    backend/src/services/ai_insights_engine.cpp
    backend/src/server/http_server.cpp
)

# Target executable
add_executable(algovault_server ${SOURCES})

# Find required libraries
find_package(OpenSSL REQUIRED)
find_package(CURL REQUIRED)
find_library(SQLITE3_LIB sqlite3 REQUIRED)

# Link libraries
target_link_libraries(algovault_server PRIVATE
    OpenSSL::SSL
    OpenSSL::Crypto
    CURL::libcurl
    ${SQLITE3_LIB}
    pthread
)
