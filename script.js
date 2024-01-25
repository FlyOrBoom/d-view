// Notation convention: a variable prefixed with $ indicates an HTML element

const state = {}; // Mutable state of the viewer

state.selected_path = window.location.pathname.split("/").filter(entry => entry !== "");
state.preview_path = state.selected_path;
state.diff_depth = 0;

const dir_structure_fetch = await fetch("/dir_structure.json");
const dir_structure = await dir_structure_fetch.json();

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

    const type = structure[1];

    if(type === enums.FILE) {
        $depths.slice(depth).forEach($depth => $depth.hidden = true);
        return;
    }

    const children = structure.slice(2);

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

        const child_path = path_covered.concat([ child[0] ])

        if(child[1] === enums.FILE){
          $item.classList.add("nav-file");
        } else {
          $item.classList.add("nav-dir");
        }

        if(path_remaining[0] === child[0]) 
          $item.classList.add("nav-selected");

        $item.classList.add(child[0]);
        $title.append(child[0]);
        $link.append($title);
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
      structure: children.find(child => child[0] == path_remaining[0])
    });
  } else {
    $depths.slice(depth + 1).forEach($depth => $depth.hidden = true)
  }
}
