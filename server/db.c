#include "db.h"
#include <stdio.h>
#include <string.h>

#define DB_CONN "hostaddr=82.179.140.18 port=5432 dbname=poloskov2406_lib user=mpi password=135a1"

// ----------------------------------------------- Connect/Disconnect -----------------------------------------------
PGconn *db_connect() {
    PGconn *conn = PQconnectdb(DB_CONN);
    if (PQstatus(conn) != CONNECTION_OK) {
        fprintf(stderr, "DB connection error: %s\n", PQerrorMessage(conn));
        PQfinish(conn);
        return NULL;
    }
    return conn;
}

void db_disconnect(PGconn *conn) { PQfinish(conn); }

// ----------------------------------------------- Login ----------------------------------------------- 
// Авторизация - проверка логина
// и пароля Таблица Employee с полями Login, Password
void db_login(PGconn *conn, const char *login, const char *password, char *out,
              int out_size) {
    const char *params[2] = {login, password};
    PGresult *res =
        PQexecParams(conn,
                     "SELECT e.idemployee, e.fullname "
                     "FROM account a "
                     "JOIN employee e ON a.idemployee = e.idemployee "
                     "WHERE a.login = $1 AND a.password = $2",
                     2, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_TUPLES_OK || PQntuples(res) == 0) {
        snprintf(out, out_size, "ERROR|Invalid login or password");
        PQclear(res);
    } else {
        snprintf(out, out_size, "OK|%s|%s", PQgetvalue(res, 0, 0), // idemployee
                 PQgetvalue(res, 0, 1)                             // fullname
        );
        PQclear(res);
    }
}

