USE 'mysql';
CREATE USER 'dbuser' IDENTIFIED BY 'dbuser';
CREATE DATABASE vpsreq;
GRANT ALL ON vpsreq.* TO 'dbuser'@'%' IDENTIFIED BY "dbuser";
