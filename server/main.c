#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>  // inet_addr
#include "db.h"
#include "handler.h"

#define PORT 8080
#define BUFFER_SIZE 4096

int main() {
    int server_fd, client_fd;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_len = sizeof(client_addr);
    char buffer[BUFFER_SIZE];

    // 1. Создание сокета
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        perror("socket failed");
        return 1;
    }

    // 2. Привязка сокета к адресу и порту
    server_addr.sin_family      = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;  // Принимать с любого интерфейса
    server_addr.sin_port        = htons(PORT); // htons = перевод в сетевой порядок 

    if (bind(server_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {  // Сообщение ОС информации о том, что сокет слушает порт 8080
        perror("bind failed");
        return 1;
    }

    // Начало прослушивания (очередь до 10 клиентов)
    listen(server_fd, 10);
    printf("Server started on port %d\n", PORT);

    // Подключение к PostgreSQL один раз при старте
    PGconn *conn = db_connect();
    if (conn == NULL) {
        fprintf(stderr, "Failed to connect to database\n");
        return 1;
    }
    printf("Connected to database\n");

    // 5. Главный цикл - принятие клиентов
    while (1) {
        // accept() ожидает нового клиента и возвращает дискриптор
        client_fd = accept(server_fd,
                           (struct sockaddr*)&client_addr,
                           &client_len);
        if (client_fd < 0) {
            perror("accept failed");
            continue; // Сервер не падает, а ждет следующего   
        }

        printf("Client connected: %s\n", inet_ntoa(client_addr.sin_addr));
        
        // 6. Чтение команды от клиента
        memset(buffer, 0, BUFFER_SIZE);
        int bytes = recv(client_fd, buffer, BUFFER_SIZE - 1, 0);
        
        if (bytes > 0) {
            // Убирание \n в конце строки
            buffer[strcspn(buffer, "\n")] = 0;

            // 7. Передача команды обработчику, получение ответа
            char response[BUFFER_SIZE];
            handle_command(conn, buffer, response, BUFFER_SIZE);

            // 8. Отправка ответа клиенту
            send(client_fd, response, strlen(response), 0);
        }

        // Закрытие соединения с клиентом
        close(client_fd);
    }

    // Сюда можно попасть, только при ручном завершении сервера
    db_disconnect(conn);
    close(server_fd);
    return 0;
}