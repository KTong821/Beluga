import random
import string
import os


def jwtPrivateKey(len):
    letters = string.ascii_letters + string.digits
    result = ''.join(random.choice(letters) for i in range(len))
    return result


os.environ["beluga_jwtPrivateKey"] = jwtPrivateKey(15)
print(os.environ["beluga_jwtPrivateKey"])
