#include <algorithm>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <vector>
#include <execution>
 
namespace fs = std::filesystem;

void hierarchy(fs::path path)
{
    std::cout << "[";
    std::cout << path.filename();
    
    if(fs::is_directory(path)) {
        std::vector<fs::directory_entry> it;
        std::ranges::for_each(
            fs::directory_iterator{path},
            [&](const auto& dir_entry){
                it.push_back(dir_entry);
            }
        );
        std::for_each(
            std::execution::par,
            std::begin(it),
            std::end(it),
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
