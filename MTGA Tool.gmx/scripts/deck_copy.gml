/// deck_copy(ds_list) 
var _list = argument0;

var _size = ds_list_size(_list);
var _card, _cid, cc, _name, _set, _cn, _q, clip; 
var clip = "";

for (cc=0; cc<_size; cc++) {
    _card = ds_list_find_value(_list, cc);
    _cid = string(_card[? "id"]);
    _name = get_card_data(_cid, 0);
    _set = get_card_data(_cid, 1);
    _cn = get_card_data(_cid, 6);
    _q = _card[? "quantity"];
    
    if _name != "Unknown" {
        clip += string(_q)+" "+_name+" ("+setcodes[? _set]+") "+string(_cn)+"
";
    }
    
}

clipboard_set_text(clip);
