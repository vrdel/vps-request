FROM debian:9
MAINTAINER dvrcic@srce.hr
RUN apt-get update -y
RUN apt-get install -y \
    apache2 \
    default-libmysqlclient-dev \
    dialog \
    htop \
    libapache2-mod-wsgi-py3 \
    memcached \
    mysql-client \
    mysql-server \
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
COPY mysql_setup.sh /root
COPY create_dbuser.sql /root
COPY 60-allifaces.cnf /etc/mysql/mariadb.conf.d/
COPY entrypoint.sh /root
RUN mkdir /root/pysitepkg
RUN . /data/vps-request/bin/activate && pip install -U -r /root/requirements.txt
RUN /root/mysql_setup.sh
ENTRYPOINT ["/root/entrypoint.sh"]
