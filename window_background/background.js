var electron = require('electron');

const {app, net, clipboard} = require('electron');
const path  = require('path');
const Store = require('../store.js');
const async = require("async");

var store = new Store({
	configName: 'default',
	defaults: {
		windowBounds: { width: 800, height: 600, x: 0, y: 0 },
		overlayBounds: { width: 300, height: 600, x: 0, y: 0 },
        cards: { cards_time: 0, cards_before:[], cards:[] },
		settings: {sound_priority: true, cards_quality: 'small', show_overlay: true, show_overlay_always: false, startup: true, close_to_tray: true, send_data: true, close_on_match: true, cards_size: 2, overlay_alpha: 1, overlay_top: true, overlay_title: true, overlay_deck: true, overlay_clock: true},
        matches_index:[],
        draft_index:[],
        vault_history:[],
        gold_history:[],
        wildcards_history:[]
	}
});

const Database = require('../shared/database.js');
const cardsDb = new Database();

const serverAddress = 'mtgatool.com';

const debugLog = false;
const debugLogSpeed = 0.1;
var timeStart = 0;
var timeEnd = 0;
const fs = require("fs");
window.ipc = electron.ipcRenderer;

var firstPass = true;
var tokenAuth = undefined;

var renderer_state = 0;
var currentChunk = "";
var currentDeck = {};
var currentDeckUpdated = {};
var currentMatchId = null;
var currentEventId = null;
var matchWincon = "";
var duringMatch = false;
var matchBeginTime = 0;

var playerName = null;
var playerRank = null;
var playerTier = null;
var playerId = null;
var playerSeat = null;
var playerWin = 0;

var oppName = null;
var oppRank = null;
var oppTier = null;
var oppId = null;
var oppSeat = null;
var oppWin = 0;
var annotationsRead = [];

var turnPhase = "";
var turnStep  = "";
var turnNumber = 0;
var turnActive = 0;
var turnPriority = 0;
var turnDecision = 0;
var turnStorm = 0;

var zones = {};
var gameObjs = {};
var hoverCard = undefined;
var history = {};
var drafts = {};
var topDecks = {};
var coursesToSubmit = {};

var updateAvailable = false;
var updateState = -1;
var updateProgress = -1;
var updateSpeed = 0;
var currentDraft = undefined;
var currentDraftPack = undefined;
var draftSet = "";
var draftId = undefined;
var overlayDeckMode = 0;
var lastDeckUpdate = new Date();

var goldHistory = [];
var vaultHistory = [];
var wilcardsHistory = [];

ipc_log = function (str, arg) {
    ipc.send('ipc_log', arg);
};


//
ipc.on('set_renderer_state', function (event, arg) {
	renderer_state = arg;
	var settings = store.get("settings");
	updateSettings(settings);
	ipc.send("background_set_settings", settings);

	if (debugLog) {
	    finishLoading()
	    ipc.send("show_background", 1);
	}
});

//
ipc.on('windowBounds', function (event, obj) {
	store.set('windowBounds', obj);
});

//
ipc.on('overlayBounds', function (event, obj) {
	store.set('overlayBounds', obj);
});

//
ipc.on('save_settings', function (event, settings) {
    store.set('settings', settings);
    updateSettings(settings);
});

//
ipc.on('delete_data', function (event, arg) {
    httpDeleteData();
});

//
ipc.on('update_install', function (event, settings) {
    if (updateState == 3) {
        autoUpdater.quitAndInstall();
    }
});

//
ipc.on('request_history', function (event, state) {
    requestHistorySend(state);
});

//
function requestHistorySend(state) {
    if (state == 1) {
        ipc.send("background_set_history", history);
    }
    else {
        ipc.send("background_set_history_data", history);
    }
}

//
ipc.on('set_economy', function (event, economy) {
    goldHistory = store.get("gold_history");
    vaultHistory = store.get("vault_history");
    wilcardsHistory = store.get("wildcards_history");

    goldHistory = fix_history(goldHistory);
    vaultHistory = fix_history(vaultHistory);
    wilcardsHistory = fix_history(wilcardsHistory);

    var economy = {gold: goldHistory, vault: vaultHistory, wildcards: wilcardsHistory};    

    ipc.send("set_economy", economy);
});

ipc.on('request_explore', function (event, arg) {
    httpGetTopDecks(arg);
});

ipc.on('request_course', function (event, arg) {
    httpGetCourse(arg);
});

ipc.on('set_deck_mode', function (event, state) {
    overlayDeckMode = state;
    update_deck();
});





function loadPlayerConfig(playerId) {
    store = new Store({
        configName: playerId,
        defaults: {
            windowBounds: { width: 800, height: 600, x: 0, y: 0 },
            overlayBounds: { width: 300, height: 600, x: 0, y: 0 },
            cards: { cards_time: 0, cards_before:[], cards:[] },
            settings: {sound_priority: true, cards_quality: 'small', show_overlay: true, show_overlay_always: false, startup: true, close_to_tray: true, send_data: true, close_on_match: true, cards_size: 2, overlay_alpha: 1, overlay_top: true, overlay_title: true, overlay_deck: true, overlay_clock: true},
            matches_index:[],
            draft_index:[],
            vault_history:[],
            gold_history:[],
            wildcards_history:[]
        }
    });

    history.matches = store.get('matches_index');
    for (let i=0; i<history.matches.length; i++) {
        let id = history.matches[i];
        history[id] = store.get(id);
        history[id].type = "match";
    }

    drafts.matches = store.get('draft_index');
    for (let i=0; i<drafts.matches.length; i++) {
        let id = drafts.matches[i];

        history.matches.push(id);
        history[id] = store.get(id);
        history[id].type = "draft";
    }


    goldHistory = store.get("gold_history");
    vaultHistory = store.get("vault_history");
    wilcardsHistory = store.get("wildcards_history");

    var settings = store.get("settings");
    updateSettings(settings);
    ipc.send("renderer_save_settings", settings);
}


