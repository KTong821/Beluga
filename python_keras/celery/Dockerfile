FROM python:3.7.8-slim-buster

WORKDIR /app

RUN apt-get update
RUN apt-get install nano

COPY ./requirements.txt .
RUN pip install --disable-pip-version-check --no-cache-dir -r requirements.txt

COPY ./start.sh .
RUN chmod 111 ./start.sh

COPY tasks ./tasks
RUN ls -al
CMD ["bash", "start.sh"]
