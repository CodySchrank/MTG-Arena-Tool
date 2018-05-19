height = 32;
xx = sidew;
yy = toph+16+offset;
lineh = 64;
/*
draw_set_halign(fa_center);
draw_set_color(color_red);
draw_set_font(font_24);
draw_text(bx, by-40, "Coming soon");
draw_set_color(color_white);
draw_set_font(font_13);
draw_text(bx, by, 'Here you will be able to see winning decklists of the community');
*/
if ds_list_size(top_decks) > 0 {
    var size = ds_list_size(top_decks);
    for (i=0; i<size; i++) {
        if yy > 0 && yy < view_hview {
            _entry = ds_list_find_value(top_decks, i);
            _deck = _entry[? "deck"]; 
            
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
                    view_deck_type = 1;
                    deck_sort(_deck[? "mainDeck"]);
                    deck_sort(_deck[? "sideboard"]);
                    selected = 0;
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
                download = undefined;
                if !is_undefined(dlid)
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
            draw_set_halign(fa_left);
            
            var nam = string(_deck[? "name"]);
            draw_set_font(font_14);
            draw_text(xx+24, yy+lineh/2-14, nam);
            draw_set_font(font_14_i);
            draw_text(xx+24+string_width(nam), yy+lineh/2-14, "  ("+string(_entry[? "playername"])+")");

            if ds_map_exists(_deck, "colorIdentity") {
                draw_mana_cost(_deck[? "colorIdentity"], xx+24+10, yy+lineh/2+14, 0, icons_20_spr);
            }
            else {
                _deck[? "colorIdentity"] = deck_get_colors(_deck[? "mainDeck"], _deck[? "sideboard"]);
            }
            
            draw_set_font(font_14);
            draw_set_halign(fa_center);
            //draw_text(bx, yy+lineh/2-14, string(_deck[? "format"]));
            draw_text(bx, yy+lineh/2, string_replace_all(string(_entry[? "event"]), "_", " "));
            
            draw_set_font(font_12_i);
            draw_set_halign(fa_right);
            record = _entry[? "record"];
            if !is_undefined(record) {
                var w = record[? "CurrentWins"];
                var l = record[? "CurrentLosses"];
                draw_text(view_wview-24-120, yy+lineh/2, string(w)+" - "+string(l));
                draw_text(view_wview-24, yy+lineh/2, "("+string(100/(w+l)*w)+"%)");
            }
        }
        yy += lineh;
        height += lineh;
    }
}
else if !requested_top {
    http_get_top_decks();
    requested_top = true;
}

