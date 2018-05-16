/// json_get(json,path)
/*
**  Usage:
**      json_get()
**
**  Arguments:
**      map, path
**
**  Returns:
**      Pointed value
**
**  map must be a valid JSON ds_map, and path is the path you want
**  to point within the JSON hierarchy.
**  
**  Examples of usage:
**   json_get(global.json, "Main menu.Title")
**   json_get(global.json, "Main menu.Items[0]")
**   json_get(global.json, "Main menu.Items[]")
**   json_get(global.json, "Main menu.Items[0].Title")
** 
**  Manuel Etchegaray
**
*/


var value = argument0;
var current = argument0;
var path = argument1;
var key, ii;

for (ii=0; ii<string_count(".", path)+1; ii++) {
    key = string_extract(path, ".", ii);
    current = value;
    
    if string_count("[", key) && string_count("]", key) {
        var array_pos = string_replace(string_extract(key, "[", 1), "]", "");
        key = string_extract(key, "[", 0);
        current = ds_map_find_value(value, key);
        if array_pos == "" {
            value = ds_list_size(current);
        }
        else {
            value = ds_list_find_value(current, real(array_pos));
        }
    }
    else {
        value = ds_map_find_value(current, key);
    }
}

return value;
