'use strict';

const electron = require('electron');
const {app, Menu, Tray, net, clipboard} = require('electron');
const path  = require('path');
const Store = require('./store.js');
const async = require("async");

const {autoUpdater} = require("electron-updater");

var store = new Store({
	configName: 'default',
	defaults: {
		windowBounds: { width: 800, height: 600, x: 0, y: 0 },
		overlayBounds: { width: 300, height: 600, x: 0, y: 0 },
        cards: { cards_time: 0, cards_before:[], cards:[] },
		settings: {show_overlay: true, startup: true, close_to_tray: true, send_data: true, close_on_match: true},
        matches_index:[],
        draft_index:[],
        vault_history:[],
        gold_history:[],
        wildcards_history:[]
	}
});

const serverAddress = 'mtgatool.com';
const Database = require('./database.js');
const cardsDb = new Database();

const debugLog = false;
const debugLogSpeed = 0.1;
const fs = require("fs");
const ipc = electron.ipcMain;

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

var goldHistory = [];
var vaultHistory = [];
var wilcardsHistory = [];

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')({showDevTools: false});

var mainWindow;
var overlay;
var tray = null;

//Debug stuff
ipc.on('ipc_log', function (event, msg) {
    console.log("IPC LOG: ", msg);
});

ipc.on('renderer_state', function (event, state) {
    renderer_state = state;
    console.log("Renderer state: ", state);
    showWindow();
    var settings = store.get("settings");
    mainWindow.webContents.send("set_settings", settings);

    updateSettings(settings);
    if (debugLog) {
        finishLoading()
    }
});

ipc.on('save_settings', function (event, settings) {
    store.set('settings', settings);

    updateSettings(settings);
});

ipc.on('erase_data', function (event, settings) {
    httpDeleteData();
});


ipc.on('update_install', function (event, settings) {
    if (updateState == 3) {
        autoUpdater.quitAndInstall();
    }
});


function loadPlayerConfig(playerId) {
    store = new Store({
        configName: playerId,
        defaults: {
            windowBounds: { width: 800, height: 600, x: 0, y: 0 },
            overlayBounds: { width: 300, height: 600, x: 0, y: 0 },
            cards: { cards_time: 0, cards_before:[], cards:[] },
            settings: {show_overlay: true, startup: true, close_to_tray: true, send_data: true, close_on_match: true},
            matches_index:[],
            draft_index:[],
            vault_history:[],
            gold_history:[],
            wildcards_history:[]
        }
    });

    goldHistory = store.get("gold_history");
    vaultHistory = store.get("vault_history");
    wilcardsHistory = store.get("wildcards_history");

    var settings = store.get("settings");
    mainWindow.webContents.send("set_settings", settings);
    updateSettings(settings);
}


function updateSettings(settings) {
    const exeName = path.basename(process.execPath);

    app.setLoginItemSettings({
        openAtLogin: settings.startup
    });
}


ipc.on('request_history', function (event, state) {
	history.matches = store.get('matches_index');
	history.matches.forEach(function(id) {
		history[id] = store.get(id);
        history[id].type = "match";
	});
	
    var drafts = {};
    drafts.matches = store.get('draft_index');
    drafts.matches.forEach(function(id) {
        history.matches.push(id);
        history[id] = store.get(id);
        history[id].type = "draft";
    });

	if (state == 1) {
	    mainWindow.webContents.send("set_history", history);
	}
	else {
	    mainWindow.webContents.send("set_history_data", history);
	}

});

ipc.on('request_explore', function (event, arg) {
    httpGetTopDecks(arg);
});

ipc.on('request_course', function (event, arg) {
    httpGetCourse(arg);
});


// Events
ipc.on('window_close', function (event, state) {
    if (store.get("settings").close_to_tray) {
        hideWindow();
    }
    else {
        quit();
    }
});

ipc.on('window_minimize', function (event, state) {
    mainWindow.minimize();
});

ipc.on('overlay_close', function (event, state) {
    overlay.hide();
});

ipc.on('overlay_minimize', function (event, state) {
    overlay.minimize();
});

ipc.on('set_deck_mode', function (event, state) {
    overlayDeckMode = state;
    update_deck();
});

ipc.on('force_open_settings', function (event, state) {
    mainWindow.webContents.send("force_open_settings", true);
    showWindow();
});

