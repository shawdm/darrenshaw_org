#!/usr/bin/env bash

# wordpress install
apt-get update
apt-get install unzip
cd /usr/share
wget http://wordpress.org/wordpress-4.1.zip
unzip wordpress-4.1.zip
rm -f wordpress-4.1.zip

# apache config
rm -rf /var/www/html
ln -s /usr/share/wordpress /var/www/html
cp /vagrant/bootstrap/wp-config-development.php /usr/share/wordpress/wp-config.php
ln -s /vagrant/darrenshaw-org-wordpress-theme /usr/share/wordpress/wp-content/themes/darrenshaw-org-wordpress-theme
mkdir /usr/share/wordpress/wp-content/uploads
chmod 777 /usr/share/wordpress/wp-content/uploads
apachectl restart

# mysql create database
start mysql
mysql -u root -proot -e "create database darrenshaw_org";
mysql -u root -proot darrenshaw_org < /vagrant/bootstrap/darrenshaw_dev.sql
