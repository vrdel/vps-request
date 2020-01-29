#!/bin/bash

/etc/init.d/mysql start
mysql < /home/user/create_dbuser.sql
