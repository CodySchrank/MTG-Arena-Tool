xx = sidew;
yy = toph+32;
height = 0;
//
draw_set_font(font_12);
draw_set_color(color_white);
draw_set_halign(fa_left);
draw_text(xx+40, yy, "Find output log manually");

but = button_rectangle_simple(view_wview-320-64, yy-16, view_wview-320+64, yy+16)
if but == 2 {
    var path = get_open_filename("Arena Log file|output_log.txt", parser_obj.log_uri);
    show_debug_message("> "+string(path));
    if file_exists_ns(path) && path != "" {
        parser_obj.log_uri = path;
    }
}
draw_sprite(but_normal_spr, but, view_wview-320, yy);
draw_set_font(font_12);
draw_set_halign(fa_center);
draw_set_color(color_dark);
draw_text(view_wview-320, yy, "Find manually");

//
yy += 48;
draw_set_color(color_white);
draw_set_halign(fa_left);
draw_text(xx+40, yy, "Show overlay when playing:");

but = button_rectangle_simple(view_wview-320-12, yy-12, view_wview-320+12, yy+12);
if but == 4 {
    sel = saved_data[? "show_overlay"];
    if is_undefined(sel)    sel = 1;
    saved_data[? "show_overlay"] = !sel;
    save();
}
draw_sprite(but_square_spr, but, view_wview-320, yy);
if saved_data[? "show_overlay"] {
    draw_sprite(ok_spr, 0, view_wview-320, yy);
}

//
yy += 48;
draw_set_color(color_white);
draw_set_halign(fa_left);
draw_text(xx+40, yy, "Close button on overlay behaviour:");

but = button_rectangle_simple(view_wview-320-64, yy-12, view_wview-320+64, yy+12);
sel = saved_data[? "close_overlay"];
if is_undefined(sel)    sel = 0;
if but == 4 {
    sel += 1;
    if sel > 3 sel = 0;
    saved_data[? "close_overlay"] = sel;
    save();
}
txt[0] = "Hide for 10s";
txt[1] = "Hide for 20s";
txt[2] = "Toggle opacity";
txt[3] = "Close overlay";
draw_sprite(but_normal_spr, but, view_wview-320, yy);
draw_set_font(font_12);
draw_set_halign(fa_center);
draw_set_color(color_dark);
draw_text(view_wview-320, yy, txt[sel]);

//
yy += 48;
draw_set_color(color_white);
draw_set_halign(fa_left);
draw_text(xx+40, yy, "Deck lists style:");

but = button_rectangle_simple(view_wview-320-64, yy-12, view_wview-320+64, yy+12);
sel = saved_data[? "decklist_style"];
if is_undefined(sel)    sel = 0;
if but == 4 {
    sel += 1;
    if sel > 1 sel = 0;
    saved_data[? "decklist_style"] = sel;
    save();
}
txt[0] = "Classic";
txt[1] = "Arena";

draw_sprite(but_normal_spr, but, view_wview-320, yy);
draw_set_font(font_12);
draw_set_halign(fa_center);
draw_set_color(color_dark);
draw_text(view_wview-320, yy, txt[sel]);

yy += 48;
if sel == 0 {
    draw_tile_classic(4, 67518, xx+40, yy, view_wview-320-sidew, 24);
}
if sel == 1 {
    draw_tile_arena(card_tiles_24_spr, 4, 67518, xx+40, yy, view_wview-320-sidew);
}

//
/*
yy += 48;
draw_set_color(color_white);
draw_set_halign(fa_left);
draw_text(xx+40, yy, "Clear Output Log when it reaches:");
draw_set_font(font_12_i);
draw_set_color(color_light);
draw_text(xx+40, yy+24, "A big output log makes it slower to read.");
draw_set_font(font_12);

but = button_rectangle_simple(view_wview-320-64, yy, view_wview-320+64, yy+24);
sel = saved_data[? "clear_log"];
if is_undefined(sel)    sel = 1;
if but == 4 {
    sel += 1;
    if sel > 3 sel = 0;
    saved_data[? "clear_log"] = sel;
    save();
}
txt[0] = "25mb";
txt[1] = "50mb";
txt[2] = "75mb";
txt[3] = "Do not clear";
draw_sprite(but_normal_spr, but, view_wview-320, yy+12);
draw_set_font(font_12);
draw_set_halign(fa_center);
draw_set_color(color_dark);
draw_text(view_wview-320, yy+12, txt[sel]);
*/
