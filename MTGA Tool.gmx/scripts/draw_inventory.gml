xx = sidew;
yy = toph + 32 + offset;

draw_set_halign(fa_left);
draw_set_color(color_white);
draw_set_font(font_13);
draw_text(xx+32, yy, 'Press the "Sync" button to synchronize your inventory');

draw_set_font(font_12);
but = button_rectangle_simple(view_wview-90-64, yy-16, view_wview-90+64, yy+16);
if but == 2 {
    parser_obj.demand_update = 2;
}
draw_set_halign(fa_center);
draw_sprite(but_normal_spr, but, view_wview-90, yy);
draw_set_color(color_dark);
draw_text(view_wview-90, yy, "Sync");

draw_set_color(color_white);
yy += 52;

key = ds_map_find_first(sets_cards);    
sz = ds_map_size(sets_cards);
height = 80;
for (i=0; i<sz; i++) {
    set_sz = sets_cards[? key];
    set_co = sets_completion[? key];
            
    draw_set_halign(fa_center);
    draw_set_font(font_14);
    draw_text(bx, yy, key);
    yy += 24;
    draw_set_halign(fa_left);
    draw_set_font(font_10);
    draw_text(xx+24, yy, "Common:");
    draw_text(xx+24, yy+20, "Uncommon:");
    draw_text(xx+24, yy+40, "Rare:");
    draw_text(xx+24, yy+60, "Mythic:");
    draw_text(xx+24, yy+80, "Total:");
    draw_set_halign(fa_right);
    cc = 100/(set_sz[? "common"]*4)*set_co[? "common"];
    draw_text(view_wview-24, yy, string(set_co[? "common"])+" / "+string(set_sz[? "common"]*4)+" - "+string(cc)+"%");
    cc = 100/(set_sz[? "uncommon"]*4)*set_co[? "uncommon"];
    draw_text(view_wview-24, yy+20, string(set_co[? "uncommon"])+" / "+string(set_sz[? "uncommon"]*4)+" - "+string(cc)+"%");
    cc = 100/(set_sz[? "rare"]*4)*set_co[? "rare"];
    draw_text(view_wview-24, yy+40, string(set_co[? "rare"])+" / "+string(set_sz[? "rare"]*4)+" - "+string(cc)+"%");
    cc = 100/(set_sz[? "mythic"]*4)*set_co[? "mythic"];
    draw_text(view_wview-24, yy+60, string(set_co[? "mythic"])+" / "+string(set_sz[? "mythic"]*4)+" - "+string(cc)+"%");
    cc = 100/(set_sz[? "total"]*4)*set_co[? "total"];
    draw_text(view_wview-24, yy+80, string(set_co[? "total"])+" / "+string(set_sz[? "total"]*4)+" - "+string(cc)+"%");
    
    yy += 110
    height += 134;
    key = ds_map_find_next(sets_cards, key);
}

