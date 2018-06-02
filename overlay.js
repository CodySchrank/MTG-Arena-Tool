var electron = require('electron');
window.ipc = electron.ipcRenderer;

var mana = {0: "", 1: "white", 2: "blue", 3: "black", 4: "red", 5: "green", 6: "colorless", 7: "", 8: "x"};

ipc_log = function (str, arg) {
    ipc.send('ipc_log', arg);
};


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
		var type = database[grpId].type;
		if (prevIndex == 0) ;
			addCardSeparator(get_card_type_sort(type), $(".overlay_decklist"));
		}
		else if (prevIndex != 0) {
			if (get_card_type_sort(type) != get_card_type_sort(database[prevIndex].type)) {
				addCardSeparator(get_card_type_sort(type), $(".overlay_decklist"));
			}
		}
		*/

		addCardTile(grpId, card.quantity, $(".overlay_decklist"));
		prevIndex = grpId;
	});
});

function hoverCard(grpId) {
	if (grpId == undefined) {
		$('.overlay_hover').css("opacity", 0);
	}
	else {
		let dfc = '';
		if (database[grpId].dfc == 'DFC_Back')	dfc = 'a';
		if (database[grpId].dfc == 'DFC_Front')	dfc = 'b';
		if (database[grpId].dfc == 'SplitHalf')	dfc = 'a';
		$('.overlay_hover').css("opacity", 1);
		$('.overlay_hover').attr("src", "https://img.scryfall.com/cards/normal/en/"+get_set_scryfall(database[grpId].set)+"/"+database[grpId].cid+dfc+".jpg");
		setTimeout(function () {
			$('.overlay_hover').css("opacity", 0);
		}, 10000);
	}
}


$(document).ready(function() {
	//
	$(".close").click(function () {
	    ipc.send('overlay_close', 1);
	});

	//
	$(".minimize").click(function () {
	    ipc.send('overlay_minimize', 1);
	});


});
