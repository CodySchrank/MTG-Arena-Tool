/// card_get_tile(cardid)
var _cost = get_card_data(argument0, 3);
var _type = string_lower(get_card_data(argument0, 2));
var tile = 16;

var _w = string_count("{W}", _cost);
var _u = string_count("{U}", _cost);
var _b = string_count("{B}", _cost);
var _r = string_count("{R}", _cost);
var _g = string_count("{G}", _cost);
if string_pos("land", _type) {
    var _w = string_count("plains", _type);
    var _u = string_count("island", _type);
    var _b = string_count("swamp", _type);
    var _r = string_count("mountain", _type);
    var _g = string_count("forest", _type);
}

_w = max(_w, 1);
_u = max(_u, 1);
_b = max(_b, 1);
_r = max(_r, 1);
_g = max(_g, 1);

// Colorless
if _w + _u + _b + _r + _g = 0
    tile = 16;
// White
if _w = 1 && _u = 0 && _b = 0 && _r = 0 && _g = 0
    tile = 0;
// Blue
if _w = 0 && _u > 1 && _b = 0 && _r = 0 && _g = 0
    tile = 1;
// Black
if _w = 0 && _u = 0 && _b = 1 && _r = 0 && _g = 0
    tile = 2;
// Red
if _w = 0 && _u = 0 && _b = 0 && _r = 1 && _g = 0
    tile = 3;
// Green
if _w = 0 && _u = 0 && _b = 0 && _r = 0 && _g = 1
    tile = 4;
// Gold
if _w + _u + _b + _r + _g >= 3
    tile = 5;
// WU
if _w = 1 && _u = 1 && _b = 0 && _r = 0 && _g = 0
    tile = 6;
// WB
if _w = 1 && _u = 0 && _b = 1 && _r = 0 && _g = 0
    tile = 7;
// UB
if _w = 0 && _u = 1 && _b = 1 && _r = 0 && _g = 0
    tile = 8;
// UR
if _w = 0 && _u = 1 && _b = 0 && _r = 1 && _g = 0
    tile = 9;
// BR
if _w = 0 && _u = 0 && _b = 1 && _r = 1 && _g = 0
    tile = 10;
// BG
if _w = 0 && _u = 0 && _b = 1 && _r = 0 && _g = 1
    tile = 11;
// RW
if _w = 1 && _u = 0 && _b = 0 && _r = 1 && _g = 0
    tile = 12;
// RG
if _w = 0 && _u = 0 && _b = 0 && _r = 1 && _g = 1
    tile = 13;
// GW
if _w = 1 && _u = 0 && _b = 0 && _r = 0 && _g = 1
    tile = 14;
// GU
if _w = 0 && _u = 1 && _b = 0 && _r = 0 && _g = 1
    tile = 15;

return tile;


