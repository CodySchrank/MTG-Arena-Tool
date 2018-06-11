var electron = require('electron');
window.ipc = electron.ipcRenderer;
var decks = null;
var matchesHistory = null;
var explore = null;
var cards = {};
var cardsNew = {};
var settings = null;

const Database = require('./database.js');
const cardsDb = new Database();


var mana = {0: "", 1: "white", 2: "blue", 3: "black", 4: "red", 5: "green", 6: "colorless", 7: "", 8: "x"}

ipc_log = function (str, arg) {
    ipc.send('ipc_log', arg);
};

//
setTimeout(function () {
	ipc.send('renderer_state', 1);
}, 1000);

//
ipc.on('set_username', function (event, arg) {
	$('.top_username').html(arg);
});

//
ipc.on('set_rank', function (event, offset, rank) {
	$(".top_rank").css("background-position", (offset*-48)+"px 0px").attr("title", rank);
});

//
ipc.on('set_decks', function (event, arg) {
	setDecks(arg);
});

//
ipc.on('set_history', function (event, arg) {
	setHistory(arg);
});

//
ipc.on('set_history_data', function (event, arg) {
	if (arg != null) {
		matchesHistory = arg;
	}
});

//
ipc.on('set_cards', function (event, _cards, _cardsnew) {
	cards = _cards;
	cardsNew = _cardsnew;
});

//
ipc.on('set_explore', function (event, arg) {
	setExplore(arg);
});

//
ipc.on('set_settings', function (event, arg) {
	settings = arg;
});

//
ipc.on('force_open_settings', function (event, arg) {
	force_open_settings();
});

//
ipc.on('initialize', function (event, arg) {
	$('.sidebar').removeClass('hidden');
	$('.overflow_ux').removeClass('hidden');
	$('.message_center').css('display', 'none');
	//$('.wrapper').css('left', '100%');
});

$(".list_deck").on('mouseenter mouseleave', function(e) {
    $(".deck_tile").trigger(e.type);
});


