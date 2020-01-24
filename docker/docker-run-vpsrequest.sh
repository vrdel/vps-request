#!/bin/bash

IMAGE="ipanema:5000/vps-request"
VENV=/data/vps-request
WORKDIR=$HOME/my_work/srce/git.vps-request/vps-request/

if [ -z "$1" ]
then
	IMG="$IMAGE"
else
	IMG="$IMAGE:$1"
fi

docker run --privileged --rm --name vps-request -ti -p 80:80 -p 443:443 -p 8000:8000 \
-e ZDOTDIR=/mnt \
-v /home/dvrcic/:/mnt/ \
-v /etc/localtime:/etc/localtime:ro \
--log-driver json-file --log-opt max-size=10m \
-v /dev/log/:/dev/log \
-v $WORKDIR/vpsrequest/:$VENV/lib64/python3.5/site-packages/vpsrequest \
-v $WORKDIR/vpsrequest/static:$VENV/share/vpsrequest/static \
-v $WORKDIR/apache/vpsrequest.example.com.conf:/etc/apache2/sites-available/vpsrequest.example.com.conf \
-v $WORKDIR/bin/vpsreq-db:$VENV/bin/vpsreq-db \
-v $WORKDIR/bin/vpsreq-manage:$VENV/bin/vpsreq-manage \
-v $WORKDIR/etc/vpsrequest.conf:$VENV/etc/vpsrequest/vpsrequest.conf \
$IMG \
/bin/bash