ipc.on('set_clipboard', function (event, arg) {
    clipboard.writeText(arg);
});

// Catch exceptions
process.on('uncaughtException', function (err) {
    console.log('Uncaught exception;');
    console.log(err.stack);
    //console.log('Current chunk:',  currentChunk);
});

/*
    Auto update stuff
*/
autoUpdater.on('checking-for-update', () => {
    updateState = 0;
    sendUpdateState();
    console.log('Auto updater:', 'Checking for update...');
})

autoUpdater.on('update-available', (info) => {
    updateState = 1;
    updateAvailable = true;
    sendUpdateState();
    console.log('Auto updater:', 'Update available.');
    mainWindow.webContents.send("show_notification", "Update available");
})

autoUpdater.on('update-not-available', (info) => {
    updateState = -1;
    updateAvailable = false;
    sendUpdateState();
    console.log('Auto updater:', 'Update not available.');
})

autoUpdater.on('error', (err) => {
    updateState = -2;
    updateAvailable = false;
    sendUpdateState();
    console.log('Auto updater:', 'Error in auto-updater. ' + err);
})

autoUpdater.on('download-progress', (progressObj) => {
    updateState = 2;
    updateProgress = Math.round(progressObj.percent * 100) / 100;
    updateSpeed = progressObj.bytesPerSecond;
    sendUpdateState();

    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log('Auto updater:', log_message);
})
autoUpdater.on('update-downloaded', (info) => {
    updateState = 3;
    sendUpdateState();
    mainWindow.webContents.send("show_notification", "Update downloaded");
    console.log('Auto updater:', 'Update downloaded');
});

function sendUpdateState() {
    var state = {state: updateState, available: updateAvailable, progress: updateProgress, speed: updateSpeed};
    mainWindow.webContents.send("set_update", state);
}

function onClosed() {
    mainWindow = null;
}

function onOverlayClosed() {
    overlay = null;
}

function hideWindow() {
    if (mainWindow.isVisible()) {
        mainWindow.hide()
    }
}

function toggleWindow() {
    if (mainWindow.isVisible()) {
        if (!mainWindow.isMinimized()) {
            mainWindow.minimize();
        }
        else {
            showWindow();
        }
    } else {
        showWindow();
    }
}

function showWindow() {
    mainWindow.show();
    mainWindow.focus();
}

function quit() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
}

function saveWindowPos() {
	var obj = {};
	var bounds = mainWindow.getBounds();
	var pos = mainWindow.getPosition();
	obj.width = Math.floor(bounds.width);
	obj.height = Math.floor(bounds.height);
	obj.x = Math.floor(pos[0]);
	obj.y = Math.floor(pos[1]);
	store.set('windowBounds', obj);
}

function saveOverlayPos() {
	var obj = {};
	var bounds = overlay.getBounds();
	var pos = overlay.getPosition();
	obj.width = Math.floor(bounds.width);
	obj.height = Math.floor(bounds.height);
	obj.x = Math.floor(pos[0]);
	obj.y = Math.floor(pos[1]);
	store.set('overlayBounds', obj);
}

function createMainWindow() {
	var obj = store.get('windowBounds');

    const win = new electron.BrowserWindow({
        frame: false,
        show: false,
        width: obj.width,
        height: obj.height,
        title: "MTG Arena Tool",
        icon:'icon.png'
    });
    win.loadURL(`file://${__dirname}/index.html`);
    win.on('closed', onClosed);

    let iconPath = path.join(__dirname, 'icon.ico');
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {label: 'Show', click: () => { showWindow();}},
      {label: 'Quit', click: () => { quit();}}
    ])
    tray.on('double-click', toggleWindow);
    tray.setToolTip('MTG Arena Tool');
    tray.setContextMenu(contextMenu);

	win.on('resize', () => {
		saveWindowPos();
	});

    return win;
}

function createOverlay() {
	var obj = store.get('overlayBounds');

    const over = new electron.BrowserWindow({
        frame: false,
        alwaysOnTop: true,
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
        show: false,
        title: "MTG Arena Tool",
        icon:'images/icon.png'
    });
    over.loadURL(`file://${__dirname}/overlay.html`);
    over.on('closed', onOverlayClosed);

	over.on('resize', () => {
		saveOverlayPos();
	});

    setTimeout( function() {
        overlay.webContents.send("set_deck", currentDeck);
    	//debug_overlay_show();
    }, 1000);

    return over;
}