function force_open_settings() {
	$(".sidebar_item").each(function(index) {
		$(this).removeClass("item_selected");
		if ($(this).hasClass("it4")) {
			$(this).addClass("item_selected");
		}
	});
	$('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
	open_settings();
}

$(document).ready(function() {
	//
	$(".close").click(function () {
	    ipc.send('window_close', 1);
	});

	//
	$(".minimize").click(function () {
	    ipc.send('window_minimize', 1);
	});

	//
	$(".settings").click(function () {
		force_open_settings();
	});

	//
	$(".sidebar_item").click(function () {
		if (!$(this).hasClass("item_selected")) {
			$('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 

			$(".sidebar_item").each(function(index) {
				$(this).removeClass("item_selected");
			});

			$(this).addClass("item_selected");

			if ($(this).hasClass("it0")) {
				setDecks(null);
			}
			if ($(this).hasClass("it1")) {
				$("#ux_0").html('');
				ipc.send('request_history', 1);
			}
			if ($(this).hasClass("it2")) {
				$("#ux_0").html('');
				ipc.send('request_explore', 1);
			}
			if ($(this).hasClass("it3")) {
				open_cards();
			}
			if ($(this).hasClass("it4")) {
				open_settings();
			}
			if ($(this).hasClass("it5")) {
				open_about();
			}
		}
	});
});

//
function setHistory(arg) {
	if (arg != null) {
		matchesHistory = arg;
	}

	console.log(matchesHistory);
	sort_history();

	$("#ux_0").html('');
	$("#ux_0").append('<div class="list_fill"></div>');

	matchesHistory.matches.forEach(function(match, index) {
		match = matchesHistory[match];

		var div = $('<div class="'+match.id+' list_match"></div>');


		var fltl = $('<div class="flex_item"></div>');

		var fll = $('<div class="flex_item"></div>');
		fll.css("flex-direction","column");
		var flt = $('<div class="flex_top"></div>');
		var flb = $('<div class="flex_bottom"></div>');
		flt.appendTo(fll); flb.appendTo(fll);

		var flc = $('<div class="flex_item"></div>');
		flc.css("flex-direction","column");
		flc.css("flex-grow", 2);
		fct = $('<div class="flex_top"></div>');
		fcb = $('<div class="flex_bottom"></div>');
		fct.appendTo(flc); fcb.appendTo(flc);

		var flr = $('<div class="flex_item"></div>');

		var tileGrpid = match.playerDeck.deckTileId;
		var tile = $('<div class="'+match.id+'t deck_tile"></div>');
		tile.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+".jpg)");
		tile.appendTo(fltl);

		var d = $('<div class="list_deck_name">'+match.playerDeck.name+'</div>');
		d.appendTo(flt);
		//match.playerDeck.colors = get_deck_colors(match.playerDeck);

		match.playerDeck.colors.forEach(function(color) {
			$('<div class="mana_20 mana_'+mana[color]+'"></div>').appendTo(flb);
		});

		var d = $('<div class="list_match_title">vs '+match.opponent.name+'</div>');
		d.appendTo(fct);
		var d = $('<div class="list_match_time">'+timeSince(new Date(match.date))+' ago.</div>');
		d.appendTo(fcb);

		if (match.player.win > match.opponent.win) {
			var d = $('<div class="list_match_result_win">Win</div>'); d.appendTo(flr);
		}
		else {
			var d = $('<div class="list_match_result_loss">Loss</div>'); d.appendTo(flr);
		}

		fltl.appendTo(div);
		fll.appendTo(div);
		flc.appendTo(div);
		flr.appendTo(div);
		$("#ux_0").append(div);

		$('.'+match.id).on('mouseenter', function(e) {
		    $('.'+match.id+'t').css('opacity', 1);
		    $('.'+match.id+'t').css('width', '200px');
		});

		$('.'+match.id).on('mouseleave', function(e) {
		    $('.'+match.id+'t').css('opacity', 0.66);
		    $('.'+match.id+'t').css('width', '128px');
		});

		$('.'+match.id).on('click', function(e) {
			open_match(match.id);
		    $('.moving_ux').animate({'left': '-100%'}, 250, 'easeInOutCubic'); 
		});
	});

	$("#ux_0").append('<div class="list_fill"></div>');
}

//
function setDecks(arg) {
	if (arg != null) {
		decks = arg;//JSON.parse(arg);
	}
	sort_decks();
	$("#ux_0").html('');

	$("#ux_0").append('<div class="list_fill"></div>');
	decks.forEach(function(deck, index) {

		var tileGrpid = deck.deckTileId;
		var tile = $('<div class="'+deck.id+'t deck_tile"></div>');
		tile.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+".jpg)");

		var div = $('<div class="'+deck.id+' list_deck"></div>');

		var fll = $('<div class="flex_item"></div>');
		var flc = $('<div class="flex_item"></div>');
		var flcf = $('<div class="flex_item" style="flex-grow: 2"></div>');
		var flr = $('<div class="flex_item"></div>');
		flc.css("flex-direction","column")

		var flt = $('<div class="flex_top"></div>');
		var flb = $('<div class="flex_bottom"></div>');

		$('<div class="list_deck_name">'+deck.name+'</div>').appendTo(flt);
		deck.colors.forEach(function(color) {
			$('<div class="mana_20 mana_'+mana[color]+'"></div>').appendTo(flb);
		});

		var wr = getDeckWinrate(deck.id);
		if (wr != 0) {
			$('<div class="list_deck_winrate">Winrate: '+wr*100+'%</div>').appendTo(flr);
		}

		fll.appendTo(div);
		tile.appendTo(fll);

		flc.appendTo(div);
		flcf.appendTo(div);
		flt.appendTo(flc);
		flb.appendTo(flc);
		flr.appendTo(div);
		$("#ux_0").append(div);

		$('.'+deck.id).on('mouseenter', function(e) {
		    $('.'+deck.id+'t').css('opacity', 1);
		    $('.'+deck.id+'t').css('width', '200px');
		});

		$('.'+deck.id).on('mouseleave', function(e) {
		    $('.'+deck.id+'t').css('opacity', 0.66);
		    $('.'+deck.id+'t').css('width', '128px');
		});

		$('.'+deck.id).on('click', function(e) {
			open_deck(index, 0);
		    $('.moving_ux').animate({'left': '-100%'}, 250, 'easeInOutCubic'); 
		});

	});
	$("#ux_0").append('<div class="list_fill"></div>');
}

