argument0 = string_replace(argument0, "https://img.scryfall.com/cards", "");
argument0 = string_replace(argument0, "en/", "en/_");
return string_copy(string_replace_all(argument0,"/","\"), 2, 9999);
