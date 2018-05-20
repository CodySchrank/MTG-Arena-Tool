var _str = cards_db[? string(argument0)];
var _type = string_extract(_str, "$", 2);
var _cmc  = real(string_extract(_str, "$", 4));

var sv = 0;

if string_pos("Creature", _type)
    sv = 1000
if string_pos("Planeswalker", _type)
    sv = 2000
if string_pos("Instant", _type)
    sv = 3000
if string_pos("Sorcery", _type)
    sv = 4000
if string_pos("Artifact", _type)
    sv = 5000
if string_pos("Enchantment", _type)
    sv = 6000
if string_pos("Land", _type)
    sv = 7000

sv += _cmc;

return sv;
