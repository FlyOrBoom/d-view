time ( repeat 100 { python3 gen.py "../.somewhere" > dir_structure.py } ) && time ( repeat 100 { python3 gen_old.py "../.somewhere" > dir_structure.py } )
