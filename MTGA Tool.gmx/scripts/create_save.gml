saved_data = ds_map_create();
saved_data[? "show_overlay"] = true;
saved_data[? "close_overlay"] = 0;
saved_data[? "clear_log"] = 3;
saved_data[? "x"] = 0;
saved_data[? "y"] = 0;
saved_data[? "width"] = 240;;
saved_data[? "height"] = 720;
ds_map_secure_save(saved_data, "save");
