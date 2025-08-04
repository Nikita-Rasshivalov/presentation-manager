FROM mysql:8

ENV MYSQL_ROOT_PASSWORD=supersecretrootpass
ENV MYSQL_DATABASE=manage_users_db
ENV MYSQL_USER=myuser
ENV MYSQL_PASSWORD=mypassword

COPY init.sql /docker-entrypoint-initdb.d/