import os
import subprocess


def ipynb(script, notebook=None):
    if (not isinstance(script, str)):
        raise TypeError('"script" file path must be a string.')
    if (script[-3:] != ".py"):
        raise ValueError('"script" must be of file type .py')
    if (not notebook is None):
        if (not isinstance(notebook, str)):
            raise TypeError('"notebook" file path must be a string.')
        elif (notebook[-6:] != ".ipynb"):
            raise ValueError('"notebook" must be of file type .ipynb')

    if (not os.path.isfile(script)):
        raise ValueError(
            f"Provided file path {script} could not be found.")
    if notebook is None:
        dest = script[:-2] + "ipynb"
        subprocess.run(["ipynb-py-convert", script, dest],
                       timeout=1000, check=True)
    else:
        subprocess.run(["ipynb-py-convert", script, notebook],
                       timeout=1000, check=True)
