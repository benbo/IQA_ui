SIMG-UI - A web application

[TOC]

# NPM/bower setup
package management tools for front-end development 
```bash
# yum install npm
# npm install -g bower
```

# Clone this repository


# Depedency setup
Run as a normal user
```bash
$ bower install
```
This downloads the dependent libraries, ie. javascript, and store them in ```bower_components``` folder.

# Nginx setup
## Install Nginx 
```bash
# yum install nginx
```

## Create Nginx folders
```bash
# an example
mkdir opt/ui/nginx/tmp
mkdir opt/ui/nginx/log
mkdir opt/ui/nginx/var
mkdir opt/ui/nginx/etc
```

## nginx.conf
* Change port number and specify the web content folder by editing nginx.conf.

```javascript
  server {
    # IPv4.
    listen 3000; # port number
    # IPv6.
    listen [::]:3000 default ipv6only=on; # port number

    root /somefolder/opt/ui; # root directory of web content

```

* Edit the paths
* Specify the root directory of static content.

Suppose we store images in ```images/xyz.jpg``` in the file system, and want to access them via URL ```http://localhost/images/xyz.jpg```.
Then we instruct NGINX search for a URI that starts with /images/ in the /mnt/xfsdata/simg/images directory on the file system.
```javascript
  server {
    ...

    # root directory of image files
    location /images/ {
        root somefolder; # NOT somefolder/images/
    }
    ...
```

## launch nginx
```bash
# Run the command as a non privileged user.
$ nginx -c folder_to_nginx/etc/nginx.conf
```

Ignore the warning
```bash
nginx: [alert] could not open error log file: open() "/var/log/nginx/error.log" failed (13: Permission denied)
```

## Verity nginx is running
```bash
$ netstat -anp | grep 3000

# you should see something like this

(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN      6573/nginx: master
tcp6       0      0 :::3000                 :::*                    LISTEN      6573/nginx: master
```

## Reload
To reload Nginx after editing, do
```bash
# on gpu1
$ nginx -c folder_to_nginx/etc/nginx.conf -s reload
```

# Access the web interface
Use ssh tunnels to forward ports:

* 3000 - web service
* 5000 - API service
* 27017 - MongoDB

```bash
ssh -L3000:localhost:3000 -L5000:localhost:5000 -L27017:localhost:29019 myserver.org  
```

You can now access the web interface via the following URLs

* development: [http://127.0.0.1:3000/dev.html](http://127.0.0.1:3000/dev.html)
* ~~production: [http://127.0.0.1:3000/index.html](http://127.0.0.1:3000/index.html)~~


