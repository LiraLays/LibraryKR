#include <stdio.h>
#include <string.h>
#include "db.h"

#define DB_CONN "hostaddr=82.179.140.18 port=5432 dbname=poloskov2406_lib user=mpi password=135a1"

PGconn* db_connect() {
    PGconn *conn = PQconnectdb(DB_CONN);
    if (PQstatus(conn) != CONNECTION_OK) {
        fprintf(stderr, "DB connection error: %s\n", PQerrorMessage(conn));
        PQfinish(conn);
        return NULL;
    }
    return conn;
}

void db_disconnect(PGconn *conn) {
    PQfinish(conn);
}

// Полчение всех книг
void db_get_books(PGconn *conn, char *out, int out_size) {
    PGresult *res = PQexec(conn, 
        "SELECT b.IdBook, b.BookName, a.FullName, b.PublicationYear "
        "FROM Book b JOIN Author a ON b.IdAuthor = a.IdAuthor "
        "ORDER BY b.IdBook");

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    // Собирание ответа: каждая книга = одна строка, разделенная ;
    // Формат: OK|id,name,author,year;id,name,author,year;..
    strcpy(out, "OK|");
    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char row[512];
        snprintf(row, sizeof(row), "%s,%s,%s,%s",
            PQgetvalue(res, i, 0), // IdBook
            PQgetvalue(res, i, 1), // BookName
            PQgetvalue(res, i, 2), // FullName (автор)
            PQgetvalue(res, i, 3) // PublicationYear
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

// Пример полученной строки:
// "OK|1,Война и мир,Толстой,1869;2,Преступление и наказание, Достоевкий,1866"

// Получение информации о книге
void db_get_book(PGconn *conn, const char *id, char *out, int out_size) {
    const char *params[1] = { id };
    PGresult *res = PQexecParams(conn, 
        "SELECT b.IdBook, b.BookName, a.FullName, b.PublicationYear, p.PublisherName "
        "FROM Book b "
        "JOIN Author a ON b.IdAuthor = a.IdAuthor "
        "JOIN Publisher p ON b.IdPublisher = p.IdPublisher "
        "WHERE b.IdBook = $1",
        1, NULL, params, NULL, NULL, 0
    );

    if (PQresultStatus(res) != PGRES_TUPLES_OK || PQntuples(res) == 0) {
        snprintf(out, out_size, "ERROR|Book not found");
    } else {
        snprintf(out, out_size, "OK|%s,%s,%s,%s,%s", 
            PQgetvalue(res, 0, 0), // IdBook
            PQgetvalue(res, 0, 1), // BookName
            PQgetvalue(res, 0, 2), // Author
            PQgetvalue(res, 0, 3), // Year
            PQgetvalue(res, 0, 4) // Publisher
        );
    }
    PQclear(res);
}

// Добавить книгу - использования параметризованного запроса (защита от SQL-инъекций)
void db_add_book(PGconn *conn, const char *name, const char *author_id, const char *year, const char *cost, char *out, int out_size) {
    
    const char* params[4] = { name, author_id, year, cost};
    // $1 $2 $3 - плейсхолдеры для параметровs
    const char *sql = 
    "INSERT INTO Book (BookName, IdAuthor, IdGroup, PublicationYear, IdPublisher, Cost) "
    "VALUES ($1, $2, 1, $3, 1, $4)";

    PGresult *res = PQexecParams(conn, sql,
        4,      // количество параметров
        NULL,   // типы параметров (NULL = определить автоматически)
        params, // значения параметров
        NULL,   // длины (NULL = строки с \0)
        NULL,   // форматы (NULL = текст)
        0);     // формат результата (0 = текст)
    
    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));    
    } else {
        snprintf(out, out_size, "OK|Book added");
    }
    PQclear(res);
}

// Editing book
void db_update_book(PGconn *conn, const char *id, const char *name, const char *author_id, const char *year, const char *cost, char *out, int out_size) {
    const char *params[5] = { name, author_id, year, cost, id };
    PGresult *res = PQexecParams(conn, 
        "UPDATE Book SET BookName=$1, IdAuthor=$2, "
        "PublicationYear=$3, Cost=$4 WHERE IdBook=$5", 
        5, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Book updated");
    PQclear(res);
}

// Удаление книги
void db_delete_book(PGconn *conn, const char *id, char *out, int out_size) {
    const char *params[1] = { id };
    PGresult *res = PQexecParams(conn, 
        "DELETE FROM Book WHERE IdBook = $1",
        1, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Book deleted");
    }
    PQclear(res);
}

// Adding author
void db_add_author(PGconn *conn, const char *name, char *out, int out_size) {
    const char *params[1] = {name};
    PGresult *res = PQexecParams(conn, 
        "INSERT INTO Author (FullName) VALUES ($1)",
        1, NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else 
        snprintf(out, out_size, "OK|Author added");
    PQclear(res);
}

// Editing author
void db_update_author(PGconn *conn, const char *id, const char *name, char *out, int out_size) {
    const char *params[2] = { name, id };
    PGresult *res = PQexecParams(conn,
        "UPDATE Author SET FullName=$1 WHERE IdAuthor=$2",
        2, NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else 
        snprintf(out, out_size, "OK|Author updated");
    PQclear(res);
}

// Deleting author
void db_delete_author(PGconn *conn, const char *id, char *out, int out_size) {
    const char *params[1] = { id };
    PGresult *res = PQexecParams(conn,
        "DELETE FROM Author WHERE IdAuthor=$1",
        1, NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Author deleted");
    PQclear(res);
}

// Авторизация - проверка логина и пароля
// Таблица Employee с полями Login, Password
void db_login(PGconn *conn, const char *login, const char *password, char *out, int out_size) {
    const char *params[2] = { login, password };
    PGresult *res = PQexecParams(conn,
        "SELECT e.idemployee, e.fullname "
        "FROM account a "
        "JOIN employee e ON a.idemployee = e.idemployee "
        "WHERE a.login = $1 AND a.password = $2",
        2, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_TUPLES_OK || PQntuples(res) == 0) {
        snprintf(out, out_size, "ERROR|Invalid login or password");
        PQclear(res);
    } else {
        snprintf(out, out_size, "OK|%s|%s",
            PQgetvalue(res, 0, 0),  // idemployee
            PQgetvalue(res, 0, 1)   // fullname
        );
        PQclear(res);
    }
}

// Get authors
void db_get_authors(PGconn *conn, char *out, int out_size) {
    PGresult *res = PQexec(conn,
        "SELECT IdAuthor, FullName FROM Author ORDER BY FullName");
    
    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    strcpy(out, "OK|");
    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char row[256];
        snprintf(row, sizeof(row), "%s,%s",
            PQgetvalue(res, i, 0),  // IdAuthor
            PQgetvalue(res, i, 1)); // FullName
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}