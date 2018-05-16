/// json_set(json,path,value)
/*
**  Usage:
**      json_get()
**
**  Arguments:
**      map, path, value
**
**  Returns:
**      New value
**
**  map must be a valid JSON ds_map, and path is the path you want
**  to point within the JSON hierarchy.
**  value is the new value you want to put there, if it doesnt exists
**  it will be added to the JSON map
**  
**  Example of usage:
**   json_set(global.json, "Main menu.Title", "Something")
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
        var array_pos = real(string_replace(string_extract(key, "[", 1), "]", ""));
        key = string_extract(key, "[", 0);
        current = ds_map_find_value(value, key);
        value = ds_list_find_value(current, array_pos);
    }
    else {
        value = ds_map_find_value(current, key);
    }
}

ds_map_replace(current, key, argument2);

return value;
