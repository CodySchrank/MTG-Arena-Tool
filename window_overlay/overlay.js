var electron = require('electron');
window.ipc = electron.ipcRenderer;
var renderer = 1;
var matchBeginTime = Date.now();
var clockMode = 0;
var draftMode = 1;
var deckMode = 0;
var overlayMode = 0;

var turnPhase = 0;
var turnStep = 0;
var turnNumber = 0;
var turnActive = 0;
var turnPriority = 0;
var turnDecision = 0;
var soundPriority = false;

var showSideboard = false;


const Database = require('../shared/database.js');
const cardsDb = new Database();

var mana = {0: "", 1: "white", 2: "blue", 3: "black", 4: "red", 5: "green", 6: "colorless", 7: "", 8: "x"};

const Howler = require('howler');
var sound = new Howl({
	src: ['../sounds/blip.mp3']
});

ipc_send = function (method, arg) {
    ipc.send('ipc_switch', method, arg);
};

updateClock();

function updateClock() {
	if (clockMode == 0) {
		var diff = Math.floor((Date.now() - matchBeginTime)/1000);
		var hh = Math.floor(diff / 3600);
		var mm = Math.floor(diff % (3600) / 60);
		var ss = Math.floor(diff % 60);
		//console.log(diff, Date.now(), matchBeginTime);
	}
	if (clockMode == 1) {
		var d = new Date();
		var hh = d.getHours();
		var mm = d.getMinutes();
		var ss = d.getSeconds();
	}

	hh = ('0' + hh).slice(-2);
	mm = ('0' + mm).slice(-2);
	ss = ('0' + ss).slice(-2);
	$(".clock_elapsed").html(hh+":"+mm+":"+ss);
	setTimeout(function () {
		updateClock();
	}, 250);
}

//
ipc.on('set_db', function (event, arg) {
	cardsDb.set(arg);
});

//
ipc.on('set_timer', function (event, arg) {
	if (arg == -1) {
		$(".overlay_clock_container").hide();
		$(".overlay_deck_container").hide();
		$(".overlay_draft_container").show();
		$(".overlay_draft_container").css("display", "flex");


		let _height = 114;
		if ($('.top').css('display') == 'none') {
			_height -= 32;
		}
		if ($('.overlay_deckname').css('display') == 'none') {
			_height -= 78;
		}
		if ($('.overlay_clock_container').css('display') == 'none') {
			_height -= 64;
		}
		$(".overlay_decklist").css("height", "100%").css("height", "-="+_height+"px");
		overlayMode = 1;
		matchBeginTime = Date.now();
	}
	else {
		matchBeginTime = Date.parse(arg);
	}
	//console.log("set time", arg);
});

$( window ).resize(function() {
	let _height = 178//114;
	if ($('.top').css('display') == 'none') {
		_height -= 32;
	}
	if ($('.overlay_deckname').css('display') == 'none') {
		_height -= 78;
	}
	if ($('.overlay_clock_container').css('display') == 'none') {
		_height -= 64;
	}
	if (overlayMode == 1) {
		_height += 64;
	}
	$(".overlay_decklist").css("height", "100%").css("height", "-="+_height+"px");
});


ipc.on('set_settings', function (event, settings) {
	// Alpha does some weird things..
	/*
	let alpha = settings.overlay_alpha;
	$('body').css("background-color", "rgba(0,0,0,"+alpha+")");
	$('.overlay_wrapper:before').css("opacity", 0.4*alpha);
	$('.overlay_wrapper').css("opacity", alpha);
	*/
	showSideboard = settings.overlay_sideboard;
	soundPriority = settings.sound_priority;
	$('.top').css('display', '');
	$('.overlay_deckname').css('display', '');
	$('.overlay_deckcolors').css('display', '');
	$('.overlay_separator').css('display', '');
	$('.overlay_decklist').css('display', '');
	$('.overlay_clock_container').css('display', '');
	$('.overlay_deck_container').attr('style', '');
	$('.overlay_draft_container').attr('style', '');

	if (!settings.overlay_top) {
		hideDiv('.top');
		let style = 'top: 0px !important;';
		$('.overlay_deck_container').attr('style', style);
		$('.overlay_draft_container').attr('style', style);
	}
	if (!settings.overlay_title) {
		hideDiv('.overlay_deckname');
		hideDiv('.overlay_deckcolors');
		hideDiv('.overlay_separator');
	}
	if (!settings.overlay_deck) {
		hideDiv('.overlay_decklist');
		hideDiv('.overlay_deck_container');
		hideDiv('.overlay_draft_container');
	}
	if (!settings.overlay_clock || overlayMode == 1) {
		hideDiv('.overlay_clock_container');
	}

	let _height = 174;
	if (overlayMode == 1) {
		_height = 110;
	}
	if (!settings.overlay_top) {
		_height -= 32;
	}
	if (!settings.overlay_title) {
		_height -= 78;
	}
	if (!settings.overlay_clock) {
		_height -= 64;
	}
	$(".overlay_decklist").css("height", "100%").css("height", "-="+_height+"px");
});

