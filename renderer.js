var electron = require('electron');
var desktopCapturer = electron.desktopCapturer;
var shell = electron.shell;
window.ipc = electron.ipcRenderer;
var decks = null;
var matchesHistory = null;
var explore = null;
var cards = {};
var cardsNew = {};
var settings = null;
var updateState =  {state: -1, available: false, progress: 0, speed: 0};
var sidebarActive = 0;
var arenaRunning = false;
var renderer = 0;
var collectionPage = 0;
var filterEvent = '';
var filteredSets = [];
var draftPosition = 1;
var inputTimer = undefined;
//var initialized = false;

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
ipc.on('open_course_deck', function (event, arg) {
	$('.moving_ux').animate({'left': '-100%'}, 250, 'easeInOutCubic');
	arg = arg.CourseDeck;
	arg.colors = get_deck_colors(arg);
	arg.mainDeck.sort(compare_cards);
	arg.sideboard.sort(compare_cards);
	console.log(arg);
	open_deck(arg, 1);
});



//
ipc.on('set_settings', function (event, arg) {
	settings = arg;
});

//
ipc.on('set_update', function (event, arg) {
	updateState = arg;

	if (sidebarActive == 5) {
		open_about();
	}
});

//
ipc.on('show_notification', function (event, arg) {
    $('.notification').show();
    $('.notification').attr("title", arg);

    if (arg == "Update available" || arg == "Update downloaded") {
	    $('.notification').click(function() {
	        force_open_about();
	    });
	}
});

//
ipc.on('hide_notification', function (event, arg) {
    $('.notification').hide();
    $('.notification').attr("title", "");
});

//
ipc.on('force_open_settings', function (event, arg) {
	force_open_settings();
});

//
ipc.on('force_open_about', function (event, arg) {
	force_open_about();
});

//
ipc.on('initialize', function (event, arg) {
	//initialized = true;
	$('.sidebar').removeClass('hidden');
	$('.overflow_ux').removeClass('hidden');
	$('.message_center').css('display', 'none');

	//arenaCheckLoop();
	//$('.wrapper').css('left', '100%');
});


//
ipc.on('no_log', function (event, arg) {
	console.log(arg)
	$('.sidebar').addClass('hidden');
	$('.overflow_ux').addClass('hidden');
	$('.message_center').css('display', 'flex');
	$('.message_center').html('<div class="message_big red">No Log found</div><div class="message_sub_16 white">check if it exists at '+arg+'</div><div class="message_sub_16 white">if it does, try closing MTG Arena and deleting it.</div>');
});


$(".list_deck").on('mouseenter mouseleave', function(e) {
    $(".deck_tile").trigger(e.type);
});

function installUpdate() {
	ipc.send('update_install', 1);
}

function force_open_settings() {
	sidebarActive = 4;
	$(".sidebar_item").each(function(index) {
		$(this).removeClass("item_selected");
		if ($(this).hasClass("it4")) {
			$(this).addClass("item_selected");
		}
	});
	$('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
	open_settings();
}

function force_open_about() {
	sidebarActive = 4;
	$(".sidebar_item").each(function(index) {
		$(this).removeClass("item_selected");
		if ($(this).hasClass("it5")) {
			$(this).addClass("item_selected");
		}
	});
	$('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
	open_about();
}

function arenaCheckLoop() {
	if (!arenaRunning) {
		console.log("Arena is NOT running")
		$('.sidebar').addClass('hidden');
		$('.overflow_ux').addClass('hidden');
		$('.message_center').css('display', 'flex');
		$('.message_center').html('<div class="message_big red">Open MTG Arena</div><div class="message_sub white">...</div>');
	}
	else {
		console.log("Arena is running")
		$('.sidebar').removeClass('hidden');
		$('.overflow_ux').removeClass('hidden');
		$('.message_center').css('display', 'none');
	}

	isArenaRunning();
	setTimeout( function() {
		arenaCheckLoop();
	}, 100);
}

function isArenaRunning() {
	// This is not quite working as expected
    desktopCapturer.getSources({
        types: ['window', 'screen']
    }, (error, sources) => {
        if (error) throw error
		arenaRunning = false;
        for (let i = 0; i < sources.length; ++i) {
        	// sometimes arena does not show up here
        	console.log(sources[i].name);
            if (sources[i].name.indexOf('MTGA') !== -1) {
            	arenaRunning = true;
            }
        }
    });
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
				sidebarActive = 0;
				setDecks(null);
			}
			if ($(this).hasClass("it1")) {
				sidebarActive = 1;
				$("#ux_0").html('');
				ipc.send('request_history', 1);
			}
			if ($(this).hasClass("it2")) {
				sidebarActive = 2;
				$("#ux_0").html('');
				ipc.send('request_explore', filterEvent);
			}
			if ($(this).hasClass("it3")) {
				sidebarActive = 3;
				open_cards();
			}
			if ($(this).hasClass("it4")) {
				sidebarActive = 4;
				open_settings();
			}
			if ($(this).hasClass("it5")) {
				sidebarActive = 5;
				open_about();
			}
		}
		else {
			$('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
		}
	});
});

