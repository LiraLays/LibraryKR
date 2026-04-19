#include <stdio.h>
#include <string.h>
#include "handler.h"
#include "db.h"

// Разбиение строки "CMD|param1|param2" на части
// Возврат количества частей
static int split(char *str, char **parts, int max_parts) {
    int count = 0;
    char *token = strtok(str, "|");
    while (token != NULL && count < max_parts) {
        parts[count++] = token;
        token = strtok(NULL, "|");
    }
    return count;
}

void handle_command(PGconn *conn, char *cmd_str, char *response, int resp_size) {
    char buf[4096];
    strncpy(buf, cmd_str, sizeof(buf)); // копирование, т.к. strtok изменяет строку

    char *parts[10];
    int n = split(buf, parts, 10);

    if (n == 0) {
        snprintf(response, resp_size, "ERROR|Empty command");
        return;
    }

    char *cmd = parts[0];

    if (strcmp(cmd, "GET_BOOKS") == 0) {
        db_get_books(conn, response, resp_size);
    } 
    else if (strcmp(cmd, "GET_BOOK") == 0 && n >= 2) {
        db_get_book(conn, parts[1], response, resp_size);
    } 
    else if (strcmp(cmd, "ADD_BOOK") == 0 && n >= 4) {
        db_add_book(conn, parts[1], parts[2], parts[3], response, resp_size);
    }
    else if (strcmp(cmd, "DELETE_BOOK") == 0 && n >= 2) {
        db_delete_book(conn, parts[1], response, resp_size);
    }
    else if (strcmp(cmd, "LOGIN") == 0 && n >= 3) {
        db_login(conn, parts[1], parts[2], response, resp_size);
    }
    else if (strcmp(cmd, "GET_AUTHORS") == 0) {
        db_get_authors(conn, response, resp_size);
    }
    else {
        snprintf(response, resp_size, "ERROR|Unknown command: %s", cmd);
    }
}
