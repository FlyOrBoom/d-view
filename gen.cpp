#include <algorithm>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <utility>
#include <map>

namespace fs = std::filesystem;

enum Entry_type { 
    directory = 0,
    file = 1
};

struct Entry_key {
    std::string entry_name;
    Entry_type entry_type;

    std::strong_ordering operator<=>(const Entry_key& other) const {
        auto compare_name = entry_name <=> other.entry_name; 
        auto compare_type = entry_type <=> other.entry_type; 
        if (compare_type != 0) return compare_type;
        return compare_name;
    }
};


void hierarchy(fs::path path, struct Entry_key key, int depth)
{
    std::cout << "[";
    std::cout << "\"" << key.entry_name << "\"";

    if(key.entry_type == directory) {
        std::cout << ",0";

        if(depth != 0) 
        {
            std::map<struct Entry_key, fs::path> sorted_dir;

            for(const auto& dir_entry : fs::directory_iterator{path})
            {
                fs::path entry_path = dir_entry.path();
                struct Entry_key entry_key = {
                    .entry_name = entry_path.filename(),
                    .entry_type = (dir_entry.is_directory()) ? directory : file,
                };

                sorted_dir[ entry_key ] = entry_path;
            }
            for(const auto&[ entry_key, entry_path ] : sorted_dir)
            {
                std::cout << ",";
                hierarchy(entry_path, entry_key, depth - 1);
            }
        }
    } else {
        std::cout << ",1";
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
    const struct Entry_key base_key = { 
        .entry_name = base_path.filename(),
        .entry_type = directory,
    };

    hierarchy(base_path, base_key, max_depth);
    std::cout << "\n";
}
