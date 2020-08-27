from tasks import celery


def something():
    with open("./test.py", "w") as file:
        file.write("import tensorflow as tf\n")
        file.write("import numpy as np\n")
        file.write("import seaborn as sn\n")


@celery.task(name="backend.tasks.test")
def script(model):
    # pprint(model)
    something()
# shutil.copyfile()
