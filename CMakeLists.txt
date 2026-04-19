cmake_minimum_required(VERSION 3.16)
project(LibraryKR CXX C)

set(CMAKE_C_STANDARD   11)
set(CMAKE_CXX_STANDARD 17)

# ── Выходные файлы в build/bin ──────────────────────
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib")
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib")
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(WEBVIEW_WEBKITGTK_API 6.0)	

# ══════════════════════════════════════════════════════════════
#  SERVER  (чистый C + libpq)
# ══════════════════════════════════════════════════════════════

# Ищем установленный PostgreSQL (libpq + заголовки)
find_package(PostgreSQL REQUIRED)

add_executable(library_server
    server/main.c
    server/db.c
    server/handler.c
)

target_include_directories(library_server PRIVATE
    ${PostgreSQL_INCLUDE_DIRS}
    ${CMAKE_SOURCE_DIR}/server  # чтобы #include "db.h" работал из любого .c
)

target_link_libraries(library_server PRIVATE
    ${PostgreSQL_LIBRARIES}
)

# ══════════════════════════════════════════════════════════════
#  CLIENT  (C++ + WebView)
#  Сюда добавляй свой существующий код для webview/nlohmann
# ══════════════════════════════════════════════════════════════

include(FetchContent)

FetchContent_Declare(
    webview
    GIT_REPOSITORY https://github.com/webview/webview.git
    GIT_TAG        0.12.0
)
FetchContent_MakeAvailable(webview)

FetchContent_Declare(
    json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG        v3.12.0
)
FetchContent_MakeAvailable(json)

add_executable(library_client
    src/main.cpp
)

target_sources(library_client PRIVATE src/main.cpp ui/dist/index_html.h)
target_include_directories(library_client PRIVATE ui/dist)
target_link_libraries(library_client PRIVATE
    webview::core
    nlohmann_json::nlohmann_json
)

# ── Платформо-зависимые зависимости для WebView ───────────────
if(UNIX AND NOT APPLE)
    find_package(PkgConfig REQUIRED)
    pkg_check_modules(GTK3 REQUIRED gtk+-3.0)
    pkg_check_modules(WEBKIT2 REQUIRED webkit2gtk-4.1)
    target_include_directories(library_client PRIVATE
        ${GTK3_INCLUDE_DIRS}
        ${WEBKIT2_INCLUDE_DIRS}
    )
    target_link_libraries(library_client PRIVATE
        ${GTK3_LIBRARIES}
        ${WEBKIT2_LIBRARIES}
    )
endif()
