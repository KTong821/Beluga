import sys  # noqa
import os  # noqa
sys.path.insert(1, os.path.abspath("../"))  # noqa
from tasks import script  # noqa

from flask import request
from flask_app import app
from pymongo import MongoClient
from bson.objectid import ObjectId
from pprint import pprint
from datetime import datetime
from .printd import debug
import json


if (os.environ.get("ON_LOCAL")):
    uri = "mongodb://localhost:27017/"
else:
    uri = "mongodb://mongodb:27017/"

try:
    client = MongoClient(host=[uri], connectTimeoutMS=2000)
    client.server_info()
except:
    print(f"CONNECTION ERROR COULD NOT CONNECT TO MONGODB @ {uri}")
    client.close()
else:
    print(f"CONNECTION TO {uri} SUCCESSFUL")

db = client["beluga-dev"]
models = db["models"]
layers = db["layers"]


@app.route('/', methods=["POST"])
def publish():
    body = request.get_json()
    if body is None:
        return "Empty request body.", 400

    _id = body["_id"]
    filetype = body["type"]

    debug(body)

    try:
        model = models.find_one({"_id": ObjectId(_id)})
    except TypeError:
        return f"Invalid model ID {_id}; does not conform to mongodb format.", 400
    if model is None:
        return f"Invalid model ID {_id}; not found.", 400

    del model["updatedAt"], model["__v"]
    model["createdAt"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    model["_id"] = body["_id"]
    model["owner"] = str(model["owner"])
    debug(model)

    layer_dicts = []
    for layer in model["layers"]:
        temp = layers.find_one({"_id": layer})
        if temp is None:
            return f"Invalid layer ID {str(layer)}; not found.", 400
        del temp["_id"], temp["owner"]
        layer_dicts.append(temp)

    model["layers"] = layer_dicts
    script.delay(model)
    return body["_id"]
