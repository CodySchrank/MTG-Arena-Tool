_str = string_copy(argument0, string_pos(lookfor, argument0)+string_length(lookfor)-1, string_length(argument0));
json = json_decode(_str);
if json == -1   exit;
show_debug_message("> Get player cards");


var i, sc, key;
key = ds_map_find_first(sets_completion);
sz = ds_map_size(sets_completion);
for (i=0; i<sz; i++) {
    sc = ds_map_find_value(sets_completion, key);
    ds_map_clear(sc);
    sc = json_decode(setsizestr);
    ds_map_replace_map(sets_completion, key, sc);
    key = ds_map_find_next(sets_completion, key);
}

var sz = ds_map_size(json);
key = ds_map_find_first(json);
for (i=0; i<sz; i++) {
    cs = get_card_data(key, 1);
    cr = get_card_data(key, 5);
    set = sets_completion[? cs];
    
    num = json[? key];
    
    ds_map_replace(set, "total", set[? "total"] + num);
    ds_map_replace(set, cr, set[? cr] + num);
    
    key = ds_map_find_next(json, key);
}
//show_debug_message(json_encode(sets_completion));

ds_map_destroy(json);
