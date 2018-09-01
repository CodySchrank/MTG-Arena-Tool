var electron = require('electron');
var desktopCapturer = electron.desktopCapturer;
var shell = electron.shell;
window.ipc = electron.ipcRenderer;
var decks = null;
var changes = null;
var matchesHistory = null;
var explore = null;
var cards = {};
var cardsNew = {};
var settings = null;
var updateState =  {state: -1, available: false, progress: 0, speed: 0};
var sidebarActive = -1;
var arenaRunning = false;
var renderer = 0;
var collectionPage = 0;
var eventFilters = null;
var filterEvent = '';
var filteredSets = [];
var filteredMana = [];
var draftPosition = 1;
var overlayAlpha = 1;
var cardSizePos = 4;
var cardSize = 140;
var cardQuality = "normal";
var inputTimer = undefined;
var loadHistory = 0;

var currentOpenDeck = null;

var rankOffset = 0;
var rankTitle = "";
var userName = ""
var goldHistory = null;
var gemsHistory = null;
var wildcardHistory = null;

const chartjs = require('chart.js');
const Database = require('../shared/database.js');
const cardsDb = new Database();


var mana = {0: "", 1: "white", 2: "blue", 3: "black", 4: "red", 5: "green", 6: "colorless", 7: "", 8: "x"}

ipc_send = function (method, arg) {
    ipc.send('ipc_switch', method, arg);
};

document.addEventListener('DOMContentLoaded', windowReady);
function windowReady(){
	ipc_send('renderer_state', 1);
}

//
ipc.on('set_username', function (event, arg) {
	userName = arg;
	if (sidebarActive != -1) {
		$('.top_username').html(userName);
	}
});

//
ipc.on('set_rank', function (event, offset, rank) {
	rankOffset = offset;
	rankTitle = rank;
	if (sidebarActive != -1) {
		$(".top_rank").css("background-position", (rankOffset*-32)+"px 0px").attr("title", rankTitle);
	}
});

//
ipc.on('set_decks', function (event, arg) {
    try {
        arg = JSON.parse(arg)
    } catch(e) {
        console.log("Error parsing JSON:", arg);
        return false;
    }
	setDecks(arg);
});

//
ipc.on('set_deck_updated', function (event, str) {
    try {
        deck = JSON.parse(str);
    } catch(e) {
        console.log("Error parsing JSON:", str);
        return false;
    }
	
});

//
ipc.on('set_history', function (event, arg) {
	if (arg != null) {
	    try {
	        matchesHistory = JSON.parse(arg);
	    } catch(e) {
	        console.log("Error parsing JSON:", str);
	        return false;
	    }
	}
	
	setHistory(0);
});

//
ipc.on('set_history_data', function (event, arg) {
	if (arg != null) {
		matchesHistory = JSON.parse(arg);
	}
});

//
ipc.on('set_deck_changes', function (event, arg) {
	if (arg != null) {
	    try {
	        changes = JSON.parse(arg);
	        console.log(changes);
	    } catch(e) {
	        console.log("Error parsing JSON:", str);
	        return false;
	    }
	}

	if (changes != null) {
		setChangesTimeline();
	}
});

//
ipc.on('set_cards', function (event, _cards, _cardsnew) {
	cards = _cards;
	cardsNew = _cardsnew;
});

//
ipc.on('set_explore', function (event, arg) {
	arg.sort(compare_explore);
	setExplore(arg, 0);
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
	console.log(arg);
	settings = arg;
	cardSizePos = settings.cards_size;
	overlayAlpha = settings.overlay_alpha;
	if (settings.cards_quality != undefined) {
		cardQuality = settings.cards_quality;
	}
	cardSize = 100+(cardSizePos*10);
});

//
ipc.on('set_update', function (event, arg) {
	updateState = arg;

	if (sidebarActive == 6) {
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
ipc.on('set_economy', function (event, arg) {
	goldHistory = arg.gold;
	gemsHistory = arg.gems;
	wildcardHistory = arg.wildcards;
	open = arg.open;
	if (open) {
		open_economy();
	}
});

//
ipc.on('initialize', function (event, arg) {
	$('.top_username').html(userName);
	$(".top_rank").css("background-position", (rankOffset*-32)+"px 0px").attr("title", rankTitle);
	sidebarActive = 0;
	setDecks(null);
	$('.sidebar').removeClass('hidden');
	$('.overflow_ux').removeClass('hidden');
	$('.message_center').css('display', 'none');
	$('.init_loading').hide();
});

//
ipc.on('no_log', function (event, arg) {
	console.log(arg)
	$('.sidebar').addClass('hidden');
	$('.overflow_ux').addClass('hidden');
	$('.message_center').css('display', 'flex');
	$('.message_center').html('<div class="message_big red">No Log Found</div><div class="message_sub_16 white">check if it exists at '+arg+'</div><div class="message_sub_16 white">if it does, try closing MTG Arena and deleting it.</div>');
});

//
ipc.on('log_read', function (event, arg) {
	if ($('.sidebar').hasClass('hidden')) {
		$('.sidebar').removeClass('hidden');
		$('.overflow_ux').removeClass('hidden');
		$('.message_center').css('display', 'none');
	}
});


$(".list_deck").on('mouseenter mouseleave', function(e) {
    $(".deck_tile").trigger(e.type);
});


//
ipc.on('popup', function (event, arg) {
	pop(arg);
});

var popTimeout = null;
function pop(str) {
    $('.popup').css("opacity", 1);
    $('.popup').html(str);
    if (popTimeout != null) {
	    clearTimeout(popTimeout);
    }
    popTimeout = setTimeout(function() {
    	$('.popup').css("opacity", 0);
    	popTimeout = null;
    }, 3000);
}

//
function installUpdate() {
	ipc_send('renderer_update_install', 1);
}

function force_open_settings() {
	sidebarActive = 5;
	$(".sidebar_item").each(function(index) {
		$(this).removeClass("item_selected");
		if ($(this).hasClass("it5")) {
			$(this).addClass("item_selected");
		}
	});
	$('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
	open_settings();
}

function force_open_about() {
	sidebarActive = 6;
	$(".sidebar_item").each(function(index) {
		$(this).removeClass("item_selected");
		if ($(this).hasClass("it6")) {
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
	    ipc_send('renderer_window_close', 1);
	});

	//
	$(".minimize").click(function () {
	    ipc_send('renderer_window_minimize', 1);
	});

	//
	$(".settings").click(function () {
		force_open_settings();
	});

	//
	$(".sidebar_item").click(function () {
		$("#ux_0").off();
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
				ipc_send('renderer_request_history', 1);
			}
			if ($(this).hasClass("it2")) {
				sidebarActive = 2;
				$("#ux_0").html('<div class="loading_bar ux_loading"><div class="loading_color loading_w"></div><div class="loading_color loading_u"></div><div class="loading_color loading_b"></div><div class="loading_color loading_r"></div><div class="loading_color loading_g"></div></div>');
				document.body.style.cursor = "progress";
				ipc_send('renderer_request_explore', filterEvent);
			}
			if ($(this).hasClass("it3")) {
				sidebarActive = 3;
				open_economy_ipc();
			}
			if ($(this).hasClass("it4")) {
				sidebarActive = 4;
				open_cards();
			}
			if ($(this).hasClass("it5")) {
				sidebarActive = 5;
				open_settings();
			}
			if ($(this).hasClass("it6")) {
				sidebarActive = 6;
				open_about();
			}
		}
		else {
			$('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
		}
	});
});

//
function open_economy_ipc() {
	ipc_send('renderer_get_economy', 1);
}

//
function setHistory(loadMore) {
	var mainDiv = document.getElementById("ux_0");
	if (loadMore > 0) {
	}
	else {
		loadMore = 25;
		sort_history();		
		mainDiv.innerHTML = '';

		loadHistory = 0;
		
		var div = document.createElement("div");
		div.classList.add("ranks_history");

		var t = document.createElement("div");
		t.classList.add("ranks_history_title");
		t.innerHTML = "Stats from last 10 days:";
		div.appendChild(t);

		// Add ranks matchup history here
		for (var key in matchesHistory.rankwinrates) {
		    if (matchesHistory.rankwinrates.hasOwnProperty(key)) {
		    	var val = matchesHistory.rankwinrates[key];
		    	if (val.t > 0) {
					var fla = document.createElement("div");
					fla.classList.add("flex_item");
					//fla.style.flexDirection = "column";
					fla.style.justifyContent = "center";

					var v = document.createElement("div");
					v.classList.add("ranks_history_title");
					v.innerHTML = "Vs.";

					var r = document.createElement("div");
					r.classList.add("ranks_history_badge");
					r.style.backgroundPosition = (get_rank_index(val.r, 1)*-48)+"px 0px";
					r.title = val.r;

					var s = document.createElement("div");
					s.classList.add("ranks_history_title");
					s.innerHTML = Math.round(val.w/val.t*100)+"%";

					fla.appendChild(v);
					fla.appendChild(r);
					fla.appendChild(s);
					div.appendChild(fla);
		    	}
		    }
		}

		var d = document.createElement("div");
		d.classList.add("list_fill");

		mainDiv.appendChild(div);
		mainDiv.appendChild(d);
		
	}

	console.log("Load more: ", loadHistory, loadMore, loadHistory+loadMore);
	for (var loadEnd = loadHistory + loadMore; loadHistory < loadEnd; loadHistory++) {
		var match_id = matchesHistory.matches[loadHistory];
		var match = matchesHistory[match_id];
		console.log("Load match: ", match_id, match);

		if (match == undefined) continue;
		console.log("Match: ", loadHistory, match.type, match)

		var div = document.createElement("div");
		div.classList.add(match.id);
		div.classList.add("list_match");

		var fltl = document.createElement("div");
		fltl.classList.add("flex_item");

		var fll = document.createElement("div");
		fll.classList.add("flex_item");
		fll.style.flexDirection = "column";

		var flt = document.createElement("div");
		flt.classList.add("flex_top");
		fll.appendChild(flt);

		var flb = document.createElement("div");
		flb.classList.add("flex_bottom");
		fll.appendChild(flb);

		var flc = document.createElement("div");
		flc.classList.add("flex_item");
		flc.style.flexDirection = "column";
		flc.style.flexGrow = 2;

		var fct = document.createElement("div");
		fct.classList.add("flex_top");
		flc.appendChild(fct);

		var fcb = document.createElement("div");
		fcb.classList.add("flex_bottom");
		fcb.style.marginRight = "14px";
		flc.appendChild(fcb);

		var flr = document.createElement("div");
		flr.classList.add("flex_item");

		if (match.type == "match") {
			var tileGrpid = match.playerDeck.deckTileId;
			if (!cardsDb.get(tileGrpid)) {
				tileGrpid = 67003;
			}

			var tile = document.createElement("div");
			tile.classList.add(match.id+"t");
			tile.classList.add("deck_tile");
			tile.style.backgroundImage = "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+".jpg)";
			fltl.appendChild(tile);

			var d = document.createElement("div");
			d.classList.add("list_deck_name");
			d.innerHTML = match.playerDeck.name;
			flt.appendChild(d);

			match.playerDeck.colors.forEach(function(color) {
				var m = document.createElement("div");
				m.classList.add("mana_20");
				m.classList.add("mana_"+mana[color]);
				flb.appendChild(m);
			});

			var d = document.createElement("div");
			d.classList.add("list_match_title");
			d.innerHTML = "vs "+match.opponent.name;
			fct.appendChild(d);

			var or = document.createElement("div");
			or.classList.add("ranks_16");
			or.style.backgroundPosition = (get_rank_index_16(match.opponent.rank)*-16)+"px 0px";
			or.title = match.opponent.rank+" "+match.opponent.tier;
			fct.appendChild(or);

			var d = document.createElement("div");
			d.classList.add("list_match_time");
			d.innerHTML = timeSince(new Date(match.date))+' ago.';
			fcb.appendChild(d);

			var cc = get_deck_colors(match.oppDeck);
			cc.forEach(function(color) {
				var m = document.createElement("div");
				m.classList.add("mana_20");
				m.classList.add("mana_"+mana[color]);
				fcb.appendChild(m);
			});

			if (match.player.win > match.opponent.win) {
				var d = document.createElement("div");
				d.classList.add("list_match_result_win");
				d.innerHTML = "Win";
				flr.appendChild(d);
			}
			else {
				var d = document.createElement("div");
				d.classList.add("list_match_result_loss");
				d.innerHTML = "Loss";
				flr.appendChild(d);
			}
		}
		else {
			//console.log("DRAFT: ", match)
			var tileGrpid = 67106;
			if (match.set == "Magic 2019")			tileGrpid = 65947;// Nicol Bolas art
			if (match.set == "Dominaria")			tileGrpid = 67106;// Karn art
			if (match.set == "Rivals of Ixalan")	tileGrpid = 66937;// Huatl art
			if (match.set == "Ixalan")				tileGrpid = 66433;// Vraska art
			if (match.set == "Hour of Devastation")	tileGrpid = 65759;// Nicol Bolas art
			if (match.set == "Amonketh")			tileGrpid = 64827;// Gideon art
			if (match.set == "Aether Revolt")		tileGrpid = 64647;// Tezzeret art
			if (match.set == "Kaladesh")			tileGrpid = 63859;// Chandra art

			var tile = document.createElement("div");
			tile.classList.add(match.id+"t");
			tile.classList.add("deck_tile");
			tile.style.backgroundImage = "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+".jpg)";
			fltl.appendChild(tile);

			var d = document.createElement("div");
			d.classList.add("list_deck_name");
			d.innerHTML = match.set+" draft";
			flt.appendChild(d);

			var d = document.createElement("div");
			d.classList.add("list_match_time");
			d.innerHTML = timeSince(new Date(match.date))+" ago.";
			fcb.appendChild(d);

			var d = document.createElement("div");
			d.classList.add("list_match_replay");
			d.innerHTML = "See replay";
			fct.appendChild(d);

			var d = document.createElement("div");
			d.classList.add("list_draft_share");
			d.classList.add(match.id+'dr');
			flr.appendChild(d);

		}

		div.appendChild(fltl);
		div.appendChild(fll);
		div.appendChild(flc);
		div.appendChild(flr);

		mainDiv.appendChild(div);

		if (match.type == "draft") {
			addShare(match);
		}
		addHover(match, tileGrpid);
	}

	$(this).off();
	$("#ux_0").on('scroll', function() {
		if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
			setHistory(20);
		}
	})

	loadHistory = loadEnd;
}

