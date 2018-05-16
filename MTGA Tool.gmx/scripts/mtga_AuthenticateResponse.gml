_str = string_copy(argument0, string_pos(lookfor, argument0)+string_length(lookfor)-1, string_length(argument0));
json = json_decode(_str);
if json == -1   exit;

json = json[? "authenticateResponse"];
controller_obj.player_id = json[? "clientId"];
controller_obj.player_name = json[? "screenName"];
ds_map_destroy(json);
