/// draw_tile_arena(sprite, number, cardid, x, y, width)

var _name = get_card_data(argument2, 0);
var _cost = get_card_data(argument2, 3);
var _fram = get_card_data(argument2, 7);
var _tile = card_get_tile(_fram);

var _sprw = sprite_get_width(argument0);
var _xoff = 20;
if argument0 == card_tiles_32_spr
    _xoff = 26;
var _w = argument5-_sprw-_sprw-_xoff;

draw_sprite_ext(argument0, 51, argument3, argument4, 1, 1, 0, c_white, 1);
draw_sprite_ext(argument0, _tile+1, argument3+_xoff+_sprw, argument4, _w/_sprw, 1, 0, c_white, 1);
draw_sprite_ext(argument0, _tile  , argument3+_xoff, argument4, 1, 1, 0, c_white, 1);
draw_sprite_ext(argument0, _tile+2, argument3+_w+_sprw+_xoff, argument4, 1, 1, 0, c_white, 1);
draw_set_font(beleren_10);
draw_set_halign(fa_center);
draw_set_color(c_white);
if argument0 == card_tiles_32_spr {
    draw_text(argument3+16, argument4, string(argument1));
    draw_set_color(c_black);
    draw_set_halign(fa_left);
    draw_text(argument3+45, argument4, string(_name));
    draw_mana_cost(_cost, argument3+_w+_sprw+_sprw+3, argument4, 1, icons_20_sh_spr);
}
else {
    draw_text(argument3+12, argument4, string(argument1));
    draw_set_color(c_black);
    draw_set_halign(fa_left);
    draw_text(argument3+32, argument4, string(_name));
    draw_mana_cost(_cost, argument3+_w+_sprw+_sprw+3, argument4, 1, icons_16_sh_spr);
}


