_str = string_copy(argument0, string_pos(lookfor, argument0)+string_length(lookfor)-1, string_length(argument0));
json = json_decode(_str);
if json == -1   exit;
show_debug_message("> Get imported deck");

var list = json[? "mainDeck"];
var first = list[| 0];
macro_obj.card_id = first[? "id"];
