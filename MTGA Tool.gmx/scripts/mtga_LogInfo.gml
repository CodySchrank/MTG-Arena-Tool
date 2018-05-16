_str = string_copy(argument0, string_pos("{", argument0), string_length(argument0));
json = json_decode(_str);
if json == -1   exit;
show_debug_message("> Log Info");
params = json[? "params"];
payload = params[? "payloadObject"];
if !is_undefined(payload) {
    pid = payload[? "playerId"];
    if !is_undefined(pid) {
        controller_obj.player_id = pid;
    }
    nam = payload[? "screenName"];
    if !is_undefined(nam) {
        controller_obj.player_name = nam;
    }
}
ds_map_destroy(json);