//
function addShare(_match) {
	$('.'+_match.id+'dr').on('click', function(e) {
		e.stopPropagation();
		$('.share_dialog_wrapper').css('opacity', 1);
		$('.share_dialog_wrapper').css('pointer-events', 'all');
		$('.share_dialog_wrapper').show();
		$('.share_dialog').css('width', '500px');
		$('.share_dialog').css('height', '200px');
		$('.share_dialog').css('top', 'calc(50% - 100px)');

		$('.share_dialog_wrapper').on('click', function(e) {
			console.log('.share_dialog_wrapper on click')
			//e.stopPropagation();
			$('.share_dialog_wrapper').css('opacity', 0);
			$('.share_dialog_wrapper').css('pointer-events', 'none');
			setTimeout(function() {
				$('.share_dialog_wrapper').hide();
				$('.share_dialog').css('width', '400px');
				$('.share_dialog').css('height', '160px');
				$('.share_dialog').css('top', 'calc(50% - 80px)');
			}, 250);
		});

		$('.share_dialog').on('click', function(e) {
			e.stopPropagation();
			console.log('.share_dialog on click')
		});

		var dialog = $('.share_dialog');
		dialog.html('');
		var cont = $('<div class="share_dialog_container"></div>');

		cont.append('<div class="share_title">Link For sharing:</div>');
		var icd = $('<div class="share_input_container"></div>');
		var but = $('<div class="button_simple">Copy</div>');
		var sin = $('<input id="share_input" onClick="this.setSelectionRange(0, this.value.length)" autofocus autocomplete="off" value="https://mtgatool.com/draft/'+_match.id+'" />');

		sin.appendTo(icd);
		but.appendTo(icd);
		icd.appendTo(cont);
		cont.append('<div class="share_subtitle"><i>This link will never expire</i></div>');
		cont.appendTo(dialog);

		but.click(function () {
		    ipc_send('set_clipboard', "https://mtgatool.com/draft/"+_match.id);
		});
	});
}

//
function addHover(_match, tileGrpid) {
	$('.'+_match.id).on('mouseenter', function(e) {
	    $('.'+_match.id+'t').css('opacity', 1);
	    $('.'+_match.id+'t').css('width', '200px');
	});

	$('.'+_match.id).on('mouseleave', function(e) {
	    $('.'+_match.id+'t').css('opacity', 0.66);
	    $('.'+_match.id+'t').css('width', '128px');
	});

	$('.'+_match.id).on('click', function(e) {
		if (_match.type == "match") {
			open_match(_match.id);
		}
		else {
			draftPosition = 1;
			open_draft(_match.id, tileGrpid, _match.set);
		}
	    $('.moving_ux').animate({'left': '-100%'}, 250, 'easeInOutCubic'); 
	});
}

