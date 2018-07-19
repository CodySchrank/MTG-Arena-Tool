'use strict';

const electron = require('electron');

const {app, Menu, Tray, net, clipboard} = require('electron');
const path  = require('path');
const Store = require('./store.js');
const async = require("async");

const {autoUpdater} = require("electron-updater");

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')({showDevTools: false});
console.log(process.platform);

var mainWindow;
var background;
var overlay;
var tray = null;
var closeToTray = true;

const ipc = electron.ipcMain;

//Debug stuff
ipc.on('ipc_log', function (event, msg) {
    console.log("IPC LOG: ", msg);
});

// 
ipc.on('renderer_state', function (event, state) {
    console.log("Renderer state");
    showWindow();

    background.webContents.send("set_renderer_state", state);
});

//
ipc.on('background_set_settings', function (event, settings) {
    mainWindow.webContents.send("set_settings", settings);
});

//
ipc.on('renderer_save_settings', function (event, settings) {
    closeToTray = settings.close_to_tray;
    background.webContents.send("save_settings", settings);
});


//
ipc.on('renderer_erase_data', function (event, arg) {
    background.webContents.send("delete_data", 1);
    httpDeleteData();
});

//
ipc.on('renderer_update_install', function (event, settings) {
    background.webContents.send("update_install", 1);
});

//
ipc.on('renderer_request_history', function (event, state) {
    background.webContents.send("request_history", state);
});

//
ipc.on('background_set_history', function (event, history) {
    mainWindow.webContents.send("set_history", history);
});

//
ipc.on('background_set_history_data', function (event, history) {
    mainWindow.webContents.send("set_history_data", history);
});

//
ipc.on('renderer_get_economy', function (event, state) {
    background.webContents.send("set_economy", 1);
});

ipc.on('set_economy', function (event, economy) {
    mainWindow.webContents.send("set_economy", economy);
});

//
ipc.on('renderer_request_explore', function (event, arg) {
    background.webContents.send("request_explore", arg);
});

ipc.on('renderer_request_course', function (event, arg) {
    background.webContents.send("request_course", arg);
});

//
ipc.on('renderer_window_close', function (event, state) {
    if (closeToTray) {
    //if (store.get("settings").close_to_tray) {
        hideWindow();
    }
    else {
        quit();
    }
});

//
ipc.on('renderer_hide', function (event, state) {
    hideWindow();
});

//
ipc.on('renderer_show', function (event, state) {
    showWindow();
});

//
ipc.on('renderer_set_bounds', function (event, obj) {
    mainWindow.setBounds(obj);
});

//
ipc.on('renderer_window_minimize', function (event, state) {
    mainWindow.minimize();
});

//
ipc.on('no_log', function (event, logUri) {
    mainWindow.webContents.send("no_log", logUri);
});

//
ipc.on('set_username', function (event, playerName) {
    mainWindow.webContents.send("set_username", playerName);
});

//
ipc.on('set_rank', function (event, rank, str) {
    mainWindow.webContents.send("set_rank", rank, str);
});

//
ipc.on('set_decks', function (event, json) {
    mainWindow.webContents.send("set_decks", json);
});

//
ipc.on('set_cards', function (event, json, newlyAdded) {
    mainWindow.webContents.send("set_cards", json, newlyAdded);
});

//
ipc.on('initialize', function (event, arg) {
    mainWindow.webContents.send("initialize", arg);
});

//
ipc.on('set_explore', function (event, arg) {
    mainWindow.webContents.send("set_explore", arg);
});

//
ipc.on('open_course_deck', function (event, arg) {
    mainWindow.webContents.send("open_course_deck", arg);
});

//
ipc.on('set_draft_picks', function (event, arg) {
    overlay.webContents.send("set_draft_picks", arg);
});

//
ipc.on('set_deck', function (event, arg) {
    overlay.webContents.send("set_deck", arg);
});

//
ipc.on('overlay_set_deck_mode', function (event, arg) {
    background.webContents.send("set_deck_mode", arg);
});

//
ipc.on('set_draft', function (event, arg) {
    overlay.webContents.send("set_draft", arg);
});

//
ipc.on('set_timer', function (event, arg) {
    overlay.webContents.send("set_timer", arg);
});

