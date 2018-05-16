
//Get each deck's history
var key, map, keya, keyb, mapa, mapb, list, size, sorted, deckid, dsmap;

list = player_history[? "matches"];
size = ds_list_size(list);
if ds_map_size(matches) == 0 {
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
    sorted = false;
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

if ds_map_size(decks_stats) == 0 {
    for (i=size-1; i>=0; i--) {
        key = ds_list_find_value(list, i);
        map = matches[? key];
        
        // CHANGE BY A REAL ID
        deckid = map[? "deck_name"];
        if ds_map_exists(map, "deck_id") {
            deckid = map[? "deck_id"];
        }
        if ds_map_exists(decks_stats, deckid) {
            dsmap = ds_map_find_value(decks_stats, deckid);
        }
        else {
            dsmap = ds_map_create();
            dsmap[? "won"] = 0;
            dsmap[? "lost"] = 0;
            dsmap[? "streak"] = 0;
            ds_map_add(decks_stats, deckid, dsmap);
        }
        if map[? "winner"] == "player" {
            dsmap[? "won"] = dsmap[? "won"]+1;
            dsmap[? "streak"] = dsmap[? "streak"]+1;
        }
        else {
            dsmap[? "lost"] = dsmap[? "lost"]+1;
            dsmap[? "streak"] = 0;
        }
    }
}

xx = sidew;
yy = toph+16+offset;
lineh = 64;
decks = player_data[? "decks"];

if view_deck != -1 {
    total_ins = 0;
    total_sor = 0;
    total_cre = 0;
    total_enc = 0;
    total_art = 0;
    total_pla = 0;
    total_lan = 0;
    
    total_c = 0;
    total_u = 0;
    total_r = 0;
    total_m = 0;
    
    mana_curve_max = 0;
    for (i=0; i<20; i++) {
        mana_curve[i] = 0;
    }
    if view_deck_type == 0 {
        _deck = ds_list_find_value(decks, view_deck);
    }
    if view_deck_type == 1 {
        _entry = ds_list_find_value(top_decks, view_deck);
        _deck = _entry[? "deck"]; 
    }
    
    dlid = _deck[? "dlid"];
    tileid = _deck[? "deckTileId"];
    
    var deck_spr = crop_spr;
    if is_undefined(dlid) && !is_undefined(tileid) {
        var setcode = get_set_scryfall(get_card_data(tileid, 1));
        var cardid = string(get_card_data(tileid, 6));
        url = "https://img.scryfall.com/cards/art_crop/en/"+setcode+"/"+cardid+".jpg";
        _deck[? "dlid"] = download_image(url, get_uri_dir(url));
        download = ds_list_find_value(database.images_to_load, _deck[? "dlid"]);
        download[? "border"] = false;
    }
    else {
        download = ds_list_find_value(database.images_to_load, dlid);
        if download != undefined {
            deck_spr = download[? "sprite"];
        }
        else {
            deck_spr = crop_spr;
        }
    }
    if sprite_exists(deck_spr) && deck_spr != crop_spr {
        sc = 1/sprite_get_width(deck_spr)*(view_wview-sidew);
        top = ((sprite_get_width(deck_spr))-72) / 2
        draw_sprite_part_ext(deck_spr, 0, 0, top, (view_wview-sidew)/sc, 72/sc, xx, yy, sc, sc, c_white, 0.5);
    }
    
    draw_set_color(color_white);
    draw_set_alpha(1);
    draw_set_font(font_14);
    draw_set_halign(fa_left);
    
    draw_text(xx+36, yy+36, string(_deck[? "name"]));
    if ds_map_exists(_deck, "colorIdentity") {
        draw_mana_cost(_deck[? "colorIdentity"], view_wview - 36, yy+36, 1, icons_20_spr);
    }
    
    yy += 72;
    draw_set_font(font_12_b);
    draw_set_halign(fa_center);
    draw_text(xx+160, yy+24, "Main Deck ("+string(total_main)+")");
    draw_set_halign(fa_left);
    yy += 64
    deck = _deck[? "mainDeck"];
    size = ds_list_size(deck);
    
    height = 200;
    total_main = 0;
    for (o=0; o<size; o++) {
        card = ds_list_find_value(deck, o);
        q = card[? "quantity"];
        total_main += real(q);
        cid = card[? "id"];
        
        cmc = real(get_card_data(cid, 4));
        var type = get_card_data(cid, 2);
        if cmc > mana_curve_max mana_curve_max = cmc;
        if !string_pos("Land", type) {
            mana_curve[cmc] += real(q);
            var rarity = get_card_data(cid, 5);
            if rarity == "common"   total_c += real(q);
            if rarity == "uncommon" total_u += real(q);
            if rarity == "rare"     total_r += real(q);
            if rarity == "mythic"   total_m += real(q);
        }
        
        if string_pos("Instant", type)
            total_ins += real(q);
        if string_pos("Sorcery", type)
            total_sor += real(q);
        if string_pos("Creature", type)
            total_cre += real(q);
        if string_pos("Enchantment", type)
            total_enc += real(q);
        if string_pos("Artifact", type)
            total_art += real(q);
        if string_pos("Planeswalker", type)
            total_pla += real(q);
        if string_pos("Land", type)
            total_lan += real(q);
        
        name = get_card_data(cid, 0);
        cost = get_card_data(cid, 3);
        draw_set_halign(fa_left);
        draw_set_font(font_12_b);
        if q > 0 {
            draw_text(xx+24, yy, string(q));
            draw_set_font(font_12);
            draw_text(xx+48, yy, string(name));
            draw_mana_cost(cost, xx+320, yy, 1, icons_16_spr);
            yy += 28;
        }
    }
    height += size * 28;
    
    draw_set_font(font_12_b);
    draw_set_halign(fa_center);
    draw_text(xx+160, yy+12, "Sideboard ("+string(total_side)+")");
    draw_set_halign(fa_left);
    yy += 48
    deck = _deck[? "sideboard"];
    size = ds_list_size(deck);
    total_side = 0;
    for (o=0; o<size; o++) {
        card = ds_list_find_value(deck, o);
        q = card[? "quantity"];
        total_side += real(q);
        cid = card[? "id"];
        name = get_card_data(cid, 0);
        cost = get_card_data(cid, 3);
        draw_set_halign(fa_left);
        draw_set_font(font_12_b);
        if q > 0 {
            draw_text(xx+24, yy, string(q));
            draw_set_font(font_12);
            draw_text(xx+48, yy, string(name));
            draw_mana_cost(cost, xx+320, yy, 1, icons_16_spr);
            yy += 28;
        }
    }
    height += size * 28;
    
    // Draw winrate
    xx = sidew+320+64;
    yy = toph + 154 + offset;
    draw_set_font(font_12);
    
    if ds_map_exists(decks_stats, _deck[? "id"]) {
        dsmap = ds_map_find_value(decks_stats, _deck[? "id"]);
        var w = dsmap[? "won"];
        var l = dsmap[? "lost"];
        var s = dsmap[? "streak"];
        draw_text(xx, yy, "Wins: "+string(w));
        yy += 24;
        draw_text(xx, yy, "Losses: "+string(l));
        yy += 24;
        draw_text(xx, yy, "Winrate: "+string(100/(w+l)*w)+"%");
        yy += 24;
        draw_text(xx, yy, "Current streak: "+string(s));
        yy += 24;
    }
    
    yy += 200;

    // Draw Mana Curve
    var mx = 0;
    for (i=0; i<20; i++) {
        if mana_curve[i] > mx
            mx = mana_curve[i];
    }
    var ww = view_wview - 64 - xx;
    mana_curve_max = max(5, mana_curve_max+2);
    var sz = ww/(mana_curve_max);
    draw_line_width_colour(xx, yy+1, xx+ww, yy+1, 2, color_light, color_light);
    draw_set_halign(fa_center);
    draw_set_font(font_12_b);
    for (i=0; i<mana_curve_max; i++) {
        var hh = 128 / mx * mana_curve[i];
        if hh > 0
            draw_rectangle_color(xx+1, yy, xx+sz-1, yy-hh, color_light,  color_light,  color_light,  color_light, 0)
        draw_text(xx+sz/2, yy-hh-16, string(mana_curve[i] ));
        draw_mana_cost("{"+string(i)+"}", xx+sz/2, yy+18, 2, icons_16_spr);
        xx += sz;
    }
    
    xx = sidew+320+64;
    yy += 64;
    but = button_rectangle_simple(xx+ww/2-64, yy-16, xx+ww/2+64, yy+16);
    if but == 4 {
        deck_copy(_deck[? "mainDeck"]);
    }
    draw_set_halign(fa_center);
    draw_set_color(color_dark);
    draw_set_font(font_12);
    draw_sprite(but_normal_spr, but, xx+ww/2, yy);
    draw_text(xx+ww/2, yy, "Copy deck");
    
    // Draw card types
    var sz = ww/7;
    xx = sidew+320+64;
    
    total_ins = 0;
    total_sor = 0;
    total_cre = 0;
    total_enc = 0;
    total_art = 0;
    total_pla = 0;
    total_lan = 0;
}
else if ds_list_size(decks) > 0 {   
    height = 32;             
    if view_deck == -1 {
        var decksn = ds_list_size(decks);
        var _deck;
        for (i=0; i<decksn; i++) {
            if yy > 0 && yy < view_hview {
                _deck = ds_list_find_value(decks, i);
                var but = button_rectangle_simple(xx, yy, view_wview, yy+lineh);
                var hover = _deck[? "hover"];
                if is_undefined(hover) {
                    _deck[? "hover"] = 0;
                    hover = 0;
                }
                
                if but {
                    hover = tween(hover, hover, 1, delta*2);
                    draw_set_alpha(0.1*hover);
                    draw_rectangle_colour(xx, yy, view_wview, yy+lineh, c_white, c_white, c_white, c_white, 0);
                    draw_set_alpha(1);
                    if but == 4 && is_not_drag(10) {
                        view_deck = i;
                        view_deck_type = 0;
                        offset = 0;
                        _deck[? "hover"] = 0;
                    }
                }
                else {
                    hover = tween(hover, hover, 0, delta*2);
                }
                _deck[? "hover"] = hover;
                
                dlid = _deck[? "dlid"];
                tileid = _deck[? "deckTileId"];
                var deck_spr = crop_spr;
                if is_undefined(dlid) && !is_undefined(tileid) {
                    var setcode = get_set_scryfall(get_card_data(tileid, 1));
                    var cardid = string(get_card_data(tileid, 6));
                    url = "https://img.scryfall.com/cards/art_crop/en/"+setcode+"/"+cardid+".jpg";
                    _deck[? "dlid"] = download_image(url, get_uri_dir(url));
                    download = ds_list_find_value(database.images_to_load, _deck[? "dlid"]);
                    download[? "border"] = false;
                }
                else {
                    download = ds_list_find_value(database.images_to_load, dlid);
                    if download != undefined {
                        deck_spr = download[? "sprite"];
                    }
                    else {
                        deck_spr = crop_spr;
                    }
                }
                if sprite_exists(deck_spr) {
                    var tex = sprite_get_texture(deck_spr, 0);
                    var sprw = sprite_get_width(deck_spr);
                    var sprh = sprite_get_height(deck_spr);
                    var nh = sprh*(400)/sprw;
                    
                    var off = 1 / nh * (nh - (lineh)) / 2;
                    var xoff = texture_get_width(tex);
                    
                    var eased = easing(easeOutSine, hover, 0, 1, 1);
                    //draw_set_alpha(eased*0.5);
                    draw_set_color(c_white);
                    ox = - 48 + (48*eased);
                    draw_primitive_begin_texture(pr_trianglestrip, tex);
                    draw_vertex_texture_colour(ox+xx    , yy, 0.00, off, c_white, hover*0.666);
                    draw_vertex_texture_colour(ox+xx    , yy+lineh, 0.00, 1.00-off, c_white, hover*0.666);
                    draw_vertex_texture_colour(ox+xx+400, yy, xoff, off, c_white, 0);
                    draw_vertex_texture_colour(ox+xx+400, yy+lineh, xoff, 1.00-off, c_white, 0);

                    draw_primitive_end();
                    draw_set_alpha(1);
                }
                
                draw_set_color(color_white);
                draw_set_font(font_14);
                draw_set_halign(fa_left);
                
                draw_text(xx+24, yy+lineh/2-14, string(_deck[? "name"]));
                if ds_map_exists(_deck, "colorIdentity") {
                    draw_mana_cost(_deck[? "colorIdentity"], xx+24+10, yy+lineh/2+14, 0, icons_20_spr);
                }
                
                draw_set_halign(fa_center);
                draw_text(bx, yy+lineh/2-14, string(_deck[? "format"]));
                
                draw_set_font(font_14_i);
                draw_set_halign(fa_right);
                // CHANGE BY A REAL ID
                //_deck[? "id"];
                if ds_map_exists(decks_stats, _deck[? "id"]) {
                    dsmap = ds_map_find_value(decks_stats, _deck[? "id"]);
                    var w = dsmap[? "won"];
                    var l = dsmap[? "lost"];
                    var s = dsmap[? "streak"];
                    draw_text(view_wview-24, yy+lineh/2-14, "Winrate: "+string(100/(w+l)*w)+"%");
                    draw_text(view_wview-24, yy+lineh/2+14, "Streak: "+string(s));
                }
                else if ds_map_exists(decks_stats, _deck[? "name"]) {
                    dsmap = ds_map_find_value(decks_stats, _deck[? "name"]);
                    var w = dsmap[? "won"];
                    var l = dsmap[? "lost"];
                    var s = dsmap[? "streak"];
                    draw_text(view_wview-24, yy+lineh/2-14, "Winrate: "+string(100/(w+l)*w)+"%");
                    draw_text(view_wview-24, yy+lineh/2+14, "Streak: "+string(s));
                }
                /*
                else {
                    draw_text(view_wview-24, yy+lineh/2-14, "Winrate: -");
                    draw_text(view_wview-24, yy+lineh/2+14, "Streak: -");
                }
                */
            }
            yy += lineh;
            height += lineh;
        }
    }
}

decks = player_data[? "decks"];
if ds_list_size(decks) == 0 {
    if view_deck != -1 && view_deck_type == 1
        exit;
    height = 32;
    draw_set_halign(fa_center);
    draw_set_color(color_red);
    draw_set_font(font_24);
    draw_text(bx, by-40, "You have no decks loaded yet");
    draw_set_color(color_white);
    draw_set_font(font_13);
    draw_text(bx, by, 'To load your decks click the button below');

    draw_set_font(font_12);
    but = button_rectangle_simple(bx-64, by+40-16, bx+64, by+40+16);
    if but == 2 {
        parser_obj.demand_update = 3;
    }
    draw_set_halign(fa_center);
    draw_sprite(but_normal_spr, but, bx, by+40);
    draw_set_color(color_dark);
    draw_text(bx, by+40, "Sync");
}
