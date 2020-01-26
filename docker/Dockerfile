FROM debian:9
MAINTAINER dvrcic@srce.hr 
RUN apt-get update -y
RUN apt-get install -y \
    apache2 \
    dialog \
    htop \
    libapache2-mod-wsgi-py3 \
    memcached \
    net-tools \
    python3 \
    python3-pip \
    python3-venv \
    rsync \
    tree \
    vim \
    wget \ 
    xmlsec1
RUN python3 -m venv /data/vps-request
RUN . /data/vps-request/bin/activate && pip install wheel 
RUN . /data/vps-request/bin/activate && pip install ipdb
COPY requirements.txt /root
COPY collectstatic.sh /root
COPY restarthttpd.sh /root
COPY syncsite.sh /root
RUN mkdir /root/pysitepkg 
RUN . /data/vps-request/bin/activate && pip install -U -r /root/requirements.txt
