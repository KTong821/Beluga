FROM python:3.7.8-slim-buster

WORKDIR /app

COPY . .
RUN pip install --no-cache-dir -r ./flask/requirements.txt
RUN ls
RUN pwd

CMD ["flask", "run"]
