import os

cell_marker = "# %%"


def append(here, there, **kwargs):
    if (not isinstance(here, str)):
        raise TypeError('"here" file path must be a string.')
    if (not isinstance(there, str)):
        raise TypeError('"there" file path must be a string.')
    if (not os.path.isfile(here)):
        raise ValueError(
            f"Provided file path {here} could not be found.")

    with open(here, "r") as content:
        with open(there, "a") as dest:
            if "header" in kwargs:
                for i in range(kwargs["header"]):
                    dest.write("\n")
            for line in content:
                if not line.startswith(cell_marker):
                    dest.write(line)

            if "footer" in kwargs:
                for i in range(kwargs["footer"]):
                    dest.write("\n")


def append_nb(here, there, **kwargs):
    if (not isinstance(here, str)):
        raise TypeError('"here" file path must be a string.')
    if (not isinstance(there, str)):
        raise TypeError('"there" file path must be a string.')
    if (not os.path.isfile(here)):
        raise ValueError(
            f"Provided file path {here} could not be found.")

    with open(here, "r") as content:
        with open(there, "a") as dest:
            if "header" in kwargs:
                for i in range(kwargs["header"]):
                    dest.write("\n")
            dest.write(content.read())
            if "footer" in kwargs:
                for i in range(kwargs["footer"]):
                    dest.write("\n")