//
function setDecks(arg) {
	if (arg != null) {
		decks = arg;//JSON.parse(arg);
	}
	if (sidebarActive == 0 && decks != null) {
		sort_decks();
		var mainDiv = document.getElementById("ux_0");
		mainDiv.innerHTML = '';
		var d = document.createElement("div");
		d.classList.add("list_fill");
		mainDiv.appendChild(d);

		decks.forEach(function(deck, index) {
			var tileGrpid = deck.deckTileId;

			var tile = document.createElement("div");
			tile.classList.add(deck.id+'t');
			tile.classList.add('deck_tile');

			let dfc = '';
			if (cardsDb.get(tileGrpid).dfc == 'DFC_Back')	dfc = 'a';
			if (cardsDb.get(tileGrpid).dfc == 'DFC_Front')	dfc = 'b';
			if (cardsDb.get(tileGrpid).dfc == 'SplitHalf')	dfc = 'a';
			tile.style.backgroundImage = "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+dfc+".jpg)";

			var div = document.createElement("div");
			div.classList.add(deck.id);
			div.classList.add('list_deck');

			var fll = document.createElement("div");
			fll.classList.add('flex_item');

			var flc = document.createElement("div");
			flc.classList.add('flex_item');
			flc.style.flexDirection = "column";

			var flcf = document.createElement("div");
			flcf.classList.add('flex_item');
			flcf.style.flexGrow = 2;

			var flr = document.createElement("div");
			flr.classList.add('flex_item');
			flr.style.flexDirection = "column";

			var flt = document.createElement("div");
			flt.classList.add('flex_top');

			var flb = document.createElement("div");
			flb.classList.add('flex_bottom');

			if (deck.name.indexOf('?=?Loc/Decks/Precon/') != -1) {
				deck.name = deck.name.replace('?=?Loc/Decks/Precon/', '');
			}

			var d = document.createElement("div");
			d.classList.add('list_deck_name');
			d.innerHTML = deck.name;
			flt.appendChild(d);

			var missingCards = false;
			deck.mainDeck.forEach(function(card) {
				var grpId = card.id;
				var type = cardsDb.get(grpId).type;
				if (cardsDb.get(grpId).type.indexOf("Basic Land") == -1) {
					if (cards[grpId] == undefined) {
						missingCards = true
					}
					else if (card.quantity > cards[grpId]) {
						missingCards = true;
					}
				}
			});
			deck.sideboard.forEach(function(card) {
				var grpId = card.id;
				var type = cardsDb.get(grpId).type;
				if (cardsDb.get(grpId).type.indexOf("Basic Land") == -1) {
					if (cards[grpId] == undefined) {
						missingCards = true
					}
					else if (card.quantity > cards[grpId]) {
						missingCards = true;
					}
				}
			});

			if (missingCards) {
				var d = document.createElement("div");
				d.classList.add('decklist_not_owned');
				flt.appendChild(d);
			}


			deck.colors.forEach(function(color) {
				var d = document.createElement("div");
				d.classList.add('mana_20');
				d.classList.add('mana_'+mana[color]);
				flb.appendChild(d);
			});

			var wr = getDeckWinrate(deck.id, deck.lastUpdated);
			if (wr != 0) {
				var d = document.createElement("div");
				d.classList.add('list_deck_winrate');
				d.innerHTML = 'Winrate: '+(wr.total*100).toFixed(2)+'%';
				flr.appendChild(d);

				var d = document.createElement("div");
				d.classList.add('list_deck_winrate');
				d.style.opacity = 0.6;
				d.innerHTML = 'Since last edit: '+(wr.lastEdit*100).toFixed(2)+'%';
				flr.appendChild(d);
			}

			div.appendChild(fll);
			fll.appendChild(tile);
			div.appendChild(flc);
			div.appendChild(flcf);
			flc.appendChild(flt);
			flc.appendChild(flb);
			div.appendChild(flr);
			mainDiv.appendChild(div);

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
}

//
function updateExplore() {
	filterEvent = document.getElementById("query_select").value;
	if (filterEvent == "All") {
		filterEvent = "";
	}
	ipc_send('request_explore', filterEvent.toLowerCase());
}

//
function setExplore(arg, loadMore) {
	document.body.style.cursor = "auto";
	if (arg != null) {
		explore = arg;
	}

	var mainDiv = document.getElementById("ux_0");

	if (loadMore > 0) {
	}
	else {
		loadMore = 25;

		mainDiv.innerHTML = '';

		var d = document.createElement("div");
		d.classList.add("list_fill");
		mainDiv.appendChild(d);// goes down

		// Search box
		var icd = $('<div class="input_container"></div>');
		var label = $('<label style="display: table; margin-top: 6px !important;">Filter by event</label>');
		label.appendTo(icd);
		
		var input = $('<div class="query_explore" style="margin-left: 16px;"></div>');
		var select = $('<select id="query_select"></select>');

		if (eventFilters == null) {
			eventFilters = ['All'];
			for (var i = 0; i < explore.length; i++) {
				let _deck = explore[i];
				let evId = _deck.event.replace(/[0-9]/g, ''); 

				if (!eventFilters.includes(evId)) {
					eventFilters.push(evId); 
				}
			}
		}
		eventFilters.sort(function(a, b){
			if(a < b) return -1;
			if(a > b) return 1;
			return 0;
		})
		for (var i=0; i < eventFilters.length; i++) {
			if (i==0) {
				select.append('<option value="hide">'+eventFilters[i]+'</option>');
			}
			else {
				select.append('<option value="'+eventFilters[i]+'">'+getReadableEvent(eventFilters[i])+'</option>');
			}
		}
		select.appendTo(input);
		selectAdd(select, updateExplore);

		input.appendTo(icd);
		icd.appendTo($("#ux_0"));

		var d = document.createElement("div");
		d.classList.add("list_fill");
		mainDiv.appendChild(d);
		var d = document.createElement("div");
		d.classList.add("list_fill");
		mainDiv.appendChild(d);

		loadExplore = 0;
	}


	//explore.forEach(function(_deck, index) {
	for (var loadEnd = loadExplore + loadMore; loadExplore < loadEnd; loadExplore++) {
		let _deck = explore[loadExplore];
		let index = loadExplore;


		if (_deck.deck_colors == undefined) {
			_deck.deck_colors = [];
		}
		if (_deck.wins == undefined) {
			_deck.wins = 0;
			_deck.losses = 0;
		}

		var tileGrpid = _deck.deck_tile;
		if (!cardsDb.get(tileGrpid)) {
			tileGrpid = 67003;
		}

		var tile = document.createElement("div");
		tile.classList.add(index+"t");
		tile.classList.add("deck_tile");

		let dfc = '';
		if (cardsDb.get(tileGrpid).dfc == 'DFC_Back')	dfc = 'a';
		if (cardsDb.get(tileGrpid).dfc == 'DFC_Front')	dfc = 'b';
		if (cardsDb.get(tileGrpid).dfc == 'SplitHalf')	dfc = 'a';
		tile.style.backgroundImage = "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+dfc+".jpg)";

		var div = document.createElement("div");
		div.classList.add(index);
		div.classList.add("list_deck");

		var fll = document.createElement("div");
		fll.classList.add("flex_item");

		var flc = document.createElement("div");
		flc.classList.add("flex_item");
		flc.style.flexDirection = "column";

		var flcf = document.createElement("div");
		flcf.classList.add("flex_item");
		flcf.style.flexGrow = 2;

		var flr = document.createElement("div");
		flr.classList.add("flex_item");
		flr.style.flexDirection = "column";

		var flt = document.createElement("div");
		flt.classList.add("flex_top");

		var flb = document.createElement("div");
		flb.classList.add("flex_bottom");

		var d = document.createElement("div");
		d.classList.add("list_deck_name");
		d.innerHTML = _deck.deck_name;
		flt.appendChild(d);

		var d = document.createElement("div");
		d.classList.add("list_deck_name_it");
		d.innerHTML = "by "+_deck.player_name;
		flt.appendChild(d);
		
		_deck.deck_colors.forEach(function(color) {
			var d = document.createElement("div");
			d.classList.add("mana_20");
			d.classList.add("mana_"+mana[color]);
			flb.appendChild(d);
		});

		var d = document.createElement("div");
		d.classList.add("list_deck_record");
		d.innerHTML = _deck.wins+' - '+_deck.losses;
		flr.appendChild(d);

		var d = document.createElement("div");
		d.classList.add("list_deck_name_it");
		d.innerHTML = getReadableEvent(_deck.event)+" - "+timeSince(_deck.date*1000)+" ago";
		flr.appendChild(d);

		div.appendChild(fll);
		fll.appendChild(tile);
		div.appendChild(flc);
		div.appendChild(flcf);
		flc.appendChild(flt);
		flc.appendChild(flb);
		div.appendChild(flr);

		mainDiv.appendChild(div);

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
		});

	}
	//$("#ux_0").append('<div class="list_fill"></div>');

	$(this).off();
	$("#ux_0").on('scroll', function() {
		if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
			setExplore(null, 20);
		}
	})

	loadExplore += 20;
}

//
function open_course_request(courseId) {
	ipc_send('renderer_request_course', courseId);
}