//
ipc.on('set_opponent', function (event, arg) {
    overlay.webContents.send("set_opponent", arg);
});

//
ipc.on('set_opponent_rank', function (event, rank, str) {
    overlay.webContents.send("set_opponent_rank", rank, str);
});

//
ipc.on('overlay_set_settings', function (event, sound_priority, alpha, top, title, deck, clock) {
    overlay.webContents.send("set_settings", sound_priority, alpha, top, title, deck, clock);
});

//
ipc.on('set_draft_cards', function(event, pack, picks, packn, pickn) {
    overlay.webContents.send("set_draft_cards", pack, picks, packn, pickn);
});

//
ipc.on('set_turn', function(event, playerSeat, turnPhase, turnStep, turnNumber, turnActive, turnPriority, turnDecision) {
    overlay.webContents.send("set_turn", playerSeat, turnPhase, turnStep, turnNumber, turnActive, turnPriority, turnDecision);
});

//
ipc.on('set_close_to_tray', function(event, arg) {
    closeToTray = arg;
});

//
ipc.on('overlay_close', function (event, state) {
    overlay.hide();
});

//
ipc.on('overlay_minimize', function (event, state) {
    overlay.minimize();
});

//
ipc.on('overlay_show', function (event, state) {
    if (!overlay.isVisible()) {
        overlay.show();
    }
});

//
ipc.on('overlay_set_bounds', function (event, obj) {
    overlay.setBounds(obj);
});


//
ipc.on('app_startup', function (event, arg) {
    app.setLoginItemSettings({
        openAtLogin: arg
    });
});

ipc.on('force_open_settings', function (event, state) {
    mainWindow.webContents.send("force_open_settings", true);
    showWindow();
});

ipc.on('set_clipboard', function (event, arg) {
    clipboard.writeText(arg);
});

ipc.on('show_background', function (event) {
    background.show();
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
    background.webContents.send('windowBounds', obj);
}

function saveOverlayPos() {
	var obj = {};
	var bounds = overlay.getBounds();
	var pos = overlay.getPosition();
	obj.width = Math.floor(bounds.width);
	obj.height = Math.floor(bounds.height);
	obj.x = Math.floor(pos[0]);
	obj.y = Math.floor(pos[1]);
    background.webContents.send('overlayBounds', obj);
}

function createBackgroundWindow() {
    const win = new electron.BrowserWindow({
        frame: false,
        x: 0,
        y: 0,
        show: false,
        width: 100,
        height: 100,
        title: "MTG Arena Tool",
        icon:'icon.png'
    });
    win.loadURL(`file://${__dirname}/window_background/index.html`);
    win.on('closed', onClosed);

    return win;
}

function createMainWindow() {
    const win = new electron.BrowserWindow({
        /*transparent: true,*/
        frame: false,
        show: false,
        width: 800,
        height: 600,
        title: "MTG Arena Tool",
        icon:'icon.png'
    });
    win.loadURL(`file://${__dirname}/window_main/index.html`);
    win.on('closed', onClosed);

    let iconPath = path.join(__dirname, 'icon.png');
    if (process.platform == 'win32') {
        iconPath = path.join(__dirname, 'icon.ico');
    }
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {label: 'Show', click: () => { showWindow();}},
      {label: 'Quit', click: () => { quit();}}
    ])
    tray.on('double-click', toggleWindow);
    tray.setToolTip('MTG Arena Tool');
    tray.setContextMenu(contextMenu);

	win.on('resize', (e) => {
		saveWindowPos();
	});

    return win;
}

function createOverlay() {
    const over = new electron.BrowserWindow({
        /*transparent: true,*/
        frame: false,
        alwaysOnTop: true,
        x: 0,
        y: 0,
        width: 300,
        height: 600,
        show: false,
        title: "MTG Arena Tool",
        icon:'images/icon.png'
    });
    over.loadURL(`file://${__dirname}/window_overlay/index.html`);
    over.on('closed', onOverlayClosed);

	over.on('resize', () => {
		saveOverlayPos();
	});
    /*
    setTimeout( function() {
        overlay.webContents.send("set_deck", currentDeck);
    	//debug_overlay_show();
    }, 1000);
    */
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
    background = createBackgroundWindow();
    autoUpdater.checkForUpdatesAndNotify();
});
