if argument0 = -1 && controller_obj.mode != -1 {
    view_wview = 1024;
    view_hview = 720;
    window_set_size(1024, 720);    
    surface_resize(application_surface, view_wport, view_hport);
    window_center();
    window_set_topmost(false);
    controller_obj.mode = argument0;
    controller_obj.fade_to = 255;
}
if argument0 = 1 && controller_obj.mode != 1 {
    if saved_data[? "show_overlay"] == true {
        if file_exists("save") {
            saved_data = ds_map_secure_load("save");
            var wx = saved_data[? "x"];
            var wy = saved_data[? "y"];
            var ww = saved_data[? "width"];
            var wh = saved_data[? "height"];
            window_set_position(wx, wy);
            window_set_size(ww, wh);
        }
        else {
            create_save();
        }
        controller_obj.mode = argument0;
    }
}