function updateSettings(settings) {
    const exeName = path.basename(process.execPath);

    if (settings.overlay_top   == undefined) settings.overlay_top   = true;
    if (settings.overlay_title == undefined) settings.overlay_title = true;
    if (settings.overlay_deck  == undefined) settings.overlay_deck  = true;
    if (settings.overlay_clock == undefined) settings.overlay_clock = true;

    ipc.send("app_startup", settings.startup);

    if (settings.show_overlay == false) {
    	ipc.send("overlay_close", 1);
    }
    else if (duringMatch || settings.show_overlay_always) {
        ipc.send("overlay_show", 1);
    }
    
    ipc.send("overlay_set_settings", settings.sound_priority, 1, settings.overlay_top, settings.overlay_title, settings.overlay_deck, settings.overlay_clock);
}

//
function fix_history(history) {
    for (let ii = 0; ii < history.length; ii++) {
        if (ii > 0) {
            let dataPrev = history[ii-1]; let data = history[ii];
            let diff = (data.date - dataPrev.date) / (1000*60*60*24);
            for (let i = 0; i<diff; i++) {
                history.splice(ii, 0, {date: dataPrev.date + (1000*60*60*24*i), value: dataPrev.value}); ii++;
            }
        }
    }
    for (let ii = 0; ii < history.length; ii++) {
        if (ii > 0) {
            let dataPrev = history[ii-1]; let data = history[ii];
            let da = new Date(data.date);
            let db = new Date(dataPrev.date);
            if (da.toDateString() == db.toDateString()) {
                history.splice(ii-1, 1); ii-=1;
            }
        }
    }
    return history;
}

// Read the log
var prevLogSize = 0;
if (process.platform === 'win32') {
    var logUri = process.env.APPDATA;
    logUri = logUri.replace('Roaming','LocalLow\\Wizards Of The Coast\\MTGA\\output_log.txt');
}
else {
    // Path for Wine, could change depending on installation method
    var logUri = process.env.HOME+'/.wine/drive_c/user/'+process.env.USER+'/AppData/LocalLow/Wizards of the Coast/MTGA/output_log.txt';
}
console.log(logUri);

var file;
logLoop();

function logLoop() {
    //console.log("logLoop() start");
    fs.open(logUri, 'r', function(err, fd) {
        file = fd;
        if (err) {
            setTimeout( function() {
                ipc.send("no_log", logUri);
            }, 1000);
            setTimeout(logLoop, 5000);
            console.log("No log file found");
        } else {
            readLog();
        }
    });
}

function readLog() {
	//console.log("readLog()");
    if (debugLog) {
        firstPass = false;
    }
    if (renderer_state == 1) {
        var stats = fs.fstatSync(file);
        var logSize = stats.size;
        var logDiff = logSize - prevLogSize;

        if (logSize > prevLogSize+1) {
            fs.read(file, new Buffer(logDiff), 0, logDiff, prevLogSize, processLog);
        }
        else {
            //console.log("fs.close(file) readLog")
            fs.close(file);
            setTimeout(logLoop, 1000);
        }
    }
    else {
        fs.close(file);
        setTimeout(logLoop, 1000);
    }
}

function processLog(err, bytecount, buff) {
    let rawString = buff.toString('utf-8', 0, bytecount);
    var splitString = rawString.split('(Filename: ');
    console.log('Reading:', bytecount, 'bytes, ',splitString.length, ' chunks');

    var str;
    for (var i=0; i<splitString.length; i++) {
    	str = splitString[i];
        // iterate trough all 
		(function(i, str){
			setTimeout(function(){
				processLogData(str);
			}, i * debugLogSpeed);
		}(i, str));
    }

    if (firstPass) {
        setTimeout(function(){
            finishLoading();
        }, (splitString.length + 2) * debugLogSpeed);
    }

    setTimeout(function(){
        fs.close(file);
        //console.log("fs.close(file) processLog")
        setTimeout(logLoop, 1000);
    }, (splitString.length + 5) * debugLogSpeed);

    prevLogSize+=bytecount;
    //process.nextTick(readLog);
}

function checkJson(str, check, chop) {
    if (str.indexOf(check) > -1) {
        try {
            str = dataChop(str, check, chop);
            return JSON.parse(str);
        } catch(e) {
            return false;
        }
    }
    return false;
}

function dataChop(data, startStr, endStr) {
    var start = data.indexOf(startStr)+startStr.length;
    var end = data.length;
    data = data.substring(start, end);

    if (endStr != '') {
        var start = 0;
        var end = data.indexOf(endStr);
        data = data.substring(start, end);
    }

    return data;
}

function checkJsonWithStart(str, check, chop, start) {
    if (str.indexOf(check) > -1) {
        try {
            str = dataChop(str, check, chop);
            str = dataChop(str, start, chop);
            return JSON.parse(str);
        } catch(e) {
            console.log(str);
            return false;
        }
    }
    return false;
}


