/// draw_mana_cost(cost, x, y, align, sprite)
var cost = argument0
if argument0 = ""    exit;
var _size = string_count("}{", argument0)+1;
var _w = 18;
if argument4 == icons_20_spr
    _w = 22;
var _x = argument1;
var _y = argument2;

if argument3 == 1   _x -= _w*(_size-1);
if argument3 == 2   _x -= _w*(_size/2)-(_w/2);

var sub = 0;

for (var _i=0; _i<_size; _i++) {
    sub = string_extract(argument0, "}{", _i);
    sub = string_replace_all(sub, "{", "");
    sub = string_replace_all(sub, "}", "");
    draw_sprite(argument4, ds_map_find_value(mana, sub), _x, _y)
    _x += _w;
}
