from celery import shared_task
from .util.append import *
from .util.ipynb import *
from pprint import pformat
from .templates.layers import *
from .template.models import *


def layer(name, dest, details):
    # change to if statements
    switch = {
        "input": inputs(dest, ),
        "dense": dense(dest, ),
        "dropout": dropout(dest, ),
        "flatten": flatten(dest, ),
        "maxp2d": maxp2d(dest, ),
        "gmp2d": gmp2d(dest, ),
        "conv2d": conv2d(dest, ),
        "vgg16": vgg16(dest, ),
        "vgg19": vgg19(dest, ),
        "resnet50": resnet50(dest, ),
        "effnetb0":  effnetb0(dest, )
    }
    layer_type = switch.get(name, None)
    if (layer is None):
        raise ValueError(f"Layer type {type} is not supported.")


@shared_task(name="tasks.script")
def script(model, type):
    dest = f"./outputs/{model.owner}/{model.name}.py"
    print("received")
    with open("test.txt", "w+") as file:
        file.write(pformat(model))
