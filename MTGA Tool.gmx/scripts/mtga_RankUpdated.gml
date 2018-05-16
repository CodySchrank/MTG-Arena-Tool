_str = string_copy(argument0, string_pos(lookfor, argument0)+string_length(lookfor)-1, string_length(argument0));
//show_debug_message("> Rank updated");
jsonstruct = json_decode(_str);
//clipboard_set_text(_str);
if jsonstruct == -1   exit;

var type = jsonstruct[? "rankUpdateType"]
if type == "Constructed" {
    controller_obj.con_rank = jsonstruct[? "newClass"];
    controller_obj.con_tier = jsonstruct[? "newTier"];
    controller_obj.con_prog = jsonstruct[? "newProgress"];
    controller_obj.con_stre = jsonstruct[? "newStreak"];
    // save
    player_data[? "rank"] = controller_obj.con_rank;
    player_data[? "tier"] = controller_obj.con_tier;
}
if type == "Limited" {
    controller_obj.lim_rank = jsonstruct[? "newClass"];
    controller_obj.lim_tier = jsonstruct[? "newTier"];
    controller_obj.lim_prog = jsonstruct[? "newProgress"];
    controller_obj.lim_stre = jsonstruct[? "newStreak"];

}


http_set_player();
