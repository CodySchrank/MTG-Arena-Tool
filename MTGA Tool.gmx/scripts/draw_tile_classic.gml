/// draw_tile_classic(number, cardid, x, y, width, space)

var _name = get_card_data(argument1, 0);
var _cost = get_card_data(argument1, 3);

draw_set_color(color_white);
draw_set_halign(fa_left);
draw_set_font(font_12_b);
draw_text(argument2, argument3, string(argument0));
draw_set_font(font_12);
draw_text(argument2+argument5, argument3, _name);
draw_mana_cost(_cost, argument2+argument4-16, argument3, 1, icons_16_spr);
