FROM debian:9
MAINTAINER dvrcic@srce.hr
RUN groupadd user -g 1000 && useradd -u 1000 -g 1000 user -m -d /home/user
RUN passwd -d root
RUN apt-get update -y
RUN apt-get install -y \
		curl \
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
RUN curl -sL https://deb.nodesource.com/setup_12.x | /bin/bash -
RUN apt-get install -y nodejs
RUN python3 -m venv /data/vps-request
RUN . /data/vps-request/bin/activate && pip install wheel
RUN . /data/vps-request/bin/activate && pip install ipdb
COPY requirements.txt /home/user
COPY collectstatic.sh /home/user
COPY restarthttpd.sh /home/user
COPY syncsite.sh /home/user
COPY mysql_setup.sh /home/user
COPY create_dbuser.sql /home/user
COPY 60-allifaces.cnf /etc/mysql/mariadb.conf.d/
COPY entrypoint.sh /home/user/
RUN mkdir /home/user/pysitepkg
RUN . /data/vps-request/bin/activate && pip install -U -r /home/user/requirements.txt
RUN /home/user/mysql_setup.sh
USER user
WORKDIR /home/user
ENTRYPOINT ["/home/user/entrypoint.sh"]