/*

    unnecessarily long text to mark a point in the code that is fairly important because I cant remember the line number \^.^/

*/

function processLogData(data) {
	//console.log("Read log:", data);

	currentChunk = data;
    var strCheck, json;

    let timeStart = new Date();

    // Get player Id
    strCheck = '"PlayerId":"';
    if (data.indexOf(strCheck) > -1) {
        if (playerId == null) {
            playerId = dataChop(data, strCheck, '"');
            httpAuth();
            loadPlayerConfig(playerId);
        }
    }

    // Get User name
    strCheck = '"PlayerScreenName":"';
    if (data.indexOf(strCheck) > -1) {
        playerName = dataChop(data, strCheck, '"');
        ipc.send("set_username", playerName);
    }

    // Get Ranks
    strCheck = '<== Event.GetCombinedRankInfo(';
    json = checkJsonWithStart(data, strCheck, '', ')');
    if (json != false) {
		playerRank = json.constructedClass;
		playerTier = json.constructedTier;

        let rank = get_rank_index(playerRank, playerTier);

        ipc.send("set_rank", rank, playerRank+" "+playerTier);
    }

    // Get Decks
    strCheck = '<== Deck.GetDeckLists(';
    json = checkJsonWithStart(data, strCheck, '', ')');
    if (json != false) {
        //if (debugLog == true || firstPass == false) {
            requestHistorySend(0);
            ipc.send("set_decks", json);
        //}
    }

    // Get inventory
    strCheck = '<== PlayerInventory.GetPlayerInventory(';
    json = checkJsonWithStart(data, strCheck, '', ')');
    if (json != false) {
        //This checks time, use with caution!
        strCheck = '[UnityCrossThreadLogger]';
        if (data.indexOf(strCheck) > -1) {
            var str = dataChop(data, strCheck, 'M')+'M';
            var logTime = parseWotcTime(str);
        }

        var gold = json.gold;
        var vault = json.vaultProgress;
        var wcCommon = json.wcCommon;
        var wcUncommon = json.wcUncommon;
        var wcRare = json.wcRare;
        var wcMythic = json.wcMythic;

        goldHistory = store.get("gold_history");
        var lastDate  = 0;
        var lastValue = -1;
        goldHistory.forEach(function(data, index) {
            if (data.date > lastDate) {
                lastDate = data.date;
                lastValue = data.value;
            }

        });
        if (gold != lastValue && lastDate < logTime.getTime()) {
            goldHistory.push({date: logTime.getTime(), value: gold});
            store.set("gold_history", goldHistory);
        }

        vaultHistory = store.get("vault_history");
        var lastDate  = 0;
        var lastValue = -1;
        vaultHistory.forEach(function(data) {
            if (data.date > lastDate) {
                lastDate = data.date;
                lastValue = data.value;
            }
        });
        if (vault != lastValue && lastDate < logTime.getTime()) {
            vaultHistory.push({date: logTime.getTime(), value: vault});
            store.set("vault_history", vaultHistory);
        }

        wilcardsHistory = store.get("wildcards_history");
        var lastDate  = 0;
        var lastValue = -1;
        wilcardsHistory.forEach(function(data) {
            if (data.date > lastDate) {
                lastDate = data.date;
                lastValue = data.value;
            }
        });
        if (lastDate < logTime.getTime()) {
            if (wcCommon != lastValue.wcCommon || wcUncommon != lastValue.wcUncommon || wcRare != lastValue.wcRare || wcMythic != lastValue.wcMythic) {
                var newValue = {wcCommon: wcCommon, wcUncommon: wcUncommon, wcRare: wcRare, wcMythic: wcMythic};
                wilcardsHistory.push({date: logTime.getTime(), value: newValue});
                store.set("wildcards_history", wilcardsHistory);
            }
        }
    }

    // Get Cards
    strCheck = '<== PlayerInventory.GetPlayerCardsV3(';
    json = checkJsonWithStart(data, strCheck, '', ')');
    if (json != false) {
        var date = new Date(store.get('cards.cards_time'));
        var now = new Date();
        var diff = Math.abs(now.getTime() - date.getTime());
        var days = Math.floor(diff / (1000 * 3600 * 24));

        if (store.get('cards.cards_time') == 0) {
            store.set('cards.cards_time', now);
            store.set('cards.cards_before', json);
            store.set('cards.cards', json);
        }
        // If a day has passed since last update
        else if (days > 0) {
            var cardsPrev = store.get('cards.cards');
            store.set('cards.cards_time', now);
            store.set('cards.cards_before', cardsPrev);
            store.set('cards.cards', json);
        }

        var cardsPrevious = store.get('cards.cards_before');
        var cardsNewlyAdded = {};

        Object.keys(json).forEach(function(key) {
            // get differences
            if (cardsPrevious[key] == undefined) {
                cardsNewlyAdded[key] = json[key];
            }
            else if (cardsPrevious[key] < json[key]) {
                cardsNewlyAdded[key] = json[key] - cardsPrevious[key];
            }
        });

        ipc.send("set_cards", json, cardsNewlyAdded);
    }

    // Select deck
    strCheck = '<== Event.DeckSubmit(';
	json = checkJsonWithStart(data, strCheck, '', ')');
	if (json != false) {
        select_deck(json);
    }

    // Match created
    strCheck = ' Event.MatchCreated ';
    json = checkJson(data, strCheck, '');
    if (json != false) {
        strCheck = '[UnityCrossThreadLogger]';
        if (data.indexOf(strCheck) > -1) {
            var logTime = dataChop(data, strCheck, ' (');
            matchBeginTime = parseWotcTime(logTime);
        }
        createMatch(json);
    }

    // Draft status / draft start
    strCheck = '<== Event.Draft(';
    json = checkJsonWithStart(data, strCheck, '', ')');
    if (json != false) {
        console.log("Draft start")
        draftId = json.Id;
    }

    //   
    strCheck = '<== Draft.DraftStatus(';
    json = checkJsonWithStart(data, strCheck, '', ')');
    if (json != false) {
        console.log("Draft status");
        if (json.eventName != undefined) {
            if (json.eventName.indexOf("M19") !== -1)   draftSet = "Magic 2019";
            if (json.eventName.indexOf("DOM") !== -1)   draftSet = "Dominaria";
            if (json.eventName.indexOf("HOU") !== -1)   draftSet = "Hour of Devastation";
            if (json.eventName.indexOf("AKH") !== -1)   draftSet = "Amonketh";
            if (json.eventName.indexOf("XLN") !== -1)   draftSet = "Ixalan";
            if (json.eventName.indexOf("RIX") !== -1)   draftSet = "Rivals of Ixalan";
            if (json.eventName.indexOf("KLD") !== -1)   draftSet = "Kaladesh";
            if (json.eventName.indexOf("AER") !== -1)   draftSet = "Aether Revolt";
        }
        if (json.draftStatus != undefined) {
            createDraft();
            ipc.send("set_draft_cards", json.draftPack, json.pickedCards, json.packNumber+1, json.pickNumber);
            currentDraftPack = json.draftPack.slice(0);
            httpGetPicks(draftSet);
        }
    }

    // make pick (get the whole action)
    strCheck = '<== Draft.MakePick(';
    json = checkJsonWithStart(data, strCheck, '', ')');
    if (json != false) {
        // store pack in recording
        if (json.draftPack != undefined) {
            ipc.send("set_draft_cards", json.draftPack, json.pickedCards, json.packNumber+1, json.pickNumber);
            currentDraftPack = json.draftPack.slice(0);
        }
    }

    // make pick (get just what we picked)
    strCheck = '==> Draft.MakePick(';
    json = checkJsonWithStart(data, strCheck, '', '):');
    if (json != false) {
        // store pick in recording
        var value = {};
        value.pick = json.params.cardId;
        value.pack = currentDraftPack;
        var key = "pack_"+json.params.packNumber+"pick_"+json.params.pickNumber;
        currentDraft[key] = value;
    }

    //end draft
    strCheck = '<== Event.CompleteDraft(';
    json = checkJsonWithStart(data, strCheck, '', ')');
    if (json != false) {
        saveOverlayPos();
        clear_deck();
        if (!store.get('settings.show_overlay_always')) {
	        ipc.send("overlay_close", 1);
        }
        ipc.send("renderer_show", 1);

        saveDraft();
    }

    // Game Room State Changed
    strCheck = 'MatchGameRoomStateChangedEvent';
		json = checkJson(data, strCheck, '');
	if (json != false) {
        json = json.matchGameRoomStateChangedEvent.gameRoomInfo;

        if (json.gameRoomConfig != undefined) {
            currentMatchId = json.gameRoomConfig.matchId;
            duringMatch = true;
        }

        if (json.stateType == "MatchGameRoomStateType_MatchCompleted") {
            playerWin = 0;
            oppWin = 0;
        	json.finalMatchResult.resultList.forEach(function(res) {
        		if (res.scope == "MatchScope_Game") {
            		if (res.winningTeamId == playerSeat) {
                        playerWin += 1;
            		}
            		if (res.winningTeamId == oppSeat) {
            			oppWin += 1;
            		}
            	}
                if (res.scope == "MatchScope_Match") {
                    duringMatch = false;
                }
        	});

            saveOverlayPos();
            clear_deck();
            if (!store.get('settings.show_overlay_always')) {
            	ipc.send("overlay_close", 1);
            }
        	ipc.send("renderer_show", 1);
            saveMatch();
        }

        if (json.players != undefined) {
            json.players.forEach(function(player) {
                if (player.userId == playerId) {
                    playerSeat = player.systemSeatId;
                }
                else {
                	oppId = player.userId;
                	oppSeat = player.systemSeatId;
                }
            });
        }
    }

    // Gre to Client Event
    strCheck = 'GreToClientEvent';
		json = checkJson(data, strCheck, '');
	if (json != false) {
        gre_to_client(json.greToClientEvent.greToClientMessages);
    }

    // Get courses
    strCheck = '<== Event.GetPlayerCourse(';
    json = checkJsonWithStart(data, strCheck, '', ')');
    if (json != false) {
        if (json.Id != "00000000-0000-0000-0000-000000000000") {
            json._id = json.Id;
            delete json.Id;

            select_deck(json);
            json.CourseDeck.colors = get_deck_colors(json.CourseDeck);
            httpSubmitCourse(json._id, json);
        }
    }

    // Get sideboard changes
    strCheck = 'Received unhandled GREMessageType: GREMessageType_SubmitDeckReq';
    json = checkJson(data, strCheck, '');
    if (json != false) {
        var tempMain = {};
        var tempSide = {};
        json.submitDeckReq.deck.deckCards.forEach( function (grpId) {
            if (tempMain[grpId] == undefined) {
                tempMain[grpId] = 1
            }
            else {
                tempMain[grpId] += 1;
            }
        });
        json.submitDeckReq.deck.sideboardCards.forEach( function (grpId) {
            if (tempSide[grpId] == undefined) {
                tempSide[grpId] = 1
            }
            else {
                tempSide[grpId] += 1;
            }
        });

        // Update on overlay
        var str = JSON.stringify(currentDeck);
        currentDeckUpdated = JSON.parse(str);
        ipc.send("set_deck", currentDeck);

        currentDeck.mainDeck = [];
        Object.keys(tempMain).forEach(function(key) {
            var c = {"id": key, "quantity": tempMain[key]};
            currentDeck.mainDeck.push(c);
        });

        currentDeck.sideboard = [];
        Object.keys(tempSide).forEach(function(key) {
            var c = {"id": key, "quantity": tempSide[key]};
            currentDeck.sideboard.push(c);
        });

        //console.log(JSON.stringify(currentDeck));
        //console.log(currentDeck);
    }

    let timeEnd = new Date();
    if (timeEnd - timeStart > 10) {
        //console.log("DELTA: ", timeEnd - timeStart, data);
    }
}


