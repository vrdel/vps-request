FROM debian:9
MAINTAINER dvrcic@srce.hr
ENV virtenvdir /data/vps-request/
RUN groupadd user -g 1000 && useradd -u 1000 -g 1000 user -m -d /home/user
RUN passwd -d root
RUN apt-get update -y
RUN apt-get install -y \
    apache2 \
    curl \
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
    sudo \
    tree \
    vim \
    wget \
    xmlsec1
RUN curl -sL https://deb.nodesource.com/setup_12.x | /bin/bash -
RUN apt-get install -y nodejs
RUN python3 -m venv /data/vps-request
RUN . ${virtenvdir}/bin/activate && pip install wheel
RUN . ${virtenvdir}/bin/activate && pip install ipdb pylint-django
COPY \
     create_dbuser.sql \
     entrypoint.sh\
     mysql_setup.sh \
     requirements.txt \
     wrap_make.sh \
     /home/user/
COPY 60-allifaces.cnf /etc/mysql/mariadb.conf.d/
RUN mkdir /home/user/pysitepkg
RUN . ${virtenvdir}/bin/activate && pip install -U -r /home/user/requirements.txt
RUN /home/user/mysql_setup.sh
COPY key.pem cert.pem metadata.xml ${virtenvdir}/etc/vpsrequest/
RUN echo "user ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers
USER user
WORKDIR /home/user
ENTRYPOINT ["/home/user/entrypoint.sh"]
