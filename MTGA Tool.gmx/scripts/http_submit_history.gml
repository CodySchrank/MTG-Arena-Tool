var _str = '?';
_str  = 'uid='+string(controller_obj.player_id);
_str += '&method=submit_history';
_str += '&token=$$TKN$$';
_str += '&course='+string(argument0);

ds_list_add(controller_obj.async_submit, _str);
//controller_obj.async_submit_history = http_post_string(server_api_url, _str);

