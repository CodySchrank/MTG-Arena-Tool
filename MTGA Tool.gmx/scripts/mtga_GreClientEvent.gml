_str = string_copy(argument0, string_pos(lookfor, argument0)+string_length(lookfor), string_length(argument0));
json = json_decode(_str);
if json == -1   exit;

var gre = json[? "greToClientEvent"];

var msgs = gre[? "greToClientMessages"];
for (n=0; n<ds_list_size(msgs); n++) {
    var msg = ds_list_find_value(msgs, n);
    if msg[? "type"] == "GREMessageType_GameStateMessage" {
        var msgid = string(msg[? "msgId"]);
        //show_debug_message("> GREMessageType_GameStateMessage: "+msgid);
        var gamestate = msg[? "gameStateMessage"];
        
        // Game Info
        if ds_map_exists(gamestate, "gameInfo") {
            if !is_undefined(gamestate[? "matchID"]) {
                controller_obj.match_id = gamestate[? "matchID"];
                alarm[4] = 1;
            }
            var game = gamestate[? "gameInfo"];
            if game[? "stage"] == "GameStage_GameOver" {
                if ds_map_exists(game, "results") {
                    var res = game[? "results"];
                    var r = res[| 0];
                    controller_obj.game_winner = r[? "winningTeamId"];
                    set_mode(-1);
                }
            }
        }
        /*
        if ds_map_exists(gamestate, "actions") {
            var act = gamestate[? "actions"];
            for (a=0; a<ds_list_size(act); a++) {
                var _a = ds_list_find_value(act, i);
                var seat = _a[? "seatId"];
                _a = _a[? "action"];
                
                var aid = _a[? "actionType"];
                var iid = _a[? "instanceId"];
                var abid = 0;
                if is_undefined(iid) {
                    var iid = _a[? "sourceId"];
                    var abid = _a[? "abilityGrpId"];
                }
                
                var instance = ds_map_find_value(gameobjects, iid); 
                var cname = "undefined";
                if !is_undefined(instance) {
                    cname = instance.name;
                }
            }
        }
        */
        // Zones
        if ds_map_exists(gamestate, "zones") {
            var zon = gamestate[? "zones"];
            var map;
            for (z=0; z<ds_list_size(zon); z++) {
                var obj = ds_list_find_value(zon, z);
                if !ds_map_exists(zones, obj[? "zoneId"]) {
                    map = ds_map_create();
                    ds_map_add(zones, obj[? "zoneId"], map);
                }
                else {
                    map = ds_map_find_value(zones, obj[? "zoneId"]);
                }
                
                if ds_map_exists(obj, "type")
                    map[? "type"] = obj[? "type"];
                if ds_map_exists(obj, "objectInstanceIds")
                    map[? "objectInstanceIds"] = obj[? "objectInstanceIds"];
                if ds_map_exists(obj, "visibility")
                    map[? "visibility"] = obj[? "visibility"];
                if ds_map_exists(obj, "ownerSeatId")
                    map[? "ownerSeatId"] = obj[? "ownerSeatId"];
                if ds_map_exists(obj, "objectInstanceIds")
                    map[? "objectInstanceIds"] = obj[? "objectInstanceIds"];
            }
        }
        
        // Game objects
        if ds_map_exists(gamestate, "gameObjects") {
            var gobjs = gamestate[? "gameObjects"];
            for (o=0; o<ds_list_size(gobjs); o++) {
                var obj = ds_list_find_value(gobjs, o);
                var instance = undefined;
                if ds_map_exists(gameobjects, obj[? "instanceId"]) {
                    instance = ds_map_find_value(gameobjects, obj[? "instanceId"]);
                }
                else {
                    instance = instance_create(0, 0, gameobject);
                    ds_map_add(gameobjects, obj[? "instanceId"], instance);
                }
                show_debug_message("object id "+string(obj[? "instanceId"])+" state change");
                if instance_exists(instance) {
                    instance.instanceId     = obj[? "instanceId"];
                    instance.name           = obj[? "name"];
                    instance.type           = obj[? "type"];
                    instance.zoneId         = obj[? "zoneId"];
                    instance.visibility     = obj[? "visibility"];
                    instance.ownerSeatId    = obj[? "ownerSeatId"];
                    instance.grpId          = obj[? "grpId"];
                    instance.controllerSeatId = obj[? "controllerSeatId"];
                }
            }
        }
        
        // Annotations
        if ds_map_exists(gamestate, "annotations") {
            var anns = gamestate[? "annotations"];
            for (o=0; o<ds_list_size(anns); o++) {
                var ann = ds_list_find_value(anns, o);
                
                var type    = ann[? "type"];
                var details = ann[? "details"];
                
                //if ds_list_find_index(type, "AnnotationType_PhaseOrStepModified") != -1 {
                //    
                //}
                if ds_list_find_index(type, "AnnotationType_ObjectIdChanged") != -1 {
                    var orig = 0; var dest = 0; var val = 0; var _det = 0;
                    for (d=0; d<ds_list_size(details); d++) {
                        _det = ds_list_find_value(details, d);
                        if _det[? "key"] == "orig_id"   orig = ds_list_find_value(_det[? "valueInt32"], 0);
                        if _det[? "key"] == "new_id"    dest = ds_list_find_value(_det[? "valueInt32"], 0);
                    }
                    // Change ID
                    var instance = ds_map_find_value(gameobjects, orig);                        
                    if !is_undefined(instance) {
                        if instance_exists(instance) {
                            instance.instanceId = dest;
                            ds_map_add(gameobjects, dest, instance);
                        }
                    }
                    show_debug_message("Change id from "+string(orig)+" to "+string(dest))
                }
            }
        }
        // Deleted IDs
        if ds_map_exists(gamestate, "diffDeletedInstanceIds") {
            var diffdel = gamestate[? "diffDeletedInstanceIds"];
            for (o=0; o<ds_list_size(diffdel); o++) {
                var objid = ds_list_find_value(diffdel, o);
                var instance = ds_map_find_value(gameobjects, objid);
                if instance != undefined {
                    with (instance) {
                        instance_destroy();
                    }
                }
                ds_map_delete(gameobjects, objid);
                show_debug_message("Deleted id "+string(objid))
            }
        }
    }
}
ds_map_destroy(json);
