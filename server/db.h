#ifndef DB_H
#define DB_H

#include <libpq-fe.h>

// Connect / disconnect
PGconn* db_connect();
void db_disconnect(PGconn *conn);

// Books operations
void db_get_books   (PGconn *conn, char *out, int out_size);
void db_get_book    (PGconn *conn, const char *id, char *out, int out_size);
void db_add_book    (PGconn *conn, const char *name, 
                    const char *author_id, const char *year, const char *cost, char *out, int out_size);
void db_update_book (PGconn *conn, const char *id, const char *name, const char *author_id, const char *year, const char *cost, char *out, int out_size);
void db_delete_book (PGconn *conn, const char *id, char *out, int out_size);

//Authors
void db_add_author(PGconn *conn, const char *name, char *out, int out_size);
void db_update_author(PGconn *conn, const char *id, const char *name, char *out, int out_size);
void db_delete_author(PGconn *conn, const char *id, char *out, int out_size);

// Authorization
void db_login       (PGconn *conn, const char *login, 
                    const char *password, char *out, int out_size);

// Authors operations
void db_get_authors(PGconn *conn, char *out, int out_size);

#endif                    