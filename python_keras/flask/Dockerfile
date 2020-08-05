FROM python:3.7.8-slim-buster

WORKDIR /app

COPY . .
RUN pip install --disable-pip-version-check --no-cache-dir -r ./flask/requirements.txt

WORKDIR /app/flask
CMD ["python", "index.py"]