//
function setExplore(arg) {
	if (arg != null) {
		explore = arg;
	}

	$("#ux_0").html('');
	$("#ux_0").append('<div class="list_fill"></div>');
	explore.forEach(function(_deck, index) {
		deck = _deck.deck;

		var tileGrpid = deck.deckTileId;
		var tile = $('<div class="'+index+'t deck_tile"></div>');
		tile.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+".jpg)");

		var div = $('<div class="'+index+' list_deck"></div>');

		var fll = $('<div class="flex_item"></div>');
		var flc = $('<div class="flex_item"></div>');
		var flcf = $('<div class="flex_item" style="flex-grow: 2"></div>');
		var flr = $('<div class="flex_item"></div>');
		flc.css("flex-direction","column")

		var flt = $('<div class="flex_top"></div>');
		var flb = $('<div class="flex_bottom"></div>');

		$('<div class="list_deck_name">'+deck.name+'</div>').appendTo(flt);
		$('<div class="list_deck_name_it">by '+_deck.playername+'</div>').appendTo(flt);
		deck.colors = get_deck_colors(deck);
		deck.colors.forEach(function(color) {
			$('<div class="mana_20 mana_'+mana[color]+'"></div>').appendTo(flb);
		});

		$('<div class="list_deck_record">'+_deck.record.CurrentWins+' - '+_deck.record.CurrentLosses+'</div>').appendTo(flr);


		fll.appendTo(div);
		tile.appendTo(fll);

		flc.appendTo(div);
		flcf.appendTo(div);
		flt.appendTo(flc);
		flb.appendTo(flc);
		flr.appendTo(div);
		$("#ux_0").append(div);

		$('.'+index).on('mouseenter', function(e) {
		    $('.'+index+'t').css('opacity', 1);
		    $('.'+index+'t').css('width', '200px');
		});

		$('.'+index).on('mouseleave', function(e) {
		    $('.'+index+'t').css('opacity', 0.66);
		    $('.'+index+'t').css('width', '128px');
		});

		$('.'+index).on('click', function(e) {
			deck.mainDeck.sort(compare_cards);
			deck.sideboard.sort(compare_cards);
			open_deck(index, 1);
		    $('.moving_ux').animate({'left': '-100%'}, 250, 'easeInOutCubic'); 
		});

	});
	$("#ux_0").append('<div class="list_fill"></div>');
}

// 
function open_deck(i, type) {
	if (type == 0) {
		_deck = decks[i];
	}
	if (type == 1) {
		_deck = explore[i].deck;
	}

	let clip = get_deck_export(_deck);
	ipc.send('set_clipboard', clip);

	$("#ux_1").html('');

	var top = $('<div class="decklist_top"><div class="button back"></div><div class="deck_name">'+_deck.name+'</div></div>');
	flr = $('<div class="flex_item" style="align-self: center;"></div>');

	_deck.colors.forEach(function(color) {
		var m = $('<div class="mana_20 mana_'+mana[color]+'"></div>');
		flr.append(m);
	});
	top.append(flr);


	var tileGrpid = _deck.deckTileId;
	top.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+".jpg)");
	var fld = $('<div class="flex_item"></div>');

	var dl = $('<div class="decklist"></div>');

	var deck = _deck;
	var prevIndex = 0;
	deck.mainDeck.forEach(function(card) {
		var grpId = card.id;
		var type = cardsDb.get(grpId).type;
		if (prevIndex == 0) {
			addCardSeparator(get_card_type_sort(type), dl);
		}
		else if (prevIndex != 0) {
			if (get_card_type_sort(type) != get_card_type_sort(cardsDb.get(prevIndex).type)) {
				addCardSeparator(get_card_type_sort(type), dl);
			}
		}

		if (card.quantity > 0) {
			addCardTile(grpId, 'a', card.quantity, dl);
		}
		
		prevIndex = grpId;
	});

	dl.appendTo(fld);
	$("#ux_1").append(top);
	$("#ux_1").append(fld);
	//
	$(".back").click(function () {
	    $('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
	});
}

