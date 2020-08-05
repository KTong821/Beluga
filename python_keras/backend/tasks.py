from celery import Celery
from pprint import pprint

celery = Celery(
    "tasks",
    # backend="redis://localhost:6379",
    # broker="redis://localhost:6379"
    backend="redis://redis-server:6379",
    broker="redis://redis-server:6379"
)


@celery.task(name="backend.tasks.test")
def test(model):
    pprint(model)
