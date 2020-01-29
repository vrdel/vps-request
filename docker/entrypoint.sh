#!/bin/bash

RUNASROOT="su -m -s /bin/bash root -c"

$RUNASROOT "/etc/init.d/memcached start"
$RUNASROOT "/etc/init.d/apache2 start"
$RUNASROOT "/etc/init.d/mysql start"
. /data/vps-request/bin/activate
/bin/bash -c $*