//
function setHistory(arg) {
	if (arg != null) {
		matchesHistory = arg;
	}

	sort_history();
	console.log(matchesHistory);

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

		if (match.type == "match") {
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
		}
		else {
			var tileGrpid = 67106;
			if (match.set == "Dominaria")			tileGrpid = 67106;// Karn art
			if (match.set == "Rivals of Ixalan")	tileGrpid = 66937;// Huatl art
			if (match.set == "Ixalan")				tileGrpid = 66433;// Vraska art
			if (match.set == "Hour of Devastation")	tileGrpid = 65759;// Nicol Bolas art
			if (match.set == "Amonketh")			tileGrpid = 64827;// Gideon art
			if (match.set == "Aether Revolt")		tileGrpid = 64647;// Tezzeret art
			if (match.set == "Kaladesh")			tileGrpid = 63859;// Chandra art

			
			var tile = $('<div class="'+match.id+'t deck_tile"></div>');
			tile.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+".jpg)");
			tile.appendTo(fltl);

			var d = $('<div class="list_deck_name">'+match.set+' draft</div>');
			d.appendTo(flt);

			var d = $('<div class="list_match_time">'+timeSince(new Date(match.date))+' ago.</div>');
			d.appendTo(fcb);

			var d = $('<div class="list_match_replay">See replay</div>');
			d.appendTo(fct);

			var d = $('<div class="list_match_result_win"></div>');
			d.appendTo(flr);
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
			if (match.type == "match") {
				open_match(match.id);
			}
			else {
				draftPosition = 1;
				open_draft(match.id, tileGrpid, match.set);
			}
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
		flr.css("flex-direction","column")
		flc.css("flex-direction","column")

		var flt = $('<div class="flex_top"></div>');
		var flb = $('<div class="flex_bottom"></div>');

		$('<div class="list_deck_name">'+deck.name+'</div>').appendTo(flt);
		deck.colors.forEach(function(color) {
			$('<div class="mana_20 mana_'+mana[color]+'"></div>').appendTo(flb);
		});

		var wr = getDeckWinrate(deck.id, deck.lastUpdated);
		if (wr != 0) {
			$('<div class="list_deck_winrate">Winrate: '+(wr.total*100).toFixed(2)+'%</div>').appendTo(flr);
			$('<div class="list_deck_winrate">Since last edit: '+(wr.lastEdit*100).toFixed(2)+'%</div>').appendTo(flr);
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
function updateExplore() {
	filterEvent = document.getElementById("query_explore").value;
	ipc.send('request_explore', filterEvent);
}


//
function setExplore(arg) {
	if (arg != null) {
		explore = arg;
	}

	$("#ux_0").html('');
	$("#ux_0").append('<div class="list_fill"></div>');

	// Search box
	var label = $('<label class="input_container">Filter by event</label>');
	var input = $('<input type="search" id="query_explore" autocomplete="off" autofocus value="'+filterEvent+'" />');
	input.appendTo(label);
	label.appendTo($("#ux_0"));
	input.focus();
	input[0].setSelectionRange(filterEvent.length, filterEvent.length);

	input.on('input', function() {
		updateExplore();
	});

	$("#ux_0").append('<div class="list_fill"></div>');
	$("#ux_0").append('<div class="list_fill"></div>');

	explore.forEach(function(_deck, index) {
		if (_deck.deck_colors == undefined) {
			_deck.deck_colors = [];
		}
		if (_deck.wins == undefined) {
			_deck.wins = 0;
			_deck.losses = 0;
		}

		var tileGrpid = _deck.deck_tile;
		var tile = $('<div class="'+index+'t deck_tile"></div>');
		tile.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+".jpg)");

		var div = $('<div class="'+index+' list_deck"></div>');

		var fll = $('<div class="flex_item"></div>');
		var flc = $('<div class="flex_item"></div>');
		var flcf = $('<div class="flex_item" style="flex-grow: 2"></div>');
		var flr = $('<div class="flex_item"></div>');
		flc.css("flex-direction","column");
		flr.css("flex-direction","column");

		var flt = $('<div class="flex_top"></div>');
		var flb = $('<div class="flex_bottom"></div>');

		$('<div class="list_deck_name">'+_deck.deck_name+'</div>').appendTo(flt);
		$('<div class="list_deck_name_it">by '+_deck.player_name+'</div>').appendTo(flt);
		
		_deck.deck_colors.forEach(function(color) {
			$('<div class="mana_20 mana_'+mana[color]+'"></div>').appendTo(flb);
		});

		$('<div class="list_deck_record">'+_deck.wins+' - '+_deck.losses+'</div>').appendTo(flr);
		$('<div class="list_deck_name_it">'+_deck.event.replace(/_/g, " ")+'</div>').appendTo(flr);


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
			open_course_request(_deck.id);
		    //$('.moving_ux').animate({'left': '-100%'}, 250, 'easeInOutCubic'); 
		});

	});
	$("#ux_0").append('<div class="list_fill"></div>');
}

