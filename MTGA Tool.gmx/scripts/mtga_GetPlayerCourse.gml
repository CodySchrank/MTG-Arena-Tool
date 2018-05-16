_str = string_copy(argument0, string_pos(lookfor, argument0)+string_length(lookfor)-1, string_length(argument0));

json = json_decode(_str);
if json == -1   exit;

if ds_map_exists(json, "CourseDeck") {
    deck = json[? "CourseDeck"];

    controller_obj.deck_costs = "";
    controller_obj.alarm[2] = 1;
    controller_obj.active_deck = deck[? "id"];
    
    var decksn = ds_list_size(player_data[? "decks"]);
    for (dd=0; dd<decksn; dd++) {
        _deck = ds_list_find_value(player_data[? "decks"], dd);
        if _deck[? "id"] == deck[? "id"] {
            ds_list_delete(player_data[? "decks"], dd);
            decksn -= 1;
        }
    }
            
    ds_list_add(player_data[? "decks"], deck);
    
    if json[? "Id"] != "00000000-0000-0000-0000-000000000000" {
        json[? "_id"] = json[? "Id"];
        
        var cd = json[? "CourseDeck"];
        cd[? "colorIdentity"] = deck_get_colors(cd[? "mainDeck"], cd[? "sideboard"])
        ds_map_delete(json, "Id");
        http_submit_course(json_encode(json));
    }
}
controller_obj.game_winner = -1;
with (controller_obj) {
    event_perform(ev_alarm, 1);
}
