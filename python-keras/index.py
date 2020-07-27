import json
import sys
print("Hello World")


def read():
    print("here")
    lines = sys.stdin.readlines()
    print("here1", lines)
    temp = json.loads(lines[0])
    print("here2")
    return temp


def main():
    var = read()
    print("IN MAIN")
    print(var)


if (__name__ == "__main__"):
    main()
