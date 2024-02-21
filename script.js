// Notation convention: a variable prefixed with $ indicates an HTML element

const state = {}; // Mutable state of the viewer

state.selected_path = window.location.pathname.split("/").filter(entry => entry !== "");
state.preview_path = state.selected_path;
state.diff_depth = 0;

const dir_structure_fetch = await fetch("/dir_structure.json");
const dir_structure = await dir_structure_fetch.json();

const struct_name = structure => structure[0] // zeroth element is file/dir name
const struct_type = structure => structure[1] // first element is file/dir type
const struct_children = structure => structure.slice(2, -1) // in between are dir children
const struct_size = structure => structure[structure.length - 1] // last element is file/dir size

// https://stackoverflow.com/a/20732091
const format_size = (size) => { 
    const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

const enums = {
  DIRECTORY: 0,
  FILE: 1,
}

const $nav = document.getElementById("nav");
$nav.addEventListener("mouseout", (event) => {
  if(event.target === $nav) preview_path(state.selected_path);
});

const MAX_DEPTH = 16;
const $depths = Array(MAX_DEPTH).fill(0).map((_, index) => {
  const $depth = document.createElement("ul");
  return $depth;
})
$nav.replaceChildren(...$depths)

preview_path(state.selected_path)

function path_to_url(path){
    return "/" + path.join("/");
}

function preview_path(path){
    const old_path = state.preview_path;
    state.diff_depth = path.findIndex( (entry, index) => entry !== old_path[index] );
    state.preview_path = path;
    draw_dir({
        depth: 0,
        $root: $nav,
        path_covered: [],
        path_remaining: path,
        structure: dir_structure,
    });
}

function select_path(path){
    preview_path(path);
    state.selected_path = path;
    history.pushState(state.selected_path, "", path_to_url(path));
}

function draw_dir({ depth, $root, path_covered, path_remaining, structure }){
  /* Using a structure object, recursively draws each directory listed in path_remaining
   * as an HTML list of the files and subdirectories it contains,
   * attaching this HTML list to $root.
   *
   * $root: HTML element to attach directory to 
   * path_covered: Array of strings, path from the root directory to the structure object
   * path_remaining: Array of strings, path from the structure object to the selected object
   * structure: JSON of the directory structure
  */

    const type = struct_type(structure);
    const size = struct_size(structure)

    if(type === enums.FILE) {
        $depths.slice(depth).forEach($depth => $depth.hidden = true);
        return;
    }

    const children = struct_children(structure)

    if(depth === state.diff_depth) {
        Array.from($depths[depth].getElementsByClassName("nav-selected"))
            .forEach( element => element.classList.remove("nav-selected") );

        Array.from($depths[depth].getElementsByClassName(path_remaining[0]))
            .forEach( element => element.classList.add("nav-selected") );
    }

    if(depth > state.diff_depth && children.length > 0) {

      // Create HTML list item element for each file and subdirectory
      const $items = children.map(child => {
        const $item = document.createElement("li");
        const $link = document.createElement("a");
        const $title = document.createElement("span");
        const $size = document.createElement("span");

        const child_name = struct_name(child)
        const child_type = struct_type(child)
        const child_size = struct_size(child)

        const child_path = path_covered.concat([ child_name ])

        if(child_type === enums.FILE){
          $item.classList.add("nav-file");
        } else {
          $item.classList.add("nav-dir");
        }

        if(path_remaining[0] === child_name)
          $item.classList.add("nav-selected");

        $item.classList.add(child_name);

        $title.classList.add("nav-title")
        $title.textContent = child_name;
        $link.append($title);

        $size.classList.add("nav-size")
        $size.textContent = "(" + format_size(child_size) + ")" 
              + (child_type === enums.DIRECTORY ? " /" : "");
        $link.append($size);

        $item.append($link);

        $link.href = path_to_url(child_path);

        $item.addEventListener("mouseover", () => preview_path(child_path) );

        $item.addEventListener("click", (event) => {
            event.preventDefault();
            select_path(child_path);
        });

        return $item;
      });

      // Append elements to root
      $depths[depth].replaceChildren(...$items);
      $depths[depth].hidden = false;

    }

  // Recurse
  if(path_remaining.length > 0) {
    draw_dir({ 
      depth: depth + 1,
      $root,
      path_covered: path_covered.concat(path_remaining[0]),
      path_remaining: path_remaining.slice(1), 
      structure: children.find(child => struct_name(child) == path_remaining[0])
    });
  } else {
    $depths.slice(depth + 1).forEach($depth => $depth.hidden = true)
  }
}
