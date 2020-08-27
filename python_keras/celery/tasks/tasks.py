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


def something():
    with open("./test.py", "w") as file:
        file.write("import tensorflow as tf\n")
        file.write("import numpy as np\n")
        file.write("import seaborn as sn\n")


@celery.task(name="backend.tasks.test")
def test(model):
    pprint(model)
    something()
