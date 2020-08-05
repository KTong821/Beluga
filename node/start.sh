#!/bin/bash
export beluga_jwtPrivateKey=$(python ./startup/jwt.py) NODE_ENV=dev

if [ "$NPM_TEST" = "true" ]; then
    npm i --save-dev jest
    npm i --save-dev supertest
    npm test
else
    node index.js
fi
