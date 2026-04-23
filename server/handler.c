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

    // Books operations
    
    if (strcmp(cmd, "GET_BOOKS") == 0)
        db_get_books(conn, response, resp_size);
    
    else if (strcmp(cmd, "GET_BOOK") == 0 && n >= 2)
        db_get_book(conn, parts[1], response, resp_size);
    
    else if (strcmp(cmd, "ADD_BOOK") == 0 && n >= 7)
        db_add_book(conn, parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], response, resp_size);

    else if (strcmp(cmd, "UPDATE_BOOK") == 0 && n >= 8)
        db_update_book(conn, parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], parts[7], response, resp_size);

    else if (strcmp(cmd, "DELETE_BOOK") == 0 && n >= 2)
        db_delete_book(conn, parts[1], response, resp_size);
    
    // Login operations
    
    else if (strcmp(cmd, "LOGIN") == 0 && n >= 3)
        db_login(conn, parts[1], parts[2], response, resp_size);
    
    // Authors operations
    
    else if (strcmp(cmd, "GET_AUTHORS") == 0)
        db_get_authors(conn, response, resp_size);
    
    else if (strcmp(cmd, "ADD_AUTHOR") == 0 && n >= 2)
        db_add_author(conn, parts[1], response, resp_size);
    
    else if (strcmp(cmd, "UPDATE_AUTHOR") == 0 && n >= 3)
        db_update_author(conn, parts[1], parts[2], response, resp_size);
    
    else if (strcmp(cmd, "DELETE_AUTHOR") == 0 && n >= 2)
        db_delete_author(conn, parts[1], response, resp_size);
    
    // Reader operations
    
    else if (strcmp(cmd, "GET_READERS") == 0)
        db_get_readers(conn, response, resp_size);
    
    else if (strcmp(cmd, "GET_READER") == 0 && n >= 2)
        db_get_reader(conn, parts[1], response, resp_size);
    
    else if (strcmp(cmd, "ADD_READER") == 0 && n >= 3)
        db_add_reader(conn, parts[1], parts[2], parts[3], response, resp_size);
    
    else if (strcmp(cmd, "UPDATE_READER") == 0 && n >= 4)
        db_update_reader(conn, parts[1], parts[2], parts[3], parts[4], response, resp_size);
    
    else if (strcmp(cmd, "DELETE_READER") == 0 && n >= 2)
        db_delete_reader(conn, parts[1], response, resp_size);
    
    // Enterprise operations
    
    else if (strcmp(cmd, "GET_ENTERPEISES") == 0)
        db_get_enterprises(conn, response, resp_size);

    else if (strcmp(cmd, "GET_ENTERPEISE") == 0 && n >= 2)
        db_get_enterprise(conn, parts[1], response, resp_size);

    else if (strcmp(cmd, "ADD_ENTERPEISE") == 0 && n >= 2)
        db_add_enterprise(conn, parts[1], response, resp_size);

    else if (strcmp(cmd, "UPDATE_ENTERPEISE") == 0 && n >= 3)
        db_update_enterprise(conn, parts[1], parts[2], response, resp_size);

    else if (strcmp(cmd, "DELETE_ENTERPEISE") == 0 && n >= 2)
        db_delete_enterprise(conn, parts[1], response, resp_size);

    // Bookgroups operations
    else if (strcmp(cmd, "GET_BOOKGROUPS") == 0)
        db_get_bookgroups(conn, response, resp_size);

    else if (strcmp(cmd, "GET_BOOKGROUP") == 0 && n >= 2)
        db_get_bookgroup(conn, parts[1], response, resp_size);

    else if (strcmp(cmd, "ADD_BOOKGROUP") == 0 && n >= 2)
        db_add_bookgroup(conn, parts[1], response, resp_size);

    else if (strcmp(cmd, "UPDATE_BOOKGROUP") == 0 && n >= 3)
        db_update_bookgroup(conn, parts[1], parts[2], response, resp_size);

    else if (strcmp(cmd, "DELETE_BOOKGROUP") == 0 && n >= 2)
        db_delete_bookgroup(conn, parts[1], response, resp_size);

    // Publishers operations
    else if (strcmp(cmd, "GET_PUBLISHERS") == 0)
        db_get_publishers(conn, response, resp_size);

    else if (strcmp(cmd, "GET_PUBLISHER") == 0 && n >= 2)
        db_get_publisher(conn, parts[1], response, resp_size);

    else if (strcmp(cmd, "ADD_PUBLISHER") == 0 && n >= 2)
        db_add_publisher(conn, parts[1], response, resp_size);

    else if (strcmp(cmd, "UPDATE_PUBLISHER") == 0 && n >= 3)
        db_update_publisher(conn, parts[1], parts[2], response, resp_size);

    else if (strcmp(cmd, "DELETE_PUBLISHER") == 0 && n >= 2)
        db_delete_publisher(conn, parts[1], response, resp_size);

    // Bookissue operations
    else if (strcmp(cmd, "GET_BOOKISSUES") == 0)
        db_get_bookissues(conn, response, resp_size);

    else if (strcmp(cmd, "GET_BOOKISSUE") == 0 && n >= 2)
        db_get_bookissue(conn, parts[1], response, resp_size);

    else if (strcmp(cmd, "ADD_BOOKISSUE") == 0 && n >= 6)
        db_add_bookissue(conn, parts[1], parts[2], parts[3], parts[4], parts[5],
                         response, resp_size);

    else if (strcmp(cmd, "UPDATE_BOOKISSUE") == 0 && n >= 7)
        db_update_bookissue(conn, parts[1], parts[2], parts[3], parts[4],
                            parts[5], parts[6], response, resp_size);

    else if (strcmp(cmd, "DELETE_BOOKISSUE") == 0 && n >= 2)
        db_delete_bookissue(conn, parts[1], response, resp_size);

    // OTHER
    else
        snprintf(response, resp_size, "ERROR|Unknown command: %s", cmd);
}
