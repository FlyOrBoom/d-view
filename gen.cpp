#include <algorithm>
#include <filesystem>
#include <fstream>
#include <iostream>
 
namespace fs = std::filesystem;

void hierarchy(fs::path path)
{
    std::cout << "[";
    std::cout << path.filename();
    
    if(fs::is_directory(path)) {
        std::ranges::for_each(
            fs::directory_iterator{path},
            [](const auto& dir_entry){
                std::cout << ",";
                hierarchy(dir_entry);
            }
        );
    } else {
        std::cout << ",\"file\"";
    }

    std::cout << "]";
}

int main(int argc, char* argv[1])
{
    std::string base_directory = argv[1];

    const fs::path base_path{base_directory};

    hierarchy(base_path);
    std::cout << "\n";
}
