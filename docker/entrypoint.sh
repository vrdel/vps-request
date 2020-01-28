#!/bin/bash

/etc/init.d/memcached start
/etc/init.d/apache2 start
/etc/init.d/mysql start
. /data/vps-request/bin/activate
/bin/bash -c $*