function gre_to_client(data) {
    data.forEach(function(msg) {
        if (msg.type == "GREMessageType_SubmitDeckReq") {
            gameObjs = {};
        }

        if (msg.type == "GREMessageType_GameStateMessage") {
            if (msg.gameStateMessage.type == "GameStateType_Full") {
                if (msg.gameStateMessage.zones != undefined) {
                    msg.gameStateMessage.zones.forEach(function(zone) {
                        zones[zone.zoneId] = zone;
                    });
                }
            }
            else if (msg.gameStateMessage.type == "GameStateType_Diff") {

                if (msg.gameStateMessage.turnInfo != undefined) {
                    turnPhase = msg.gameStateMessage.turnInfo.phase;
                    turnStep  = msg.gameStateMessage.turnInfo.step;
                    turnNumber = msg.gameStateMessage.turnInfo.turnNumber;
                    turnActive = msg.gameStateMessage.turnInfo.activePlayer;
                    turnPriority = msg.gameStateMessage.turnInfo.priorityPlayer;
                    turnDecision = msg.gameStateMessage.turnInfo.decisionPlayer;
                    turnStorm = msg.gameStateMessage.turnInfo.stormCount;

                    if (!firstPass) {
                        ipc.send("set_turn", playerSeat, turnPhase, turnStep, turnNumber, turnActive, turnPriority, turnDecision);
                    }
                    //console.log(msg.msgId, "Turn "+turnNumber, turnPhase, turnStep);
                }

                if (msg.gameStateMessage.gameInfo != undefined) {
                    if (msg.gameStateMessage.gameInfo.matchState == "MatchState_GameComplete") {
                        let results = msg.gameStateMessage.gameInfo.results;
                        matchWincon = msg.gameStateMessage.gameInfo.matchWinCondition;
                        playerWin = 0;
                        oppWin = 0;
                        results.forEach(function(res) {
                            if (res.scope == "MatchScope_Game") {
                                if (res.winningTeamId == playerSeat) {
                                    playerWin += 1;
                                }
                                if (res.winningTeamId == oppSeat) {
                                    oppWin += 1;
                                }
                            }
                            if (res.scope == "MatchScope_Match") {
                                duringMatch = false;
                            }
                        });
                    }
                    if (msg.gameStateMessage.gameInfo.matchState == "MatchState_MatchComplete") {
                        saveOverlayPos();
                        clear_deck();
                        if (!store.get('settings.show_overlay_always')) {
                            ipc.send("overlay_close", 1);
                        }

                        saveMatch();
                    }
                }

                if (msg.gameStateMessage.annotations != undefined) {
                    msg.gameStateMessage.annotations.forEach(function(obj) {
                        
                        let affector = obj.affectorId;
                        let affected = obj.affectedIds;
                        //if (annotationsRead[obj.id] == undefined) {
                        if (affected != undefined) {
                            affected.forEach(function(aff) {
                                if (obj.type.includes("AnnotationType_EnteredZoneThisTurn")) {
                                    if (gameObjs[aff] !== undefined) {
                                        //console.log(obj.id, cardsDb.get(gameObjs[aff].grpId).name, "Entered", zones[affector].type);
                                        //annotationsRead[obj.id] = true;
                                    }
                                    
                                }

                                //if (obj.type.includes("AnnotationType_WinTheGame")) {
                                //}
                            });
                        }
                    });
                }

                if (msg.gameStateMessage.zones != undefined) {
                    msg.gameStateMessage.zones.forEach(function(zone) {
                        zones[zone.zoneId] = zone;
                    });
                }

                if (msg.gameStateMessage.gameObjects != undefined) {
                    msg.gameStateMessage.gameObjects.forEach(function(obj) {
                        gameObjs[obj.instanceId] = obj;
                    });
                }

                if (msg.gameStateMessage.diffDeletedInstanceIds != undefined) {
                    msg.gameStateMessage.diffDeletedInstanceIds.forEach(function(obj) {
                        gameObjs[obj] = undefined;
                    });
                }
            }
        }
        //
    });
    
    var str = JSON.stringify(currentDeck);
    currentDeckUpdated = JSON.parse(str);
    forceDeckUpdate();
    update_deck();
}

