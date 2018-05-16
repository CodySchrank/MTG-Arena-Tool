if string_pos("Message summarized", argument0) {
    exit;
}

lookfor = "GreToClientEvent";
if string_pos(lookfor, argument0) {
    mtga_GreClientEvent(argument0);
    exit;
}

lookfor = "Deck.GetDeckLists [";
if jsontime[0] == 0 {
    if string_pos(lookfor, argument0) {
        mtga_GetDeckLists(argument0);
        jsontime[0] = 5;
        exit;
    }
}

lookfor = "Event.DeckSubmit {";
if string_pos(lookfor, argument0) {
    mtga_DeckSubmit(argument0)
    exit;
}

lookfor = "Event.GetPlayerCourse {";
if string_pos(lookfor, argument0) {
    mtga_GetPlayerCourse(argument0)
    exit;
}

lookfor = "Event.GetCombinedRankInfo {";
if string_pos(lookfor, argument0) {
    mtga_GetCombinedRankInfo(argument0)
    exit;
}

lookfor = "Rank.Updated {";
if string_pos(lookfor, argument0) {
    mtga_RankUpdated(argument0);
    exit;
}

if controller_obj.player_id == "" || controller_obj.player_name == "" {
    if string_pos("Log.Info(", argument0) {
        mtga_LogInfo(argument0);
        exit;
    }
}

lookfor = "Event.MatchCreated {";
if string_pos(lookfor, argument0) {
    mtga_MatchCreated(argument0);
    exit;
}

lookfor = "AuthenticateResponse";
if string_pos(lookfor, argument0) {
    mtga_AuthenticateResponse(argument0);
    exit;
}

lookfor = "PlayerInventory.GetPlayerCardsV3 {";
if string_pos(lookfor, argument0) {
    mtga_GetPlayerCardsV3(argument0);
    exit;
}

lookfor = "MatchGameRoomStateChangedEvent";
if string_pos(lookfor, argument0) {
    mtga_MatchGameRoomStateChangedEvent(argument0);
    exit;
}

if instance_exists(macro_obj) {
    lookfor = "Deck.CreateDeck {";
    if string_pos(lookfor, argument0) {
        mtga_CreateDeck(argument0);
    }
    exit;
}

