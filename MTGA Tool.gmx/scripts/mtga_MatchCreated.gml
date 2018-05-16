_str = string_copy(argument0, string_pos(lookfor, argument0)+string_length(lookfor)-1, string_length(argument0));
json = json_decode(_str);
if json == -1   exit;
show_debug_message("> Match created");
controller_obj.opponent_name = json[? "opponentScreenName"];
controller_obj.opponent_wotc = json[? "opponentIsWotc"];
controller_obj.opponent_rank = json[? "opponentRankingClass"];
controller_obj.opponent_tier = json[? "opponentRankingTier"];
controller_obj.match_id      = json[? "matchId"];
controller_obj.game_winner   = -1;

set_mode(1);
controller_obj.deck_costs = "";
controller_obj.alarm[2] = 1;
controller_obj.game_winner = -1;
with (controller_obj) {
    event_perform(ev_alarm, 1);
}

ds_map_destroy(json);
