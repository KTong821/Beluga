from flask import Flask, request
from pymongo import MongoClient
from bson.objectid import ObjectId
import sys
import os
sys.path.insert(1, os.path.abspath("../"))
from backend.tasks import test  # noqa

app = Flask(__name__)
client = MongoClient("mongodb://mongodb:27017/")
models = client["beluga-dev"].models


@app.route('/', methods=["POST"])
def home():
    model = models.find_one({"_id": ObjectId(request.form["_id"])})
    test.delay(model)
    return model


if (__name__ == "__main__"):
    app.run(host="0.0.0.0")
