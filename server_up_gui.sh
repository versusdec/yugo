#!/bin/bash

back_title="Скрипт установки компонентов сервера"
#template_path="git@bitbucket.org:cassej/core.git"
template_path="https://github.com/test/HelloWorld.git"
steps_total=0
steps_current=0
progress=0
maria_selected=false

pre_install() {
	cd /tmp/
	yum install -y -q curl wget htop nano sed gcc gcc-c++ make zlib-devel pcre-devel openssl-devel yum-utils pygpgme epel-release bash-completion unzip libev-devel git &> /dev/null
}
post_install() {
	if [ "$maria_selected" = true ]; then
		dialog --title "Подтверждение" --backtitle "$back_title" --yesno "Желаете запустить mysql_secure_installation?" 10 50
		if [ $? == 0 ]; then
			clear
			mysql_secure_installation
		fi
	fi	
}
install_openresty() {
	increase_step
	show_progress "openresty"

	yum-config-manager --add-repo https://openresty.org/package/centos/openresty.repo &> /dev/null
	yum install -y -q openresty &> /dev/null

	wget https://luarocks.org/releases/luarocks-3.7.0.tar.gz &> /dev/null
	tar zxpf luarocks-3.7.0.tar.gz
	cd luarocks-3.7.0

	./configure --prefix=/usr/local/openresty/luajit  \
	   --with-lua=/usr/local/openresty/luajit/ \
	   --lua-suffix=jit \
	   --with-lua-include=/usr/local/openresty/luajit/include/luajit-2.1 &> /dev/null


	make -s &> /dev/null
	make -s install &> /dev/null

	rm -Rf /tmp/luarocks-3.7.0 && cd /tmp/

	ln -s /usr/local/openresty/luajit/bin/luarocks /usr/bin/luarocks
	ln -s /usr/local/openresty/luajit/bin/luajit /usr/bin/luajit

	luarocks install luasec &> /dev/null
	luarocks install lua-cjson &> /dev/null
	luarocks install luajwt &> /dev/null
	luarocks install redis-lua &> /dev/null
	luarocks install luafilesystem &> /dev/null
	luarocks install inifile &> /dev/null
	luarocks install utf8 &> /dev/null
	luarocks install luaposix &> /dev/null
	luarocks install telegram-bot-lua &> /dev/null

	useradd www -s /bin/false -M -U
	mkdir /www && touch /www/nginx.conf

	cat <<EOT > /usr/local/openresty/nginx/conf/nginx.conf
user  www;

worker_processes  auto;

events {
    use epoll;
    worker_connections 1024;
    multi_accept on;
}

http {
    include mime.types;
    default_type application/octet-stream;

    access_log off;
    error_log /www/error.log crit;

    keepalive_timeout  30;
    keepalive_requests 100;

    client_max_body_size  1m;
    client_body_timeout 10;
    reset_timedout_connection on;
    send_timeout 2;
    sendfile on;
    tcp_nodelay on;
    tcp_nopush on;

    gzip on;
    gzip_disable "msie6";
    gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript;

    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    include /www/nginx.conf;
}

EOT


	systemctl enable openresty
	service openresty start

	
	update_progress
	show_progress "openresty"			
}
install_template() {
	increase_step
	show_progress "template"

	if [ ! -d /www ]; then
		mkdir /www
	fi

	if [ ! -d /tmp/_git ]; then
		mkdir /tmp/_git
	fi	

	rm -Rf /tmp/_git/* && cd /tmp/_git	
	git clone -q "$template_path" .
	rm -Rf /tmp/_git/.git && cp -Rf /tmp/_git/* /www/ && cd /tmp/

	update_progress
	show_progress "template"
}
install_redis() {
	increase_step
	show_progress "redis"

	yum install -y -q redis
	systemctl enable redis
	service redis start
	
	update_progress
	show_progress "redis"
}
install_clickhouse() {	
	increase_step
	show_progress "clickhouse"

	#curl -s https://packagecloud.io/install/repositories/altinity/clickhouse/script.rpm.sh | bash	
	rpm --import --quiet https://repo.yandex.ru/clickhouse/CLICKHOUSE-KEY.GPG
	yum-config-manager --add-repo https://repo.yandex.ru/clickhouse/rpm/stable/x86_64 &> /dev/null	
	yum install -y -q clickhouse-server clickhouse-client
	
	systemctl enable clickhouse-server
	service clickhouse-server start
	
	update_progress
	show_progress "clickhouse"
}
install_freeswitch() {	
	increase_step
	show_progress "freeswitch"

	yum install -y -q https://files.freeswitch.org/repo/yum/centos-release/freeswitch-release-repo-0-1.noarch.rpm &> /dev/null
	yum install -y -q freeswitch-config-vanilla freeswitch-format-mod-shout &> /dev/null
	yum install -y -q freeswitch freeswitch-lua freeswitch-application-curl freeswitch-codec-* freeswitch-format-mod-shout &> /dev/null

	systemctl enable freeswitch

	ln -s /etc/freeswitch /www/freeswitch
	ln -s /usr/share/freeswitch/scripts /www/freeswitch/scripts
	
	update_progress
	show_progress "freeswitch"
}
install_rethinkdb() {
	increase_step
	show_progress "rethinkdb"

	cat << EOF > /etc/yum.repos.d/rethinkdb.repo
[rethinkdb]
name=RethinkDB
enabled=1
baseurl=https://download.rethinkdb.com/repository/centos/7/x86_64/
gpgkey=https://download.rethinkdb.com/repository/raw/pubkey.gpg
gpgcheck=1
EOF

	yum install -y -q rethinkdb &> /dev/null
	systemctl enable rethinkdb
	service rethinkdb start

	update_progress
	show_progress "rethinkdb"
}
install_php() {	
	increase_step
	show_progress "php"

	rpm --install --quiet http://rpms.famillecollet.com/enterprise/remi-release-7.rpm
	sed -i '0,/enabled=/s/enabled=0/enabled=1/' /etc/yum.repos.d/remi-php72.repo &> /dev/null

	yum install -y -q php php-common php-opcache php-mcrypt php-cli php-gd php-curl php-mysqlnd php-mbstring php-redis php-fpm &> /dev/null

	systemctl enable php-fpm
	service php-fpm start
	
	update_progress
	show_progress "php"
}
install_mariadb() {	
	increase_step
	show_progress "mariadb"

	cat <<EOT > /etc/yum.repos.d/MariaDB.repo
[mariadb]
name = MariaDB
baseurl = http://yum.mariadb.org/10.1/centos7-amd64
gpgkey=https://yum.mariadb.org/RPM-GPG-KEY-MariaDB
gpgcheck=1

EOT


	yum install -y -q MariaDB-server MariaDB-client &> /dev/null

	systemctl enable mariadb
	service mariadb start
	maria_selected=true
	
	
	update_progress
	show_progress "mariadb"
}
increase_step(){
	steps_current=$((steps_current+1))
}
update_progress(){		
	progress=$((steps_current * 100 / steps_total))
}
show_progress(){
	echo "$progress" | dialog --title "Шаг $steps_current из $steps_total" --backtitle "$back_title" --gauge "Установка $1..." 10 50 0
	if [ $progress == 100 ]; then
		dialog --title "Финиш" --backtitle "$back_title" --msgbox "Установка компонентов завершена" 6 50
	fi
}
run() {
	if [ ! -f /etc/redhat-release ]; then
		echo "Скрипт написан под CentOS. Выход..."
		exit 1
	fi

	echo "Подготовка к запуску..."

	yum install -y -q dialog &> /dev/null

	options=$(dialog --stdout --clear --keep-window --ok-label "Установить" --cancel-label "Отмена" \
		--title "Компоненты к установке" \
		--backtitle "$back_title" \
		--checklist "Отметьте необходимые пункты клавишей <Пробел>" 15 60 10 \
		1 "openresty" on \
		2 "шаблон сайта" off \
		3 "redis" off \
		4 "clickhouse" off \
		5 "freeswitch" off \
		6 "rethinkdb" off \
		7 "php" off \
		8 "mariadb" off \
	)

	if [ $? == 0 ]; then
		if [ -z "$options" ]; then
			clear
			echo "Ничего не выбрано. Выход..."			
			exit 2
		else
			dialog --backtitle "$back_title" --infobox "Подготовка к установке. Подождите...." 10 50			    
		    for option in $options; do
		    	steps_total=$((steps_total+1))
		    done		    
		    pre_install		    
		    for option in $options; do		    	
		    	case $option in

		    		1)
						#echo "Выбран компонент openresty"						
						install_openresty
						;;
					2) 
						#echo "Выбран компонент шаблон сайта"
						install_template
						;;	
					3)
						#echo "Выбран компонент redis"
						install_redis
						;;
					4)
						#echo "Выбран компонент clickhouse"						
						install_clickhouse
						;;
					5)
						#echo "Выбран компонент freeswitch"
						install_freeswitch
						;;
					6)
						#echo "Выбран компонент rethinkdb"
						install_rethinkdb
						;;	
					7)
						#echo "Выбран компонент php"
						install_php
						;;
					8)
						#echo "Выбран компонент mariadb"
						install_mariadb
						;;						

		    	esac	
		    done
		    post_install
		fi
	else
		clear		
	    echo "Выбрана отмена. Выход..."	    
	    exit 3
	fi

	clear
	exit 0
}

run