//
function open_match(id) {
	$("#ux_1").html('');
	var match = matchesHistory[id];

	var top = $('<div class="decklist_top"><div class="button back"></div><div class="deck_name">'+match.playerDeck.name+'</div></div>');
	flr = $('<div class="flex_item" style="align-self: center;"></div>');

	match.playerDeck.colors.forEach(function(color) {
		var m = $('<div class="mana_20 mana_'+mana[color]+'"></div>');
		flr.append(m);
	});
	top.append(flr);


	var tileGrpid = match.playerDeck.deckTileId;
	top.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+".jpg)");
	var fld = $('<div class="flex_item"></div>');

	// this is a mess
	var flt = $('<div class="flex_item"></div>')
	var fltl = $('<div class="flex_item"></div>')
	var r = $('<div class="top_rank"></div>'); r.appendTo(fltl);

	var fltr = $('<div class="flex_item"></div>'); fltr.css("flex-direction","column");
	var fltrt = $('<div class="flex_top"></div>');
	var fltrb = $('<div class="flex_bottom"></div>');
	fltrt.appendTo(fltr); fltrb.appendTo(fltr);

	fltl.appendTo(flt); fltr.appendTo(flt);

	var rank = match.player.rank;
	var tier = match.player.tier;
	r.css("background-position", (get_rank_index(rank, tier)*-48)+"px 0px").attr("title", rank+" "+tier);

	var name = $('<div class="list_match_player_left">'+match.player.name+' ('+match.player.win+')</div>');
	name.appendTo(fltrt);

	if (match.player.win > match.opponent.win) {
		var w = $('<div class="list_match_player_left green">Winner</div>');
		w.appendTo(fltrb);
	}

	var dl = $('<div class="decklist"></div>');
	flt.appendTo(dl);

	var deck = match.playerDeck;
	var prevIndex = 0;
	deck.mainDeck.forEach(function(card) {
		var grpId = card.id;
		var type = cardsDb.get(grpId).type;
		if (prevIndex == 0) {
			addCardSeparator(get_card_type_sort(type), dl);
		}
		else if (prevIndex != 0) {
			if (get_card_type_sort(type) != get_card_type_sort(cardsDb.get(prevIndex).type)) {
				addCardSeparator(get_card_type_sort(type), dl);
			}
		}
		if (card.quantity > 0) {
			addCardTile(grpId, 'a', card.quantity, dl);
		}
		
		prevIndex = grpId;
	});

	var flt = $('<div class="flex_item" style="flex-direction: row-reverse;"></div>')
	var fltl = $('<div class="flex_item"></div>')
	var r = $('<div class="top_rank"></div>'); r.appendTo(fltl);

	var fltr = $('<div class="flex_item"></div>'); fltr.css("flex-direction","column"); fltr.css("align-items","flex-end");
	var fltrt = $('<div class="flex_top"></div>');
	var fltrb = $('<div class="flex_bottom"></div>');
	fltrt.appendTo(fltr); fltrb.appendTo(fltr);

	fltl.appendTo(flt);fltr.appendTo(flt);

	var rank = match.opponent.rank;
	var tier = match.opponent.tier;
	r.css("background-position", (get_rank_index(rank, tier)*-48)+"px 0px").attr("title", rank+" "+tier);

	var name = $('<div class="list_match_player_right">'+match.opponent.name+' ('+match.opponent.win+')</div>');
	name.appendTo(fltrt);

	if (match.player.win < match.opponent.win) {
		var w = $('<div class="list_match_player_right green">Winner</div>');
		w.appendTo(fltrb);
	}

	var odl = $('<div class="decklist"></div>');
	flt.appendTo(odl);

	var deck = match.oppDeck;
	var prevIndex = 0;
	deck.mainDeck.forEach(function(card) {
		var grpId = card.id;
		var type = cardsDb.get(grpId).type;
		if (prevIndex == 0) {
			addCardSeparator(get_card_type_sort(type), odl);
		}
		else if (prevIndex != 0) {
			if (get_card_type_sort(type) != get_card_type_sort(cardsDb.get(prevIndex).type)) {
				addCardSeparator(get_card_type_sort(type), odl);
			}
		}
		if (card.quantity > 0) {
			addCardTile(grpId, 'b', card.quantity, odl);
		}
		
		prevIndex = grpId;
	});


	dl.appendTo(fld);
	odl.appendTo(fld);
	$("#ux_1").append(top);
	$("#ux_1").append(fld);
	
	$(".back").click(function () {
	    $('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
	});

}