app.on('window-all-closed', () => {
    quit();
});

app.on('activate', () => {
    if (!mainWindow) {
        mainWindow = createMainWindow();
    }
});

app.on('ready', () => {
    mainWindow = createMainWindow();
    overlay = createOverlay();
    autoUpdater.checkForUpdatesAndNotify();
});



// Read the log
var prevLogSize = 0;
var logUri = process.env.APPDATA;
logUri = logUri.replace('Roaming','LocalLow\\Wizards Of The Coast\\MTGA\\output_log.txt');
console.log(logUri);

var file;
logLoop();

function logLoop() {
    //console.log("logLoop() start")
    fs.open(logUri, 'r', function(err, fd) {
        file = fd;
        if (err) {
            setTimeout( function() {
                mainWindow.webContents.send("no_log", logUri);
            }, 1000);
            setTimeout(logLoop, 5000);
            console.log("No log file found");
        } else {
            readLog();
        }
    });
}

function readLog() {
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


/**
***
***
***
**/

function processLogData(data) {
	currentChunk = data;
    var strCheck, json;

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
        mainWindow.webContents.send("set_username", playerName);
    }

    // Get Ranks
    strCheck = '<== Event.GetCombinedRankInfo(';
    json = checkJsonWithStart(data, strCheck, '', ')');
    if (json != false) {
		playerRank = json.constructedClass;
		playerTier = json.constructedTier;

        let rank = get_rank_index(playerRank, playerTier);

        mainWindow.webContents.send("set_rank", rank, playerRank+" "+playerTier);
    }

    // Get Decks
    strCheck = '<== Deck.GetDeckLists(';
    json = checkJsonWithStart(data, strCheck, '', ')');
    if (json != false) {
        mainWindow.webContents.send("set_decks", json);
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

        goldHistory = store.get("gold_history");
        var lastDate  = 0;
        var lastValue = -1;
        goldHistory.forEach(function(data) {
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

        mainWindow.webContents.send("set_cards", json, cardsNewlyAdded);
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
            overlay.webContents.send("set_draft_cards", json.draftPack, json.pickedCards, json.packNumber+1, json.pickNumber);
            currentDraftPack = json.draftPack.slice(0);
        }
    }

    // make pick (get the whole action)
    strCheck = '<== Draft.MakePick(';
    json = checkJsonWithStart(data, strCheck, '', ')');
    if (json != false) {
        // store pack in recording
        if (json.draftPack != undefined) {
            overlay.webContents.send("set_draft_cards", json.draftPack, json.pickedCards, json.packNumber+1, json.pickNumber);
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
        overlay.hide();
        mainWindow.show();
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
            overlay.hide();
            mainWindow.show();
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
        overlay.webContents.send("set_deck", currentDeck);

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
}


function gre_to_client(data) {
    data.forEach(function(msg) {
        /*
        // Only shows what the opp hovers now.. :(
        if (msg.type == "GREMessageType_UIMessage") {
            if (msg.uiMessage.onHover != undefined) {
                if (msg.uiMessage.onHover.objectId != undefined) {
                    if (gameObjs[msg.uiMessage.onHover.objectId] != undefined && gameObjs[msg.uiMessage.onHover.objectId].type == "GameObjectType_Card") {
                        hoverCard = gameObjs[msg.uiMessage.onHover.objectId].grpId;
                        if (cardsDb.get(gameObjs[msg.uiMessage.onHover.objectId].grpId) != undefined) {
                            overlay.webContents.send("set_hover", hoverCard);
                        }
                    }
                    else {
                        overlay.webContents.send("set_hover", undefined);
                    }
                }
                else {
                    overlay.webContents.send("set_hover", undefined);
                }
            }
        }
        */

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
                        overlay.hide();
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
            hideWindow();
        }

        overlay.show();
        overlay.focus();
        overlay.setBounds(obj);
    }

    oppName = arg.opponentScreenName;
    oppRank = arg.opponentRankingClass;
    oppTier = arg.opponentRankingTier;
    currentEventId = arg.eventId;
    currentMatchId = null;
    playerWin = 0;
    oppWin = 0;

    overlay.webContents.send("set_timer", matchBeginTime);
    overlay.webContents.send("set_opponent", oppName);
    overlay.webContents.send("set_opponent_rank", get_rank_index(oppRank, oppTier), oppRank+" "+oppTier);
}

function createDraft() {
    var obj = store.get('overlayBounds');
    annotationsRead = [];
    zones = {};
    gameObjs = {};

    if (!firstPass && store.get("settings").show_overlay == true) {
        if (store.get("settings").close_on_match) {
            hideWindow();
        }

        overlay.show();
        overlay.focus();
        overlay.setBounds(obj);
    }

    currentDraft = {};

    oppName = "";
    oppRank = "";
    oppTier = -1;
    currentMatchId = null;
    playerWin = 0;
    oppWin = 0;

    overlay.webContents.send("set_draft", true);
    overlay.webContents.send("set_timer", -1);
    overlay.webContents.send("set_opponent", oppName);
    overlay.webContents.send("set_opponent_rank", get_rank_index(oppRank, oppTier), oppRank+" "+oppTier);
}

function select_deck(arg) {
    currentDeck = arg.CourseDeck;
    var str = JSON.stringify(currentDeck);
    currentDeckUpdated = JSON.parse(str);
    overlay.webContents.send("set_deck", currentDeck);
}

function update_deck() {
    if (overlayDeckMode == 0) {
        overlay.webContents.send("set_deck", currentDeckUpdated);
    }
    if (overlayDeckMode == 1) {
        overlay.webContents.send("set_deck", currentDeck);
    }
}

function debug_overlay_show() {
    zones = {};
    gameObjs = {};
    hideWindow();
    overlay.show();
    overlay.focus();
    oppName = "Dummy";
    oppRank = "Master";
    oppTier = 1;
    currentMatchId = null;
	playerWin = 0;
	oppWin = 0;
    overlay.webContents.send("set_opponent", "Dummy");
    overlay.webContents.send("set_opponent_rank", get_rank_index(oppRank, oppTier), "Master 1");
    overlay.webContents.send("set_deck", currentDeck);
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
}

function getOppDeck() {
	var oppDeck = {mainDeck: [], sideboard : []};
	var doAdd = true;
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
    httpSetMatch(match);
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

        hideWindow();
        overlay.show();
        overlay.focus();
        overlay.setBounds(obj);
        update_deck();
    }

    history.matches = store.get('matches_index');
    history.matches.forEach(function(id) {
        history[id] = store.get(id);
        history[id].type = "match";
    });

    var drafts = {};
    drafts.matches = store.get('draft_index');
    drafts.matches.forEach(function(id) {
        history.matches.push(id);
        history[id] = store.get(id);
        history[id].type = "draft";
    });

	mainWindow.webContents.send("set_history_data", history);
	mainWindow.webContents.send("initialize", 1);

    var obj = store.get('windowBounds');
    mainWindow.setBounds(obj);

	httpSetPlayer(playerName, playerRank, playerTier);	
}


var httpAsync = [];
httpBasic();

function httpBasic() {
    var httpAsyncNew = httpAsync.slice(0);
    //var str = ""; httpAsync.forEach( function(h) {str += h.reqId+", "; }); console.log("httpAsync: ", str);
    async.forEachOfSeries(httpAsyncNew, function (value, index, callback) {
        var _headers = value;

        if (store.get("settings").send_data == false && _headers.method != 'delete_data') {
            callback({message: "Settings dont allow sending data!"});
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
        var options = { protocol: 'https:', port: 443, hostname: serverAddress, path: '/apiv4.php', method: 'POST', headers: _headers };
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
                            mainWindow.webContents.send("set_explore", parsedResult.result);
                        }
                        //
                        if (_headers.method == 'get_course') {
                            mainWindow.webContents.send("open_course_deck", parsedResult.result);
                        }
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

function httpGetMeta() {
    var _id = makeId(6);
    httpAsync.push({'reqId': _id, 'method': 'get_meta', 'uid': playerId});
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
    //console.log(str, date.toString(), date.getTime(), date)
    return date;
}

function makeId(length) {
    var ret = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++)
    ret += possible.charAt(Math.floor(Math.random() * possible.length));

    return ret;
}
