#ifndef DB_H
#define DB_H

#include <libpq-fe.h>

// Connect / disconnect
PGconn* db_connect();
void db_disconnect(PGconn *conn);

// Authorization
void db_login(PGconn *conn, const char *login, const char *password, char *out,
              int out_size);

// Books operations
void db_get_books(PGconn *conn, char *out, int out_size);
void db_get_book(PGconn *conn, const char *id, char *out, int out_size);
void db_add_book(PGconn *conn, const char *author_id, const char *group_id,
                 const char *name, const char *year, const char *puiblisher_id,
                 const char *cost, char *out, int out_size);
void db_update_book(PGconn *conn, const char *id, const char *author_id,
                    const char *group_id, const char *name, const char *year,
                    const char *puiblisher_id, const char *cost, char *out,
                    int out_size);
void db_delete_book(PGconn *conn, const char *id, char *out, int out_size);

// Authors operations
void db_get_authors(PGconn *conn, char *out, int out_size);
void db_add_author(PGconn *conn, const char *name, char *out, int out_size);
void db_update_author(PGconn *conn, const char *id, const char *name, char *out,
                      int out_size);
void db_delete_author(PGconn *conn, const char *id, char *out, int out_size);

// Readers operations
void db_get_readers(PGconn *conn, char *out, int out_size);
void db_get_reader(PGconn *conn, const char *id, char *out, int out_size);
void db_add_reader(PGconn *conn, const char *name, const char *enterprise_id,
                   const char *workphone, char *out, int out_size);
void db_update_reader(PGconn *conn, const char *id, const char *name,
                      const char *enterprise_id, const char *workphone,
                      char *out, int out_size);
void db_delete_reader(PGconn *conn, const char *id, char *out, int out_size);

// Enterprise operations
void db_get_enterprises(PGconn *conn, char *out, int out_size);
void db_get_enterprise(PGconn *conn, const char *id, char *out, int out_size);
void db_add_enterprise(PGconn *conn, const char *enterprise, char *out,
                       int out_size);
void db_update_enterprise(PGconn *conn, const char *id, const char *enterprise,
                          char *out, int out_size);
void db_delete_enterprise(PGconn *conn, const char *id, char *out, int out_size);

// Bookgroup operations
void db_get_bookgroups(PGconn *conn, char *out, int out_size);
void db_get_bookgroup(PGconn *conn, const char *id, char *out, int out_size);
void db_add_bookgroup(PGconn *conn, const char *groupname, char *out,
                      int out_size);
void db_update_bookgroup(PGconn *conn, const char *id, const char *groupname,
                         char *out, int out_size);
void db_delete_bookgroup(PGconn *conn, const char *id, char *out, int out_size);

// Publisher operations
void db_get_publishers(PGconn *conn, char *out, int out_size);
void db_get_publisher(PGconn *conn, const char *id, char *out, int out_size);
void db_add_publisher(PGconn *conn, const char *publishername, char *out,
                      int out_size);
void db_update_publisher(PGconn *conn, const char *id,
                         const char *publishername, char *out, int out_size);
void db_delete_publisher(PGconn *conn, const char *id, char *out, int out_size);

// Bookissue operations
void db_get_bookissues(PGconn *conn, char *out, int out_size);
void db_get_bookissue(PGconn *conn, const char *id, char *out, int out_size);
void db_add_bookissue(PGconn *conn, const char *client_id, const char *book_id,
                      const char *issuedate, const char *duedate, const char *returndate, 
                      char *out, int out_size);
void db_update_bookissue(PGconn *conn, const char *id, const char *client_id,
                         const char *book_id, const char *issuedate,
                         const char *duedate, const char *returndate, char *out,
                         int out_size);
void db_delete_bookissue(PGconn *conn, const char *id, char *out, int out_size);

// Library operations
void db_get_libraries(PGconn *conn, char *out, int out_size);
void db_get_library(PGconn *conn, const char *id, char *out, int out_size);
void db_add_library(PGconn *conn, const char *name, const char *address,
                    char *out, int out_size);
void db_update_library(PGconn *conn, const char *id, const char *name,
                       const char *address, char *out, int out_size);
void db_delete_library(PGconn *conn, const char *id, char *out, int out_size);

// Employee operations
void db_get_employees(PGconn *conn, char *out, int out_size);
void db_get_employee(PGconn *conn, const char *id, char *out, int out_size);
void db_add_employee(PGconn *conn, const char *name, const char *postion,
                     const char *library_id, const char *phone, char *out,
                     int out_size);
void db_update_employee(PGconn *conn, const char *id, const char *name,
                        const char *postion, const char *library_id,
                        const char *phone, char *out, int out_size);
void db_delete_employee(PGconn *conn, const char *id, char *out, int out_size);

// Account operations
void db_get_accounts(PGconn *conn, char *out, int out_size);
void db_get_account(PGconn *conn, const char *id, char *out, int out_size);
void db_add_account(PGconn *conn, const char *employee_id, const char *login,
                    const char *password, char *out, int out_size);
void db_update_account(PGconn *conn, const char *id, const char *employee_id,
                       const char *login, const char *password, char *out,
                       int out_size);
void db_delete_account(PGconn *conn, const char *id, char *out, int out_size);
#endif                    