// 
function open_deck(i, type) {
	if (type == 0) {
		_deck = decks[i];
	}
	if (type == 1) {
		_deck = i;
	}
	currentOpenDeck = _deck;

	$("#ux_1").html('');

	var top = $('<div class="decklist_top"><div class="button back"></div><div class="deck_name">'+_deck.name+'</div></div>');
	flr = $('<div class="flex_item" style="align-self: center;"></div>');

	_deck.colors.forEach(function(color) {
		var m = $('<div class="mana_20 mana_'+mana[color]+'"></div>');
		flr.append(m);
	});
	top.append(flr);


	var tileGrpid = _deck.deckTileId;
	let dfc = '';
	if (cardsDb.get(tileGrpid).dfc == 'DFC_Back')	dfc = 'a';
	if (cardsDb.get(tileGrpid).dfc == 'DFC_Front')	dfc = 'b';
	if (cardsDb.get(tileGrpid).dfc == 'SplitHalf')	dfc = 'a';

	top.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+dfc+".jpg)");
	var fld = $('<div class="flex_item"></div>');

	var dl = $('<div class="decklist"></div>');
	drawDeck(dl, _deck);

	var stats = $('<div class="stats"></div>');

	$('<div class="button_simple openHistory">History of changes</div>').appendTo(stats);
	$('<div class="button_simple exportDeck">Export to Arena</div>').appendTo(stats);
	$('<div class="button_simple exportDeckStandard">Export to .txt</div>').appendTo(stats);

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

	var cont = $('<div class="pie_container_outer"></div>');

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
	piechart.appendTo(cont);

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
	piechart.appendTo(cont);

	cont.appendTo(stats);

	if (type == 0) {
		var cont = $('<div class="pie_container_outer"></div>');
		var wr = getDeckWinrate(_deck.id, _deck.lastUpdated);
		if (wr != 0) {
			wr.winColors.total = wr.winColors.w+wr.winColors.u+wr.winColors.b+wr.winColors.r+wr.winColors.g;
			wp = wr.winColors.w / wr.winColors.total * 100;
			up = wp+wr.winColors.u / wr.winColors.total * 100;
			bp = up+wr.winColors.b / wr.winColors.total * 100;
			rp = bp+wr.winColors.r / wr.winColors.total * 100;
			gp = rp+wr.winColors.g / wr.winColors.total * 100;
			cp = gp+wr.winColors.c / wr.winColors.total * 100;

			gradient = new ConicGradient({
			    stops: '#E7CA8E '+wp+'%, #AABEDF 0 '+up+'%, #A18E87 0 '+bp+'%, #DD8263 0 '+rp+'%, #B7C89E 0 '+gp+'%, #E3E3E3 0 '+cp+'%', // required
			    size: 400 // Default: Math.max(innerWidth, innerHeight)
			});
			piechart = $('<div class="pie_container"><span>Wins vs colors</span><svg class="pie">'+gradient.svg+'</svg></div>');
			piechart.appendTo(cont);


			wr.lossColors.total = wr.lossColors.w+wr.lossColors.u+wr.lossColors.b+wr.lossColors.r+wr.lossColors.g;
			wp = wr.lossColors.w / wr.lossColors.total * 100;
			up = wp+wr.lossColors.u / wr.lossColors.total * 100;
			bp = up+wr.lossColors.b / wr.lossColors.total * 100;
			rp = bp+wr.lossColors.r / wr.lossColors.total * 100;
			gp = rp+wr.lossColors.g / wr.lossColors.total * 100;
			cp = gp+wr.lossColors.c / wr.lossColors.total * 100;

			gradient = new ConicGradient({
			    stops: '#E7CA8E '+wp+'%, #AABEDF 0 '+up+'%, #A18E87 0 '+bp+'%, #DD8263 0 '+rp+'%, #B7C89E 0 '+gp+'%, #E3E3E3 0 '+cp+'%', // required
			    size: 400 // Default: Math.max(innerWidth, innerHeight)
			});
			piechart = $('<div class="pie_container"><span>Losses vs colors</span><svg class="pie">'+gradient.svg+'</svg></div>');
			piechart.appendTo(cont);
		}
		cont.appendTo(stats);
	}

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
	$(".openHistory").click(function () {
	    ipc_send('get_deck_changes', _deck.id);
	});

	$(".exportDeck").click(function () {
	    var list = get_deck_export(_deck);
	    ipc_send('set_clipboard', list);
	});

	$(".exportDeckStandard").click(function () {
	    var list = get_deck_export_txt(_deck);
	    ipc_send('export_txt', {str: list, name: _deck.name});
	});

	$(".back").click(function () {
	    $('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
	});
}

//
function drawDeck(div, deck) {
	var unique = makeId(4);
	div.html('');
	var prevIndex = 0;
	deck.mainDeck.forEach(function(card) {
		var grpId = card.id;
		var type = cardsDb.get(grpId).type;
		if (prevIndex == 0) {
			addCardSeparator(get_card_type_sort(type), div);
		}
		else if (prevIndex != 0) {
			if (get_card_type_sort(type) != get_card_type_sort(cardsDb.get(prevIndex).type)) {
				addCardSeparator(get_card_type_sort(type), div);
			}
		}

		if (card.quantity > 0) {
			addCardTile(grpId, unique+"a", card.quantity, div);
		}
		
		prevIndex = grpId;
	});

	if (deck.sideboard != undefined) {
		if (deck.sideboard.length > 0) {
			addCardSeparator(99, div);
			var prevIndex = 0;
			deck.sideboard.forEach(function(card) {
				var grpId = card.id;
				var type = cardsDb.get(grpId).type;
				if (card.quantity > 0) {
					addCardTile(grpId, unique+"b", card.quantity, div);
				}
			});
		}
	}
}

//
function setChangesTimeline() {
	var cont = $(".stats");
	cont.html('');


	var time = $('<div class="changes_timeline"></div>')

	changes.sort(compare_changes);

	// CURRENT DECK
	let div = $('<div class="change"></div>');
	var butbox = $('<div class="change_button_cont" style="transform: scaleY(-1);"></div>');
	var button = $('<div class="change_button"></div>');
	button.appendTo(butbox);
	let datbox = $('<div class="change_data"></div>');

	// title
	let title = $('<div class="change_data_box"></div>');
	title.html('Current Deck');

	butbox.appendTo(div);
	datbox.appendTo(div);
	title.appendTo(datbox);
	div.appendTo(time);

	butbox.on('mouseenter', function(e) {
		button.css('width', '32px');
		button.css('height', '32px');
		button.css('top', 'calc(50% - 16px)');
	});

	butbox.on('mouseleave', function(e) {
		button.css('width', '24px');
		button.css('height', '24px');
		button.css('top', 'calc(50% - 12px)');
	});

	butbox.on('click', function(e) {
		var hasc = button.hasClass('change_button_active');

		$(".change_data_box_inside").each(function(index) {
			$(this).css('height', '0px');
		});

		$(".change_button").each(function(index) {
			$(this).removeClass('change_button_active');
		});

		if (!hasc) {
			button.addClass('change_button_active');
		}
	});
	//

	cn = 0;
	changes.forEach(function(change) {
		change.changesMain.sort(compare_changes_inner);
		change.changesSide.sort(compare_changes_inner);

		let div = $('<div class="change"></div>');
		if (cn < changes.length-1) {
			var butbox = $('<div style="background-size: 100% 100% !important;" class="change_button_cont"></div>');
		}
		else {
			var butbox = $('<div class="change_button_cont"></div>');
		}
		var button = $('<div class="change_button"></div>');
		button.appendTo(butbox);
		let datbox = $('<div class="change_data"></div>');

		// title
		let title = $('<div class="change_data_box"></div>');
		// inside
		let data  = $('<div class="change_data_box_inside"></div>');
		var innherH = 54;
		let nc = 0;
		if (change.changesMain.length > 0) {
			let dd = $('<div class="change_item_box"></div>');
			addCardSeparator(98, dd);
			dd.appendTo(data);
		}

		change.changesMain.forEach(function(c) {
			innherH += 30;
			if (c.quantity > 0)	nc += c.quantity;
			let dd = $('<div class="change_item_box"></div>');
			if (c.quantity > 0)	{
				let ic  = $('<div class="change_add"></div>');
				ic.appendTo(dd);
			}
			else {
				let ic  = $('<div class="change_remove"></div>');
				ic.appendTo(dd);
			}

			addCardTile(c.id, 'chm'+cn, Math.abs(c.quantity), dd);
			dd.appendTo(data);
		});

		if (change.changesSide.length > 0) {
			let dd = $('<div class="change_item_box"></div>');
			addCardSeparator(99, dd);
			innherH += 30;
			dd.appendTo(data);
		}

		change.changesSide.forEach(function(c) {
			innherH += 30;
			if (c.quantity > 0)	nc += c.quantity;
			let dd = $('<div class="change_item_box"></div>');
			if (c.quantity > 0)	{
				let ic  = $('<div class="change_add"></div>');
				ic.appendTo(dd);
			}
			else {
				let ic  = $('<div class="change_remove"></div>');
				ic.appendTo(dd);
			}

			addCardTile(c.id, 'chs'+cn, Math.abs(c.quantity), dd);
			dd.appendTo(data);
		});

		title.html(nc+' changes, '+timeSince(Date.parse(change.date))+' ago.');

		butbox.appendTo(div);
		datbox.appendTo(div);
		title.appendTo(datbox);
		data.appendTo(datbox);
		div.appendTo(time);

		butbox.on('mouseenter', function(e) {
			button.css('width', '32px');
			button.css('height', '32px');
			button.css('top', 'calc(50% - 16px)');
		});

		butbox.on('mouseleave', function(e) {
			button.css('width', '24px');
			button.css('height', '24px');
			button.css('top', 'calc(50% - 12px)');
		});

		butbox.on('click', function(e) {
			// This requires some UX indicators
			//drawDeck($('.decklist'), {mainDeck: change.previousMain, sideboard: change.previousSide});
			var hasc = button.hasClass('change_button_active');

			$(".change_data_box_inside").each(function(index) {
				$(this).css('height', '0px');
			});

			$(".change_button").each(function(index) {
				$(this).removeClass('change_button_active');
			});

			if (!hasc) {
				button.addClass('change_button_active');
				data.css('height', innherH+'px');
			}
		});

		cn++;
	})

	$('<div class="button_simple openDeck">View stats</div>').appendTo(cont);

	$(".openDeck").click(function () {
		open_deck(currentOpenDeck);
	});
	time.appendTo(cont);
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
        var d = $('<div style="width: '+cardSize+'px !important;" class="draft_card"></div>');
        var img = $('<img style="width: '+cardSize+'px !important;" class="draft_card_img"></img>');
        if (grpId == pick && draftPosition % 2 == 0) {
        	img.addClass('draft_card_picked');
        }
        var card = cardsDb.get(grpId);
		img.attr("src", "https://img.scryfall.com/cards/"+cardQuality+"/en/"+get_set_scryfall(card.set)+"/"+card.cid+dfc+".jpg");
		img.appendTo(d);

		addCardHover(img, card);

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

	if (match.playerDeck.colors != undefined) {		
		match.playerDeck.colors.forEach(function(color) {
			var m = $('<div class="mana_20 mana_'+mana[color]+'"></div>');
			flr.append(m);
		});
	}
	top.append(flr);


	var tileGrpid = match.playerDeck.deckTileId;
	top.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(cardsDb.get(tileGrpid).set)+"/"+cardsDb.get(tileGrpid).cid+".jpg)");
	var fld = $('<div class="flex_item"></div>');

	// this is a mess
	var flt = $('<div class="flex_item"></div>')
	var fltl = $('<div class="flex_item"></div>')
	var r = $('<div class="rank"></div>'); r.appendTo(fltl);

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

	drawDeck(dl, match.playerDeck);

	var flt = $('<div class="flex_item" style="flex-direction: row-reverse;"></div>')
	var fltl = $('<div class="flex_item"></div>')
	var r = $('<div class="rank"></div>'); r.appendTo(fltl);

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

	match.oppDeck.mainDeck.sort(compare_cards);
	match.oppDeck.sideboard.sort(compare_cards);
	drawDeck(odl, match.oppDeck);

	$('<div class="button_simple exportDeck">Export to Arena</div>').appendTo(odl);
	$('<div class="button_simple exportDeckStandard">Export to .txt</div>').appendTo(odl);

	dl.appendTo(fld);
	odl.appendTo(fld);
	$("#ux_1").append(top);
	$("#ux_1").append(fld);
	
	$(".exportDeck").click(function () {
	    var list = get_deck_export(deck);
	    ipc_send('set_clipboard', list);
	});
	$(".exportDeckStandard").click(function () {
	    var list = get_deck_export_txt(deck);
	    ipc_send('export_txt', {str: list, name: match.opponent.name+"'s deck"});
	});

	$(".back").click(function () {
	    $('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
	});
}

