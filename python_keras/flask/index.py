import sys  # noqa
import os  # noqa
sys.path.insert(1, os.path.abspath("../"))  # noqa
from backend.tasks import test  # noqa

from flask import Flask, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from pprint import pprint
from datetime import datetime
import json

app = Flask(__name__)

if (os.environ.get("ON_LOCAL")):
    uri = "mongodb://localhost:27017/"
else:
    uri = "mongodb://mongodb:27017/"

print("MongoDB URI:", uri)
client = MongoClient(uri)
db = client["beluga-dev"]
models = db["models"]
layers = db["layers"]


@app.route('/', methods=["POST"])
def home():
    body = request.get_json()
    model = models.find_one({"_id": ObjectId(body["_id"])})

    del model["updatedAt"], model["__v"]
    model["createdAt"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    model["_id"] = body["_id"]
    model["owner"] = str(model["owner"])
    pprint(model)
    layer_dicts = []
    for layer in model["layers"]:
        temp = layers.find_one({"_id": layer})
        del temp["_id"], temp["owner"]
        layer_dicts.append(temp)

    model["layers"] = temp
    pprint(model)
    test.delay(model)
    return "hello"


if (__name__ == "__main__"):
    app.run(host="0.0.0.0")
