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
