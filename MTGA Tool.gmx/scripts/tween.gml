/// tween(value,from,to,speed)
/*
**  Usage:
**      tween()
**
**  Arguments:
**      value, from, to, speed
**
**  Returns:
**      Real: The new value
**
**  Tween between two values at the given speed
** 
**  Manuel Etchegaray
**
*/

var _value, _from, _to, _speed;
_value = argument0; // value
_from  = argument1; // from
_to    = argument2; // to
_speed = argument3; // speed

if _from < _to {
    _value += _speed;
    if (_value > _to) {
        _value = _to;
    }
    if (_value < _from) {
        _value = _from;
    }
}
if _from > _to {
    _value -= _speed;
    if (_value > _from) {
        _value = _from;
    }
    if (_value < _to) {
        _value = _to;
    }
}

return _value;
