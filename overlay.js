var electron = require('electron');
window.ipc = electron.ipcRenderer;
var renderer = 1;
var matchBeginTime = Date.now();
var clockMode = 0;
var draftMode = 0;
var overlayMode = 0;

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

	var prevIndex = 0;
	arg.mainDeck.forEach(function(card) {
		var grpId = card.id;
		/*
		// Print type separators on overlay
		// It doesnt look good, but you can try..
		var type = cardsDb.get(grpId).type;
		if (prevIndex == 0) ;
			addCardSeparator(get_card_type_sort(type), $(".overlay_decklist"));
		}
		else if (prevIndex != 0) {
			if (get_card_type_sort(type) != get_card_type_sort(cardsDb.get(prevIndex).type)) {
				addCardSeparator(get_card_type_sort(type), $(".overlay_decklist"));
			}
		}
		*/

		addCardTile(grpId, 'a', card.quantity, $(".overlay_decklist"));
		prevIndex = grpId;
	});
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

		var prevIndex = 0;
		draftPick.forEach(function(grpId) {
			addCardTile(grpId, 'a', 1, $(".overlay_decklist"));
		});
	}
	else if (draftMode == 1) {
		var colors = get_ids_colors(draftPack);
		colors.forEach(function(color) {
			$(".overlay_deckcolors").append('<div class="mana_20 mana_'+mana[color]+'"></div>');
		});

		draftPack.sort(compare_draft_cards); 

		var prevIndex = 0;
		draftPack.forEach(function(grpId) {
			addCardTile(grpId, 'a', 1, $(".overlay_decklist"));
		});
	}
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
