var newline = chr(13)+chr(10);

var str = "";
var strnumb = string_count("(Filename:", argument0)+1;

//show_debug_message(">>");
//show_debug_message(">>");
//show_debug_message(">> RECV "+string(argument0));

for (j=0; j<strnumb; j++) {
    str = string_extract(argument0, "(Filename:", j);

    //show_debug_message("  > Processing "+str);
    clipboard_set_text(str);
    //show_debug_message("  > ");
    mtga_process_json(str);
}