function open_cards() {
	$("#ux_0").html('');
	var div = $('<div class="inventory"></div>');
	
	var filters = $('<div class="inventory_filters"></div>');


	// Search box
	var label = $('<label class="input_container">Search</label>');
	label.appendTo(filters);
	var input = $('<input type="search" id="query_name" autocomplete="off" />');
	input.appendTo(label);

	// Newly added only
	var label = $('<label class="check_container">Newly aquired only</label>');
	label.appendTo(filters);
	var check_new = $('<input type="checkbox" id="query_new" onclick="printCards()" />');
	check_new.appendTo(label);
	var span = $('<span class="checkmark"></span>');
	span.appendTo(label);



	input.on('input', function() {
		printCards();
	});

	$("#ux_0").append(filters);
	$("#ux_0").append(div);

	printCards();
}

//
function printCards() {
	var div = $(".inventory");
	div.html('');

	filterName = document.getElementById("query_name").value.toLowerCase();
	filterNew  = document.getElementById("query_new");
	console.log("filter", filterNew.checked);

    Object.keys(cards).forEach(function(key) {
    	let grpId = key;
    	let doDraw = true;

    	let name = cardsDb.get(key).name.toLowerCase();
    	let type = cardsDb.get(key).type.toLowerCase();

		if (name.indexOf(filterName) == -1 && type.indexOf(filterName) == -1) {
			doDraw = false;
		}

    	if (filterNew.checked && cardsNew[key] == undefined) {
    		doDraw = false;
    	}

    	if (doDraw) {
			let dfc = '';
			if (cardsDb.get(grpId).dfc == 'DFC_Back')	dfc = 'a';
			if (cardsDb.get(grpId).dfc == 'DFC_Front')	dfc = 'b';
			if (cardsDb.get(grpId).dfc == 'SplitHalf')	dfc = 'a';

	        var d = $('<div class="inventory_card"></div>');

	        for (let i=0; i<4; i++) {
	        	if (cardsNew[key] != undefined && i < cardsNew[key]) {
				    $('<div class="inventory_card_quantity_blue"></div>').appendTo(d);
	        	}
	        	else if (i < cards[key]) {
			        $('<div class="inventory_card_quantity_green"></div>').appendTo(d);
	        	}
	        	else {
			        $('<div class="inventory_card_quantity_gray"></div>').appendTo(d);
	        	}
	        }

	        var img = $('<img class="inventory_card_img"></img>');
			img.attr("src", "https://img.scryfall.com/cards/small/en/"+get_set_scryfall(cardsDb.get(grpId).set)+"/"+cardsDb.get(grpId).cid+dfc+".jpg");
			img.appendTo(d);
			d.appendTo(div);
		}
    });
}

