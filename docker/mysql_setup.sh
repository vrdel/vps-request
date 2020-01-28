#!/bin/bash

/etc/init.d/mysql start
mysql < /root/user.sql