function hideDiv(div) {
	let style = $(div).attr('style');	style += 'display: none !important;';
	$(div).attr('style', style);
}


ipc.on('ping', function (event, arg) {
});

//
ipc.on('set_hover', function (event, arg) {
	hoverCard(arg);
});

//
ipc.on('set_opponent', function (event, arg) {
	$('.top_username').html(arg);
});

//
ipc.on('set_opponent_rank', function (event, rank, title) {
	$(".top_rank").css("background-position", (rank*-48)+"px 0px").attr("title", title);
});

var picksRank = null;
ipc.on('set_draft_picks', function (event, arg) {
	picksRank = arg;
	console.log(arg);
});

//
ipc.on('set_deck', function (event, arg) {
	$(".overlay_decklist").html('');
	$(".overlay_deckcolors").html('');

	if (deckMode == 3) {
		$(".overlay_deckname").html("Played by "+arg.name);
	}
	else {
		$(".overlay_deckname").html(arg.name);
	}

	arg.colors = get_deck_colors(arg);
	arg.colors.forEach(function(color) {
		$(".overlay_deckcolors").append('<div class="mana_20 mana_'+mana[color]+'"></div>');
	});

	arg.mainDeck.sort(compare_cards); 
	var deckListDiv = $(".overlay_decklist");
	var prevIndex = 0;

	if (deckMode == 0 || deckMode == 2) {
		deckListDiv.append('<div class="chance_title">'+arg.cardsLeft+' cards left</div>');
	}
	else {
		var deckSize = 0
		arg.mainDeck.forEach(function(card) {
			deckSize += card.quantity;
		});

		deckListDiv.append('<div class="chance_title">'+deckSize+' cards</div>');
	}

	arg.mainDeck.forEach(function(card) {
		var grpId = card.id;
		if (deckMode == 2) {
			addCardTile(grpId, 'a', card.chance+"%", deckListDiv);
		}
		else {
			addCardTile(grpId, 'a', card.quantity, deckListDiv);
		}
		prevIndex = grpId;
	});
	if (showSideboard) {
		deckListDiv.append('<div class="card_tile_separator">Sideboard</div>');
		
		arg.sideboard.forEach(function(card) {
			var grpId = card.id;
			if (deckMode == 2) {
				addCardTile(grpId, 'a', "0%", deckListDiv);
			}
			else {
				addCardTile(grpId, 'a', card.quantity, deckListDiv);
			}
			prevIndex = grpId;
		});
	}

	if (deckMode == 2) {
		deckListDiv.append('<div class="chance_title"></div>');// Add some space
		deckListDiv.append('<div class="chance_title">Creature: '+arg.chanceCre+'%</div>');
		deckListDiv.append('<div class="chance_title">Instant: '+arg.chanceIns+'%</div>');
		deckListDiv.append('<div class="chance_title">Sorcery: '+arg.chanceSor+'%</div>');
		deckListDiv.append('<div class="chance_title">Artifact: '+arg.chanceArt+'%</div>');
		deckListDiv.append('<div class="chance_title">Enchantment: '+arg.chanceEnc+'%</div>');
		deckListDiv.append('<div class="chance_title">Planeswalker: '+arg.chancePla+'%</div>');
		deckListDiv.append('<div class="chance_title">Land: '+arg.chanceLan+'%</div>');
	}
});

var draftPack, draftPick, packN, pickN;
//
ipc.on('set_draft_cards', function (event, pack, picks, packn, pickn) {
	draftPack = pack;
	draftPick = picks;
	packN = packn;
	pickN = pickn;
	setDraft();
});