//
function open_economy() {
	$("#ux_0").html('');
	$("#ux_1").html('');
	var div = $('<div class="economy"></div>');
	$('<div class="chart_container"><canvas id="goldChart"></canvas></div>').appendTo(div);
	$('<div class="chart_container"><canvas id="wildcardsChart"></canvas></div>').appendTo(div);
	$('<div class="chart_container"><canvas id="gemsChart"></canvas></div>').appendTo(div);

	$("#ux_0").append(div);

	// Set gold chart
	var labels = [];
	var data = [];

	goldHistory.forEach(function(item) {
		var date = new Date(item.date);
		labels.push(date);
		data.push(item.value);
	});

 	var ctx = document.getElementById("goldChart").getContext('2d');
	var myChart = new Chart(ctx, {
	    type: 'bar',
	    data: {
	        labels: labels,
	        datasets: [{
	            label: 'Gold',
				data: data,
				type: 'line',
				fill: true,
	            backgroundColor: [
	                'rgba(221, 130, 99, 0.5)',
	            ],
	            borderColor: [
	                'rgba(221, 130, 99, 0.5)',
	            ]
	        }]
	    },
	    options: {
	    	responsive: true,
			elements: {
				line: {
					tension: 0.000001
				}
			},
			scales: {
				xAxes: [{
					type: 'time',
					distribution: 'series',
					display: true,
	                time: {
	                    unit: 'day'
	                },
					ticks: {
						source: 'labels'
					}
				}],
				yAxes: [{
					display: true
				}]
			}
	    }
	});

	// Set wildcards chart
	wcCommon = [];
	wcUncommon = [];
	wcRare = [];
	wcMythic = [];
	labels = [];
	wildcardHistory.forEach(function(item) {
		var date = new Date(item.date);
		labels.push(date);
		wcCommon.push(item.value.wcCommon);
		wcUncommon.push(item.value.wcUncommon);
		wcRare.push(item.value.wcRare);
		wcMythic.push(item.value.wcMythic);
	});

	var ctx = document.getElementById("wildcardsChart").getContext('2d');
	var myChart = new Chart(ctx, {
	    type: 'bar',
	    data: {
	        labels: labels,
	        datasets: [{
	            label: 'Common',
				data: wcCommon,
				type: 'line',
	            borderColor: [
	                'rgba(255, 255, 255, 0.5)',
	            ]
	        },{
	            label: 'Uncommon',
				data: wcUncommon,
				type: 'line',
	            borderColor: [
	                'rgba(166, 206, 255, 0.5)',
	            ]
	        },{
	            label: 'Rare',
				data: wcRare,
				type: 'line',
				fill: true,
	            borderColor: [
	                'rgba(255, 186, 0, 0.5)',
	            ]
	        },{
	            label: 'Mythic Rare',
				data: wcMythic,
				type: 'line',
				fill: true,
	            borderColor: [
	                'rgba(255, 27, 0, 0.5)',
	            ]
	        }]
	    },
	    options: {
	    	responsive: true,
			elements: {
				line: {
					tension: 0.000001
				}
			},
			scales: {
				xAxes: [{
					type: 'time',
					distribution: 'series',
	                time: {
	                    unit: 'day'
	                },
					ticks: {
						source: 'labels'
					}
				}],
				yAxes: [{
					display: true
				}]
			}
	    }
	});

	// Set gems chart
	labels = [];
	data = [];
	gemsHistory.forEach(function(item) {
		var date = new Date(item.date);
		labels.push(date);
		data.push(item.value);
	});

	var ctx = document.getElementById("gemsChart").getContext('2d');
	var myChart = new Chart(ctx, {
	    type: 'bar',
	    data: {
	        labels: labels,
	        datasets: [{
	            label: 'gems',
				data: data,
				type: 'line',
				fill: true,
	            backgroundColor: [
	                'rgba(183, 200, 158, 0.5)',
	            ],
	            borderColor: [
	                'rgba(183, 200, 158, 0.5)',
	            ]
	        }]
	    },
	    options: {
	    	responsive: true,
			elements: {
				line: {
					tension: 0.000001
				}
			},
			scales: {
				xAxes: [{
					type: 'time',
					distribution: 'series',
	                time: {
	                    unit: 'day'
	                },
					ticks: {
						source: 'labels'
					}
				}],
				yAxes: [{
					display: true
				}]
			}
	    }
	});
}

//
function open_cards() {
	$("#ux_0").html('');
	$("#ux_1").html('');
	var div = $('<div class="inventory"></div>');
	
	var basicFilters = $('<div class="inventory_filters_basic"></div>');
	var flex = $('<div class="inventory_flex"></div>');

	var icd = $('<div class="input_container"></div>');
	var label = $('<label style="display: table">Search</label>');
	label.appendTo(icd);
	var input = $('<input type="search" id="query_name" autocomplete="off" />');
	input.appendTo(icd);
	icd.appendTo(flex);

	input.keypress(function(e) {
		if (e.which == 13) {
			printCards();
		}
	});

	var searchButton = $('<div class="button_simple button_thin" onClick="printCards()">Search</div>');	
	searchButton.appendTo(flex);
	var advancedButton = $('<div class="button_simple button_thin" onClick="expandFilters()">Advanced filters</div>');
	advancedButton.appendTo(flex);

	flex.appendTo(basicFilters);
	var flex = $('<div class="inventory_flex"></div>');

	var exp   = $('<div class="button_simple button_thin" onClick="exportCollection()">Copy to Clipboard</div>');
	exp.appendTo(flex);
	var reset = $('<div class="button_simple button_thin" onClick="resetFilters()">Reset</div>');
	reset.appendTo(flex);
	var stats = $('<div class="button_simple button_thin stats_button" onClick="printStats()">Collection Stats</div>');
	stats.appendTo(flex);

	flex.appendTo(basicFilters);


	// "ADVANCED" FILTERS
	var filters = $('<div class="inventory_filters"></div>');

	var sets = $('<div class="sets_container"><label>Filter by set:</label></div>');
	setsList.forEach(function(set) {
		var setbutton = $('<div class="set_filter set_filter_on" style="background-image: url(../images/sets/'+get_set_code(set)+'.png)" title="'+set+'"></div>');
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
		});
	});
	sets.appendTo(filters);

	var manas = $('<div class="sets_container"><label>Filter by color:</label></div>');
	var ms = ["w", "u", "b", "r", "g"];
	ms.forEach(function(s, i) {
		var mi = [1, 2, 3, 4, 5];
		var manabutton = $('<div class="mana_filter mana_filter_on" style="background-image: url(../images/'+s+'20.png)"></div>');
		manabutton.appendTo(manas);
		manabutton.click(function() {
			if (manabutton.hasClass('mana_filter_on')) {
				manabutton.removeClass('mana_filter_on');
				filteredMana.push(mi[i]);
			}
			else {
				manabutton.addClass('mana_filter_on');
				let n = filteredMana.indexOf(mi[i]);
				if (n > -1) {
					filteredMana.splice(n, 1);
				}
			}
		});
	});
	manas.appendTo(filters);

	var cont = $('<div class="buttons_container"></div>');
	add_checkbox_search(cont, 'Show unowned', 'query_unown', false);
	add_checkbox_search(cont, 'Newly aquired only', 'query_new', false);
	add_checkbox_search(cont, 'Require multicolored', 'query_multicolor', false);
	add_checkbox_search(cont, 'Exclude unselected', 'query_exclude', false);
	cont.appendTo(filters);

	var cont = $('<div class="buttons_container"></div>');
	add_checkbox_search(cont, 'Common', 'query_common', true);
	add_checkbox_search(cont, 'Uncommon', 'query_uncommon', true);
	add_checkbox_search(cont, 'Rare', 'query_rare', true);
	add_checkbox_search(cont, 'Mythic Rare', 'query_mythic', true);
	cont.appendTo(filters);
	
	var cont = $('<div class="buttons_container"></div>');

	var icd = $('<div class="input_container auto_width"></div>');
	var label = $('<label style="display: table">CMC:</label>');
	label.appendTo(icd);
	var input = $('<input type="number" id="query_cmc" autocomplete="off" />');
	input.appendTo(icd);
	icd.appendTo(cont);

	add_checkbox_search(cont, 'Lower than', 'query_cmclower', false);
	add_checkbox_search(cont, 'Equal to', 'query_cmcequal', true);
	add_checkbox_search(cont, 'Higher than', 'query_cmchigher', false);
	
	cont.appendTo(filters);
	
	$("#ux_0").append(basicFilters);
	$("#ux_0").append(filters);
	$("#ux_0").append(div);


    $('#query_cmclower').change(function() {
        if (document.getElementById("query_cmclower").checked == true) {
            document.getElementById("query_cmchigher").checked = false;
        }
    });

    $('#query_cmchigher').change(function() {
        if (document.getElementById("query_cmchigher").checked == true) {
            document.getElementById("query_cmclower").checked = false;
        }
    });

	filterCmcLower 	= document.getElementById("query_cmclower");
	filterCmcEqual 	= document.getElementById("query_cmcequal");
	filterCmcHigher = document.getElementById("query_cmchigher");

	printCards();
}

