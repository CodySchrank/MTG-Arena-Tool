/// get_card_data(cardid, return)
if ds_map_exists(cards_db, string(argument0))
    return string_extract(string(cards_db[? string(argument0)]), "$", argument1);
else {
    return string_extract("Unknown ("+string(argument0)+")$$${0}$0$0", "$", argument1);
    if controller_obj.mode == 1 {
        show_debug_message("Unknown card ID "+string(argument0));
    } 
}

