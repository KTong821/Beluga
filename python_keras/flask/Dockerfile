FROM tiangolo/uwsgi-nginx-flask:python3.8-alpine
RUN apk --update add bash nano
ENV STATIC_URL /static
ENV STATIC_PATH /var/www/app/static

WORKDIR /var/www/

COPY ./flask/requirements.txt ./flask/uwsgi.ini ./flask/main.py ./
RUN pip install --disable-pip-version-check --no-cache-dir -r requirements.txt

COPY ./flask/flask_app ./flask_app
COPY ./celery/tasks ./tasks

RUN ls -al
