CXX = g++
CXXFLAGS = -std=c++17 -O3 -Wall -Wextra -pthread -Ibackend/include -Ibackend/third_party
LDFLAGS = -lsqlite3 -lssl -lcrypto -lcurl -lpthread

BUILD_DIR = build
TARGET = $(BUILD_DIR)/algovault_server

SRCS = backend/src/main.cpp \
       backend/src/database/db_connection.cpp \
       backend/src/database/user_repository.cpp \
       backend/src/database/problem_repository.cpp \
       backend/src/database/settings_repository.cpp \
       backend/src/auth/token_manager.cpp \
       backend/src/auth/auth_service.cpp \
       backend/src/services/leetcode_service.cpp \
       backend/src/services/ai_insights_engine.cpp \
       backend/src/server/http_server.cpp

OBJS = $(patsubst backend/src/%.cpp, $(BUILD_DIR)/%.o, $(SRCS))

all: $(TARGET)

$(TARGET): $(OBJS)
	@mkdir -p $(BUILD_DIR)
	@echo "Linking $(TARGET)..."
	$(CXX) $(OBJS) -o $@ $(LDFLAGS)
	@echo "Build complete: $(TARGET)"

$(BUILD_DIR)/%.o: backend/src/%.cpp
	@mkdir -p $(dir $@)
	@echo "Compiling $<..."
	$(CXX) $(CXXFLAGS) -c $< -o $@

build: $(TARGET)

run: $(TARGET)
	@echo "Starting AlgoVault C++ Server on port 3001..."
	./$(TARGET) --port 3001 --db ./algovault.db --static ./frontend

clean:
	rm -rf $(BUILD_DIR)

.PHONY: all build run clean