//
function add_checkbox_search(div, label, iid, def) {
	var label = $('<label class="check_container">'+label+'</label>');
	var check_new = $('<input type="checkbox" id="'+iid+'" />');
	check_new.appendTo(label);
	check_new.prop('checked', def);

	var span = $('<span class="checkmark"></span>');
	span.appendTo(label);
	label.appendTo(div);
}

function expandFilters() {
	var div = $('.inventory_filters');
	if (div.css('opacity') == 1) {
		div.css('height', '0px');
		div.css('opacity', 0);
		$('.inventory').show();

	}
	else {
		div.css('height', 'calc(100% - 122px)');
		div.css('opacity', 1);
		setTimeout(function() {
			$('.inventory').hide();
		}, 200);
	}
}

function resetFilters() {
	filteredSets = [];
	filteredMana = [];
	
	$(".set_filter").each(function( index ) {
		$( this ).removeClass('set_filter_on');
		$( this ).addClass('set_filter_on');
	});
	$(".mana_filter").each(function( index ) {
		$( this ).removeClass('mana_filter_on');
		$( this ).addClass('mana_filter_on');
	});

	document.getElementById("query_name").value = "";
	document.getElementById("query_unown").checked = false;
	document.getElementById("query_new").checked = false;
	document.getElementById("query_multicolor").checked = false;
	document.getElementById("query_exclude").checked = false;

	document.getElementById("query_common").checked = true;
	document.getElementById("query_uncommon").checked = true;
	document.getElementById("query_rare").checked = true;
	document.getElementById("query_mythic").checked = true;

	document.getElementById("query_cmc").value = "";
	document.getElementById("query_cmclower").checked = false;
	document.getElementById("query_cmcequal").checked = true;
	document.getElementById("query_cmchigher").checked = false;

	printCards();
}

