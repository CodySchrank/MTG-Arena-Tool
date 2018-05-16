var _str = '?';
_str  = 'uid='+string(controller_obj.player_id);
_str += '&method=auth';
_str += '&username='+string(controller_obj.player_name);

ds_list_add(controller_obj.async_submit, _str);
//controller_obj.async_auth = http_post_string(server_api_url, _str);

