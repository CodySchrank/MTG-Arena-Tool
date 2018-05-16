_str = string_copy(argument0, string_pos(lookfor, argument0)+string_length(lookfor), string_length(argument0));
json = json_decode(_str);
if json == -1   exit;

_json = json[? "matchGameRoomStateChangedEvent"];
_json = _json[? "gameRoomInfo"];

if ds_map_exists(_json, "stateType") {
    if _json[? "stateType"] == "MatchGameRoomStateType_MatchCompleted" {
        controller_obj.mode = -1;
    }
    //show_debug_message("> MatchGameRoomStateChangedEvent: "+string( _json[? "stateType"]));
}
// get match results here
if ds_map_exists(_json, "finalMatchResult") {
    var mr = _json[? "finalMatchResult"];
    mr = mr[? "resultList"];
    mt = mr[| 0];
    controller_obj.game_winner = mt[? "winningTeamId"];
}

_json = _json[? "gameRoomConfig"];
if !is_undefined(_json[? "matchId"]) {
    controller_obj.match_id = _json[? "matchId"];
    controller_obj.alarm[4] = 1;
}
if ds_map_exists(_json, "reservedPlayers") {
    players = _json[? "reservedPlayers"];
    for (i=0; i<ds_list_size(players); i++) {
        p = ds_list_find_value(players, i);
        if p[? "userId"] == controller_obj.player_id {
            controller_obj.player_seatid = p[? "systemSeatId"];
            controller_obj.player_name   = p[? "playerName"];
        }
        else {
            controller_obj.opponent_name   = p[? "playerName"];
            controller_obj.opponent_pid    = p[? "userId"];
            controller_obj.opponent_seatid = p[? "systemSeatId"];
        }
    }
}

ds_map_destroy(json);
