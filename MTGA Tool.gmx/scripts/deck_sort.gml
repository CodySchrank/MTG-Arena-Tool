/// deck_sort(ds_list) 
var _list = argument0;

var _size = ds_list_size(_list);
var _card, cc, _ca, _cb, _a, _b, _tmp;
var sorted = false;
while (!sorted) {
    sorted = true;
    for (cc=0; cc<_size-1; cc++) {
        _card = ds_list_find_value(_list, cc);
        _ca = real(_card[? "id"]);
        _card = ds_list_find_value(_list, cc+1);
        _cb = real(_card[? "id"]);
        
        if get_card_data(_ca, 0) > get_card_data(_cb, 0) {
           _tmp = ds_map_create();
           ds_map_copy(_tmp, ds_list_find_value(_list, cc));
        
           ds_list_delete(_list, cc);
           ds_list_insert(_list, cc+1, _tmp);
           sorted = false;
        }
    }
}

sorted = false;
while (!sorted) {
    sorted = true;
    for (cc=0; cc<_size-1; cc++) {
        _card = ds_list_find_value(_list, cc);
        _ca = real(_card[? "id"]);
        _card = ds_list_find_value(_list, cc+1);
        _cb = real(_card[? "id"]);
        
        if get_card_sv(_ca) > get_card_sv( _cb) {
           _tmp = ds_map_create();
           ds_map_copy(_tmp, ds_list_find_value(_list, cc));
        
           ds_list_delete(_list, cc);
           ds_list_insert(_list, cc+1, _tmp);
           sorted = false;
        }
    }
}
