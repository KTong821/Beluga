from bson.json_util import dumps

def debug(text):
    if (isinstance(text, dict)):
        text = dumps(text)
    print('\x1b[1;32;40m' + text + '\x1b[0m')