//
ipc.on("set_turn", function (event, _we, _phase, _step, _number, _active, _priority, _decision) {
	if (turnPriority != _priority && _priority == _we && soundPriority) {
		sound.play();
	}
	turnPhase = _phase;
	turnStep = _step;
	turnNumber = _number;
	turnActive = _active;
	turnPriority = _priority;
	turnDecision = _decision;
	if (turnPriority == _we) {
		$('.clock_turn').html("You have priority.");
	}
	else {
		$('.clock_turn').html("Opponent has priority.");
	}
});

function setDraft() {
	$(".overlay_decklist").html('');
	$(".overlay_deckcolors").html('');
	$(".overlay_deckname").html("Pack "+packN+" - Pick "+pickN);

	if (draftMode == 0) {
		var colors = get_ids_colors(draftPick);
		colors.forEach(function(color) {
			$(".overlay_deckcolors").append('<div class="mana_20 mana_'+mana[color]+'"></div>');
		});

		draftPick.sort(compare_draft_cards); 

		draftPick.forEach(function(grpId) {
			addCardTile(grpId, 'a', 1, $(".overlay_decklist"));
		});
	}
	else if (draftMode == 1) {
		var colors = get_ids_colors(draftPack);
		colors.forEach(function(color) {
			$(".overlay_deckcolors").append('<div class="mana_20 mana_'+mana[color]+'"></div>');
		});

		draftPack.sort(compare_draft_picks); 

		draftPack.forEach(function(grpId) {
			var rank = 9;
			if (picksRank != null) {
				if (picksRank[grpId] != undefined) {
					rank = Math.round(picksRank[grpId].average/13*9);
				}
			}
			addCardTile(grpId, 'a', rank+1, $(".overlay_decklist"));
		});
	}
}

function compare_draft_picks(a, b) {
	var arank = 15;
	var brank = 15;
	if (picksRank != null) {
		if (picksRank[a] != undefined) {
			arank = picksRank[a].average;
		}
		if (picksRank[b] != undefined) {
			brank = picksRank[b].average;
		}

		if (arank < brank)	return -1;
		if (arank > brank)	return 1;
	}
	return 0;
}

function hoverCard(grpId) {
	if (grpId == undefined) {
		$('.overlay_hover').css("opacity", 0);
	}
	else {
		let dfc = '';
		if (cardsDb.get(grpId).dfc == 'DFC_Back')	dfc = 'a';
		if (cardsDb.get(grpId).dfc == 'DFC_Front')	dfc = 'b';
		if (cardsDb.get(grpId).dfc == 'SplitHalf')	dfc = 'a';
		$('.overlay_hover').css("opacity", 1);
		$('.overlay_hover').attr("src", "https://img.scryfall.com/cards/normal/en/"+get_set_scryfall(cardsDb.get(grpId).set)+"/"+cardsDb.get(grpId).cid+dfc+".jpg");
		setTimeout(function () {
			$('.overlay_hover').css("opacity", 0);
		}, 10000);
	}
}


$(document).ready(function() {
	//
	$(".clock_prev").click(function () {
	    clockMode -= 1;
	    if (clockMode < 0) {
	    	clockMode = 1;
	    }
	});
	//
	$(".clock_next").click(function () {
	    clockMode += 1;
	    if (clockMode > 1) {
	    	clockMode = 0;
	    }

	});
	//
	$(".draft_prev").click(function () {
	    draftMode -= 1;
	    if (draftMode < 0) {
	    	draftMode = 1;
	    }
	    setDraft();
	});
	//
	$(".draft_next").click(function () {
	    draftMode += 1;
	    if (draftMode > 1) {
	    	draftMode = 0;
	    }
	    setDraft();
	});
	//
	$(".deck_prev").click(function () {
	    deckMode -= 1;
	    if (deckMode < 0) {
	    	deckMode = 3;
	    }
	    ipc_send('overlay_set_deck_mode', deckMode);
	});
	//
	$(".deck_next").click(function () {
	    deckMode += 1;
	    if (deckMode > 3) {
	    	deckMode = 0;
	    }
	    ipc_send('overlay_set_deck_mode', deckMode);
	});

	//
	$(".close").click(function () {
	    ipc_send('overlay_close', 1);
	});

	//
	$(".minimize").click(function () {
	    ipc_send('overlay_minimize', 1);
	});

	//
	$(".settings").click(function () {
		ipc_send('force_open_settings', 1);
	});
});