//
function exportCollection() {
	var str = get_collection_export();
	ipc_send('set_clipboard', str);
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
		$('<div class="stats_set_icon" style="background-image: url(../images/sets/'+get_set_code(set)+'.png)"><span>'+set+' <i>('+stats[set].ownedCards+'/'+stats[set].totalCards+', '+Math.round(stats[set].ownedCards/stats[set].totalCards*100)+'%)</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats[set].ownedCards/stats[set].totalCards*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(mainstats);

		setdiv.click(function() {
			var substats = $(".sub_stats");
			substats.html('');
			$('<label>'+set+' Completion</label>').appendTo(substats);
			var setdiv = $('<div class="stats_set_completion"></div>');
			$('<div class="stats_rarity_icon" style="background-image: url(../images/wc_common.png)"><span>Commons <i>('+stats[set].ownedCommon+'/'+stats[set].totalCommon+', '+Math.round(stats[set].ownedCommon/stats[set].totalCommon*100)+'%)</i></span></div>').appendTo(setdiv);
			$('<div class="stats_set_bar" style="width: '+stats[set].ownedCommon/stats[set].totalCommon*100+'%"></div>').appendTo(setdiv);
			setdiv.appendTo(substats);
			var setdiv = $('<div class="stats_set_completion"></div>');
			$('<div class="stats_rarity_icon" style="background-image: url(../images/wc_uncommon.png)"><span>Uncommons <i>('+stats[set].ownedUncommon+'/'+stats[set].totalUncommon+', '+Math.round(stats[set].ownedUncommon/stats[set].totalUncommon*100)+'%)</i></span></div>').appendTo(setdiv);
			$('<div class="stats_set_bar" style="width: '+stats[set].ownedUncommon/stats[set].totalUncommon*100+'%"></div>').appendTo(setdiv);
			setdiv.appendTo(substats);
			var setdiv = $('<div class="stats_set_completion"></div>');
			$('<div class="stats_rarity_icon" style="background-image: url(../images/wc_rare.png)"><span>Rares <i>('+stats[set].ownedRare+'/'+stats[set].totalRare+', '+Math.round(stats[set].ownedRare/stats[set].totalRare*100)+'%)</i></span></div>').appendTo(setdiv);
			$('<div class="stats_set_bar" style="width: '+stats[set].ownedRare/stats[set].totalRare*100+'%"></div>').appendTo(setdiv);
			setdiv.appendTo(substats);
			if (stats[set].totalMythic == 0)	stats[set].totalMythic = 1;
			var setdiv = $('<div class="stats_set_completion"></div>');
			$('<div class="stats_rarity_icon" style="background-image: url(../images/wc_mythic.png)"><span>Mythics <i>('+stats[set].ownedMythic+'/'+stats[set].totalMythic+', '+Math.round(stats[set].ownedMythic/stats[set].totalMythic*100)+'%)</i></span></div>').appendTo(setdiv);
			$('<div class="stats_set_bar" style="width: '+stats[set].ownedMythic/stats[set].totalMythic*100+'%"></div>').appendTo(setdiv);
			setdiv.appendTo(substats);
		});
	});

	// Complete collection sats
	var setdiv = $('<div class="stats_set_completion"></div>');
	$('<div class="stats_set_icon" style="background-image: url(../images/sets/pw.png)"><span>Complete collection <i>('+stats.ownedCards+'/'+stats.totalCards+', '+Math.round(stats.ownedCards/stats.totalCards*100)+'%)</i></span></div>').appendTo(setdiv);
	$('<div class="stats_set_bar" style="width: '+stats.ownedCards/stats.totalCards*100+'%"></div>').appendTo(setdiv);
	setdiv.appendTo(mainstats);

	setdiv.click(function() {
		var substats = $(".sub_stats");
		substats.html('');
		$('<label>Complete collection completion</label>').appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(../images/wc_common.png)"><span>Commons <i>('+stats.ownedCommon+'/'+stats.totalCommon+', '+Math.round(stats.ownedCommon/stats.totalCommon*100)+'%)</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedCommon/stats.totalCommon*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(../images/wc_uncommon.png)"><span>Uncommons <i>('+stats.ownedUncommon+'/'+stats.totalUncommon+', '+Math.round(stats.ownedUncommon/stats.totalUncommon*100)+'%)</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedUncommon/stats.totalUncommon*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(../images/wc_rare.png)"><span>Rares <i>('+stats.ownedRare+'/'+stats.totalRare+', '+Math.round(stats.ownedRare/stats.totalRare*100)+'%)</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedRare/stats.totalRare*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(../images/wc_mythic.png)"><span>Mythics <i>('+stats.ownedMythic+'/'+stats.totalMythic+', '+Math.round(stats.ownedMythic/stats.totalMythic*100)+'%)</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedMythic/stats.totalMythic*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
	});

	// Singleton collection sats
	var setdiv = $('<div class="stats_set_completion"></div>');
	$('<div class="stats_set_icon" style="background-image: url(../images/sets/pw.png)"><span>Singles <i>('+stats.ownedSingles+'/'+stats.totalSingles+', '+Math.round(stats.ownedSingles/stats.totalSingles*100)+'%)</i></span></div>').appendTo(setdiv);
	$('<div class="stats_set_bar" style="width: '+stats.ownedSingles/stats.totalSingles*100+'%"></div>').appendTo(setdiv);
	setdiv.appendTo(mainstats);

	setdiv.click(function() {
		var substats = $(".sub_stats");
		substats.html('');
		$('<label>Singles completion</label>').appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(../images/wc_common.png)"><span>Commons <i>('+stats.ownedSinglesCommon+'/'+stats.totalSinglesCommon+', '+Math.round(stats.ownedSinglesCommon/stats.totalSinglesCommon*100)+'%)</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedSinglesCommon/stats.totalSinglesCommon*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(../images/wc_uncommon.png)"><span>Uncommons <i>('+stats.ownedSinglesUncommon+'/'+stats.totalSinglesUncommon+', '+Math.round(stats.ownedSinglesUncommon/stats.totalSinglesUncommon*100)+'%)</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedSinglesUncommon/stats.totalSinglesUncommon*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(../images/wc_rare.png)"><span>Rares <i>('+stats.ownedSinglesRare+'/'+stats.totalSinglesRare+', '+Math.round(stats.ownedSinglesRare/stats.totalSinglesRare*100)+'%)</i></span></div>').appendTo(setdiv);
		$('<div class="stats_set_bar" style="width: '+stats.ownedSinglesRare/stats.totalSinglesRare*100+'%"></div>').appendTo(setdiv);
		setdiv.appendTo(substats);
		var setdiv = $('<div class="stats_set_completion"></div>');
		$('<div class="stats_rarity_icon" style="background-image: url(../images/wc_mythic.png)"><span>Mythics <i>('+stats.ownedSinglesMythic+'/'+stats.totalSinglesMythic+', '+Math.round(stats.ownedSinglesMythic/stats.totalSinglesMythic*100)+'%)</i></span></div>').appendTo(setdiv);
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
	var div = $('.inventory_filters');
	div.css('height', '0px');
	div.css('opacity', 0);
	$('.inventory').show();

	div = $(".inventory");
	div.html('');

	var paging = $('<div class="paging_container"></div>');
	div.append(paging);

	filterName  	= document.getElementById("query_name").value.toLowerCase();
	filterUnown		= document.getElementById("query_unown").checked;
	filterNew   	= document.getElementById("query_new");
	filterMulti 	= document.getElementById("query_multicolor");
	filterExclude 	= document.getElementById("query_exclude");

	filterCommon 	= document.getElementById("query_common");
	filterUncommon 	= document.getElementById("query_uncommon");
	filterRare 		= document.getElementById("query_rare");
	filterMythic 	= document.getElementById("query_mythic");

	filterCMC  		= document.getElementById("query_cmc").value;
	filterCmcLower 	= document.getElementById("query_cmclower").checked;
	filterCmcEqual 	= document.getElementById("query_cmcequal").checked;
	filterCmcHigher = document.getElementById("query_cmchigher").checked;

	var totalCards = 0;
	if (filterUnown) {
		var list = cardsDb.getAll();
	}
	else {
		var list = cards;
	}
	
	
	var keysSorted = Object.keys(list).sort( collectionSortName );
	var keysSorted = Object.keys(list).sort( collectionSortSet );
	var keysSorted = Object.keys(list).sort( collectionSortRarity );
	var keysSorted = Object.keys(list).sort( collectionSortCmc );

    for (n=0; n<keysSorted.length; n++) {
		let key = keysSorted[n];
	
		let grpId = key;
		let card = cardsDb.get(grpId);
    	let doDraw = true;

    	let name = card.name.toLowerCase();
    	let type = card.type.toLowerCase();
    	let rarity = card.rarity;
    	let cost = card.cost;
    	let cmc = card.cmc;
    	let set  = card.set;

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

    	if (filterCMC && doDraw) {
    		if (filterCmcLower && filterCmcEqual) {
    			if (cmc > filterCMC) {
    				doDraw = false;
    			}
    		}
    		else if (filterCmcHigher && filterCmcEqual) {
    			if (cmc < filterCMC) {
    				doDraw = false;
    			}
    		}
    		else if (filterCmcLower && !filterCmcEqual) {
    			if (cmc >= filterCMC) {
    				doDraw = false;
    			}
    		}
    		else if (filterCmcHigher && !filterCmcEqual) {
    			if (cmc <= filterCMC) {
    				doDraw = false;
    			}
    		}
    		else if (!filterCmcHigher && !filterCmcLower && filterCmcEqual) {
    			if (cmc != filterCMC) {
    				doDraw = false;
    			}
    		}
    	}

    	switch (rarity) {
    		case 'land':
    			if (!filterCommon.checked) 		doDraw = false; break;
    		case 'common':
    			if (!filterCommon.checked) 		doDraw = false; break;
    		case 'uncommon':
    			if (!filterUncommon.checked) 	doDraw = false; break;
    		case 'rare':
    			if (!filterRare.checked) 		doDraw = false; break;
    		case 'mythic':
    			if (!filterMythic.checked) 		doDraw = false; break;
			default:
				doDraw = false;
    			break;
		}

		if (filterExclude.checked && cost.length == 0) {
			doDraw = false;
		}
		else {
			let s = [];
			let generic = false;
			cost.forEach(function(m) {
				if (m.color < 6 && m.color > 0) {
					s[m.color] = 1;
					if (filterExclude.checked && !filteredMana.includes(m.color)) {
						doDraw = false;
					}
				}
				if (m.color > 6) {
					generic = true;
				}
			});
			let ms = s.reduce((a, b) => a + b, 0);
			if ((generic && ms == 0) && filterExclude.checked) {
				doDraw = false;
			}
			if (filteredMana.length > 0) {
				let su = 0;
				filteredMana.forEach( function(m) {
					if (s[m] == 1) {
						su ++;
					}
				});
				if (su == 0) {
					doDraw = false;
				}
			}
			if (filterMulti.checked && ms < 2) {
				doDraw = false;
			}
		}

    	if (doDraw) {
    		totalCards++;
    	}

    	if (totalCards < collectionPage*100 || totalCards > collectionPage*100+99) {
    		doDraw = false;
    	}

		let dfc = '';
		if (card.dfc == 'DFC_Back')	 dfc = 'a';
		if (card.dfc == 'DFC_Front') dfc = 'b';
		if (card.dfc == 'SplitHalf') dfc = 'a';
		if (dfc == 'b') {
			doDraw = false;
		}

    	if (doDraw) {
	        var d = $('<div style="width: '+cardSize+'px !important;" class="inventory_card"></div>');

	        for (let i=0; i<4; i++) {
	        	if (cardsNew[key] != undefined && i < cardsNew[key]) {
				    $('<div style="width: '+cardSize/4+'px;" class="inventory_card_quantity_orange"></div>').appendTo(d);
	        	}
	        	else if (i < cards[key]) {
			        $('<div style="width: '+cardSize/4+'px;" class="inventory_card_quantity_green"></div>').appendTo(d);
	        	}
	        	else {
			        $('<div style="width: '+cardSize/4+'px;" class="inventory_card_quantity_gray"></div>').appendTo(d);
	        	}
	        }

	        var img = $('<img style="width: '+cardSize+'px !important;" class="inventory_card_img"></img>');
			img.attr("src", "https://img.scryfall.com/cards/"+cardQuality+"/en/"+get_set_scryfall(card.set)+"/"+card.cid+dfc+".jpg");
			img.appendTo(d);

			addCardHover(img, card);

			img.on('click', function(e) {
				if (cardsDb.get(grpId).dfc == 'SplitHalf')	{
					card = cardsDb.get(card.dfcId);
				}
				let newname = card.name.split(' ').join('-');

				shell.openExternal('https://scryfall.com/card/'+get_set_scryfall(card.set)+'/'+card.cid+'/'+card.name);
			});

			d.appendTo(div);
		}
    }

	var paging_bottom = $('<div class="paging_container"></div>');
	div.append(paging_bottom);

	if (collectionPage <= 0) {
		but = $('<div class="paging_button_disabled"> \< </div>');
	}
	else {
		but = $('<div class="paging_button" onClick="setCollectionPage('+(collectionPage-1)+')"> \< </div>');
	}

	paging.append(but);
	paging_bottom.append(but.clone());

	var totalPages = Math.ceil(totalCards / 100);
	for (var n=0; n<totalPages; n++) {
		but = $('<div class="paging_button" onClick="setCollectionPage('+(n)+')">'+n+'</div>');
		if (collectionPage == n) {
			but.addClass("paging_active");
		}
		paging.append(but);
		paging_bottom.append(but.clone());
	}
	if (collectionPage >= totalPages-1) {
		but = $('<div class="paging_button_disabled"> \> </div>');
	}
	else {
		but = $('<div class="paging_button" onClick="setCollectionPage('+(collectionPage+1)+')"> \> </div>');
	}
	paging.append(but);
	paging_bottom.append(but.clone());
}


//
function setCollectionPage(page) {
	collectionPage = page;
	printCards();
}

//
function add_checkbox(div, label, iid, def) {
	var label = $('<label class="check_container">'+label+'</label>');
	label.appendTo(div);
	var check_new = $('<input type="checkbox" id="'+iid+'" onclick="updateSettings()" />');
	check_new.appendTo(label);
	check_new.prop('checked', def);

	var span = $('<span class="checkmark"></span>');
	span.appendTo(label);
}

//
function open_settings() {
	$("#ux_0").html('');
	var div = $('<div class="settings_page"></div>');

	// Launch on startup
	div.append('<div class="settings_title">Behaviour</div>');

	add_checkbox(div, 'Launch on startup', 'settings_startup', settings.startup);
	add_checkbox(div, 'Close main window on match found', 'settings_closeonmatch', settings.close_on_match);
	add_checkbox(div, 'Close to tray', 'settings_closetotray', settings.close_to_tray);
	add_checkbox(div, 'Sound when priority changes', 'settings_soundpriority', settings.sound_priority);

	div.append('<div class="settings_title">Overlay</div>');

	add_checkbox(div, 'Always on top', 'settings_overlay_ontop', settings.overlay_ontop);
	add_checkbox(div, 'Show overlay', 'settings_showoverlay', settings.show_overlay);
	add_checkbox(div, 'Persistent overlay <i>(useful for OBS setup)</i>', 'settings_showoverlayalways', settings.show_overlay_always);

	add_checkbox(div, 'Show top bar', 'settings_overlay_top', settings.overlay_top);
	add_checkbox(div, 'Show title', 'settings_overlay_title', settings.overlay_title);
	add_checkbox(div, 'Show deck/lists', 'settings_overlay_deck', settings.overlay_deck);
	add_checkbox(div, 'Show clock', 'settings_overlay_clock', settings.overlay_clock);
	add_checkbox(div, 'Show sideboard', 'settings_overlay_sideboard', settings.overlay_sideboard);

	div.append('<div class="settings_title">Visual</div>');

	var label = $('<label class="but_container_label">Cards quality:</label>');
	label.appendTo(div);
	var button = $('<div class="button_simple button_long" style="margin-left: 32px;" onclick="changeQuality(this)">'+cardQuality+'</div>');
	button.appendTo(label);

	var slider = $('<div class="slidecontainer_settings"></div>');
	slider.appendTo(div);
	var sliderlabel = $('<label style="width: 400px; !important" class="card_size_container">Cards size: '+cardSize+'px</label>');
	sliderlabel.appendTo(slider);
	var sliderInput = $('<input type="range" min="0" max="20" value="'+cardSizePos+'" class="slider sliderA" id="myRange">');
	sliderInput.appendTo(slider);

	var d = $('<div style="width: '+cardSize+'px; !important" class="inventory_card_settings"></div>');
	var img = $('<img style="width: '+cardSize+'px; !important" class="inventory_card_settings_img"></img>');
	img.attr("src", "https://img.scryfall.com/cards/"+cardQuality+"/en/m19/"+Math.round(Math.random()*314)+".jpg");
	img.appendTo(d);

	d.appendTo(slider);

	/*
	var alphaSlider = $('<div class="slidecontainer_settings"></div>');
	alphaSlider.appendTo(div);
	var alphasliderlabel = $('<label style="width: 400px; !important" class="card_size_container">Overlay transparency: '+overlayAlpha+'</label>');
	alphasliderlabel.appendTo(alphaSlider);
	var sliderInput = $('<input type="range" min="0" max="10" value="'+overlayAlpha*10+'" class="slider sliderB" id="myRange">');
	sliderInput.appendTo(alphaSlider);
	*/

	div.append('<div class="settings_title">Privacy</div>');
	add_checkbox(div, 'Anonymous sharing <i>(makes your username anonymous on Explore)</i>', 'settings_anon_explore', settings.anon_explore);
	add_checkbox(div, 'Online sharing <i>(when disabled, blocks any connections with our servers)</i>', 'settings_senddata', settings.send_data);

	// Erase data
	var label = $('<label class="check_container_but"></label>');
	label.appendTo(div);
	var button = $('<div class="button_simple button_long" onclick="eraseData()">Erase my shared data</div>');
	button.appendTo(label);

	$("#ux_0").append(div);

	$(".sliderA").off();

	$(".sliderA").on('click mousemove', function() {
		cardSizePos = Math.round(parseInt(this.value));
		cardSize = 100+(cardSizePos*10);
		sliderlabel.html('Cards size: '+cardSize+'px');

		$('.inventory_card_settings').css('width', '');
		var styles = $('.inventory_card_settings').attr('style');
		styles += 'width: '+cardSize+'px !important;'
		$('.inventory_card_settings').attr('style', styles);

		$('.inventory_card_settings_img').css('width', '');
		var styles = $('.inventory_card_settings_img').attr('style');
		styles += 'width: '+cardSize+'px !important;'
		$('.inventory_card_settings_img').attr('style', styles);
	});

	$(".sliderA").on('click mouseup', function() {
		cardSizePos = Math.round(parseInt(this.value));
		updateSettings();
	});

	$(".sliderB").off();

	$(".sliderB").on('click mousemove', function() {
		overlayAlpha = parseInt(this.value)/10;
		alphasliderlabel.html('Overlay transparency: '+overlayAlpha);
	});

	$(".sliderB").on('click mouseup', function() {
		overlayAlpha = parseInt(this.value)/10;
		updateSettings();
	});

}

//
function changeQuality(dom) {
	if (cardQuality == "normal") {
		cardQuality = "large";
	}
	else if (cardQuality == "large") {
		cardQuality = "small";
	}
	else if (cardQuality == "small") {
		cardQuality = "normal";
	}
	dom.innerHTML = cardQuality;
	updateSettings();
	open_settings();
}

//
function eraseData() {
	if (confirm('This will erase all of your decks and events shared online, are you sure?')) {
		ipc_send('renderer_erase_data', true);
	} else {
		return;
	}
}

//
function updateSettings() {
	var startup = document.getElementById("settings_startup").checked;
	var showOverlay = document.getElementById("settings_showoverlay").checked;
	var showOverlayAlways = document.getElementById("settings_showoverlayalways").checked;
	var soundPriority = document.getElementById("settings_soundpriority").checked;

	var overlayOnTop = document.getElementById("settings_overlay_ontop").checked;
	var closeToTray = document.getElementById("settings_closetotray").checked;
	var sendData = document.getElementById("settings_senddata").checked;
	var anonExplore = document.getElementById("settings_anon_explore").checked;

	var closeOnMatch = document.getElementById("settings_closeonmatch").checked;

	var overlayTop = document.getElementById("settings_overlay_top").checked;
	var overlayTitle = document.getElementById("settings_overlay_title").checked;
	var overlayDeck = document.getElementById("settings_overlay_deck").checked;
	var overlayClock = document.getElementById("settings_overlay_clock").checked;
	var overlaySideboard = document.getElementById("settings_overlay_sideboard").checked;

	settings = {
		sound_priority: soundPriority,
		show_overlay: showOverlay,
		show_overlay_always: showOverlayAlways,
		startup: startup,
		close_to_tray: closeToTray,
		send_data: sendData,
		close_on_match: closeOnMatch,
		cards_size: cardSizePos,
		cards_quality: cardQuality,
		overlay_alpha: overlayAlpha,
		overlay_top: overlayTop,
		overlay_title: overlayTitle,
		overlay_deck: overlayDeck,
		overlay_clock: overlayClock,
		overlay_sideboard: overlaySideboard,
		overlay_ontop: overlayOnTop,
		anon_explore: anonExplore
	};
	cardSize = 100+(cardSizePos*10);
	ipc_send('save_settings', settings);
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
	var winColors = {w: 0, u: 0, b: 0, r: 0, g:0};
	var lossColors = {w: 0, u: 0, b: 0, r: 0, g:0};
	if (matchesHistory == undefined) {
		return 0;
	}
	matchesHistory.matches.forEach(function(matchid, index) {
		match = matchesHistory[matchid];
		if (matchid != null && match != undefined) {
			if (match.type == "match") {
				if (match.playerDeck.id == deckid) {
					if (match.player.win > match.opponent.win) {
						winColors = add_deck_colors(winColors, match.oppDeck.mainDeck);
						wins++;
					}
					else {
						lossColors = add_deck_colors(lossColors, match.oppDeck.mainDeck);
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
		}
	});

	if (wins == 0) {
		return 0;
	}

	var winrate = Math.round((1/(wins+loss)*wins) * 100) / 100;
	var winrateLastEdit = Math.round((1/(winsLastEdit+lossLastEdit)*winsLastEdit) * 100) / 100;
	if (winsLastEdit == 0)	winrateLastEdit = 0;
	return {total: winrate, lastEdit: winrateLastEdit, winColors: winColors, lossColors: lossColors};
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
function compare_changes(a, b) {
	a = Date.parse(a.date);
	b = Date.parse(b.date);
	if (a < b)	return 1;
	if (a > b)	return -1;
	return 0;
}

//
function compare_changes_inner(a, b) {
	a = a.quantity;
	b = b.quantity;
	if (a > 0 && b > 0) {
		if (a < b)	return -1;
		if (a > b)	return 1;
	}
	if (a < 0 && b < 0) {
		if (a < b)	return 1;
		if (a > b)	return -1;
	}
	if (a < 0 && b > 0) {
		return -1;
	}
	if (a > 0 && b < 0) {
		return 1;
	}
	return 0;
}

//
function sort_history() {
	matchesHistory.matches.sort(compare_matches); 

	matchesHistory.matches.forEach(function(mid) {
		var match = matchesHistory[mid];

		if (mid != null && match != undefined) {
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
		}
	});
}

//
function compare_matches(a, b) {
	if (a == undefined)
		return -1;
	if (b == undefined)
		return 1;

	a = matchesHistory[a];
	b = matchesHistory[b];

	if (a == undefined)
		return -1;
	if (b == undefined)
		return 1;

	a = Date.parse(a.date);
	b = Date.parse(b.date);
	if (a < b)	return 1;
	if (a > b)	return -1;
	return 0;
}

function compare_explore(a, b) {
	var awlrate = a.wins-a.losses;
	var bwlrate = b.wins-b.losses;

	if (awlrate > bwlrate)	return -1;
	if (awlrate < bwlrate)	return 1;
	return 0;
}
