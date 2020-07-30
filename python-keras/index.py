from flask import Flask
from celery import Celery
import time
def make_celery(app):
    celery = Celery(
        app.import_name,
        backend=app.config['CELERY_RESULT_BACKEND'],
        broker=app.config['CELERY_BROKER_URL']
    )
    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery


app = Flask(__name__)
app.config.update(
    CELERY_BROKER_URL='redis://localhost:6379',
    CELERY_RESULT_BACKEND='redis://localhost:6379'
)
celery = make_celery(app)

@celery.task()
def sum(a,b):
    print("before")
    time.sleep(5)
    print("after")
    print(a+b)

@app.route('/')
def home():
    result = sum.delay(1,2)
    # print(result.wait())
    return "test 404", 404

if (__name__ == "__main__"):
    app.run(host="0.0.0.0")
