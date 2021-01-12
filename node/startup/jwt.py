import random
import string

# simple random jwt private key generator


def jwtPrivateKey(len):
    letters = string.ascii_letters + string.digits
    result = ''.join(random.choice(letters) for i in range(len))
    return result


print(jwtPrivateKey(15))
