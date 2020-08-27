from celery import Celery
from pprint import pprint
import os

if(os.environ.get("ON_LOCAL")):
    celery = Celery(
        "tasks",
        backend="redis://localhost:6379",
        broker="redis://localhost:6379"
    )
else:
    celery = Celery(
        "tasks",
        backend="redis://redis-server:6379",
        broker="redis://redis-server:6379"
    )
