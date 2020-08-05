FROM python:3.7.8-slim-buster

WORKDIR /app

COPY . .
RUN pip install --disable-pip-version-check --no-cache-dir -r requirements.txt
RUN chmod 111 ./start.sh

CMD ["bash", "start.sh"]