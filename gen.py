#!/usr/bin/env python

# from https://unix.stackexchange.com/questions/164602/how-to-output-the-directory-structure-to-json-format

import os
import errno

def path_hierarchy(path):
    hierarchy = {
        'type': 'folder',
        'name': os.path.basename(path),
        'path': path,
    }

    try:
        children = [ 
            path_hierarchy(os.path.join(path, contents))
            for contents in os.listdir(path)
        ]
        children.sort(key = lambda child: child['name']) # Sort alphabetically by filename
        children.sort(key = lambda child: child['type'] != "folder") # Folders on top

        hierarchy['children'] = children
    except OSError as e:
        if e.errno != errno.ENOTDIR:
            raise
        hierarchy['type'] = 'file'

    return hierarchy

if __name__ == '__main__':
    import json
    import sys

    try:
        directory = sys.argv[1]
    except IndexError:
        directory = "."

    print(json.dumps(path_hierarchy(directory), indent=2, sort_keys=True))
