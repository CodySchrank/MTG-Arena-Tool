/// arenatime_to_datetime(string)
// 2018-05-19T14:13:44.670544
var date = string_extract(argument0, "T", 0);
var _ye = real(string_extract(argument0, "-", 0));
var _mo = real(string_extract(argument0, "-", 1));
var _da = real(string_extract(argument0, "-", 2));
//var time = string_extract(argument0, "T", 1);
//var _ho = real(string_extract(argument0, ":", 0));
//var _mi = real(string_extract(argument0, ":", 1));
//var _se = real(string_extract(argument0, ":", 2));

return date_create_datetime(_ye, _mo, _da, 0, 0, 0);


