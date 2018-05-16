/// string_compare(str a, str b)
//
// Outcomes:
//  0 = both are equal
//  1 = A is lower
//  2 = B is lower
var _stra = string_lower(argument0);
var _strb = string_lower(argument1);

if _stra == _strb
    return 0;

var _size = min(string_length(_stra),string_length(_strb));

for (ii = 0; ii<_size; ii++) {
    if ord(string_char_at(_stra, ii)) < ord(string_char_at(_strb, ii)) {
        return 1;
    }
    if ord(string_char_at(_stra, ii)) > ord(string_char_at(_strb, ii)) {
        return 2;
    }
}

return 1;

