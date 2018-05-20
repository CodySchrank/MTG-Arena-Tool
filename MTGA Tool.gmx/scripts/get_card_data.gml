/// get_card_data(cardid, return)
var _map = ds_map_find_value(cards_db, string(argument0));
if _map != undefined {
    return string_extract(_map, "$", argument1);
}
else {
    return string_extract("Unknown ("+string(argument0)+")$$${0}$0$0", "$", argument1);
    if controller_obj.mode == 1 {
        show_debug_message("Unknown card ID "+string(argument0));
    } 
}

