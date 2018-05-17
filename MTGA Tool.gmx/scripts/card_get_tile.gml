/// card_get_tile(cardid)
var _frame = argument0;
var tile = 48;

var _w = min(string_count("{W}", _frame), 1);
var _u = min(string_count("{U}", _frame), 1);
var _b = min(string_count("{B}", _frame), 1);
var _r = min(string_count("{R}", _frame), 1);
var _g = min(string_count("{G}", _frame), 1);

// Colorless
if _w + _u + _b + _r + _g = 0
    tile = 48;
// White
if _w = 1 && _u = 0 && _b = 0 && _r = 0 && _g = 0
    tile = 0;
// Blue
if _w = 0 && _u = 1 && _b = 0 && _r = 0 && _g = 0
    tile = 3;
// Black
if _w = 0 && _u = 0 && _b = 1 && _r = 0 && _g = 0
    tile = 6;
// Red
if _w = 0 && _u = 0 && _b = 0 && _r = 1 && _g = 0
    tile = 9;
// Green
if _w = 0 && _u = 0 && _b = 0 && _r = 0 && _g = 1
    tile = 12;
// Gold
if _w + _u + _b + _r + _g >= 3
    tile = 15;
// WU
if _w = 1 && _u = 1 && _b = 0 && _r = 0 && _g = 0
    tile = 18;
// WB
if _w = 1 && _u = 0 && _b = 1 && _r = 0 && _g = 0
    tile = 21;
// UB
if _w = 0 && _u = 1 && _b = 1 && _r = 0 && _g = 0
    tile = 24;
// UR
if _w = 0 && _u = 1 && _b = 0 && _r = 1 && _g = 0
    tile = 27;
// BR
if _w = 0 && _u = 0 && _b = 1 && _r = 1 && _g = 0
    tile = 30;
// BG
if _w = 0 && _u = 0 && _b = 1 && _r = 0 && _g = 1
    tile = 33;
// RW
if _w = 1 && _u = 0 && _b = 0 && _r = 1 && _g = 0
    tile = 36;
// RG
if _w = 0 && _u = 0 && _b = 0 && _r = 1 && _g = 1
    tile = 39;
// GW
if _w = 1 && _u = 0 && _b = 0 && _r = 0 && _g = 1
    tile = 42;
// GU
if _w = 0 && _u = 1 && _b = 0 && _r = 0 && _g = 1
    tile = 45;

return tile;


