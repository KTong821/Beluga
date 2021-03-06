@ECHO OFF
cls
if [%1]==[] goto DEVELOPMENT
if %1==-d goto DEBUG
if %1==-p goto PRODUCTION    
if %1==test goto TEST
:DEVELOPMENT
set NODE_ENV=dev
goto FINAL

:DEBUG
set NODE_ENV=debug
goto FINAL

:PRODUCTION
set NODE_ENV=prod
goto FINAL

:TEST
set NODE_ENV=dev
for /f %%i in ('python ./startup/jwt.py') do set beluga_jwtPrivateKey=%%i
npm test

:FINAL
for /f %%i in ('python ./startup/jwt.py') do set beluga_jwtPrivateKey=%%i
nodemon index.js
cls