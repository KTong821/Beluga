from .publish import publisher
from .healthcheck import healthchecker
from flask import Flask
app = Flask(__name__)


app.register_blueprint(publisher, url_prefix="")
app.register_blueprint(healthchecker, url_prefix="/healthcheck")
