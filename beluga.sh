#!/bin/bash
clear

function egress {
    printf "\nEXITING"
    mongod --shutdown
    wait $P1 $P2 $P3
    clear
}
trap egress EXIT
export beluga_jwtPrivateKey=$(python ./startup/jwt.py) FLASK_APP=index.py FLASK_DEBUG=1

[ ! -d "./logs" ] && mkdir logs

mongod > ./logs/mongod.log 2>&1 &
redis-server > ./logs/redis.log 2>&1 &
P1=$!

# clear
cd python-keras
source ~/anaconda3/etc/profile.d/conda.sh
conda activate beluga

gnome-terminal --disable-factory -e "flask run" &
P2=$!

celery -A index.celery worker -l info > ../logs/celery.log 2>&1 &
P3=$!
# clear

xdg-open http:localhost:5555 &
# clear

conda deactivate
cd ..

if [ -z "$1" ]
then
    export NODE_ENV=dev
elif [ $1 = "-d" ]
then
    export NODE_ENV=debug
elif [ $1 = "-p" ]
then
    export NODE_ENV=prod
elif [ $1 = "test" ]
then
    export NODE_ENV=dev
    npm test
fi

nodemon index.js
