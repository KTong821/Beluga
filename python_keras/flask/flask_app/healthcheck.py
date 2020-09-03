from flask import Blueprint

healthchecker = Blueprint("healthchecker", __name__)


@healthchecker.route("/", methods=["GET"])
def healthcheck():
    return "OK"
