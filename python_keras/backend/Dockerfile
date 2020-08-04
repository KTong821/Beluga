FROM python:3.7.8-slim-buster

WORKDIR /app

COPY . .
RUN pip install --no-cache-dir -r requirements.txt

CMD ["celery","flower" ,"-A", "tasks.celery", "--address=0.0.0.0", "--port=5555"]