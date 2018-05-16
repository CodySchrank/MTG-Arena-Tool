var _str = '?';
_str  = 'uid='+string(controller_obj.player_id);
_str += '&method=set_player';
_str += '&token=$$TKN$$';
_str += '&name='+string(controller_obj.player_name);
_str += '&rank='+string(controller_obj.con_rank);
_str += '&tier='+string(controller_obj.con_tier);

ds_list_add(controller_obj.async_submit, _str);
//controller_obj.async_submit_course = http_post_string(server_api_url, _str);

