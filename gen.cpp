#include <algorithm>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <stdexcept>

namespace fs = std::filesystem;

void hierarchy(fs::path path, int depth)
{
    std::cout << "[";
    std::cout << path.filename();

    if(fs::is_directory(path)) {
        if(depth == 0) {
            std::cout << ",\"dir\"";
        } else {
            for(const fs::directory_entry& dir_entry : fs::directory_iterator{path})
            {
                std::cout << ",";
                hierarchy(dir_entry, depth - 1);
            }
        }
    } else {
        std::cout << ",\"file\"";
    }

    std::cout << "]";
}

int main(int argc, char* argv[])
{
    if(argc <= 1) {
        std::cout << "Filesystem JSON tree generator" << "\n";
        std::cout << "usage: gen <path> [max-depth]" << "\n";
        return 0;
    }

    const std::string base_directory = argv[1];

    int max_depth = (argc >= 3) ? atoi(argv[2]) : -1;

    const fs::path base_path{base_directory};

    hierarchy(base_path, max_depth);
    std::cout << "\n";
}
