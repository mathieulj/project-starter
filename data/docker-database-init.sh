#!/bin/sh
## Docker entry point for initialising a new database
# This file will be executed on startup by the docker mongo image if
# it detects no initialised database.

DATA=/docker-entrypoint-initdb.d

mongo ${DATA}/scripts/000_create_db.js
