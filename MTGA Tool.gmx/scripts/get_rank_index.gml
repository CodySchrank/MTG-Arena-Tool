/// get_rank_index(rank, tier);
var _rank, _tier;

_rank = string(argument0);
_tier = real(argument1);

var ii = 25;
if _rank = "Bronze" || _rank = "Beginner"
    ii = 0 + _tier;
if _rank = "Silver" || _rank = "Intermediate"
    ii = 5 + _tier;
if _rank = "Gold" || _rank = "Advanced"
    ii = 10 + _tier;
if _rank = "Diamond"
    ii = 15 + _tier;
if _rank = "Master"
    ii = 20 + _tier;

return ii;
