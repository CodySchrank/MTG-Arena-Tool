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

const Database = require('./database.js');
const cardsDb = new Database();

var mana = {0: "", 1: "white", 2: "blue", 3: "black", 4: "red", 5: "green", 6: "colorless", 7: "", 8: "x"};

ipc_log = function (str, arg) {
    ipc.send('ipc_log', arg);
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
ipc.on('set_timer', function (event, arg) {
	if (arg == -1) {
		$(".overlay_clock_container").hide();
		$(".overlay_deck_container").hide();
		$(".overlay_draft_container").show();
		$(".overlay_draft_container").css("display", "flex");
		$(".overlay_decklist").css("height", "100%").css("height", "-=146px");
		overlayMode = 1;
		matchBeginTime = Date.now();
	}
	else {
		matchBeginTime = Date.parse(arg);
	}
	//console.log("set time", arg);
});

$( window ).resize(function() {
	if (overlayMode == 1) {
		$(".overlay_decklist").css("height", "100%").css("height", "-=146px");
	}
});


ipc.on('alpha', function (event, arg) {
	$('body').css("background-color", "rgba(0,0,0,"+arg+")");
	$('.overlay_wrapper:before').css("opacity", 0.4*arg);
	$('.overlay_wrapper').css("opacity", arg);
});


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
	$(".overlay_deckname").html(arg.name);

	arg.colors = get_deck_colors(arg);
	arg.colors.forEach(function(color) {
		$(".overlay_deckcolors").append('<div class="mana_20 mana_'+mana[color]+'"></div>');
	});

	arg.mainDeck.sort(compare_cards); 
	//arg.mainDeck.forEach(function(card) {
	//	var grpId = card.id;
	var deckListDiv = $(".overlay_decklist");

	var prevIndex = 0;
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

	if (deckMode == 2) {
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
		$('.clock_turn').html("Oppenent has priority.");
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
			if (picksRank[grpId] != undefined) {
				rank = Math.round(picksRank[grpId].average/13*9);
			}
			addCardTile(grpId, 'a', rank+1, $(".overlay_decklist"));
		});
	}
}

function compare_draft_picks(a, b) {
	var arank = 15;
	var brank = 15;

	if (picksRank[a] != undefined) {
		arank = picksRank[a].average;
	}
	if (picksRank[b] != undefined) {
		brank = picksRank[b].average;
	}

	if (arank < brank)	return -1;
	if (arank > brank)	return 1;
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
	    	deckMode = 2;
	    }
	    ipc.send('set_deck_mode', deckMode);
	});
	//
	$(".deck_next").click(function () {
	    deckMode += 1;
	    if (deckMode > 2) {
	    	deckMode = 0;
	    }
	    ipc.send('set_deck_mode', deckMode);
	});

	//
	$(".close").click(function () {
	    ipc.send('overlay_close', 1);
	});

	//
	$(".minimize").click(function () {
	    ipc.send('overlay_minimize', 1);
	});

	//
	$(".settings").click(function () {
		ipc.send('force_open_settings', 1);
	});
});
