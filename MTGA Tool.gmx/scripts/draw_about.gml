draw_set_halign(fa_center);
draw_set_color(color_green);
draw_set_font(font_24);
yy = toph + 64;
height = 0;

draw_text(bx, yy, "MTGA Tool");
draw_set_color(color_white);
draw_set_font(font_13);
yy += 32;
draw_text(bx, yy, 'By Manuel Etchegaray');
yy += 24;
draw_text(bx, yy, 'Version '+GM_version);

yy += 60;
draw_set_color(color_light);
draw_set_font(font_12_i);
draw_text(bx, yy, 'MtG Arena Tool is unofficial Fan Content permitted under the Fan Content Policy.
Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast.
©Wizards of the Coast LLC.');

yy += 70;

if controller_obj.current_version < controller_obj.latest_version {
    draw_set_font(font_12);
    but = button_rectangle_simple(bx-64, yy-16, bx+64, yy+16);
    if but == 2 {
        url_open(controller_obj.latest_version_link);
    }
    draw_set_halign(fa_center);
    draw_sprite(but_normal_spr, but, bx, yy);
    draw_set_color(color_dark);
    draw_text(bx, yy, "Download");
    
    draw_set_color(color_light);
    draw_set_font(font_12_i);
    draw_text(bx, yy+48, 'A new version ('+string(controller_obj.latest_version_code)+') is available');
}
else {
    draw_set_font(font_12);
    but = button_rectangle_simple(bx-64, yy-16, bx+64, yy+16);
    if but == 2 {
        http_get_version();
    }
    draw_set_halign(fa_center);
    draw_sprite(but_normal_spr, but, bx, yy);
    draw_set_color(color_dark);
    draw_text(bx, yy, "Check Updates");
    
    if controller_obj.latest_version != -1 {
        draw_set_color(color_light);
        draw_set_font(font_12_i);
        draw_text(bx, yy+48, 'Client is up to date!');
    }
}