function createMatch(arg) {
    var obj = store.get('overlayBounds');

    annotationsRead = [];
    zones = {};
    gameObjs = {};

    if (!firstPass && store.get("settings").show_overlay == true) {
        if (store.get("settings").close_on_match) {
            ipc.send("renderer_hide", 1);
        }
        ipc.send("overlay_show", 1);
        ipc.send("overlay_set_bounds", obj);
    }

    oppName = arg.opponentScreenName;
    oppRank = arg.opponentRankingClass;
    oppTier = arg.opponentRankingTier;
    currentEventId = arg.eventId;
    currentMatchId = null;
    playerWin = 0;
    oppWin = 0;

    ipc.send("set_timer", matchBeginTime);
    ipc.send("set_opponent", oppName);
    ipc.send("set_opponent_rank", get_rank_index(oppRank, oppTier), oppRank+" "+oppTier);
}

function createDraft() {
    var obj = store.get('overlayBounds');
    annotationsRead = [];
    zones = {};
    gameObjs = {};

    if (!firstPass && store.get("settings").show_overlay == true) {
        if (store.get("settings").close_on_match) {
            ipc.send("renderer_hide", 1);
        }

        ipc.send("overlay_show", 1);
        ipc.send("overlay_set_bounds", obj);
    }

    currentDraft = {};

    oppName = "";
    oppRank = "";
    oppTier = -1;
    currentMatchId = null;
    playerWin = 0;
    oppWin = 0;

    ipc.send("set_draft", true);
    ipc.send("set_timer", -1);
    ipc.send("set_opponent", oppName);
    ipc.send("set_opponent_rank", get_rank_index(oppRank, oppTier), oppRank+" "+oppTier);
}

