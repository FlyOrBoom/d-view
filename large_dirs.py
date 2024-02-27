import json
file = open("dir_structure.json")
d = json.load(file)

def read(base, structure):

    struct_name = structure[0]
    struct_type = structure[1]
    struct_children = structure[2:-1]
    struct_size = structure[-1]

    print_parent = True
    for child in struct_children:
        child_size = child[-1]
        child_name = child[0]
        if child_size > 1e13:
            print_parent = False

    if not print_parent:
        for child in struct_children:
            child_name = child[0]
            child_path = base + "/" + child_name
            if read(child_path, child):
                print('"' + child_path + '"')

    return print_parent

read("", d)
