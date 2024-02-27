gen:
	g++ gen.cpp -std=c++20 -o gen
dir_structure.json:
	./gen "$DESI_ROOT/public/edr/"
large_dirs.txt:
	python3 large_dirs.py > large_dirs.txt
