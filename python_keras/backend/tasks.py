from celery import Celery
celery = Celery(
    "backend.tasks",
    backend="redis://localhost:6379",
    broker="redis://localhost:6379"
    # backend="redis://redis-server:6379",
    # broker="redis://redis-server:6379"
)


@celery.task()
def sum(a, b):
    print("ANSWER", a + b)
