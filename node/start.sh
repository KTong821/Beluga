#!/bin/bash
export beluga_jwtPrivateKey=$(python ./startup/jwt.py) CI=true

if [ "$NPM_TEST" = "true" ]; then
    export NODE_ENV=dev
    npm test
fi

export NODE_ENV=prod
node index.js