// ----------------------------------------------- Books ----------------------------------------------- 
// Полчение всех книг
void db_get_books(PGconn *conn, char *out, int out_size) {
    PGresult *res =
        PQexec(conn, "SELECT b.idbook, b.bookname, bgr.groupname, a.fullname, "
                     "b.publicationyear, p.publishername, b.cost "
                     "FROM book b "
                     "JOIN author a ON b.idauthor = a.idauthor "
                     "JOIN publisher p ON b.idpublisher = p.idpublisher "
                     "JOIN bookgroup bgr ON b.idgroup = bgr.idgroup "
                     "ORDER BY b.idbook");

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
        snprintf(row, sizeof(row), "%s,%s,%s,%s,%s,%s,%s",
                 PQgetvalue(res, i, 0), // IdBook
                 PQgetvalue(res, i, 1), // BookName
                 PQgetvalue(res, i, 2), // GroupName
                 PQgetvalue(res, i, 3), // FullName (автор)
                 PQgetvalue(res, i, 4), // PublicationYear
                 PQgetvalue(res, i, 5), // publishername
                 PQgetvalue(res, i, 6)  // Cost
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
    const char *params[1] = {id};
    PGresult *res =
        PQexecParams(conn,
                     "SELECT b.idbook, b.bookname, bgr.groupname, a.fullname, "
                     "b.publicationyear, p.publishername, b.cost "
                     "FROM book b "
                     "JOIN author a ON b.idauthor = a.idauthor "
                     "JOIN publisher p ON b.idpublisher = p.idpublisher "
                     "JOIN bookgroup bgr ON b.idgroup = bgr.idgroup "
                     "WHERE b.idbook = $1",
                     1, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_TUPLES_OK || PQntuples(res) == 0) {
        snprintf(out, out_size, "ERROR|Book not found");
    } else {
        snprintf(out, out_size, "OK|%s,%s,%s,%s,%s,%s,%s",
                 PQgetvalue(res, 0, 0), // IdBook
                 PQgetvalue(res, 0, 1), // BookName
                 PQgetvalue(res, 0, 2), // GroupName
                 PQgetvalue(res, 0, 3), // Author
                 PQgetvalue(res, 0, 4), // Year
                 PQgetvalue(res, 0, 5),  // Publisher
                 PQgetvalue(res, 0, 6)  // Cost
        );
    }
    PQclear(res);
}

// Добавить книгу - использования параметризованного запроса (защита от
// SQL-инъекций)
void db_add_book(PGconn *conn, const char *author_id, const char *group_id,
                 const char *name, const char *year, const char *publisher_id,
                 const char *cost, char *out, int out_size) {

    const char *params[6] = {author_id, group_id, name, year, publisher_id, cost};
    // $1 $2 $3 - плейсхолдеры для параметровs
    const char *sql = "INSERT INTO book (idauthor, idgroup, bookname, "
                      "publicationyear, idpublisher, cost) "
                      "VALUES ($1, $2, $3, $4, $5, $6)";

    PGresult *res =
        PQexecParams(conn, sql,
                     6,    // количество параметров
                     NULL, // типы параметров (NULL = определить автоматически)
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
void db_update_book(PGconn *conn, const char *id, const char *author_id,
                    const char *group_id, const char *name, const char *year,
                    const char *publisher_id, const char *cost, char *out,
                    int out_size) {
    const char *params[7] = {author_id, group_id, name, year, publisher_id, cost, id};
    const char *sql = "UPDATE book SET idauthor=$1, idgroup=$2, "
                      "bookname=$3, publicationyear=$4, idpublisher=$5, cost=$6 "
                      "WHERE idbook=$7";
    PGresult *res = PQexecParams(conn, sql, 7, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Book updated");
    PQclear(res);
}

// Удаление книги
void db_delete_book(PGconn *conn, const char *id, char *out, int out_size) {
    const char *params[1] = {id};
    PGresult *res = PQexecParams(conn, "DELETE FROM book WHERE idbook = $1", 1,
                                 NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Book deleted");
    }
    PQclear(res);
}

// ----------------------------------------------- Authors ----------------------------------------------- 
// Get authors
void db_get_authors(PGconn *conn, char *out, int out_size) {
    PGresult *res =
        PQexec(conn, "SELECT idauthor, fullname FROM author ORDER BY fullname");

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    strcpy(out, "OK|");
    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char row[256];
        snprintf(row, sizeof(row), "%s,%s", PQgetvalue(res, i, 0), // IdAuthor
                 PQgetvalue(res, i, 1));                           // FullName
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

// Adding author
void db_add_author(PGconn *conn, const char *name, char *out, int out_size) {
    const char *params[1] = {name};
    PGresult *res =
        PQexecParams(conn, "INSERT INTO author (fullname) VALUES ($1)", 1, NULL,
                     params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Author added");
    PQclear(res);
}

// Editing author
void db_update_author(PGconn *conn, const char *id, const char *name, char *out,
                      int out_size) {
    const char *params[2] = {name, id};
    PGresult *res =
        PQexecParams(conn, "UPDATE author SET fullname=$1 WHERE idauthor=$2", 2,
                     NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Author updated");
    PQclear(res);
}

// Deleting author
void db_delete_author(PGconn *conn, const char *id, char *out, int out_size) {
    const char *params[1] = {id};
    PGresult *res = PQexecParams(conn, "DELETE FROM author WHERE idauthor=$1",
                                 1, NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Author deleted");
    PQclear(res);
}

// ----------------------------------------------- Readers -----------------------------------------------

// Get readers
void db_get_readers(PGconn *conn, char *out, int out_size) {
    PGresult *res = PQexec(
        conn,
        "SELECT r.idclient, r.fullname, e.enterprisename, "
        "r.workphone "
        "FROM reader r "
        "JOIN enterprise e ON r.identerprise = e.identerprise "
        "ORDER BY r.idclient");

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
                 PQgetvalue(res, i, 0), // idclient
                 PQgetvalue(res, i, 1), // fullname
                 PQgetvalue(res, i, 2), // enterprisename
                 PQgetvalue(res, i, 3) //  workphone
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

// Get reader
void db_get_reader(PGconn *conn, const char *id, char *out, int out_size) { 
    const char *params[1] = {id};
    const char *sql = "SELECT r.idclient, r.fullname, e.enterprisename, "
                      "r.workphone "
                      "FROM reader r "
                      "JOIN enterprise e ON r.identerprise = e.identerprise "
                      "WHERE r.idclient = $1";

    PGresult *res = PQexecParams(conn, sql,
         1, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_TUPLES_OK || PQntuples(res) == 0) {
        snprintf(out, out_size, "ERROR|Reader not found");
    } else {
        snprintf(out, out_size, "OK|%s,%s,%s,%s",
                 PQgetvalue(res, 0, 0), // idclient
                 PQgetvalue(res, 0, 1), // fullname
                 PQgetvalue(res, 0, 2), // enterprisename
                 PQgetvalue(res, 0, 3)  // workphone
        );
    }
    PQclear(res);
}

// Add reader
void db_add_reader(PGconn *conn, const char *name, const char *enterprise_id, 
    const char *workphone ,char *out, int out_size) {
    
    const char *params[3] = {name, enterprise_id, workphone};
    const char *sql = "INSERT INTO reader "
                      "(fullname, identerprise, workphone) "
                      "VALUES ($1, $2, $3)";

    PGresult *res =
        PQexecParams(conn, sql,
                     3,    // количество параметров
                     NULL, // типы параметров (NULL = определить автоматически)
                     params, // значения параметров
                     NULL,   // длины (NULL = строки с \0)
                     NULL,   // форматы (NULL = текст)
                     0);     // формат результата (0 = текст)

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Reader added");
    }
    PQclear(res);
}
// Update reader
void db_update_reader(PGconn *conn, const char *id, const char *name, const char *enterprise_id,
    const char *workphone, char *out, int out_size) {

    const char *params[4] = {name, enterprise_id, workphone, id};
    const char *sql = "UPDATE reader "
                      "SET fullname=$1, identerprise=$2, workphone=$3 "
                      "WHERE idclient = $4";

    PGresult *res =
        PQexecParams(conn, sql,
                     4,      // parameters count
                     NULL,   // parameters type (NULL = auto)
                     params, // paramters values
                     NULL,   // length (NULL = string starting with \0)
                     NULL,   // formats (NULL = text)
                     0);     // result format (0 = text)

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Reader updated");
    }
    PQclear(res);
}
// Delete reader
void db_delete_reader(PGconn *conn, const char *id, char *out, int out_size) {
    
    const char *params[1] = {id};
    const char *sql = "DELETE FROM reader "
                      "WHERE idclient = $1";

    PGresult *res =
        PQexecParams(conn, sql,
                     1,      // parameters count
                     NULL,   // parameters type (NULL = auto)
                     params, // paramters values
                     NULL,   // length (NULL = string starting with \0)
                     NULL,   // formats (NULL = text)
                     0);     // result format (0 = text)

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Reader deleted");
    }
    PQclear(res);
}

// ----------------------------------------------- Enterprise -----------------------------------------------

// Get enterprises
void db_get_enterprises(PGconn *conn, char *out, int out_size) {

    const char *sql = "SELECT identerprise, enterprisename " 
                      "FROM enterprise "
                      "ORDER BY enterprisename";
    
    PGresult *res = PQexec(conn, sql);

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
                 PQgetvalue(res, i, 0), // identerprise
                 PQgetvalue(res, i, 1)  // enterprisename
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

// Get enterprise
void db_get_enterprise(PGconn *conn, const char *id, char *out, int out_size) {

    const char *params[1] = {id};
    const char *sql = "SELECT e.identerprise, e.enterprisename "
                      "FROM enterprise e "
                      "WHERE e.identerprise = $1";

    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);

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
                 PQgetvalue(res, i, 0), // identerprise
                 PQgetvalue(res, i, 1)  // enterprisename
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

// Add enterprise
void db_add_enterprise(PGconn *conn, const char *enterprise, char *out, int out_size) {
    const char *params[1] = {enterprise};
    const char *sql = "INSERT INTO enterprise (enterprisename) " 
                      "VALUES ($1)";
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Enterprise added");
    PQclear(res);
}
// Update enterprise
void db_update_enterprise(PGconn *conn, const char *id, const char *enterprise, char *out, int out_size) {
    const char *params[2] = { enterprise, id };
    const char *sql = "UPDATE enterprise "
                      "SET enterprisename=$1 "
                      "WHERE identerprise=$2";
    PGresult *res = PQexecParams(conn, sql, 2, NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Enterprise updated");
    PQclear(res);
}
// Delete enterprise
void db_delete_enterprise(PGconn *conn, const char *id, char *out, int out_size) {
    const char *params[1] = {id};
    const char *sql = "DELETE FROM enterprise "
                      "WHERE identerprise=$1";
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Enterprise deleted");
    PQclear(res);
}

// ----------------------------------------------- BookGroup -----------------------------------------------

// Get bookgroups
void db_get_bookgroups(PGconn *conn, char *out, int out_size) {
    const char *sql = "SELECT bgr.idgroup, bgr.groupname "
                      "FROM bookgroup bgr "
                      "ORDER BY bgr.groupname";

    PGresult *res = PQexec(conn, sql);

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    strcpy(out, "OK|");
    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char row[512];
        snprintf(row, sizeof(row), "%s,%s",
                 PQgetvalue(res, i, 0), // idgroup
                 PQgetvalue(res, i, 1) // groupname
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

// Get bookgroup
void db_get_bookgroup(PGconn *conn, const char *id, char *out, int out_size) {

    const char *params[1] = {id};
    const char *sql = "SELECT bgr.idgroup, bgr.groupname "
                      "FROM bookgroup bgr "
                      "WHERE bgr.idgroup = $1";

    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);

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
                 PQgetvalue(res, i, 0), // idgroup
                 PQgetvalue(res, i, 1)  // groupname
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

// Add bookgroup
void db_add_bookgroup(PGconn *conn, const char *groupname, char *out,
                      int out_size) {
    const char *params[1] = {groupname};
    const char *sql = "INSERT INTO bookgroup (groupname) "
                      "VALUES ($1)";
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Bookgroup added");
    PQclear(res);
}
// Update bookgroup
void db_update_bookgroup(PGconn *conn, const char *id, const char *groupname,
                         char *out, int out_size) {
    const char *params[2] = {groupname, id};
    const char *sql = "UPDATE bookgroup "
                      "SET groupname=$1 "
                      "WHERE idgroup=$2";
    PGresult *res = PQexecParams(conn, sql, 2, NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Bookgroup updated");
    PQclear(res);
}
// Delete bookgroup
void db_delete_bookgroup(PGconn *conn, const char *id, char *out,
                         int out_size) {
    const char *params[1] = {id};
    const char *sql = "DELETE FROM bookgroup "
                      "WHERE idgroup=$1";
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Bookgroup deleted");
    PQclear(res);
}
// ----------------------------------------------- Publishers -----------------------------------------------

// Get publishers
void db_get_publishers(PGconn *conn, char *out, int out_size) {

    const char *sql = "SELECT pbl.idpublisher, pbl.publishername "
                      "FROM publisher pbl "
                      "ORDER BY pbl.publishername";

    PGresult *res = PQexec(conn, sql);

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    strcpy(out, "OK|");
    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char row[512];
        snprintf(row, sizeof(row), "%s,%s", PQgetvalue(res, i, 0), // idgroup
                 PQgetvalue(res, i, 1)                             // groupname
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

// Get publisher
void db_get_publisher(PGconn *conn, const char *id, char *out, int out_size) {

    const char *params[1] = {id};
    const char *sql = "SELECT pbl.idpublisher, pbl.publishername "
                      "FROM publisher pbl "
                      "WHERE pbl.idpublisher = $1";

    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);

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
                PQgetvalue(res, i, 0), // idpublisher
                PQgetvalue(res, i, 1)  // publishername
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

// Add publisher
void db_add_publisher(PGconn *conn, const char *publishername, char *out,
                      int out_size) {
    const char *params[1] = {publishername};
    const char *sql = "INSERT INTO publisher (publishername) "
                      "VALUES ($1)";
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Publisher added");
    PQclear(res);
}
// Update publisher
void db_update_publisher(PGconn *conn, const char *id,
                         const char *publishername, char *out, int out_size) {
    const char *params[2] = {publishername, id};
    const char *sql = "UPDATE publisher "
                      "SET publishername=$1 "
                      "WHERE idpublisher=$2";
    PGresult *res = PQexecParams(conn, sql, 2, NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Publisher updated");
    PQclear(res);
}
// Delete publisher
void db_delete_publisher(PGconn *conn, const char *id, char *out,
                         int out_size) {
    const char *params[1] = {id};
    const char *sql = "DELETE FROM publisher "
                      "WHERE idpublisher=$1";
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);
    if (PQresultStatus(res) != PGRES_COMMAND_OK)
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    else
        snprintf(out, out_size, "OK|Publisher deleted");
    PQclear(res);
}

// ----------------------------------------------- BookIssues -----------------------------------------------

// Get bookissues
void db_get_bookissues(PGconn *conn, char *out, int out_size) {
    const char *sql = "SELECT bi.idorder, r.fullname, b.bookname, bi.issuedate, "
                "bi.duedate, bi.returndate "
                "FROM bookissue bi "
                "JOIN reader r ON bi.idclient = r.idclient "
                "JOIN book b ON bi.idbook = b.idbook "
                "ORDER BY bi.idorder";
    PGresult *res = PQexec(conn, sql);

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    strcpy(out, "OK|");
    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char row[512];
        snprintf(row, sizeof(row), "%s,%s,%s,%s,%s,%s",
                 PQgetvalue(res, i, 0), // idorder
                 PQgetvalue(res, i, 1), // fullname
                 PQgetvalue(res, i, 2), // bookname
                 PQgetvalue(res, i, 3), // issuedate
                 PQgetvalue(res, i, 4), // duedate
                 PQgetvalue(res, i, 5)  // returndate
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

// Get bookissue
void db_get_bookissue(PGconn *conn, const char *id, char *out, int out_size) {

    const char *params[1] = { id };
    const char *sql = "SELECT bi.idorder, r.fullname, b.bookname, bi.issuedate, "
                "bi.duedate, bi.returndate "
                "FROM bookissue bi "
                "JOIN reader r ON bi.idclient = r.idclient "
                "JOIN book b ON bi.idbook = b.idbook "
                "WHERE bi.idorder = $1";
    
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    strcpy(out, "OK|");
    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char row[512];
        snprintf(row, sizeof(row), "%s,%s,%s,%s,%s,%s",
                 PQgetvalue(res, i, 0), // idorder
                 PQgetvalue(res, i, 1), // fullname
                 PQgetvalue(res, i, 2), // bookname
                 PQgetvalue(res, i, 3), // issuedate
                 PQgetvalue(res, i, 4), // duedate
                 PQgetvalue(res, i, 5) // returndate
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

// Add bookissue
void db_add_bookissue(PGconn *conn, const char *client_id, const char *book_id,
                      const char *issuedate, const char *duedate,
                      const char *returndate, char *out, int out_size) {
    const char *params[5] = {client_id, book_id, issuedate, duedate, returndate};
    const char *sql = "INSERT INTO bookissue (idclient, idbook, "
                      "issuedate, duedate, returndate) "
                      "VALUES ($1, $2, $3, $4, $5)";
    
    PGresult *res = PQexecParams(conn, sql, 5, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Bookissue added");
    }
    PQclear(res);
}
// Update bookissue
void db_update_bookissue(PGconn *conn, const char *id, const char *client_id,
                         const char *book_id, const char *issuedate,
                         const char *duedate, const char *returndate, char *out,
                         int out_size) {
    const char *params[6] = {client_id, book_id, issuedate, duedate,
                             returndate, id};
    const char *sql = "UPDATE bookissue "
                      "SET idclient=$1, idbook=$2, issuedate=$3, "
                      "duedate=$4, returndate=$5 "
                      "WHERE idorder=$6";
    PGresult *res = PQexecParams(conn, sql, 6, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Bookissue updated");
    }
    PQclear(res);
}
// Delete bookissue
void db_delete_bookissue(PGconn *conn, const char *id, char *out, int out_size) {
    const char *params[1] = {id};
    const char *sql = "DELETE FROM bookissue "
                      "WHERE idorder = $1";
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Bookissue deleted");
    }
    PQclear(res);
}

// ----------------------------------------------- Library -----------------------------------------------

void db_get_libraries(PGconn *conn, char *out, int out_size) 
{
    const char *sql = "SELECT l.idlibrary, l.libraryname, l.address "
                      "FROM library l "
                      "ORDER BY l.idlibrary";
    PGresult *res = PQexec(conn, sql);

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    strcpy(out, "OK|");
    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char row[512];
        snprintf(row, sizeof(row), "%s,%s,%s",
                 PQgetvalue(res, i, 0), // idlibrary
                 PQgetvalue(res, i, 1), // libraryname
                 PQgetvalue(res, i, 2)  // address
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

void db_get_library(PGconn *conn, const char *id, char *out, int out_size) 
{
    const char *params[1] = { id };
    const char *sql = "SELECT l.idlibrary, l.libraryname, l.address "
                      "FROM library l "
                      "WHERE l.idlibrary = $1";
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    strcpy(out, "OK|");
    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char row[512];
        snprintf(row, sizeof(row), "%s,%s,%s",
                 PQgetvalue(res, i, 0), // idlibrary
                 PQgetvalue(res, i, 1), // libraryname
                 PQgetvalue(res, i, 2)  // address
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

void db_add_library(PGconn *conn, const char *name, const char *address, char *out, int out_size) 
{
    const char *params[2] = {name, address};
    const char *sql = "INSERT INTO library " 
                      "(libraryname, address) "
                      "VALUES ($1, $2)";

    PGresult *res = PQexecParams(conn, sql, 2, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Library added");
    }
    PQclear(res);
}

void db_update_library(PGconn *conn, const char *id, const char *name,
                       const char *address, char *out, int out_size)
{
    const char *params[3] = {name, address, id};
    const char *sql = "UPDATE library "
                      "SET libraryname=$1, address=$2 "
                      "WHERE idlibrary=$3";

    PGresult *res = PQexecParams(conn, sql, 3, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Library updated");
    }
    PQclear(res);
}
void db_delete_library(PGconn *conn, const char *id, char *out, int out_size) 
{
    const char *params[1] = {id};
    const char *sql = "DELETE FROM library "
                      "WHERE idlibrary = $1";
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Library deleted");
    }
    PQclear(res);
}

// ----------------------------------------------- Employee -----------------------------------------------

void db_get_employees(PGconn *conn, char *out, int out_size) 
{
    const char *sql = "SELECT emp.idemployee, emp.fullname, emp.position, "
                      "l.libraryname, emp.phone "
                      "FROM employee emp "
                      "JOIN library l ON emp.idlibrary = l.idlibrary "
                      "ORDER BY emp.idemployee";
    PGresult *res = PQexec(conn, sql);

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    strcpy(out, "OK|");
    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char row[512];
        snprintf(row, sizeof(row), "%s,%s,%s,%s,%s",
                 PQgetvalue(res, i, 0), // idemployee
                 PQgetvalue(res, i, 1), // fullname
                 PQgetvalue(res, i, 2), // position
                 PQgetvalue(res, i, 3), // libraryname
                 PQgetvalue(res, i, 4)  // phone
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

void db_get_employee(PGconn *conn, const char *id, char *out, int out_size) 
{
    const char *params[1] = { id };
    const char *sql = "SELECT emp.idemployee, emp.fullname, emp.position, "
                      "l.libraryname, emp.phone "
                      "FROM employee emp "
                      "JOIN library l ON emp.idlibrary = l.idlibrary "
                      "WHERE emp.idemployee=$1";
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    strcpy(out, "OK|");
    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char row[512];
        snprintf(row, sizeof(row), "%s,%s,%s,%s,%s",
                 PQgetvalue(res, i, 0), // idemployee
                 PQgetvalue(res, i, 1), // fullname
                 PQgetvalue(res, i, 2), // position
                 PQgetvalue(res, i, 3), // libraryname
                 PQgetvalue(res, i, 4)  // phone
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}

void db_add_employee(PGconn *conn, const char *name, const char *postion,
                     const char *library_id, const char *phone, char *out,
                     int out_size) 
{
    const char *params[4] = {name, postion, library_id, phone};
    const char *sql = "INSERT INTO employee "
                      "(fullname, position, idlibrary, phone) "
                      "VALUES ($1, $2, $3, $4)";

    PGresult *res = PQexecParams(conn, sql, 4, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Employee added");
    }
    PQclear(res);
}

void db_update_employee(PGconn *conn, const char *id, const char *name,
                        const char *postion, const char *library_id,
                        const char *phone, char *out, int out_size) 
{
    const char *params[5] = {name, postion, library_id, phone, id};
    const char *sql = "UPDATE employee "
                      "SET fullname=$1, position=$2, idlibrary=$3, phone=$4 "
                      "WHERE idemployee=$5";

    PGresult *res = PQexecParams(conn, sql, 5, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Employee added");
    }
    PQclear(res);
}
void db_delete_employee(PGconn *conn, const char *id, char *out, int out_size) 
{
    const char *params[1] = {id};
    const char *sql = "DELETE FROM employee "
                      "WHERE idemployee = $1";
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Employee deleted");
    }
    PQclear(res);
}
// ----------------------------------------------- Account -----------------------------------------------

void db_get_accounts(PGconn *conn, char *out, int out_size) 
{
    const char *sql = "SELECT ac.idaccount, emp.fullname, ac.login, "
                      "ac.password "
                      "FROM account ac "
                      "JOIN employee emp ON ac.idemployee = emp.idemployee "
                      "ORDER BY ac.idaccount";
    PGresult *res = PQexec(conn, sql);

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    strcpy(out, "OK|");
    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char row[512];
        snprintf(row, sizeof(row), "%s,%s,%s,%s",
                 PQgetvalue(res, i, 0), // idaccount
                 PQgetvalue(res, i, 1), // fullname
                 PQgetvalue(res, i, 2), // login
                 PQgetvalue(res, i, 3)  // password
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}
void db_get_account(PGconn *conn, const char *id, char *out, int out_size) 
{
    const char *params[1] = { id };
    const char *sql = "SELECT ac.idaccount, emp.fullname, ac.login, "
                      "ac.password "
                      "FROM account ac "
                      "JOIN employee emp ON ac.idemployee = emp.idemployee "
                      "WHERE ac.idaccount=$1";
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    strcpy(out, "OK|");
    int rows = PQntuples(res);
    for (int i = 0; i < rows; i++) {
        char row[512];
        snprintf(row, sizeof(row), "%s,%s,%s,%s",
                 PQgetvalue(res, i, 0), // idaccount
                 PQgetvalue(res, i, 1), // fullname
                 PQgetvalue(res, i, 2), // login
                 PQgetvalue(res, i, 3)  // password
        );
        strncat(out, row, out_size - strlen(out) - 1);
        if (i < rows - 1)
            strncat(out, ";", out_size - strlen(out) - 1);
    }
    PQclear(res);
}
void db_add_account(PGconn *conn, const char *employee_id, const char *login,
                    const char *password, char *out, int out_size) 
{
    const char *params[3] = {employee_id, login, password};
    const char *sql = "INSERT INTO account "
                      "(idemployee, login, password) "
                      "VALUES ($1, $2, $3)";

    PGresult *res = PQexecParams(conn, sql, 3, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Account added");
    }
    PQclear(res);
}
void db_update_account(PGconn *conn, const char *id, const char *employee_id,
                       const char *login, const char *password, char *out,
                       int out_size) 
{
    const char *params[4] = {employee_id, login, password, id};
    const char *sql = "UPDATE account "
                      "SET idemployee=$1, login=$2, password=$3 "
                      "WHERE idaccount=$4";

    PGresult *res = PQexecParams(conn, sql, 4, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Account updated");
    }
    PQclear(res);
}
void db_delete_account(PGconn *conn, const char *id, char *out, int out_size) 
{
    const char *params[1] = {id};
    const char *sql = "DELETE FROM account "
                      "WHERE idaccount = $1";
    PGresult *res = PQexecParams(conn, sql, 1, NULL, params, NULL, NULL, 0);

    if (PQresultStatus(res) != PGRES_COMMAND_OK) {
        snprintf(out, out_size, "ERROR|%s", PQerrorMessage(conn));
    } else {
        snprintf(out, out_size, "OK|Account deleted");
    }
    PQclear(res);
}