/// deck_get_colors(main, side)
var cc;
var _colors = ""; 
var deck_costs = "";

if argument0 != undefined {
    var size = ds_list_size(argument0);
    for (cc=0; cc<size; cc++) {
        _card = ds_list_find_value(argument0, cc);
        _ca = real(_card[? "id"]);
        deck_costs += string(get_card_data( _ca, 3));
    }
}

if argument1 != undefined {
    var size = ds_list_size(argument1);
    for (cc=0; cc<size; cc++) {
        _card = ds_list_find_value(argument1, cc);
        _ca = real(_card[? "id"]);
        deck_costs += string(get_card_data( _ca, 3));
    }
}

if string_count("W", deck_costs) > 0    _colors += "{W}";
if string_count("U", deck_costs) > 0    _colors += "{U}";
if string_count("B", deck_costs) > 0    _colors += "{B}";
if string_count("R", deck_costs) > 0    _colors += "{R}";
if string_count("G", deck_costs) > 0    _colors += "{G}";
return _colors;
