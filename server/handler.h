#ifndef HANDLER_H
#define HANDLER_H

#include <libpq-fe.h>

void handle_command(PGconn *conn, char *cmd_str, char *response, int resp_size);

#endif