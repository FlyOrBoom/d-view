time ( repeat 100 { python3 gen.py "../.somewhere" > dir_structure.py } ) && time ( repeat 100 { ./gen ../.somewhere > dir_structure.py } )
