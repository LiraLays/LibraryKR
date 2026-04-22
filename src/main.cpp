#include <iostream>
#include <string>
#include <sstream>
#include <nlohmann/json.hpp>
#include "webview/webview.h"
#include "index_html.h"

// Headers for TCP sockets
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>

using json = nlohmann::json;

#define SERVER_HOST "127.0.0.1"
#define SERVER_PORT 8080
#define BUFFER_SIZE 4096

// Sending command to C-server and returning answer in string format
// Example: send_to_server("GET_BOOKS") -> "OK|1,Война и мир,Толстой,1869"
std::string send_to_server(const std::string& command) {
    // 1. Creating socket
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0)
        return "ERROR|Failed to create socket";

    // 2. Filling server adress
    struct sockaddr_in server_addr{};
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(SERVER_PORT);
    inet_pton(AF_INET, SERVER_HOST, &server_addr.sin_addr);

    // 3. Connect
    if (connect(sock, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        close(sock);
        return "ERROR|Cannot connect to server";
    }

    // 4. Sending command
    std::string msg = command + "\n";
    send(sock, msg.c_str(), msg.size(), 0);

    // 5. Reading answer
    char buffer[BUFFER_SIZE] = {};
    recv(sock, buffer, BUFFER_SIZE - 1, 0);
    close(sock);

    // Deleting '\n' at the end
    std::string response(buffer);
    if (!response.empty() && response.back() == '\n')
        response.pop_back();

    return response;
}

// Parsing string by delimeter & returning vector containing parts
// Example: split("a|b|c", '|') -> ["a", "b", "c"]
std::vector<std::string> split(const std::string& s, char delim) {
    std::vector<std::string> result;
    std::stringstream ss(s);
    std::string token;
    while (std::getline(ss, token, delim))
        result.push_back(token);
    return result;
}

// Converting server answer to JSON for JS
// Example: "OK|1,Книга,Автор,2020;2,Книга2,Автор2,2021" 
// -> {"status":"ok", "data":[{"id": "1", "name": "Книга", ...}, { ... }, ... ]} 
json parse_response(const std::string& response) {
    auto parts = split(response, '|');

    // Status - first part
    std::string status = parts.empty() ? "error" : parts[0];

    if (status == "ERROR") {
        return {
            {"status", "error"},
            {"message", parts.size() > 1 ? parts[1] : "Unknown error"}
        };
    }

    if (parts.size() == 3) {
        // Проверяем что parts[1] это число — значит это ответ LOGIN
        bool is_number = !parts[1].empty() && 
                         std::all_of(parts[1].begin(), parts[1].end(), ::isdigit);
        if (is_number) {
            return {
                {"status", "ok"},
                {"id",     parts[1]},
                {"name",   parts[2]}
            };
        }
    }

    // Data - all after first '|'
    std::string data_str = parts.size() > 1 ? parts[1] : "";

    // If data is empty
    if (data_str.empty())
        return {{"status", "ok"}, {"data", json::array()}};

    // Each data string is divided ';'
    // Each field in string divided ','
    auto rows = split(data_str, ';');
    json data = json::array();

    for (auto& row : rows) {
        auto fields = split(row, ',');
        // Book: id, name, author, year
        if (fields.size() >= 4) {
            data.push_back({
                {"id",     fields[0]},
                {"name",   fields[1]},
                {"author", fields[2]},
                {"year",   fields[3]}
            });
        }
    }

    return {{"status", "ok"}, {"data", data}};
}

#ifdef _WIN32
int WINAPI WinMain(HINSTANCE /*hInst*/, HINSTANCE /*hPrevInst*/,
                   LPSTR /*lpCmdLine*/, int /*nCmdShow*/)
#else

int main() {
    try {
        webview::webview main_window(false, nullptr);
        main_window.set_title("Library");
        main_window.set_size(1280, 720, WEBVIEW_HINT_NONE);

        // Old ping leave for tests
        main_window.bind("ping", [&](const std::string& args_str) -> std::string { 
            json args = json::parse(args_str);
            std::cout << "Ping from UI: " << args[0] << std::endl;
            json result = {{"code", 200}};
            return result.dump();
        });

        // New binding - startpoint for all commands
        main_window.bind("sendCommand", [&](const std::string& args_str) -> std::string {
            // WebView always send arguments as JSON-array
            // window.sendCommand("GET_BOOKS") -> args_str = '["GET_BOOKS"]'
            json args = json::parse(args_str);

            if (args.empty() || !args[0].is_string()) {
                return json{{"status", "error"}, {"message", "No command"}}.dump();
            }

            std::string command = args[0].get<std::string>();
            std::cout << "[client] Sending command: " << command << std::endl;
            std::string raw = send_to_server(command);
            std::cout << "[client] Raw response: " << raw << std::endl;
            json result = parse_response(raw);
            return result.dump();
        });

        main_window.set_html(INDEX_HTML);
        main_window.run();
        
    } catch (const webview::exception &e) {
        std::cerr << e.what() << '\n';
        return 1;
    }

    return 0;
}

#endif