function select_deck(arg) {
    currentDeck = arg.CourseDeck;
    var str = JSON.stringify(currentDeck);
    currentDeckUpdated = JSON.parse(str);
    ipc.send("set_deck", currentDeck);
}

function clear_deck() {
    var deck = {mainDeck: [], sideboard : [], name: ""};
    ipc.send("set_deck", deck);
}

function update_deck() {
    var nd = new Date()
    if (nd - lastDeckUpdate > 1000 || debugLog == true) {
        if (overlayDeckMode == 0) {
            ipc.send("set_deck", currentDeckUpdated);
        }
        if (overlayDeckMode == 1) {
            ipc.send("set_deck", currentDeck);
        }
        if (overlayDeckMode == 2) {
            ipc.send("set_deck", currentDeckUpdated);
        }
        if (overlayDeckMode == 3) {
            var currentOppDeck = getOppDeck();
            ipc.send("set_deck", currentOppDeck);
        }
        lastDeckUpdate = nd;
    }
}

//
function get_rank_index(_rank, _tier) {
    var ii = 0;
    if (_rank == "Beginner")    ii = 0;
    if (_rank == "Bronze")      ii = 1  + _tier;
    if (_rank == "Silver")      ii = 6  + _tier;
    if (_rank == "Gold")        ii = 11 + _tier;
    if (_rank == "Diamond")     ii = 16 + _tier;
    if (_rank == "Master")      ii = 21;
    return ii;
}

function forceDeckUpdate() {
    var decksize = 0;
    var typeCre = 0;
    var typeIns = 0;
    var typeSor = 0;
    var typePla = 0;
    var typeArt = 0;
    var typeEnc = 0;
    var typeLan = 0;
    if (debugLog == true || firstPass == false) {
        currentDeckUpdated.mainDeck.forEach(function(card) {
            card.total = card.quantity;
            decksize += card.quantity;
        });
    }
    Object.keys(gameObjs).forEach(function(key) {
        if (gameObjs[key] != undefined) {
            if (zones[gameObjs[key].zoneId].type != "ZoneType_Limbo") {
                if (gameObjs[key].ownerSeatId == playerSeat && gameObjs[key].type == "GameObjectType_Card") {
                    if (currentDeckUpdated.mainDeck != undefined) {
                        currentDeckUpdated.mainDeck.forEach(function(card) {
                            if (card.id == gameObjs[key].grpId) {
                                //console.log(cardsDb.get(gameObjs[key].grpId).name, zones[gameObjs[key].zoneId].type);
                                card.quantity -= 1;
                            }
                        });
                    }
                }
            }
        }
    }); 
    if (debugLog == true || firstPass == false) {
        currentDeckUpdated.mainDeck.forEach(function(card) {
            var c = cardsDb.get(card.id);
            if (c) {
                if (c.type.includes("Creature", 0))      typeCre += card.quantity;
                if (c.type.includes("Planeswalker", 0))  typePla += card.quantity;
                if (c.type.includes("Instant", 0))       typeIns += card.quantity;
                if (c.type.includes("Sorcery", 0))       typeSor += card.quantity;
                if (c.type.includes("Artifact", 0))      typeArt += card.quantity;
                if (c.type.includes("Enchantment", 0))   typeEnc += card.quantity;
                if (c.type.includes("Land", 0))          typeLan += card.quantity;
            }
            card.chance = Math.round(hypergeometric(1, decksize, 1, card.quantity)*100);
        });

        currentDeckUpdated.chanceCre = Math.round(hypergeometric(1, decksize, 1, typeCre) * 1000)/10;
        currentDeckUpdated.chanceIns = Math.round(hypergeometric(1, decksize, 1, typeIns) * 1000)/10;
        currentDeckUpdated.chanceSor = Math.round(hypergeometric(1, decksize, 1, typeSor) * 1000)/10;
        currentDeckUpdated.chancePla = Math.round(hypergeometric(1, decksize, 1, typePla) * 1000)/10;
        currentDeckUpdated.chanceArt = Math.round(hypergeometric(1, decksize, 1, typeArt) * 1000)/10;
        currentDeckUpdated.chanceEnc = Math.round(hypergeometric(1, decksize, 1, typeEnc) * 1000)/10;
        currentDeckUpdated.chanceLan = Math.round(hypergeometric(1, decksize, 1, typeLan) * 1000)/10;
    }
}

