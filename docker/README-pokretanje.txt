 env varijable WORKDIR i VENV postaviti prema stranici, a za vrijednosti koristiti iz docker-run-vpsrequest.sh :
 
 https://www.shellhacks.com/windows-set-environment-variable-cmd-powershell/
 
 docker run --net vrdel-net --ip 172.18.0.10 --privileged --rm --name vps-request -ti `
 -p 80:80 -p 443:443 -p 3306:3306 -p 8000:8000 `
 -e ZDOTDIR=/mnt `
 -v $env:WORKDIR/mnt:/mnt/ `
 -v $env:WORKDIR/vpsrequest/frontend:/home/user/frontend `
 -v $env:WORKDIR/docker/collectstatic.sh:/home/user/collectstatic.sh `
 -v $env:WORKDIR/docker/restarthttpd.sh:/home/user/restarthttpd.sh `
 -v $env:WORKDIR/docker/syncsite.sh:/home/user/syncsite.sh `
 -v $env:WORKDIR/docker/pysitepkg:/home/user/pysitepkg `
 -v $env:WORKDIR/vpsrequest/:$env:VENV/lib64/python3.5/site-packages/vpsrequest `
 -v $env:WORKDIR/vpsrequest/static:$env:VENV/share/vpsrequest/static `
 -v $env:WORKDIR/apache/vpsrequest.example.com.conf:/etc/apache2/sites-available/vpsrequest.example.com.conf `
 -v $env:WORKDIR/bin/vpsreq-db:$env:VENV/bin/vpsreq-db `
 -v $env:WORKDIR/bin/vpsreq-manage:$env:VENV/bin/vpsreq-manage `
 -v $env:WORKDIR/bin/vpsreq-genseckey:$env:VENV/bin/vpsreq-genseckey `
 -v $env:WORKDIR/etc/vpsrequest.conf:$env:VENV/etc/vpsrequest/vpsrequest.conf `
 ipanema:5000/vps-request /bin/bash
 
 
 
- na kontejneru:
 su -
 vpsreq-genseckey -f $VIRTUAL_ENV/etc/vpsrequest/secretkey
 vpsreq-db -c
 vpsreq-db -u
 
 su -
 a2ensite vpsrequest.example.com
 restart apachea
 
 cd $VIRTUAL_ENV/lib/python3.5/site-packages/vpsrequest/frontend
 npm install
 
 vpsreq-manage loaddata $VIRTUAL_ENV/lib64/python3.5/site-packages/vpsrequest/backend/fixtures/vmoses.json (secretkey nema read permisije na ostale usere pa chmodaj)
 vpsreq-db -d /mnt/db_dump_reformat.json

 - commit docker imagea:
 docker commit vps-request ipanema:5000/vps-request
 
 
 
 
- za buildanje novog bundla sa svog kompa iz gitBasha u ovom diru /d/docker_images/vps-request/vpsrequest/frontend izvrtiti:

   make devel
 
   ako izbaci gresu kod .collectstatic.sh pretvori lineendingse u LF
   
 