//
function open_course_request(courseId) {
	ipc.send('request_course', courseId);
}

// 
function open_deck(i, type) {
	if (type == 0) {
		_deck = decks[i];
	}
	if (type == 1) {
		_deck = i;
	}

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

	addCardSeparator(99, dl);

	var prevIndex = 0;
	deck.sideboard.forEach(function(card) {
		var grpId = card.id;
		var type = cardsDb.get(grpId).type;
		if (card.quantity > 0) {
			addCardTile(grpId, 'a', card.quantity, dl);
		}
	});


	var stats = $('<div class="stats"></div>');

	$('<div class="button_simple exportDeck">Copy to clipboard</div>').appendTo(stats);

	var curvediv = $('<div class="mana_curve"></div>');
	var curve = get_deck_curve(_deck);

	var curveMax = 0;
	for (let i=0; i<curve.length; i++) {
		if (curve[i] == undefined) {
			curve[i] = 0;
		}
		if (curve[i] > curveMax) {
			curveMax = curve[i];
		}
	}

	for (let i=0; i<curve.length; i++) {
		curvediv.append($('<div class="mana_curve_column" style="height: '+(curve[i]/curveMax*100)+'%"></div>'))
	}
	curvediv.appendTo(stats);
	var curvediv = $('<div class="mana_curve_numbers"></div>');
	for (let i=0; i<curve.length; i++) {
		curvediv.append($('<div class="mana_curve_column_number"><div style="margin: 0 auto !important" class="mana_16 mana_g'+i+'"></div></div>'))
	}
	curvediv.appendTo(stats);

	//var missing = get_deck_missing(_deck);

	// Deck colors
	var colorspie = get_deck_colors_ammount(_deck);
	var wp = colorspie.w / colorspie.total * 100;
	var up = wp+colorspie.u / colorspie.total * 100;
	var bp = up+colorspie.b / colorspie.total * 100;
	var rp = bp+colorspie.r / colorspie.total * 100;
	var gp = rp+colorspie.g / colorspie.total * 100;
	var cp = gp+colorspie.c / colorspie.total * 100;

	var gradient = new ConicGradient({
	    stops: '#E7CA8E '+wp+'%, #AABEDF 0 '+up+'%, #A18E87 0 '+bp+'%, #DD8263 0 '+rp+'%, #B7C89E 0 '+gp+'%, #E3E3E3 0 '+cp+'%', // required
	    size: 400 // Default: Math.max(innerWidth, innerHeight)
	});
	var piechart = $('<div class="pie_container"><span>Mana Simbols</span><svg class="pie">'+gradient.svg+'</svg></div>');
	piechart.appendTo(stats);

	// Lands colors
	colorspie = get_deck_lands_ammount(_deck);
	wp = colorspie.w / colorspie.total * 100;
	up = wp+colorspie.u / colorspie.total * 100;
	bp = up+colorspie.b / colorspie.total * 100;
	rp = bp+colorspie.r / colorspie.total * 100;
	gp = rp+colorspie.g / colorspie.total * 100;
	cp = gp+colorspie.c / colorspie.total * 100;

	gradient = new ConicGradient({
	    stops: '#E7CA8E '+wp+'%, #AABEDF 0 '+up+'%, #A18E87 0 '+bp+'%, #DD8263 0 '+rp+'%, #B7C89E 0 '+gp+'%, #E3E3E3 0 '+cp+'%', // required
	    size: 400 // Default: Math.max(innerWidth, innerHeight)
	});
	piechart = $('<div class="pie_container"><span>Mana Sources</span><svg class="pie">'+gradient.svg+'</svg></div>');
	piechart.appendTo(stats);

	var missingWildcards = get_deck_missing(_deck);

	var cost = $('<div class="wildcards_cost"><span>Wildcards Needed</span></div>');

	var _c = $('<div class="wc_cost wc_common">'+missingWildcards.common+'</div>');
	_c.attr("title", "Common");
	_c.appendTo(cost);
	var _u = $('<div class="wc_cost wc_uncommon">'+missingWildcards.uncommon+'</div>');
	_u.appendTo(cost);
	_u.attr("title", "Uncommon");
	var _r = $('<div class="wc_cost wc_rare">'+missingWildcards.rare+'</div>');
	_r.appendTo(cost);
	_r.attr("title", "Rare");
	var _m = $('<div class="wc_cost wc_mythic">'+missingWildcards.mythic+'</div>');
	_m.appendTo(cost);
	_m.attr("title", "Mythic Rare");

	cost.appendTo(stats);

	dl.appendTo(fld);
	stats.appendTo(fld);
	$("#ux_1").append(top);
	$("#ux_1").append(fld);
	//
	$(".exportDeck").click(function () {
	    var list = get_deck_export(deck);
	    ipc.send('set_clipboard', list);
	});
	//
	$(".back").click(function () {
	    $('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
	});
}

//
function open_draft(id, tileGrpid, set) {
	console.log("OPEN DRAFT", draftPosition)
	$("#ux_1").html('');
	if (draftPosition < 1)	draftPosition = 1; 
	if (draftPosition > 84)	draftPosition = 84; 
	var draft = matchesHistory[id];

	var pa = Math.floor( (draftPosition-1)/2 / 14);
	var pi = Math.floor( ((draftPosition-1)/2) % 14);
	var key = 'pack_'+pa+'pick_'+pi;

	var pack = draft[key].pack;
	var pick = draft[key].pick;

	var top = $('<div class="decklist_top"><div class="button back"></div><div class="deck_name">'+set+' Draft</div></div>');
	flr = $('<div class="flex_item" style="align-self: center;"></div>');
	top.append(flr);
	top.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+".jpg)");

	var cont = $('<div class="flex_item" style="flex-direction: column;"></div>');
    cont.append('<div class="draft_nav_container"><div class="draft_nav_prev"></div><div class="draft_nav_next"></div></div>');

	$('<div class="draft_title">Pack '+(pa+1)+', Pick '+(pi+1)+'</div>').appendTo(cont);

	var slider = $('<div class="slidecontainer"></div>');
	slider.appendTo(cont);
	var sliderInput = $('<input type="range" min="1" max="84" value="'+draftPosition+'" class="slider" id="myRange">');
	sliderInput.appendTo(slider);


	var pd = $('<div class="draft_pack_container"></div>');
	pd.appendTo(cont);

	
	pack.forEach(function(grpId) {
		let dfc = '';
		if (cardsDb.get(grpId).dfc == 'DFC_Back')	dfc = 'a';
		if (cardsDb.get(grpId).dfc == 'DFC_Front')	dfc = 'b';
		if (cardsDb.get(grpId).dfc == 'SplitHalf')	dfc = 'a';
        var d = $('<div class="draft_card"></div>');
        var img = $('<img class="draft_card_img"></img>');
        if (grpId == pick && draftPosition % 2 == 0) {
        	img.addClass('draft_card_picked');
        }
		img.attr("src", "https://img.scryfall.com/cards/small/en/"+get_set_scryfall(cardsDb.get(grpId).set)+"/"+cardsDb.get(grpId).cid+dfc+".jpg");
		img.appendTo(d);
		img.on('mouseenter', function(e) {
			$('.main_hover').css("opacity", 1);
			$('.loader').css("opacity", 1);
			let dfc = '';
			if (cardsDb.get(grpId).dfc == 'DFC_Back')	dfc = 'a';
			if (cardsDb.get(grpId).dfc == 'DFC_Front')	dfc = 'b';
			if (cardsDb.get(grpId).dfc == 'SplitHalf')	dfc = 'a';
			$('.main_hover').attr("src", "https://img.scryfall.com/cards/normal/en/"+get_set_scryfall(cardsDb.get(grpId).set)+"/"+cardsDb.get(grpId).cid+dfc+".jpg");

			$('.main_hover').on('load', function(){
				$('.loader').css("opacity", 0);
			});
		});
		img.on('mouseleave', function(e) {
			$('.main_hover').css("opacity", 0);
			$('.loader').css("opacity", 0);
		});
		d.appendTo(pd);
	});


	$("#ux_1").append(top);
	$("#ux_1").append(cont);
	
	var qSel = document.querySelector("input");

	$(".draft_nav_prev").off();
	$(".draft_nav_next").off();
	$(".slider").off();

	$(".slider").on('click mousemove', function() {
		console.log("SLIDER MOVE", draftPosition)
		var pa = Math.floor( (qSel.value-1)/2 / 14) ;
		var pi = Math.floor( ((qSel.value-1)/2) % 14) ;
		$('.draft_title').html('Pack '+(pa+1)+', Pick '+(pi+1));
	});

	$(".slider").on('click mouseup', function() {
		console.log("SLIDER UP")
		draftPosition = parseInt(qSel.value);
		open_draft(id, tileGrpid, set);
	});
	
	$(".draft_nav_prev").on('click mouseup', function() {
		console.log("NAV PREV UP")
	    draftPosition -= 1;
	    open_draft(id, tileGrpid, set);
	});

	$(".draft_nav_next").on('click mouseup', function() {
		console.log("NAV NEXT UP")
	    draftPosition += 1;
	    open_draft(id, tileGrpid, set);
	});
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

	addCardSeparator(99, dl);

	var prevIndex = 0;
	deck.sideboard.forEach(function(card) {
		var grpId = card.id;
		var type = cardsDb.get(grpId).type;
		if (card.quantity > 0) {
			addCardTile(grpId, 'a', card.quantity, dl);
		}
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

//
function open_cards() {
	$("#ux_0").html('');
	$("#ux_1").html('');
	var div = $('<div class="inventory"></div>');
	
	var filters = $('<div class="inventory_filters"></div>');
	var sets = $('<div class="sets_container"><label>Filter by set:</label></div>');
	setsList.forEach(function(set) {
		var setbutton = $('<div class="set_filter set_filter_on" style="background-image: url(sets/'+get_set_scryfall(set)+'.png)" title="'+set+'"></div>');
		setbutton.appendTo(sets);
		setbutton.click(function() {
			if (setbutton.hasClass('set_filter_on')) {
				setbutton.removeClass('set_filter_on');
				filteredSets.push(set);
			}
			else {
				setbutton.addClass('set_filter_on');
				let n = filteredSets.indexOf(set);
				if (n > -1) {
					filteredSets.splice(n, 1);
				}
			}
			printCards();
		});
	});
	sets.appendTo(filters);

	// Search box
	var label = $('<label class="input_container">Search</label>');
	label.appendTo(filters);
	var input = $('<input type="search" id="query_name" autocomplete="off" />');
	input.appendTo(label);

	var cont = $('<div class="buttons_container"></div>');

	// Newly added only
	var label = $('<label class="check_container">Newly aquired only</label>');
	label.appendTo(cont);
	var check_new = $('<input type="checkbox" id="query_new" onclick="printCards()" />');
	check_new.appendTo(label);
	var span = $('<span class="checkmark"></span>');
	span.appendTo(label);

	// Stats
	var exp   = $('<div class="button_simple button_thin" onClick="exportCollection()">Copy to Clipboard</div>');
	var stats = $('<div class="button_simple button_thin stats_button" onClick="printStats()">Collection Stats</div>');

	exp.appendTo(cont);
	stats.appendTo(cont);
	cont.appendTo(filters);

	input.on('input', function() {
		if (inputTimer != undefined) {
			clearTimeout(inputTimer);
		}
		console.log("print cards in a second..")
		inputTimer = setTimeout(function(){
			console.log("printed")
			printCards();
		}, 500);
	});

	$("#ux_0").append(filters);
	$("#ux_0").append(div);

	printCards();
}

//
function exportCollection() {
	var str = get_collection_export();
	ipc.send('set_clipboard', str);
}

//
function printStats() {
    $('.moving_ux').animate({'left': '-100%'}, 250, 'easeInOutCubic'); 
	$("#ux_1").html('');
	stats = get_collection_stats();

	var top = $('<div class="decklist_top"><div class="button back"></div><div class="deck_name">Collection Statistics</div></div>');
	top.css("background-image", "url(http://www.artofmtg.com/wp-content/uploads/2018/04/Urzas-Tome-Dominaria-MtG-Art.jpg)");
	
	flex = $('<div class="flex_item"></div>');
	mainstats = $('<div class="main_stats"></div>');

	var label = $('<label>Sets Completion</label>');
	label.appendTo(mainstats);

	// each set stats
	setsList.forEach(function(set) {
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_set_icon" style="background-image: url(sets/'+get_set_scryfall(set)+'.png)"><span>'+set+' <i>('+stats[set].ownedCards+'/'+stats[set].totalCards+')</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats[set].ownedCards/stats[set].totalCards*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(mainstats);

		setdiv.click(function() {
			var substats = $(".sub_stats");
			substats.html('');
			$('<label>'+set+' Completion</label>').appendTo(substats);
			var setdiv = $('<div class="stats_set_completion"></div>');
			$('<div class="stats_rarity_icon" style="background-image: url(images/wc_common.png)"><span>Commons <i>('+stats[set].ownedCommon+'/'+stats[set].totalCommon+')</i></span></div>').appendTo(setdiv);
			$('<div class="stats_set_bar" style="width: '+stats[set].ownedCommon/stats[set].totalCommon*100+'%"></div>').appendTo(setdiv);
			setdiv.appendTo(substats);
			var setdiv = $('<div class="stats_set_completion"></div>');
			$('<div class="stats_rarity_icon" style="background-image: url(images/wc_uncommon.png)"><span>Uncommons <i>('+stats[set].ownedUncommon+'/'+stats[set].totalUncommon+')</i></span></div>').appendTo(setdiv);
			$('<div class="stats_set_bar" style="width: '+stats[set].ownedUncommon/stats[set].totalUncommon*100+'%"></div>').appendTo(setdiv);
			setdiv.appendTo(substats);
			var setdiv = $('<div class="stats_set_completion"></div>');
			$('<div class="stats_rarity_icon" style="background-image: url(images/wc_rare.png)"><span>Rares <i>('+stats[set].ownedRare+'/'+stats[set].totalRare+')</i></span></div>').appendTo(setdiv);
			$('<div class="stats_set_bar" style="width: '+stats[set].ownedRare/stats[set].totalRare*100+'%"></div>').appendTo(setdiv);
			setdiv.appendTo(substats);
			if (stats[set].totalMythic == 0)	stats[set].totalMythic = 1;
			var setdiv = $('<div class="stats_set_completion"></div>');
			$('<div class="stats_rarity_icon" style="background-image: url(images/wc_mythic.png)"><span>Mythics <i>('+stats[set].ownedMythic+'/'+stats[set].totalMythic+')</i></span></div>').appendTo(setdiv);
			$('<div class="stats_set_bar" style="width: '+stats[set].ownedMythic/stats[set].totalMythic*100+'%"></div>').appendTo(setdiv);
			setdiv.appendTo(substats);
		});
	});

	// Complete collection sats
	var setdiv = $('<div class="stats_set_completion"></div>');
	$('<div class="stats_set_icon" style="background-image: url(sets/pw.png)"><span>Complete collection <i>('+stats.ownedCards+'/'+stats.totalCards+')</i></span></div>').appendTo(setdiv);
	$('<div class="stats_set_bar" style="width: '+stats.ownedCards/stats.totalCards*100+'%"></div>').appendTo(setdiv);
	setdiv.appendTo(mainstats);

	setdiv.click(function() {
		var substats = $(".sub_stats");
		substats.html('');
		$('<label>Complete collection completion</label>').appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(images/wc_common.png)"><span>Commons <i>('+stats.ownedCommon+'/'+stats.totalCommon+')</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedCommon/stats.totalCommon*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(images/wc_uncommon.png)"><span>Uncommons <i>('+stats.ownedUncommon+'/'+stats.totalUncommon+')</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedUncommon/stats.totalUncommon*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(images/wc_rare.png)"><span>Rares <i>('+stats.ownedRare+'/'+stats.totalRare+')</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedRare/stats.totalRare*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(images/wc_mythic.png)"><span>Mythics <i>('+stats.ownedMythic+'/'+stats.totalMythic+')</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedMythic/stats.totalMythic*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
	});

	// Singleton collection sats
	var setdiv = $('<div class="stats_set_completion"></div>');
	$('<div class="stats_set_icon" style="background-image: url(sets/pw.png)"><span>Singles <i>('+stats.ownedSingles+'/'+stats.totalSingles+')</i></span></div>').appendTo(setdiv);
	$('<div class="stats_set_bar" style="width: '+stats.ownedSingles/stats.totalSingles*100+'%"></div>').appendTo(setdiv);
	setdiv.appendTo(mainstats);

	setdiv.click(function() {
		var substats = $(".sub_stats");
		substats.html('');
		$('<label>Singles completion</label>').appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(images/wc_common.png)"><span>Commons <i>('+stats.ownedSinglesCommon+'/'+stats.totalSinglesCommon+')</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedSinglesCommon/stats.totalSinglesCommon*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(images/wc_uncommon.png)"><span>Uncommons <i>('+stats.ownedSinglesUncommon+'/'+stats.totalSinglesUncommon+')</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedSinglesUncommon/stats.totalSinglesUncommon*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(images/wc_rare.png)"><span>Rares <i>('+stats.ownedSinglesRare+'/'+stats.totalSinglesRare+')</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedSinglesRare/stats.totalSinglesRare*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(images/wc_mythic.png)"><span>Mythics <i>('+stats.ownedSinglesMythic+'/'+stats.totalSinglesMythic+')</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedSinglesMythic/stats.totalSinglesMythic*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
	});

	substats = $('<div class="main_stats sub_stats"></div>');

	flex.append(mainstats);
	flex.append(substats);

	$("#ux_1").append(top);
	$("#ux_1").append(flex);
	//
	$(".back").click(function () {
	    $('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
	});
}

//
function printCards() {
	var div = $(".inventory");
	div.html('');

	var paging = $('<div class="paging_container"></div>');
	div.append(paging);

	filterName = document.getElementById("query_name").value.toLowerCase();
	filterNew  = document.getElementById("query_new");
	console.log("filter", filterNew.checked);
	var totalCards = 0;
    for (n=0; n<Object.keys(cards).length; n++) {
    	key = Object.keys(cards)[n];
    	let grpId = key;
    	let doDraw = true;

    	let name = cardsDb.get(key).name.toLowerCase();
    	let type = cardsDb.get(key).type.toLowerCase();
    	let set  = cardsDb.get(key).set;

		if (name.indexOf(filterName) == -1 && type.indexOf(filterName) == -1) {
			doDraw = false;
		}

    	if (filterNew.checked && cardsNew[key] == undefined) {
    		doDraw = false;
    	}

    	if (filteredSets.length > 0) {
	    	if (!filteredSets.includes(set)) {
	    		doDraw = false;
	    	}
    	}

    	if (doDraw) {
    		totalCards++;
    	}

    	if (totalCards < collectionPage*100 || totalCards > collectionPage*100+99) {
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

			img.on('mouseenter', function(e) {
				$('.main_hover').css("opacity", 1);
				$('.loader').css("opacity", 1);
				let dfc = '';
				if (cardsDb.get(grpId).dfc == 'DFC_Back')	dfc = 'a';
				if (cardsDb.get(grpId).dfc == 'DFC_Front')	dfc = 'b';
				if (cardsDb.get(grpId).dfc == 'SplitHalf')	dfc = 'a';
				$('.main_hover').attr("src", "https://img.scryfall.com/cards/normal/en/"+get_set_scryfall(cardsDb.get(grpId).set)+"/"+cardsDb.get(grpId).cid+dfc+".jpg");

				$('.main_hover').on('load', function(){
					$('.loader').css("opacity", 0);
				});
			});

			img.on('mouseleave', function(e) {
				$('.main_hover').css("opacity", 0);
				$('.loader').css("opacity", 0);
			});

			d.appendTo(div);
		}
    }

	if (collectionPage <= 0) {
		but = $('<div class="paging_button_disabled"> \< </div>');
	}
	else {
		but = $('<div class="paging_button" onClick="setCollectionPage('+(collectionPage-1)+')"> \< </div>');
	}
	paging.append(but);
	var totalPages = Math.ceil(totalCards / 100);
	for (var n=0; n<totalPages; n++) {
		but = $('<div class="paging_button" onClick="setCollectionPage('+(n)+')">'+n+'</div>');
		if (collectionPage == n) {
			but.addClass("paging_active");
		}
		paging.append(but);
	}
	if (collectionPage >= totalPages-1) {
		but = $('<div class="paging_button_disabled"> \> </div>');
	}
	else {
		but = $('<div class="paging_button" onClick="setCollectionPage('+(collectionPage+1)+')"> \> </div>');
	}
	paging.append(but);
}


//
function setCollectionPage(page) {
	collectionPage = page;
	printCards();
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


	// Show overlay
	var label = $('<label class="check_container">Show in-game overlay</label>');
	label.appendTo(div);
	var check_new = $('<input type="checkbox" id="settings_showoverlay" onclick="updateSettings()" />');
	check_new.appendTo(label);
	check_new.prop('checked', settings.show_overlay);

	var span = $('<span class="checkmark"></span>');
	span.appendTo(label);


	// Close on new
	var label = $('<label class="check_container">Close main window on match found</label>');
	label.appendTo(div);
	var check_new = $('<input type="checkbox" id="settings_closeonmatch" onclick="updateSettings()" />');
	check_new.appendTo(label);
	check_new.prop('checked', settings.close_on_match);

	var span = $('<span class="checkmark"></span>');
	span.appendTo(label);


	// Close button behaviour
	var label = $('<label class="check_container">Close to tray</label>');
	label.appendTo(div);
	var check_new = $('<input type="checkbox" id="settings_closetotray" onclick="updateSettings()" />');
	check_new.appendTo(label);
	check_new.prop('checked', settings.close_to_tray);

	var span = $('<span class="checkmark"></span>');
	span.appendTo(label);


	// Send events data
	var label = $('<label class="check_container">Online sharing <i>(when disabled, blocks any connections with our servers)</i></label>');
	label.appendTo(div);
	var check_new = $('<input type="checkbox" id="settings_senddata" onclick="updateSettings()" />');
	check_new.appendTo(label);
	check_new.prop('checked', settings.send_data);

	var span = $('<span class="checkmark"></span>');
	span.appendTo(label);


	// Erase data
	var label = $('<label class="check_container_but"></label>');
	label.appendTo(div);
	var button = $('<div class="button_simple button_long" onclick="eraseData()"">Erase my shared data</div>');
	button.appendTo(label);


	// overlay transparency
	// hover timeout
	// hide when zero left

	$("#ux_0").append(div);
}

//
function eraseData() {
	if (confirm('This will erase all of your decks and events shared online, are you sure?')) {
		ipc.send('erase_data', true);
	} else {
		return;
	}
}

//
function updateSettings() {
	var startup = document.getElementById("settings_startup").checked;
	var showOverlay = document.getElementById("settings_showoverlay").checked;
	var closeToTray = document.getElementById("settings_closetotray").checked;
	var sendData = document.getElementById("settings_senddata").checked;
	var closeOnMatch = document.getElementById("settings_closeonmatch").checked;

	settings = {show_overlay: showOverlay, startup: startup, close_to_tray: closeToTray, send_data: sendData, close_on_match: closeOnMatch};

	ipc.send('save_settings', settings);
}

//
function open_about() {
	var aboutStr = '';
	aboutStr += '<div class="about">'
	aboutStr += '	<div class="top_logo_about"></div>'
	aboutStr += '	<div class="message_sub_15 white">By Manuel Etchegaray, 2018</div>'
	aboutStr += '	<div class="message_sub_15 white">Version '+window.electron.remote.app.getVersion()+'</div>'

	if (updateState.state == 0) {
		aboutStr += '	<div class="message_updates white">Checking for updates..</div>'
	}
	if (updateState.state == 1) {
		aboutStr += '	<div class="message_updates green">Update available.</div>'
		aboutStr += '	<a class="release_notes_link">Release Notes</a>'
	}
	if (updateState.state == -1) {
		aboutStr += '	<div class="message_updates green">Client is up to date.</div>'
	}
	if (updateState.state == -2) {
		aboutStr += '	<div class="message_updates red">Error updating.</div>'
	}
	if (updateState.state == 2) {
		aboutStr += '	<div class="message_updates green">Donwloading ('+updateState.progress+'%)</div>'
		aboutStr += '	<a class="release_notes_link">Release Notes</a>'
	}
	if (updateState.state == 3) {
		aboutStr += '	<div class="message_updates green">Download complete.</div>'
		aboutStr += '	<a class="release_notes_link">Release Notes</a>'
		aboutStr += '	<div class="button_simple" onClick="installUpdate()">Install</div>'
	}

	aboutStr += '<div class="flex_item" style="width: 160px; margin: 64px auto 0px auto;"><div class="twitter_link"></div><div class="git_link"></div></div>';
	aboutStr += '</div>';

	$("#ux_0").html(aboutStr);

	$(".top_logo_about").click(function() {
		shell.openExternal('https://mtgatool.com');
	});

	$(".twitter_link").click(function() {
		shell.openExternal('https://twitter.com/MEtchegaray7');
	});

	$(".git_link").click(function() {
		shell.openExternal('https://github.com/Manuel-777/MTG-Arena-Tool');
	});

	$(".release_notes_link").click(function() {
		shell.openExternal('https://mtgatool.com/release-notes/');
	});
}

//
function getDeckWinrate(deckid, lastEdit) {
	var wins = 0;
	var loss = 0;
	var winsLastEdit = 0;
	var lossLastEdit = 0;
	if (matchesHistory == undefined) {
		return 0;
	}
	matchesHistory.matches.forEach(function(match, index) {
		match = matchesHistory[match];
		if (match.type == "match") {
			if (match.playerDeck.id == deckid) {
				if (match.player.win > match.opponent.win) {
					wins++;
				}
				else {
					loss++;
				}
				if (match.date > lastEdit) {
					if (match.player.win > match.opponent.win) {
						winsLastEdit++;
					}
					else {
						lossLastEdit++;
					}
				}
			}
		}
	});

	if (wins == 0) {
		return 0;
	}
	var winrate = Math.round((1/(wins+loss)*wins) * 100) / 100;
	var winrateLastEdit = Math.round((1/(winsLastEdit+lossLastEdit)*winsLastEdit) * 100) / 100;
	if (winsLastEdit == 0)	winrateLastEdit = 0;
	return {total: winrate, lastEdit: winrateLastEdit};
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

		if (match.type != "draft") {
			if (match.playerDeck.mainDeck == undefined) {
				match.playerDeck = JSON.parse('{"deckTileId":67003,"description":null,"format":"Standard","colors":[],"id":"00000000-0000-0000-0000-000000000000","isValid":false,"lastUpdated":"2018-05-31T00:06:29.7456958","lockedForEdit":false,"lockedForUse":false,"mainDeck":[],"name":"Undefined","resourceId":"00000000-0000-0000-0000-000000000000","sideboard":[]}');
			}
			else {
				match.playerDeck.colors = get_deck_colors(match.playerDeck);
			}

			match.playerDeck.mainDeck.sort(compare_cards);

			match.oppDeck.colors = get_deck_colors(match.oppDeck);
			match.oppDeck.mainDeck.sort(compare_cards);
		}
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


