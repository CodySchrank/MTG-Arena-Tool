_str = string_copy(argument0, string_pos(lookfor, argument0)+string_length(lookfor)-1, string_length(argument0));
_str = '{"decks":'+_str+'}';
show_debug_message("> Get deck lists");
decks = json_decode(_str);
if decks == -1   exit;

ds_map_clear(player_data[? "decks"]);

ds_list_copy(player_data[? "decks"], ds_map_find_value(decks, "decks"));
with (controller_obj) {
    event_perform(ev_alarm, 1);
}


