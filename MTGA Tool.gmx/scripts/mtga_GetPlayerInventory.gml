_str = string_copy(argument0, string_pos(lookfor, argument0)+string_length(lookfor)-1, string_length(argument0));
json = json_decode(_str);
if json == -1   exit;
show_debug_message("> Get player inventory");

//

ds_map_destroy(json);

/*
5/2/2018 7:38:09 PM Response 284: PlayerInventory.GetPlayerInventory {
  "playerId": "BA263BD3A7D57B48",
  "wcCommon": 0,
  "wcUncommon": 0,
  "wcRare": 0,
  "wcMythic": 0,
  "gold": 175,
  "gems": 0,
  "draftTokens": 0,
  "sealedTokens": 0,
  "vaultProgress": 3.3,
  "boosters": [
    {
      "collationId": 100006,
      "count": 0
    },
    {
      "collationId": 100005,
      "count": 0
    },
    {
      "collationId": 100004,
      "count": 0
    },
    {
      "collationId": 100003,
      "count": 0
    },
    {
      "collationId": 100007,
      "count": 0
    }
  ],
  "vanityItems": {
    "pets": [],
    "avatars": [],
    "cardBacks": []
  }
}
 
*/
