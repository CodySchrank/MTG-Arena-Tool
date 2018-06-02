var electron = require('electron');
window.ipc = electron.ipcRenderer;
var decks = null;

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
	set_decks(arg);
});


$(".list_deck").on('mouseenter mouseleave', function(e) {
    $(".deck_tile").trigger(e.type);
});


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
	$(".sidebar_item").click(function () {
		if (!$(this).hasClass("item_selected")) {

			$(".sidebar_item").each(function(index) {
				$(this).removeClass("item_selected");
			});

			$(this).addClass("item_selected");

			if ($(this).hasClass("it0")) {
				set_decks(null);
			}
			if ($(this).hasClass("it1")) {
				$("#ux_0").html('');
			}
			if ($(this).hasClass("it2")) {
				$("#ux_0").html('');
			}
			if ($(this).hasClass("it3")) {
				open_settings();
			}
			if ($(this).hasClass("it4")) {
				$("#ux_0").html('About');
			}
		}
	});
});

//
function set_decks(arg) {
	if (arg != null) {
		decks = arg;//JSON.parse(arg);
	}
	sort_decks();
	$("#ux_0").html('');

	$("#ux_0").append('<div class="list_fill"></div>');
	decks.forEach(function(deck, index) {

		var tileGrpid = deck.deckTileId;
		var tile = $('<div class="'+deck.id+'t deck_tile"></div>');
		tile.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(database[tileGrpid].set)+"/"+database[tileGrpid].cid+".jpg)");

		var div = $('<div class="'+deck.id+' list_deck"></div>');

		var fll = $('<div class="flex_item"></div>');
		var flc = $('<div class="flex_item"></div>');
		flc.css("flex-direction","column")

		var flt = $('<div class="flex_top"></div>');
		var flb = $('<div class="flex_bottom"></div>');

		$('<div class="list_deck_name">'+deck.name+'</div>').appendTo(flt);
		deck.colors.forEach(function(color) {
			$('<div class="mana_20 mana_'+mana[color]+'"></div>').appendTo(flb);
		});

		fll.appendTo(div);
		tile.appendTo(fll);

		flc.appendTo(div);
		flt.appendTo(flc);
		flb.appendTo(flc);
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
			open_deck(index);
		    $('.moving_ux').animate({'left': '-100%'}, 250, 'easeInOutCubic'); 
		});

	});
	$("#ux_0").append('<div class="list_fill"></div>');
}

// 
function open_deck(i) {
	$("#ux_1").html('');

	var top = $('<div class="decklist_top"><div class="button back"></div><div class="deck_name">'+decks[i].name+'</div></div>');
	flr = $('<div class="flex_item" style="align-self: center;"></div>');

	decks[i].colors.forEach(function(color) {
		var m = $('<div class="mana_20 mana_'+mana[color]+'"></div>');
		flr.append(m);
	});
	top.append(flr);


	var tileGrpid = decks[i].deckTileId;
	top.css("background-image", "url(https://img.scryfall.com/cards/art_crop/en/"+get_set_scryfall(database[tileGrpid].set)+"/"+database[tileGrpid].cid+".jpg)");
	var dl = $('<div class="decklist"></div>');

	var deck = decks[i];
	var prevIndex = 0;
	deck.mainDeck.forEach(function(card) {
		var grpId = card.id;
		var type = database[grpId].type;
		if (prevIndex == 0) {
			addCardSeparator(get_card_type_sort(type), dl);
		}
		else if (prevIndex != 0) {
			if (get_card_type_sort(type) != get_card_type_sort(database[prevIndex].type)) {
				addCardSeparator(get_card_type_sort(type), dl);
			}
		}

		addCardTile(grpId, card.quantity, dl);
		
		prevIndex = grpId;
	});

	$("#ux_1").append(top);
	$("#ux_1").append(dl);
	//
	$(".back").click(function () {
	    $('.moving_ux').animate({'left': '0px'}, 250, 'easeInOutCubic'); 
	});
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

	if (a < b)
		return 1;
	if (a > b)
		return -1;
	return 0;
}


//
function open_settings() {
	
}