function getOppDeck() {
	var oppDeck = {mainDeck: [], sideboard : []};
	var doAdd = true;
    oppDeck.name = "played by "+oppName;

    Object.keys(gameObjs).forEach(function(key) {
        if (gameObjs[key] != undefined) {
            if (zones[gameObjs[key].zoneId].type != "ZoneType_Limbo") {
                if (gameObjs[key].ownerSeatId == oppSeat && gameObjs[key].type == "GameObjectType_Card") {

                	doAdd = true;
                    oppDeck.mainDeck.forEach(function(card) {
                        if (card.id == gameObjs[key].grpId) {
                            doAdd = false;
                            card.quantity += 1;
                        }
                    });

                    if (doAdd) {
                        if (cardsDb.get(gameObjs[key].grpId) != false) {
    						oppDeck.mainDeck.push( {id: gameObjs[key].grpId, quantity: 1} );
                        }
                    }
                }
            }
        }
    }); 

    return oppDeck;
}

function saveMatch() {
    var match = {};
    match.id = currentMatchId;
    match.opponent = {
        name: oppName,
        rank: oppRank,
        tier: oppTier,
        userid: oppId,
        seat: oppSeat,
        win: oppWin
    }
    match.player = {
        name: playerName,
        rank: playerRank,
        tier: playerTier,
        userid: playerId,
        seat: playerSeat, 
        win: playerWin
    }

    match.eventId = currentEventId;
    match.playerDeck = currentDeck;
    match.oppDeck = getOppDeck();
    match.date = new Date();

    console.log("Save match:", match.id);
    var matches = store.get('matches_index');
    if (!matches.includes(currentMatchId)) {
        matches.push(currentMatchId);
    }
    else {
        match.date = store.get(currentMatchId).date;
    }

    store.set('matches_index', matches);
    store.set(currentMatchId, match);
    history[currentMatchId] = match;
    httpSetMatch(match);
    if (!debugLog) {
        requestHistorySend(0);
    }
}


function saveDraft() {
    var draft = currentDraft;
    draft.id = draftId;
    draft.date = new Date();
    draft.set = draftSet;

    console.log("Save draft:", draftId);
    var drafts = store.get('draft_index');
    if (!drafts.includes(draftId)) {
        drafts.push(draftId);
    }
    else {
        draft.date = store.get(draftId).date;
    }

    store.set('draft_index', drafts);
    store.set(draftId, draft);
    httpSetMatch(draft);
}


function finishLoading() {
	firstPass = false;

    if (duringMatch) {
        var obj = store.get('overlayBounds');

        ipc.send("renderer_hide", 1);
        ipc.send("overlay_show", 1);
        ipc.send("overlay_set_bounds", obj);
        update_deck();
    }

    requestHistorySend(0);
	ipc.send("initialize", 1);

    var obj = store.get('windowBounds');
    ipc.send("renderer_set_bounds", obj);

    if (playerName != null) {
        httpSetPlayer(playerName, playerRank, playerTier);  
    }
}


var httpAsync = [];
httpBasic();

function httpBasic() {
    var httpAsyncNew = httpAsync.slice(0);
    //var str = ""; httpAsync.forEach( function(h) {str += h.reqId+", "; }); console.log("httpAsync: ", str);
    async.forEachOfSeries(httpAsyncNew, function (value, index, callback) {
        var _headers = value;

        if (store.get("settings").send_data == false && _headers.method != 'delete_data') {
            callback({message: "Settings dont allow sending data! > "+_headers.method});
            removeFromHttp(_headers.reqId);
        }
        if (_headers.method != 'auth') {
            if (tokenAuth == undefined) {
                callback({message: "Undefined token"});
                removeFromHttp(_headers.reqId);             
                _headers.token = "";
            }
            else {
                _headers.token = tokenAuth;
            }
        }
        
        var http = require('https');
        if (_headers.method == 'get_picks') {
            var options = { protocol: 'https:', port: 443, hostname: serverAddress, path: '/get_picks.php', method: 'POST', headers: _headers };
        }
        else {
            var options = { protocol: 'https:', port: 443, hostname: serverAddress, path: '/apiv4.php', method: 'POST', headers: _headers };
        }
        //console.log("SEND >> "+index, _headers.method, _headers.reqId, _headers.token);

        var results = ''; 
        var req = http.request(options, function(res) {
            res.on('data', function (chunk) {
                results = results + chunk;
            }); 
            res.on('end', function () {
               //console.log("RECV << "+index, _headers.method, _headers.reqId, _headers.token);
               console.log("RECV << "+index, _headers.method, results);
                try {
                    var parsedResult = JSON.parse(results);
                    if (parsedResult.ok) {
                        if (_headers.method == 'auth') {
                            tokenAuth = parsedResult.token;
                            httpGetMeta();
                        }
                        //
                        if (_headers.method == 'get_top_decks') {
                            ipc.send("set_explore", parsedResult.result);
                        }
                        //
                        if (_headers.method == 'get_course') {
                            ipc.send("open_course_deck", parsedResult.result);
                        }
                    }
                    if (_headers.method == 'get_picks') {
                     ipc.send("set_draft_picks", parsedResult);
                    }
                } catch (e) {
                    console.error(e.message);
                }
                if (_headers.token != "") {
                    callback();
                }
                removeFromHttp(_headers.reqId);
                //var str = ""; httpAsync.forEach( function(h) { str += h.reqId+", "; }); console.log("httpAsync: ", str);
            }); 
        });

        req.on('error', function(e) {
            callback(e);
            removeFromHttp(_headers.reqId);
            console.error(e.message);
        });

        req.end();

    }, function (err) {
        if (err) {
            console.log("httpBasic() Error", err.message);
        }
        // do it again
        setTimeout( function() {
            httpBasic();
        }, 250);
    });
}

