FROM python:3.7.8-slim-buster

WORKDIR /app

COPY ./requirements.txt .
RUN pip install --disable-pip-version-check --no-cache-dir -r requirements.txt

COPY ./start.sh .
RUN chmod 111 ./start.sh

COPY ./tasks .
CMD ["bash", "start.sh"]
