USE 'mysql';
CREATE USER 'dbuser' IDENTIFIED BY 'dbuser';
CREATE DATABASE vpsreq CHARACTER SET utf8;
GRANT ALL ON vpsreq.* TO 'dbuser'@'%' IDENTIFIED BY "dbuser";
