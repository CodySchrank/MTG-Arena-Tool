_str = string_copy(argument0, string_pos("{", argument0), string_length(argument0));
json = json_decode(_str);
if json == -1   exit;
show_debug_message("> Join queue");
params = json[? "params"];

controller_obj.active_deck = string(params[? "deckId"]);
set_mode(1);
controller_obj.deck_costs = "";
controller_obj.alarm[2] = 1;
ds_map_destroy(json);
