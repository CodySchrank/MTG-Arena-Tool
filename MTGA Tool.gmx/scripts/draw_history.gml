xx = sidew;
yy = toph + 16 + offset;

var map, key, size, lineh, list;
list = player_history[? "matches"];
size = ds_list_size(list);
lineh = 64;

if ds_map_size(matches) == 0 {
    ds_map_clear(decks_stats);
    for (i=0; i<size; i++) {
        key = ds_list_find_value(list, i);
        if ds_map_exists(matches, key) {
            map = matches[? key];
        }
        else if file_exists(key) {
            map = ds_map_secure_load(key);
            ds_map_add(matches, key, map);
        }
    }
    
    var sorted = false;
    while (!sorted)  {
        sorted = true;
        for (i=0; i<size-1; i++) {
            keya = ds_list_find_value(list, i);
            mapa = matches[? keya];
            keyb = ds_list_find_value(list, i+1);
            mapb = matches[? keyb];
            if mapa[? "timestamp"] < mapb[? "timestamp"] {
                ds_list_delete(list, i);
                ds_list_insert(list, i+1, keya);
                sorted = false; 
            }
        }
    }
}

height = 0;
if view_match != -1 {
    key = ds_list_find_value(list, view_match);
    map = matches[? key];
    draw_set_color(color_white);
    draw_set_font(font_14);
    draw_set_halign(fa_left);
    pl = map[? "player"];
    pname = pl[? "name"];
    draw_text(xx+80, yy+32, pname);
    if map[? "winner"] == "player" {
        draw_set_color(color_green);
        draw_set_font(font_14_i);
        draw_text(xx+80+string_width(pname+"  "), yy+32, "Winner"); 
    }
    
    rank = pl[? "rank"];
    tier = pl[? "tier"];
    ii = get_rank_index(rank, tier);
    draw_sprite_ext(ranks_spr, ii, xx+40, yy+32, 1, 1, 0, c_white, 1);
    
    draw_set_color(color_white);
    draw_set_font(font_12);
    deck = pl[? "deck"];
    size = ds_list_size(deck);
    for (o=0; o<size; o++) {
        card = ds_list_find_value(deck, o);
        q = card[? "quantity"];
        cid = card[? "id"];
               
        if saved_data[? "decklist_style"] == 0 {
            draw_tile_classic(q, cid, xx+16, yy+80+o*24, 324, 16);
        }
        if saved_data[? "decklist_style"] == 1 {
            draw_tile_arena(card_tiles_24_spr, q, cid, xx+16, yy+80+o*28, 324);
        }
        
        card = ds_map_find_next(deck, card);
    }
    
    if saved_data[? "decklist_style"] == 0
        yy += size*24+80+32;
    if saved_data[? "decklist_style"] == 1
        yy += size*28+80+32;
    
    height = yy + 48 - offset;
    yy = toph + 16 + offset;

    draw_set_font(font_14);
    draw_set_halign(fa_right);
    draw_set_color(color_white);
    pl = map[? "opponent"];
    pname = pl[? "name"];
    draw_text(view_wview-80, yy+32, pname);
    if map[? "winner"] == "opponent" {
        draw_set_color(color_green);
        draw_set_font(font_14_i);
        draw_text(view_wview-80-16-string_width(pname), yy+32, "Winner"); 
    }

    rank = pl[? "rank"];
    tier = pl[? "tier"];
    deck = pl[? "cards"];
    ii = get_rank_index(rank, tier);
    draw_sprite_ext(ranks_spr, ii, view_wview-40, yy+32, 1, 1, 0, c_white, 1);
       
    draw_set_color(color_white);
    draw_set_font(font_12);
    draw_set_halign(fa_right);
    
    size = ds_list_size(deck);
    for (o=0; o<size; o++) {
        card = ds_list_find_value(deck, o);
        q = card[? "quantity"];
        cid = card[? "id"];
        
        if saved_data[? "decklist_style"] == 0 {
            draw_tile_classic(q, cid, view_wview-340, yy+80+o*24, 324, 16);
        }
        if saved_data[? "decklist_style"] == 1 {
            draw_tile_arena(card_tiles_24_spr, q, cid, view_wview-340, yy+80+o*28, 324);
        }
        
        card = ds_map_find_next(deck, card)
    }
    
    if saved_data[? "decklist_style"] == 0
        yy += size*24+80+32;
    if saved_data[? "decklist_style"] == 1
        yy += size*28+80+32;
    height = max(height, yy + 48 - offset);
    
    but = button_rectangle_simple(view_wview-170-64, yy-16, view_wview-170+64, yy+16);
    if but == 4 {
        deck_copy(deck);
    }
    draw_set_halign(fa_center);
    draw_set_color(color_dark);
    draw_set_font(font_12);
    draw_sprite(but_normal_spr, but, view_wview-170, yy);
    draw_text(view_wview-170, yy, "Copy deck");
}
else {
    height = 32+lineh*size;
    for (i=0; i<size; i++) {
        key = ds_list_find_value(list, i);
        map = matches[? key];
        if yy < view_hview && yy > toph-lineh {
            var deck_is_saved = !is_undefined(map[? "deck_name"]);
            but = button_rectangle_simple(xx, yy+1, view_wview, yy+lineh-1)
            if but {
                draw_set_alpha(0.05);
                draw_set_color(c_white);
                draw_rectangle(xx, yy, view_wview, yy+lineh, 0);
                draw_set_alpha(1);
            }
            draw_set_color(color_white);
            draw_set_font(font_14);
            draw_set_halign(fa_left);
            
            if deck_is_saved {
                var dname = string(map[? "deck_name"]);
                draw_mana_cost(map[? "deck_colors"], xx+24+10, yy+lineh/2+14, 0, icons_20_spr);
            }
            else {
                var dname = "Unknown ";
            }
            draw_text(xx+24, yy+lineh/2-14, dname);
            
            draw_set_font(font_14_i);
            var elapsed = unix_timestamp() - map[? "timestamp"];
            if elapsed > 86400
                var timestr = string(floor(elapsed / 86400))+" days ago.";
            else if elapsed > 3600
                var timestr = string(floor(elapsed / 3600))+" hours ago.";
            else
                var timestr = string(floor(elapsed / 60))+" minutes ago.";
            
            draw_set_color(color_light);  
            draw_text(xx+24+string_width(dname), yy+lineh/2-14, "  - "+timestr);
                    
            draw_set_halign(fa_right);
            draw_set_color(color_light);
            opname = map[? "opponent"];
            opname = opname[? "name"];
            if is_undefined(opname) {
                opname = "Unknown";
            }
            draw_text(view_wview-180, yy+lineh/2-14, "vs. "+opname);
            
            var w = map[? "winner"]
            if w = "player" {
                draw_set_color(color_green);
                draw_text(view_wview-180, yy+lineh/2+14, "Win"); 
            }
            else if w = "opponent" {
                draw_set_color(color_red);
                draw_text(view_wview-180, yy+lineh/2+14, "Loss"); 
            }
            else {
                draw_set_color(color_light);
                draw_text(view_wview-180, yy+lineh/2+14, "Undefined"); 
            }
            
            draw_set_font(font_12);
            but = button_rectangle_simple(view_wview-90-64, yy+lineh/2-16, view_wview-90+64, yy+lineh/2+16);
            if but == 4 {
                view_match = i;
                offset = 0;
                opd = map[? "opponent"];
                opd = opd[? "cards"];
                deck_sort(opd);
                opd = map[? "player"];
                opd = opd[? "deck"];
                deck_sort(opd);
            }
            draw_set_halign(fa_center);
            draw_sprite(but_normal_spr, but, view_wview-90, yy+lineh/2);
            draw_set_color(color_dark);
            draw_text(view_wview-90, yy+lineh/2, "View Details");
        }
        yy += lineh;
    }
    if size == 0 {
        draw_set_halign(fa_center);
        draw_set_color(color_red);
        draw_set_font(font_24);
        draw_text(bx, by-16, "You have no recorded matches yet");
        draw_set_color(color_white);
        draw_set_font(font_13);
        draw_text(bx, by+16, 'Go play some magic!');
    }
}

