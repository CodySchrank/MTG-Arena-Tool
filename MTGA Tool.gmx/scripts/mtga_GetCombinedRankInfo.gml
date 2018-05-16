_str = string_copy(argument0, string_pos(lookfor, argument0)+string_length(lookfor)-1, string_length(argument0));
show_debug_message("> Get rank info");
jsonstruct = json_decode(_str);
//clipboard_set_text(_str);
if jsonstruct == -1   exit;

cons = jsonstruct[? "constructed"];
controller_obj.player_id = cons[? "playerId"];

controller_obj.con_rank = cons[? "class"];
controller_obj.con_tier = cons[? "tier"];
controller_obj.con_prog = cons[? "progress"];
controller_obj.con_stre = cons[? "streak"];
controller_obj.con_wins = cons[? "wins"];
controller_obj.con_loss = cons[? "losses"];

limited = jsonstruct[? "limited"];
controller_obj.lim_rank = limited[? "class"];
controller_obj.lim_tier = limited[? "tier"];
controller_obj.lim_prog = limited[? "progress"];
controller_obj.lim_stre = limited[? "streak"];
controller_obj.lim_wins = limited[? "wins"];
controller_obj.lim_loss = limited[? "losses"];

// save
player_data[? "con_rank"] = controller_obj.con_rank;
player_data[? "con_tier"] = controller_obj.con_tier;
player_data[? "lim_rank"] = controller_obj.lim_rank;
player_data[? "lim_tier"] = controller_obj.lim_tier;

http_set_player();
