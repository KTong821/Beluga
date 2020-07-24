#!/bin/bash
clear
export beluga_jwtPrivateKey=$(python jwt.py)
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
    export NODE_ENV=debug
    npm test
    exit 0
fi

nodemon index.js
clear
