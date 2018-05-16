var nw = sprite_get_width(argument0);
var nh = sprite_get_height(argument0);

if argument1 == c_black
    argument1 = rgb(24,21,16);

//sprite_set_alpha_from_sprite(argument0, card_alpha_spr)

var temp_surf = surface_create(nw, nh);

surface_set_target(temp_surf);
draw_clear_alpha(c_black, 0);
draw_set_alpha(1);
draw_sprite(argument0, 0, 0, 0);
draw_set_blend_mode(bm_subtract);
draw_sprite_ext(card_alpha_spr, 0, 0, 0, nw/488, nh/680, 0, c_white, 1);
draw_set_blend_mode(bm_normal);

surface_reset_target();

sprite_delete(argument0);

var ret = sprite_create_from_surface(temp_surf, 0, 0, nw, nh, 0, 0, 0, 0);

surface_free(temp_surf);
return ret;
//

