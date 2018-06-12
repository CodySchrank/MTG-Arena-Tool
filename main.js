'use strict';

const electron = require('electron');
const {app, Menu, Tray, net, clipboard} = require('electron');
const path  = require('path');
const Store = require('electron-store');

const {autoUpdater} = require("electron-updater");

const store = new Store({
	configName: 'data',
	defaults: {
		windowBounds: { width: 800, height: 600, x: 0, y: 0 },
		overlayBounds: { width: 300, height: 600, x: 0, y: 0 },
        cards: { cards_time: 0, cards_before:[], cards:[] },
		settings: {show_overlay: true, startup: true},
        matches_index:[],
	}
});

const serverAddress = '168.181.184.14';
const Database = require('./database.js');
const cardsDb = new Database();

const debugLog = false;
const debugLogSpeed = 0.1;
const fs = require("fs");
const ipc = electron.ipcMain;

var tokenAuth = undefined;
var firstPass = true;
var renderer_state = 0;
var currentChunk = "";
var currentDeck = {};
var currentDeckUpdated = {};
var currentMatchId = null;
var matchWincon = "";
var duringMatch = false;

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

    var settings = store.get("settings");
    mainWindow.webContents.send("set_settings", settings);

    updateSettings(settings);
});

ipc.on('save_settings', function (event, settings) {
    store.set('settings', settings);

    updateSettings(settings);
});

ipc.on('update_install', function (event, settings) {
    if (updateState == 3) {
        autoUpdater.quitAndInstall();
    }
});


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
	});
	
	if (state == 1) {
	    mainWindow.webContents.send("set_history", history);
	}
	else {
	    mainWindow.webContents.send("set_history_data", history);
	}

});

ipc.on('request_explore', function (event, state) {
    httpGetTopDecks();
});


// Events
ipc.on('window_close', function (event, state) {
    hideWindow();
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
fs.open(logUri, 'r', function(err, fd) {
    file = fd;

	if (err) {
		console.log("no log file found");
	} else {
		readLog();
	}
});

function readLog() {
    if (renderer_state == 1) {
        var stats = fs.fstatSync(file);
        var logSize = stats.size;
        var logDiff = logSize - prevLogSize;

        if (logSize < prevLogSize+1) {
            setTimeout(readLog, 1000);
        }
        else {
            fs.read(file, new Buffer(logDiff), 0, logDiff, prevLogSize, processLog);
        }
    }
    else {
        setTimeout(readLog, 1000);
    }
}

function processLog(err, bytecount, buff) {
    let rawString = buff.toString('utf-8', 0, bytecount);

    var splitString = rawString.split('(Filename: ');
    console.log('Reading:', bytecount, 'bytes, ',splitString.length, ' chunks');

    var str;
    for (var i=0; i<splitString.length; i++) {
    	str = splitString[i];
    	//processLogData(str);
    	
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

    prevLogSize+=bytecount;
    process.nextTick(readLog);
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
        playerId = dataChop(data, strCheck, '"');
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
        createMatch(json);
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


            if (coursesToSubmit[json._id] == undefined) {
                httpSubmitCourse(json._id, json);
            }
            coursesToSubmit[json._id] = json;
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

        console.log(JSON.stringify(currentDeck));
        console.log(currentDeck);
    }
}


function gre_to_client(data) {
    data.forEach(function(msg) {
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
                        //}
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
	    hideWindow();
	    overlay.show();
	    overlay.focus();
	    overlay.setBounds(obj);
    }

    oppName = arg.opponentScreenName;
    oppRank = arg.opponentRankingClass;
    oppTier = arg.opponentRankingTier;
    currentMatchId = null;
	playerWin = 0;
	oppWin = 0;

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
    overlay.webContents.send("set_deck", currentDeckUpdated);
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
	});

	mainWindow.webContents.send("set_history_data", history);
	mainWindow.webContents.send("initialize", 1);

	httpAuth();
	httpSetPlayer(playerName, playerRank, playerTier);	
}

function httpBasic(_headers) {
    //console.log(_headers);
	if (_headers.method == 'submit_course' || _headers.method == 'set_player') {
		if (tokenAuth == undefined) {
		    setTimeout( function() { httpBasic(_headers); }, 500);
			return;
		}
		_headers.token = tokenAuth;
	}
	
	var http = require('http');
	var options = { hostname: serverAddress, path: '/api.php', method: 'POST', headers: _headers };

	var results = ''; 
	var req = http.request(options, function(res) {
		res.on('data', function (chunk) {
			results = results + chunk;
		}); 
		res.on('end', function () {
		    console.log(_headers.method, _headers.token, results);
			try {
				const parsedResult = JSON.parse(results);
				if (parsedResult.ok) {
					tokenAuth = parsedResult.token;

                    // set explore
					if (_headers.method == 'get_top_decks') {
						mainWindow.webContents.send("set_explore", parsedResult.result);
					}

                    // Remove course from list
                    if (_headers.method == 'submit_course') {
                        //coursesToSubmit[_headers.courseid] = undefined;
                    }
				}
				else if (parsedResult.error = "error 003") {
					setTimeout( function() { httpBasic(_headers); }, 500);
				}
			} catch (e) {
				console.error(e.message);
			}
		}); 
	});

	req.on('error', function(e) {
		console.error(e.message);
	});

	req.end();
}

function httpAuth() {
	httpBasic({ 'method': 'auth', 'uid': playerId });
}

function httpSubmitCourse(_courseId, _course) {
    _course = JSON.stringify(_course);
	httpBasic({ 'method': 'submit_course', 'uid': playerId, 'course': _course, 'courseid': _courseId });
}

function httpGetVersion() {
	httpBasic({ 'method': 'get_version', 'uid': playerId, });
}

function httpSetPlayer(name, rank, tier) {
	httpBasic({ 'method': 'set_player', 'uid': playerId, 'name': name, 'rank': rank, 'tier': tier});
}

function httpGetTopDecks() {
	httpBasic({ 'method': 'get_top_decks', 'uid': playerId});
}

