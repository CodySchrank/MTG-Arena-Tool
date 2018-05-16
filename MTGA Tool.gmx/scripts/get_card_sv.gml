var _str = string(cards_db[? string(argument0)])
var _type = string_lower(string_extract(_str, "$", 2));
var _cmc  = real(string_extract(_str, "$", 4));

var sv = 0;

if string_pos("creature", _type)
    sv = 1000
if string_pos("planeswalker", _type)
    sv = 2000
if string_pos("instant", _type)
    sv = 3000
if string_pos("sorcery", _type)
    sv = 4000
if string_pos("artifact", _type)
    sv = 5000
if string_pos("enchantment", _type)
    sv = 6000
if string_pos("land", _type)
    sv = 7000

sv += _cmc;

return sv;
