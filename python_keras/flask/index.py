from flask import Flask
import sys
import os
sys.path.insert(1, os.path.abspath("../"))
from python_keras.backend.tasks import sum  # noqa

app = Flask(__name__)
print("IN INDEX.PY")


@app.route('/')
def home():
    result = sum.delay(1, 2)
    return "hello1"


if (__name__ == "__main__"):
    app.run(host="0.0.0.0")
