#!/bin/bash

IMAGE="ipanema:5000/vps-request-packaging"
VENV=/data/vps-request
WORKDIR=$HOME/my_work/srce/git.vps-request/vps-request/

test -z $1 && IMG="$IMAGE" || IMG="$1"
test -z $2 && SH="$SHELL" || SH="$2"

docker run --net vrdel-net --ip 172.18.0.10 --privileged --rm --name vps-request-packaging -ti \
	-p 80:80 -p 443:443 -p 3306:3306 -p 8000:8000 \
-e ZDOTDIR=/mnt \
-v $HOME:/mnt/ \
-v /etc/localtime:/etc/localtime:ro \
--log-driver json-file --log-opt max-size=10m \
-v /dev/log/:/dev/log \
-v $WORKDIR/:/home/user/vpsrequest-source \
-v $WORKDIR/docker/safety.sh:/home/user/safety.sh \
-v $WORKDIR/docker/collectstatic.sh:/home/user/collectstatic.sh \
-v $WORKDIR/docker/restarthttpd.sh:/home/user/restarthttpd.sh \
-v $WORKDIR/docker/syncsite.sh:/home/user/syncsite.sh \
-v $WORKDIR/docker/pysitepkg:/home/user/pysitepkg \
$IMG \
$SH
