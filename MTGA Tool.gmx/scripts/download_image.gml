/// download_image(url, uri)
var qq, mm;
for (qq=0; qq < ds_list_size(database.images_to_load); qq++) {
    mm = ds_list_find_value(database.images_to_load, qq);
    if mm[? "uri"] == argument1 {
        show_debug_message("Already downloading "+argument1);
        return qq;
    }
}

var map = ds_map_create();
map[? "async"] = -99;
//map[? "url"] = "https://magiccards.info/scans"+argument0;

map[? "url"] = argument0;
map[? "uri"] = argument1;
map[? "downloaded"] = 0;
map[? "sprite"] = card_downloading_spr;
map[? "border"] = true;
map[? "bordered"] = false;
ds_list_add(database.images_to_load, map);

return ds_list_size(database.images_to_load)-1;
