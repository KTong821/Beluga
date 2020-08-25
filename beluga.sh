#!/bin/bash

if [ -z "$1" ]; then
    printf "\nNo flags given; process exiting.\n"
elif [ $1 = "node" ]; then
    cd node
    export beluga_jwtPrivateKey=$(python ./startup/jwt.py)
    if [ -z "$2" ]; then
        export NODE_ENV=debug
    elif [ $2 = "-d" ]; then
        export NODE_ENV=dev
    elif [ $2 = "-p" ]; then
        export NODE_ENV=prod
    elif [ $2 = "test" ]; then
        export NODE_ENV=debug
        printf "\nRunning Tests..."
        npm test
        printf "\nTests Complete."
        exit 0
    fi
    nodemon index.js
elif [ $1 = "flask" ]; then
    export FLASK_APP=index.py FLASK_DEBUG=1 ON_LOCAL=true
    source ~/anaconda3/etc/profile.d/conda.sh
    printf "\nActivating Conda Environment..."
    conda activate beluga
    cd python_keras/flask
    flask run
elif [ $1 = "redis" ]; then
    redis-server
elif [ $1 = "celery" ]; then
    export ON_LOCAL=true
    source ~/anaconda3/etc/profile.d/conda.sh
    printf "\nActivating Conda Environment..."
    conda activate beluga
    cd python_keras/backend
    watchmedo auto-restart --directory=./ --pattern=*.py --ignore-pattern="*test.py" --recursive -- celery -A tasks.celery worker -l info
elif [ $1 = "flower" ]; then
    export ON_LOCAL=true
    source ~/anaconda3/etc/profile.d/conda.sh
    conda activate beluga
    cd python_keras/backend
    celery flower -A tasks.celery --address=127.0.0.1 --port=5555
fi

# function egress() {
#     printf "\nEXITING\n"
#     mongod --shutdown
#     kill -INT $P1 $P2 $P3 $P4 $P5
#     clear
# }
# trap egress EXIT
# printf "\nGenerating JWT Key..."
# export beluga_jwtPrivateKey=$(python ./startup/jwt.py) FLASK_APP=index.py FLASK_DEBUG=1

# [ ! -d "./logs" ] && mkdir logs

# printf "\nStarting Mongo Daemon..."
# mongod >./logs/mongod.log 2>&1 &

# printf "\nStarting Redis Message Broker..."
# redis-server >./logs/redis.log 2>&1 &
# P1=$!
# printf $P1

# cd python-keras
# source ~/anaconda3/etc/profile.d/conda.sh
# printf "\nActivating Conda Environment..."
# conda activate beluga

# printf "\nStarting Flask Server..."
# gnome-terminal --disable-factory -e "flask run" &
# P2=$!
# printf $P2

# printf "\nLaunching Celery Background Workers..."
# celery -A index.celery worker -l info >../logs/celery.log 2>&1 &
# P3=$!
# printf $P3

# printf "\nOpening Flower Console..."
# celery flower -A index.celery --address=127.0.0.1 --port=5555 >../logs/flower.log 2>&1 &
# P4=$!
# printf $P4

# xdg-open http:localhost:5555 &
# P5=$!
# printf $P5

# printf "\nDeactivating Conda Environment..."
# conda deactivate
# cd ..

# printf "\nConfiguring Node Environment..."
# if [ -z "$1" ]; then
#     export NODE_ENV=dev
# elif [ $1 = "-d" ]; then
#     export NODE_ENV=debug
# elif [ $1 = "-p" ]; then
#     export NODE_ENV=prod
# elif [ $1 = "test" ]; then
#     export NODE_ENV=dev
#     printf "\nRunning Tests..."
#     # npm test
#     printf "DONE TESTS"
#     exit 0
# fi

# printf "\nStarting App...\n"
# nodemon index.js
