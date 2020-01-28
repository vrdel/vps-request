#!/bin/bash

/etc/init.d/mysql start
mysql < /root/create_dbuser.sql
