#!/usr/bin/env python

# from https://unix.stackexchange.com/questions/164602/how-to-output-the-directory-structure-to-json-format

import os
import errno

def path_hierarchy(path):
    name = os.path.basename(path)

    try:
        return [ name, [ path_hierarchy(os.path.join(path, contents)) for contents in os.listdir(path) ] ]
    except OSError as e:
        if e.errno != errno.ENOTDIR:
            raise
        return [ name, "file" ]

if __name__ == '__main__':
    import json
    import sys

    try:
        directory = sys.argv[1]
    except IndexError:
        directory = "."

    print(json.dumps(path_hierarchy(directory)))
