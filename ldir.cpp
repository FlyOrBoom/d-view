#include <algorithm>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <utility>
#include <map>

namespace fs = std::filesystem;

// Entry: A directory or file

// Entry_type: Differentiates directories and various file types.
// Currently only has one generic file type.
enum Entry_type { 
    directory = 0,
    file = 1
};

std::uintmax_t hierarchy(fs::path path, Entry_type entry_type, int depth, std::uintmax_t max_size)
{
    std::uintmax_t size = 0;
    std::uintmax_t dir_size = 0;

    if(entry_type == directory) {

        if(depth != 0) {

            for(const auto& dir_entry : fs::directory_iterator{path})
            {
                fs::path entry_path = dir_entry.path();
                entry_type = (dir_entry.is_directory()) ? directory : file;
                dir_size = hierarchy(entry_path, entry_type, depth - 1, max_size);
                if(dir_size > max_size) break;
                size += dir_size;
            }

            if(dir_size > max_size)
            {
                size = 0;
                for(const auto& dir_entry : fs::directory_iterator{path})
                {
                    fs::path entry_path = dir_entry.path();
                    std::cout << entry_path << "\n";
                }
            }
        }

    } else {
        try {
            size = fs::file_size(path);
        }
        catch (const std::exception& e){
            std::cerr << "Exception: " << e.what() << "\n";
            size = 0;
        }
    }

    return size;
}

int main(int argc, char* argv[])
{
    if(argc <= 1) {
        std::cout << "\n";
        std::cout << "Large directory finder" << "\n";
        std::cout << "usage: ldir <path> [max size] [max depth]" << "\n";
        std::cout << "| <path>: required; path to base directory" << "\n";
        std::cout << "| [max size (int)]: optional; log_10 of number of bytes for cutoff; default 12 (terabyte)" << "\n";
        std::cout << "| [max depth (int)]: optional; default unlimited (-1); maximum search depth" << "\n";
        std::cout << "\n";
        return 0;
    }

    const std::string base_directory = argv[1];

    std::uintmax_t one = 1;
    std::uintmax_t max_size = one << ( (argc > 2) ? atoi(argv[2]) : 12 )*10/3;

    int max_depth = (argc > 3) ? atoi(argv[3]) : -1;

    const fs::path base_path{base_directory};
    const Entry_type base_type = directory;

    hierarchy(base_path, base_type, max_depth, max_size);
}