function removeFromHttp(req) {
    httpAsync.forEach( function(h, i) {
        if (h.reqId == req) {
            httpAsync.splice(i, 1);
        }
    });
}

function httpAuth() {
    var _id = makeId(6);
	httpAsync.push({'reqId': _id, 'method': 'auth', 'uid': playerId});
}

function httpSubmitCourse(_courseId, _course) {
    var _id = makeId(6);
    _course = JSON.stringify(_course);
	httpAsync.push({'reqId': _id, 'method': 'submit_course', 'uid': playerId, 'course': _course, 'courseid': _courseId});
}

function httpSetPlayer(name, rank, tier) {
    var _id = makeId(6);
	httpAsync.push({'reqId': _id, 'method': 'set_player', 'uid': playerId, 'name': name, 'rank': rank, 'tier': tier});
}

function httpGetTopDecks(query) {
    var _id = makeId(6);
	httpAsync.push({'reqId': _id, 'method': 'get_top_decks', 'uid': playerId, 'query': query});
}

function httpGetCourse(courseId) {
    var _id = makeId(6);
    httpAsync.push({'reqId': _id, 'method': 'get_course', 'uid': playerId, 'courseid': courseId});
}

function httpSetMatch(match) {
    var _id = makeId(6);
    match = JSON.stringify(match);
    httpAsync.push({'reqId': _id, 'method': 'set_match', 'uid': playerId, 'match': match});
}

function httpDeleteData(courseId) {
    var _id = makeId(6);
    httpAsync.push({'reqId': _id, 'method': 'delete_data', 'uid': playerId});
}

function httpGetPicks(set) {
    var _id = makeId(6);
    httpAsync.push({'reqId': _id, 'method': 'get_picks', 'uid': playerId, 'query': set});
}

//
function get_deck_colors(deck) {
    deck.colors = [];
    deck.mainDeck.forEach(function(card) {
        var grpid = card.id;
        var card_name = cardsDb.get(grpid).name;
        var card_cost = cardsDb.get(grpid).cost;
        card_cost.forEach(function(c) {
            if (!deck.colors.includes(c.color) && c.color != 0 && c.color < 7) {
                deck.colors.push(c.color);
            }
        });
    });

    deck.sideboard.forEach(function(card) {
        var grpid = card.id;
        var card_name = cardsDb.get(grpid).name;
        var card_cost = cardsDb.get(grpid).cost;
        card_cost.forEach(function(c) {
            if (!deck.colors.includes(c.color) && c.color != 0 && c.color < 7) {
                deck.colors.push(c.color);
            }
        });
    });
    return deck.colors;
}

//
function parseWotcTime(str) {
    let datePart = str.split(" ")[0];
    let timePart = str.split(" ")[1];
    let midnight = str.split(" ")[2];

    datePart = datePart.split("/");
    timePart = timePart.split(":");

    timePart.forEach(function(s, index) {timePart[index] = parseInt(s)});
    datePart.forEach(function(s, index) {datePart[index] = parseInt(s)});

    if (midnight == "PM" && timePart[0] != 12) {
        timePart[0] += 12;
    }
    if (midnight == "AM" && timePart[0] == 12) {
        timePart[0] = 0;
    }

    var date = new Date(datePart[2], datePart[0]-1, datePart[1], timePart[0], timePart[1], timePart[2]);
    return date;
}

//
function makeId(length) {
    var ret = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++)
    ret += possible.charAt(Math.floor(Math.random() * possible.length));

    return ret;
}

//
function fact(arg0) {
    let _f = 1;
    let _i = 1;
    for (_i=1; _i<=arg0; _i++) {
        _f = _f * _i;
    }

    return _f;
}

//
function comb(arg0, arg1) {
    let ret = fact(arg0) / fact(arg0-arg1) / fact(arg1);
    
    return ret;
}

//
function hypergeometric(arg0, arg1, arg2, arg3) {
    if (arg0 > arg3) {
        return 0;
    }

    let _x, _N, _n, _k;

    _x = arg0;// Number of successes in sample (x) <= 
    _N = arg1;// Population size
    _n = arg2;// Sample size
    _k = arg3;// Number of successes in population  

    let _a = comb(_k, _x)
    let _b = comb(_N-_k, _n-_x);
    let _c = comb(_N, _n);

    return _a * _b / _c;
}

//
function debugStart() {
    timeStart = new Date();
}

//
function debugEnd(str) {
    timeEnd = new Date();
    console.log(timeEnd - timeStart, str);
    timeStart = new Date();
}