//
function open_settings() {
	$("#ux_0").html('');
	var div = $('<div class="settings_page"></div>');

	// Launch on startup
	var label = $('<label class="check_container">Launch on startup</label>');
	label.appendTo(div);
	var check_new = $('<input type="checkbox" id="settings_startup" onclick="updateSettings()" />');
	check_new.appendTo(label);
	check_new.prop('checked', settings.startup);

	var span = $('<span class="checkmark"></span>');
	span.appendTo(label);


	// Newly added only
	var label = $('<label class="check_container">Show in-game overlay</label>');
	label.appendTo(div);
	var check_new = $('<input type="checkbox" id="settings_showoverlay" onclick="updateSettings()" />');
	check_new.appendTo(label);
	check_new.prop('checked', settings.show_overlay);

	var span = $('<span class="checkmark"></span>');
	span.appendTo(label);

	// show overlay in-game?
	// overlay transparency
	// hover in-game cards?
	// hover timeout
	// hide when zero left

	$("#ux_0").append(div);
}

function updateSettings() {
	var startup = document.getElementById("settings_startup").checked;
	var showOverlay = document.getElementById("settings_showoverlay").checked;

	var settings = {show_overlay: showOverlay, startup: startup};

	ipc.send('save_settings', settings);
}

//
function open_about() {
	var aboutStr = '';
	aboutStr += '<div class="about">'
	aboutStr += '	<div class="message_big green">MTG Squirrel</div>'
	aboutStr += '	<div class="message_sub_15 white">By Manuel Etchegaray, 2018</div>'
	aboutStr += '	<div class="message_sub_15 white">Version '+window.electron.remote.app.getVersion()+'</div>'
	aboutStr += '	<img class="git_link"></img>'
	aboutStr += '</div>'
	$("#ux_0").html(aboutStr);
	var div = $();

	$("#ux_0").append(div);
}

//
function getDeckWinrate(deckid) {
	var wins = 0;
	var loss = 0;
	if (matchesHistory == undefined) {
		return 0;
	}
	matchesHistory.matches.forEach(function(match, index) {
		match = matchesHistory[match];
		if (match.playerDeck.id == deckid) {
			if (match.player.win > match.opponent.win) {
				wins++;
			}
			else {
				loss++;
			}
		}
	});

	if (wins == 0) {
		return 0;
	}
	return Math.round((1/(wins+loss)*wins) * 100) / 100
}

//
function sort_decks() {
	decks.sort(compare_decks); 
	decks.forEach(function(deck) {
		deck.colors = [];
		deck.colors = get_deck_colors(deck);
		deck.mainDeck.sort(compare_cards); 
	});
}

//
function compare_decks(a, b) {
	a = Date.parse(a.lastUpdated);
	b = Date.parse(b.lastUpdated);
	if (a < b)	return 1;
	if (a > b)	return -1;
	return 0;
}

//
function sort_history() {
	matchesHistory.matches.sort(compare_matches); 

	matchesHistory.matches.forEach(function(mid) {
		var match = matchesHistory[mid];

		if (match.playerDeck.mainDeck == undefined) {
			match.playerDeck = JSON.parse('{"deckTileId":67003,"description":null,"format":"Standard","colors":[],"id":"00000000-0000-0000-0000-000000000000","isValid":false,"lastUpdated":"2018-05-31T00:06:29.7456958","lockedForEdit":false,"lockedForUse":false,"mainDeck":[],"name":"Undefined","resourceId":"00000000-0000-0000-0000-000000000000","sideboard":[]}');
		}
		else {
			match.playerDeck.colors = get_deck_colors(match.playerDeck);
		}

		match.playerDeck.mainDeck.sort(compare_cards);

		match.oppDeck.colors = get_deck_colors(match.oppDeck);
		match.oppDeck.mainDeck.sort(compare_cards);
	});
}

//
function compare_matches(a, b) {
	a = matchesHistory[a];
	b = matchesHistory[b];
	a = Date.parse(a.date);
	b = Date.parse(b.date);
	if (a < b)	return 1;
	if (a > b)	return -1;
	return 0;
}


