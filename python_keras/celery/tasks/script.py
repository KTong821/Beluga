from celery import shared_task
from .util.append import *
from .util.ipynb import *
from pprint import pformat


@shared_task(name="tasks.script")
def script(model):
    print("received")
    with open("test.txt", "w+") as file:
        file.write(pformat(model))
