from flask_app import app

@app.route("/healthcheck", methods=["GET"])
def healthcheck():
    return "OK"