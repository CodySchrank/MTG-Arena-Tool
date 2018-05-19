var _str = '?';
_str  = 'uid='+string(controller_obj.player_id);
_str += '&method=get_top_decks';

ds_list_add(controller_obj.async_submit, _str);

