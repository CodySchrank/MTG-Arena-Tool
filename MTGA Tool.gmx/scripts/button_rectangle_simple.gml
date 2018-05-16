/// button_rectangle_simple(x1,y1,x2,y2,(optional) mouse button)
var ret, _i;
ret = 0;

var check = mb_left;
if argument_count == 5 {
    check = argument[4]; 
}

if point_in_rectangle(mouse_x, mouse_y, argument[0], argument[1], argument[2], argument[3]) {
    ret = 1;
    if mouse_check_button(check) {
        ret = 3;
    }
    if mouse_check_button_released(check) {
        ret = 4;
    }
    if mouse_check_button_pressed(check) {
        ret = 2;
    }
}


return (ret)
