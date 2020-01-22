FROM debian:9
MAINTAINER dvrcic@srce.hr 
RUN apt-get update -y
RUN apt-get install -y \
    apache2 \
    dialog \
    htop \
    libapache2-mod-wsgi-py3 \
    python3 \
    python3-pip \
    python3-venv \
    tree \
    xmlsec1 \
    vim \
    wget 
RUN python3 -m venv /data/vps-request
RUN . /data/vps-request/bin/activate && pip install wheel 
RUN . /data/vps-request/bin/activate && pip install ipdb
COPY requirements.txt /root
RUN . /data/vps-request/bin/activate && pip install -U -r /root/requirements.txt
