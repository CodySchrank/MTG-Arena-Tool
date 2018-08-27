const emuns = {"Phase":{"0":"","1":"Beginning","2":"1st Main","3":"Combat","4":"2nd Main","5":"Ending"},"CardType":{"1":"Artifact","2":"Creature","3":"Enchantment","4":"Instant","5":"Land","6":"Phenomenon","7":"Plane","8":"Planeswalker","9":"Scheme","10":"Sorcery","11":"Tribal","12":"Vanguard"},"SuperType":{"1":"Basic","2":"Legendary","3":"Ongoing","4":"Snow","5":"World"},"SubType":{"1":"Angel","2":"Archer","3":"Archon","4":"Artificer","5":"Assassin","6":"Aura","7":"Basilisk","8":"Bat","9":"Bear","10":"Beast","11":"Berserker","12":"Bird","13":"Boar","14":"Cat","15":"Chandra","16":"Cleric","17":"Construct","18":"Crocodile","19":"Demon","20":"Djinn","21":"Dragon","22":"Drake","23":"Druid","24":"Fish","25":"Elemental","26":"Elephant","27":"Elf","28":"Equipment","29":"Forest","30":"Garruk","31":"Gate","32":"Giant","33":"Gideon","34":"Goblin","35":"Golem","36":"Griffin","37":"Horse","38":"Hound","39":"Human","40":"Hydra","41":"Illusion","42":"Insect","43":"Island","44":"Jace","45":"Knight","46":"Merfolk","47":"Minotaur","48":"Monk","49":"Mountain","50":"Ogre","51":"Ooze","52":"Pegasus","53":"Phoenix","54":"Plains","55":"Rhino","56":"Rogue","57":"Salamander","58":"Scout","59":"Serpent","60":"Shade","61":"Shaman","62":"Siren","63":"Skeleton","64":"Soldier","65":"Sorin","66":"Sphinx","67":"Spider","68":"Spirit","69":"Swamp","70":"Tower","71":"Treefolk","72":"Troll","73":"Urza's","74":"Vampire","75":"Vedalken","76":"Wall","77":"Warrior","78":"Wizard","79":"Wolf","80":"Wurm","81":"Zombie","82":"Mine","83":"Power-Plant","84":"Saproling","85":"Avatar","86":"Sliver","87":"Samurai","88":"Pest","89":"Thalakos","90":"Dauthi","91":"Minion","92":"Advisor","93":"Ajani","94":"Alara","95":"Ally","96":"Anteater","97":"Antelope","98":"Ape","99":"Arcane","100":"Arkhos","101":"Ashiok","102":"Assembly-Worker","103":"Atog","104":"Aurochs","105":"Azgol","106":"Badger","107":"Barbarian","108":"Beeble","109":"Belenon","110":"Bolas","111":"Bolass","112":"Bringer","113":"Brushwagg","114":"Camel","115":"Carrier","116":"Centaur","117":"Cephalid","118":"Chimera","119":"Cockatrice","120":"Crab","121":"Curse","122":"Cyclops","123":"Desert","124":"Devil","125":"Dominaria","126":"Domri","127":"Dreadnought","128":"Drone","129":"Dryad","130":"Dwarf","131":"Efreet","132":"Elder","133":"Eldrazi","134":"Elk","135":"Elspeth","136":"Equilor","137":"Ergamon","138":"Eye","139":"Fabacin","140":"Faerie","141":"Ferret","142":"Flagbearer","143":"Fortification","144":"Fox","145":"Frog","146":"Fungus","147":"Gargoyle","148":"Gnome","149":"Goat","150":"God","151":"Gorgon","152":"Gremlin","153":"Hag","154":"Harpy","155":"Hellion","156":"Hippo","157":"Hippogriff","158":"Homarid","159":"Homunculus","160":"Horror","161":"Hyena","162":"Imp","163":"Incarnation","164":"Innistrad","165":"Iquatana","166":"Ir","167":"Jellyfish","168":"Juggernaut","169":"Kaldheim","170":"Kamigawa","171":"Karn","172":"Karsus","173":"Kavu","174":"Kephalai","175":"Kirin","176":"Kithkin","177":"Kobold","178":"Kolbahan","179":"Kor","180":"Koth","181":"Kraken","182":"Kyneth","183":"Lair","184":"Lammasu","185":"Leech","186":"Leviathan","187":"Lhurgoyf","188":"Licid","189":"Liliana","190":"Lizard","191":"Locus","192":"Lorwyn","193":"Luvion","194":"Manticore","195":"Masticore","196":"Meditation","197":"Mercadia","198":"Mercenary","199":"Metathran","200":"Mirrodin","201":"Moag","202":"Monger","203":"Mongoose","204":"Mongseng","205":"Moonfolk","206":"Muraganda","207":"Mutant","208":"Myr","209":"Mystic","210":"Nautilus","211":"Nephilim","212":"New","213":"Nightmare","214":"Nightstalker","215":"Ninja","216":"Nissa","217":"Noggle","218":"Nomad","219":"Nymph","220":"Octopus","221":"Orc","222":"Orgg","223":"Ouphe","224":"Ox","225":"Oyster","226":"Phelddagrif","227":"Phyrexia","228":"Pirate","229":"Plant","230":"Praetor","231":"Pyrulea","232":"Rabbit","233":"Rabiah","234":"Ral","235":"Rat","236":"Rath","237":"Ravnica","238":"Realm","239":"Rebel","240":"Regatha","241":"Rigger","242":"Sable","243":"Sarkhan","244":"Satyr","245":"Scarecrow","246":"Scorpion","247":"Segovia","248":"Serras","249":"Shadowmoor","250":"Shandalar","251":"Shapeshifter","252":"Sheep","253":"Shrine","254":"Slith","255":"Slug","256":"Snake","257":"Soltari","258":"Spawn","259":"Specter","260":"Spellshaper","261":"Spike","262":"Sponge","263":"Squid","264":"Squirrel","265":"Starfish","266":"Surrakar","267":"Tamiyo","268":"Tezzeret","269":"Thopter","270":"Thrull","271":"Tibalt","272":"Trap","273":"Turtle","274":"Ulgrotha","275":"Unicorn","276":"Valla","277":"Venser","278":"Viashino","279":"Volver","280":"Vraska","281":"Vryn","282":"Weird","283":"Werewolf","284":"Whale","285":"Wildfire","286":"Wolverine","287":"Wombat","288":"Worm","289":"Wraith","290":"Xenagos","291":"Xerex","292":"Yeti","293":"Zendikar","294":"Zubera","295":"Germ","296":"Contraption","297":"Citizen","298":"Coward","299":"Deserter","300":"Prism","301":"Reflection","302":"Sand","303":"Serf","304":"Dack","305":"Kiora","306":"AllCreatureTypes","307":"Blinkmoth","308":"Camarid","309":"Caribou","310":"Graveborn","311":"Lamia","312":"Orb","313":"Pentavite","314":"Pincher","315":"Splinter","316":"Survivor","317":"Tetravite","318":"Triskelavite","319":"Scion","320":"Processor","321":"Arlinn","322":"Mole","323":"Nahiri","324":"Clue","325":"Teferi","326":"Daretti","327":"Freyalise","328":"Nixilis","329":"Narset","330":"Ugin","331":"Vehicle","332":"Servo","333":"Dovin","334":"Saheeli","335":"Monkey","336":"Aetherborn","337":"Pilot","338":"Jackal","339":"Naga","340":"Cartouche","341":"Samut","342":"Dinosaur","343":"Treasure","344":"Huatli","345":"Angrath","346":"Trilobite","347":"Saga","348":"Jaya","349":"PlaceholderSubType1","350":"PlaceholderSubType2","351":"PlaceholderSubType3","352":"PlaceholderSubType4","353":"PlaceholderSubType5"},"FailureReason":{"0":"","1":"Request made with out of date game state.","2":"Player has acted out of turn.","3":"Response does not match the pending request.","4":"Attempted to batch actions that must be performed one at at time.","5":"Attempted to perform an action not currently on the list of legal actions.","6":"An optional field in the message should have been supplied based on the contents of the required fields, but was not.","7":"Selected an option that is not on the list of legal options.","8":"Message contains a bad enum.","9":"Targeted spell or ability does not have sufficient valid targets.","10":"Target specified for out-of-range target index.","11":"Specified target is not on the legal targets list.","12":"Specified mana does not exist.","13":"Specified option selection is not valid.","14":"The message received was not expected by the GRE.","15":"Player input is below a specified minimum or above a specified maximum."},"Step":{"0":"","1":"Untap","2":"Upkeep","3":"Draw","4":"Begin Combat","5":"Declare Attackers","6":"Declare Blockers","7":"Combat Damage","8":"End Combat","9":"End","10":"Cleanup","11":"First Strike Damage"},"MatchState":{"0":"","1":"Game In Progress","2":"Game Complete, Match In Progress","3":"Match Complete","4":"Sideboarding"},"CounterType":{"1":"+1\/+1","2":"-1\/-1","3":"Poison","4":"Wind","5":"Time","6":"Fade","7":"Loyalty","8":"Wish","9":"Age","10":"Aim","11":"Arrow","12":"Arrowhead","13":"Awakening","14":"Blaze","15":"Blood","16":"Bounty","17":"Bribery","18":"Carrion","19":"Charge","20":"Control","21":"Corpse","22":"Credit","23":"Cube","24":"Currency","25":"Death","26":"Delay","27":"Depletion","28":"Despair","29":"Devotion","30":"Divinity","31":"Doom","32":"Dream","33":"Echo","34":"Elixir","35":"Energy","36":"Eon","37":"Eyeball","38":"Fate","39":"Feather","40":"Filibuster","41":"Flame","42":"Flood","43":"Fungus","44":"Fuse","45":"Glyph","46":"Gold","47":"Growth","48":"Hatchling","49":"Healing","50":"Hoofprint","51":"Hourglass","52":"Hunger","53":"Ice","54":"Infection","55":"Intervention","56":"Javelin","57":"Ki","58":"Level","59":"Luck","60":"Magnet","61":"Mannequin","62":"Matrix","63":"May","64":"Mine","65":"Mining","66":"Mire","67":"Muster","68":"Net","69":"Omen","70":"Ore","71":"Page","72":"Pain","73":"Paralyzation","74":"Petal","75":"Petrification","76":"Phylactery","77":"Pin","78":"Plague","79":"Polyp","80":"Pressure","81":"Pupa","82":"Quest","83":"Scream","84":"Scroll","85":"Shell","86":"Shield","87":"Shred","88":"Sleep","89":"Sleight","90":"Slime","91":"Soot","92":"Spell","93":"Spore","94":"Storage","95":"Strife","96":"Study","97":"Theft","98":"Tide","100":"Tower","101":"Training","102":"Trap","103":"Treasure","104":"Verse","105":"Vitality","106":"Wage","107":"Winch","108":"Lore","109":"+1\/+2","110":"+0\/+1","111":"+0\/+2","112":"+1\/+0","113":"+2\/+2","114":"-0\/-1","115":"-0\/-2","116":"-1\/-0","117":"-2\/-1","118":"-2\/-2","119":"Manifestation","120":"Gem","121":"Crystal","122":"Isolation","123":"Hour","124":"Unity","125":"Velocity","126":"Brick","127":"Landmark","128":"Prey","129":"Silver","130":"Egg","131":"PlaceholderCounterType1","132":"PlaceholderCounterType2","133":"PlaceholderCounterType3","134":"PlaceholderCounterType4","135":"PlaceholderCounterType5"},"ResultCode":{"0":"","1":"Success","2":"Failure","3":"Creature cannot attack","4":"Attacking costs not paid","5":"Creature cannot block","6":"Blocker cannot block attacker","7":"Damage ordering contains omissions or additions","8":"Damage sources contain omissions","9":"Damage sources contain additions","10":"Attempt to assign damage such that non-lethal damage is assigned to anything other than the last recipient in the order","12":"Too many targets selected","13":"Not enough targets selected","14":"Selected target is not valid"}};

//
function addCardTile(grpId, indent, quantity, element) {
	if (quantity !== 0) {
		var cont = $('<div class="card_tile_container"></div>');
		if ((quantity+" ").indexOf("%") != -1) {
			var ww = 64;
			var ll = 48;
			cont.append('<div class="card_tile_odds"><span>'+quantity+'</span></div>');
		}
		else {
			var ww = 56;
			var ll = 40;
			cont.append('<div class="card_tile_quantity"><span>'+quantity+'</span></div>');
		}
		element.append(cont);
		var card = cardsDb.get(grpId);
		var div = $('<div id="t'+grpId+indent+'" style="min-width: calc(100% - '+ww+'px) !important;" class="card_tile '+get_frame_class(card.frame)+'"></div>');
		cont.append(div);

		// Glow hover
		var glow = $('<div id="t'+grpId+indent+'" style="min-width: calc(100% - '+ww+'px) !important; left: calc(0px - 100% + '+ll+'px) !important" class="card_tile_glow"></div>');
		cont.append(glow);

		addCardHover(glow, card);
		glow.on('mouseenter', function(e) {
			var domid = $(this).attr('id');
		    $('#'+domid).css('margin-top', '0px');
		    /*
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
			*/
		});

		glow.on('click', function(e) {
			if (card.dfc == 'SplitHalf')	{
				card = cardsDb.get(card.dfcId);
			}
			let newname = card.name.split(' ').join('-');

			shell.openExternal('https://scryfall.com/card/'+get_set_scryfall(card.set)+'/'+card.cid+'/'+card.name);
		});

		glow.on('mouseleave', function(e) {
			var domid = $(this).attr('id');
			//$('.main_hover').css("opacity", 0);
		    $('#'+domid).css('margin-top', '3px');
			//$('.loader').css("opacity", 0);
		});

		//
		var fl = $('<div class="flex_item"></div>');
		fl.append('<div class="card_tile_name">'+card.name+'</div>');
		div.append(fl);

		fl = $('<div class="flex_item"></div>"');
		div.append(fl);
		card.cost.forEach(function(cost) {
			if (cost.color > 0 && cost.color < 7 || cost.color == 8) {
				for (var i=0; i<cost.count; i++) {
					fl.append('<div class="mana_16 flex_end mana_'+mana[cost.color]+'"></div>');
				}
			}
			else if (cost.color == 7) {
				fl.append('<div class="mana_16 flex_end mana_g'+cost.count+'"></div>');
			}
		});

		if (renderer == 0) {
			if (card.type.indexOf("Basic Land") == -1) {
				if (cards[grpId] == undefined) {
					cont.append('<div class="card_tile_not_owned" title="'+quantity+' missing"></div>');
				}
				else if (quantity > cards[grpId]) {
					cont.append('<div class="card_tile_not_owned" title="'+(quantity-cards[grpId])+' missing"></div>');
				}
			}
		}
	}
}

//
function selectAdd(div, callback) {
	div.each(function(){
	    var $this = $(this), numberOfOptions = $(this).children('option').length;
	  
	    $this.addClass('select-hidden'); 
	    $this.wrap('<div class="select"></div>');
	    $this.after('<div class="select-styled"></div>');

	    var $styledSelect = $this.next('div.select-styled');
	    $styledSelect.text($this.children('option').eq(0).text());
	  
	    var $list = $('<ul />', {
	        'class': 'select-options'
	    }).insertAfter($styledSelect);
	  
	    for (var i = 0; i < numberOfOptions; i++) {
	        $('<li />', {
	            text: $this.children('option').eq(i).text(),
	            rel: $this.children('option').eq(i).val()
	        }).appendTo($list);
	    }
	  
	    var $listItems = $list.children('li');
	  
	    $styledSelect.click(function(e) {
	        e.stopPropagation();
	        $('div.select-styled.active').not(this).each(function(){
	            $(this).removeClass('active').next('ul.select-options').hide();
	        });
	        $(this).toggleClass('active').next('ul.select-options').toggle();
	    });
	  
	    $listItems.click(function(e) {
	        e.stopPropagation();
	        $styledSelect.text($(this).text()).removeClass('active');
	        $this.val($(this).attr('rel'));
	        $list.hide();
	        console.log($this.val());
	        callback();
	    });
	  
	    $(document).click(function() {
	        $styledSelect.removeClass('active');
	        $list.hide();
	    });
	});
}

//
function addCardHover(div, _card) {
	div.on('mouseenter', function(e) {
		$('.main_hover').css("opacity", 1);
		let dfc = '';
		if (_card.dfc == 'DFC_Back')  dfc = 'a';
		if (_card.dfc == 'DFC_Front') dfc = 'b';
		if (_card.dfc == 'SplitHalf') dfc = 'a';

		 // Split cards are readable both halves, no problem
		if (dfc != '' && _card.dfc != 'SplitHalf' && renderer == 0) {
			$('.main_hover_dfc').show();
			$('.loader_dfc').show();
			$('.main_hover_dfc').css("opacity", 1);
			$('.loader_dfc').css("opacity", 1);
			var dfcCard = cardsDb.get(_card.dfcId);
			dfcf = '';
			if (dfcCard.dfc == 'DFC_Back')	dfcf = 'a';
			if (dfcCard.dfc == 'DFC_Front') dfcf = 'b';
			$('.main_hover_dfc').attr("src", "https://img.scryfall.com/cards/normal/en/"+get_set_scryfall(dfcCard.set)+"/"+dfcCard.cid+dfcf+".jpg");
			$('.main_hover_dfc').on('load', function(){
				$('.loader_dfc').css("opacity", 0);
			});
		}
		else {
			$('.main_hover_dfc').hide();
			$('.loader_dfc').hide();
		}

		$('.main_hover').attr("src", "https://img.scryfall.com/cards/normal/en/"+get_set_scryfall(_card.set)+"/"+_card.cid+dfc+".jpg");

		$('.main_hover').on('load', function(){
			$('.loader').css("opacity", 0);
		});
	});

	div.on('mouseleave', function(e) {
		$('.main_hover').css("opacity", 0);
		$('.main_hover_dfc').css("opacity", 0);
		$('.loader').css("opacity", 0);
		$('.loader_dfc').css("opacity", 0);
	});
}

//
function get_rank_index(_rank, _tier) {
    var ii = 0;
    if (_rank == "Beginner")	ii = 0;
    if (_rank == "Bronze")      ii = 1  + _tier;
    if (_rank == "Silver")   	ii = 6  + _tier;
    if (_rank == "Gold")        ii = 11 + _tier;
    if (_rank == "Diamond")		ii = 16 + _tier;
    if (_rank == "Master")		ii = 21;
    return ii;
}

//
function get_rank_index_16(_rank) {
    var ii = 0;
    if (_rank == "Beginner")	ii = 0;
    if (_rank == "Bronze")      ii = 1;
    if (_rank == "Silver")   	ii = 2;
    if (_rank == "Gold")        ii = 3;
    if (_rank == "Diamond")		ii = 4;
    if (_rank == "Master")		ii = 5;
    return ii;
}

//
function addCardSeparator(i, element) {
	var str = "";
	switch (i) {
		case 1: str = "Creature"; break;
		case 2: str = "Planeswalker"; break;
		case 3: str = "Instant"; break;
		case 4: str = "Sorcery"; break;
		case 5: str = "Artifact"; break;
		case 6: str = "Enchantment"; break;
		case 7: str = "Land"; break;
		case 98: str = "Mainboard"; break;
		case 99: str = "Sideboard"; break;
		default: str = ""; break;
	}

	var cont = $('<div class="card_tile_separator">'+str+'</div>');
	element.append(cont);
}

//
function get_card_type_sort(a) {
	var ret = 0;
	if (a.includes("Creature", 0)) 		ret = 1;
	if (a.includes("Planeswalker", 0)) 	ret = 2;
	if (a.includes("Instant", 0)) 		ret = 3;
	if (a.includes("Sorcery", 0)) 		ret = 4;
	if (a.includes("Artifact", 0)) 		ret = 5;
	if (a.includes("Enchantment", 0)) 	ret = 6;
	if (a.includes("Land", 0))			ret = 7;
	return ret;
}

//
function compare_cards(a, b) {
	// Yeah this is lazy.. I know
	a = cardsDb.get(a.id);
	b = cardsDb.get(b.id);
	var as = get_card_type_sort(a.type);
	var bs = get_card_type_sort(b.type);

	// Order by type?
	if (as < bs) {
		return -1;
	}
	if (as > bs) {
		return 1;
	}

	// by cmc
	if (a.cmc < b.cmc) {
		return -1;
	}
	if (a.cmc > b.cmc) {
		return 1;
	}

	// then by name
	if (a.name < b.name) {
		return -1;
	}
	if (a.name > b.name) {
		return 1;
	}

	return 0;
}

//
function compare_draft_cards(a, b) {
	// Yeah this is lazy.. I know
	a = cardsDb.get(a);
	b = cardsDb.get(b);
	var as = get_card_type_sort(a.type);
	var bs = get_card_type_sort(b.type);

	// Order by type?
	if (as < bs) {
		return -1;
	}
	if (as > bs) {
		return 1;
	}

	// by cmc
	if (a.cmc < b.cmc) {
		return -1;
	}
	if (a.cmc > b.cmc) {
		return 1;
	}

	// then by name
	if (a.name < b.name) {
		return -1;
	}
	if (a.name > b.name) {
		return 1;
	}

	return 0;
}


var setsList = ["Kaladesh", "Aether Revolt", "Welcome Deck 2017", "Amonkhet", "Hour of Devastation", "Ixalan", "Rivals of Ixalan", "Dominaria", "Magic 2019", "Arena"];

//
function get_set_scryfall(set) {
	switch (set) {
	    case "Arena": 					return "mtga";
	    case "Magic 2019": 				return "m19";
	    case "Dominaria": 				return "dom";
	    case "Rivals of Ixalan": 		return "rix";
	    case "Ixalan": 					return "xln";
	    case "Hour of Devastation": 	return "hou";
	    case "Amonkhet": 				return "akh";
	    case "Aether Revolt": 			return "aer";
	    case "Kaladesh": 				return "kld";
	    case "Welcome Deck 2017": 		return "w17";
	    case "Oath of the Gatewatch": 	return "ogw";
	    default: 						return set;
	}
}

//
function get_set_code(set) {
	switch (set) {
	    case "Arena": 			return "ANA";
	    case "Magic 2019": 			return "M19";
	    case "Dominaria": 			return "DAR";
	    case "Rivals of Ixalan": 	return "RIX";
	    case "Ixalan": 				return "XLN";
	    case "Hour of Devastation": return "HOU";
	    case "Amonkhet": 			return "AKH";
	    case "Aether Revolt": 		return "AER";
	    case "Kaladesh": 			return "KLD";
	    case "Welcome Deck 2017": 	return "W17";
	    default: 					return set;
	}
}

//
function get_collection_stats() {
	var stats = {
		ownedCommon: 0,
		ownedUncommon: 0,
		ownedRare: 0,
		ownedMythic: 0,
		totalCommon: 0,
		totalUncommon: 0,
		totalRare: 0,
		totalMythic: 0,
		totalCards: 0,
		ownedCards: 0,

		ownedSinglesCommon: 0,
		ownedSinglesUncommon: 0,
		ownedSinglesRare: 0,
		ownedSinglesMythic: 0,
		totalSinglesCommon: 0,
		totalSinglesUncommon: 0,
		totalSinglesRare: 0,
		totalSinglesMythic: 0,
		totalSingles: 0,
		ownedSingles: 0
	};

	setsList.forEach(function(set) {
		stats[set] = {
			totalCards: 0,
			ownedCards: 0,
			ownedCommon: 0,
			ownedUncommon: 0,
			ownedRare: 0,
			ownedMythic: 0,
			totalCommon: 0,
			totalUncommon: 0,
			totalRare: 0,
			totalMythic: 0
		};
	});

    Object.keys(cardsDb.cards).forEach(function(grpId) {
    	card = cardsDb.get(grpId);
    	if (card.rarity !== "token" && card.rarity !== "land" && card.set !== "Oath of the Gatewatch" && card.dfc != "DFC_Front" && card.dfc != "SplitCard") {

			// add to totals
			stats[card.set].totalCards += 4;
			stats.totalCards += 4;
			stats.totalSingles += 1;
			if (card.rarity == 'common')	{ stats.totalCommon 	+= 4; stats.totalSinglesCommon 	 += 1; stats[card.set].totalCommon 	+= 4; }
			if (card.rarity == 'uncommon')	{ stats.totalUncommon 	+= 4; stats.totalSinglesUncommon += 1; stats[card.set].totalUncommon += 4; }
			if (card.rarity == 'rare')		{ stats.totalRare 		+= 4; stats.totalSinglesRare 	 += 1; stats[card.set].totalRare 	+= 4; }
			if (card.rarity == 'mythic')	{ stats.totalMythic	 	+= 4; stats.totalSinglesMythic   += 1; stats[card.set].totalMythic 	+= 4; }

    		// add cards we own
			if (cards[grpId] !== undefined) {
				var add = cards[grpId];
				stats[card.set].ownedCards += add;
				stats.ownedCards += add;
				stats.ownedSingles += 1;
				if (card.rarity == 'common')	{ stats.ownedCommon 	+= add; stats.ownedSinglesCommon 	+= 1; stats[card.set].ownedCommon 	+= add; }
				if (card.rarity == 'uncommon')	{ stats.ownedUncommon 	+= add; stats.ownedSinglesUncommon 	+= 1; stats[card.set].ownedUncommon 	+= add; }
				if (card.rarity == 'rare')		{ stats.ownedRare 		+= add; stats.ownedSinglesRare 		+= 1; stats[card.set].ownedRare 		+= add; }
				if (card.rarity == 'mythic')	{ stats.ownedMythic 	+= add; stats.ownedSinglesMythic 	+= 1; stats[card.set].ownedMythic 	+= add; }
			}
    	}
    });

    return stats;
}

//
function get_collection_export() {
	var str = "";

    Object.keys(cards).forEach(function(key) {

    	let quantity = cards[key];
    	let name = cardsDb.get(key).name;
    	name = replaceAll(name, '///', '//');

		str += quantity+" "+name+"\r\n";
    });

    return str;
}

//
function get_deck_colors(deck) {
	deck.colors = [];
	deck.mainDeck.forEach(function(card) {
		var grpid = card.id;
		if (card.quantity > 0) {
			var card_name = cardsDb.get(grpid).name;
			var card_cost = cardsDb.get(grpid).cost;
			card_cost.forEach(function(c) {
				if (!deck.colors.includes(c.color) && c.color != 0 && c.color < 7) {
					deck.colors.push(c.color);
				}
			});
		}
	});
	/*
	deck.sideboard.forEach(function(card) {
		var grpid = card.id;
		var card_name = cardsDb.get(grpid).name;
		var card_cost = cardsDb.get(grpid).cost;
		card_cost.forEach(function(c) {
			if (!deck.colors.includes(c.color) && c.color != 0 && c.color < 7) {
				deck.colors.push(c.color);
			}
		});
	});
	*/
	return deck.colors;
}

//
function get_ids_colors(list) {
	var colors = [];
	list.forEach(function(grpid) {
		var card_name = cardsDb.get(grpid).name;
		var card_cost = cardsDb.get(grpid).cost;
		card_cost.forEach(function(c) {
			if (!colors.includes(c.color) && c.color != 0 && c.color < 7) {
				colors.push(c.color);
			}
		});
	});

	return colors;
}

//
function add_deck_colors(colors, deck) {
	var cols = [0,0,0,0,0,0];
	deck.forEach(function(card) {
		var grpid = card.id;
		card = cardsDb.get(grpid);
		if (card) {
			var card_name = card.name;
			var card_cost = card.cost;
			card_cost.forEach(function(c) {
				if (c.color != 0 && c.color < 6) {
					cols[c.color] += 1;
				}
			});
		}
	});

	colors.w += cols[1];
	colors.u += cols[2];
	colors.b += cols[3];
	colors.r += cols[4];
	colors.g += cols[5];

	return colors;
}

//
function get_ids_colors(list) {
	var colors = [];
	list.forEach(function(grpid) {
		var card_name = cardsDb.get(grpid).name;
		var card_cost = cardsDb.get(grpid).cost;
		card_cost.forEach(function(c) {
			if (!colors.includes(c.color) && c.color != 0 && c.color < 7) {
				colors.push(c.color);
			}
		});
	});

	return colors;
}

//
function get_deck_missing(deck) {
	var missing = {rare: 0, common: 0, uncommon: 0, mythic: 0};

	deck.mainDeck.forEach(function(card) {
		var grpid = card.id;
		var quantity = card.quantity;
		var add = 0;
		var rarity = cardsDb.get(grpid).rarity;

		if (cards[grpid] == undefined) {
			add = quantity;
		}
		else if (quantity > cards[grpid]) {
			add = quantity - cards[grpid];
		}

		if (rarity == 'common')		{missing.common += add;}
		if (rarity == 'uncommon')	{missing.uncommon += add;}
		if (rarity == 'rare')		{missing.rare += add;}
		if (rarity == 'mythic')		{missing.mythic += add;}
	});

	deck.sideboard.forEach(function(card) {
		var grpid = card.id;
		var quantity = card.quantity;
		var add = 0;
		var rarity = cardsDb.get(grpid).rarity;

		if (cards[grpid] == undefined) {
			add = quantity;
		}
		else if (quantity > cards[grpid]) {
			add = quantity - cards[grpid];
		}

		if (rarity == 'common')		{missing.common += add;}
		if (rarity == 'uncommon')	{missing.uncommon += add;}
		if (rarity == 'rare')		{missing.rare += add;}
		if (rarity == 'mythic')		{missing.mythic += add;}
	});
	
	return missing;
}

//
function get_deck_cost(deck) {
	var cost = {rare: 0, common: 0, uncommon: 0, mythic: 0};

	deck.mainDeck.forEach(function(card) {
		var grpid = card.id;
		var rarity = cardsDb.get(grpid).rarity;

		if (rarity == 'common')		{cost.common += card.quantity;}
		if (rarity == 'uncommon')	{cost.uncommon += card.quantity;}
		if (rarity == 'rare')		{cost.rare += card.quantity;}
		if (rarity == 'mythic')		{cost.mythic += card.quantity;}
	});

	deck.sideboard.forEach(function(card) {
		var grpid = card.id;
		var rarity = cardsDb.get(grpid).rarity;

		if (rarity == 'common')		{cost.common += card.quantity;}
		if (rarity == 'uncommon')	{cost.uncommon += card.quantity;}
		if (rarity == 'rare')		{cost.rare += card.quantity;}
		if (rarity == 'mythic')		{cost.mythic += card.quantity;}
	});
	
	return cost;
}

//
function get_deck_curve(deck) {
	var curve = [];

	deck.mainDeck.forEach(function(card) {
		var grpid = card.id;
		var cmc = cardsDb.get(grpid).cmc;
		if (curve[cmc] == undefined)	curve[cmc] = 0;

		if (cardsDb.get(grpid).type.indexOf("Land") == -1) {
			curve[cmc] += card.quantity
		}
	});
	/*
	// Do not account sideboard?
	deck.sideboard.forEach(function(card) {
		var grpid = card.id;
		var cmc = cardsDb.get(grpid).cmc;
		if (curve[cmc] == undefined)	curve[cmc] = 0;
		curve[cmc] += card.quantity

		if (cardsDb.get(grpid).rarity !== 'land') {
			curve[cmc] += card.quantity
		}
	});
	*/
	//console.log(curve);
	return curve;
}

//
function get_deck_colors_ammount(deck) {
	var colors = {total:0, w: 0, u: 0, b: 0, r: 0, g: 0, c: 0};

	//var mana = {0: "", 1: "white", 2: "blue", 3: "black", 4: "red", 5: "green", 6: "colorless", 7: "", 8: "x"}
	deck.mainDeck.forEach(function(card) {
		if (card.quantity > 0) {
			cardsDb.get(card.id).cost.forEach(function(c) {
				if (c.color == 1) {
					colors.w += c.count; colors.total += c.count;
				}
				if (c.color == 2) {
					colors.u += c.count; colors.total += c.count;
				}
				if (c.color == 3) {
					colors.b += c.count; colors.total += c.count;
				}
				if (c.color == 4) {
					colors.r += c.count; colors.total += c.count;
				}
				if (c.color == 5) {
					colors.g += c.count; colors.total += c.count;
				}
				if (c.color == 6) {
					colors.c += c.count; colors.total += c.count;
				}
			});
		}
	});

	return colors;
}

//
function get_deck_lands_ammount(deck) {
	var colors = {total:0, w: 0, u: 0, b: 0, r: 0, g: 0, c: 0};

	//var mana = {0: "", 1: "white", 2: "blue", 3: "black", 4: "red", 5: "green", 6: "colorless", 7: "", 8: "x"}
	deck.mainDeck.forEach(function(card) {
		var quantity = card.quantity;
		var card = cardsDb.get(card.id); 
		if (quantity > 0) {
			if (card.type.indexOf("Land") != -1 || card.type.indexOf("land") != -1) {
				if (card.frame.length < 5) {
					card.frame.forEach(function(c) {
						if (c == 1) {
							colors.w += quantity; colors.total += quantity;
						}
						if (c == 2) {
							colors.u += quantity; colors.total += quantity;
						}
						if (c == 3) {
							colors.b += quantity; colors.total += quantity;
						}
						if (c == 4) {
							colors.r += quantity; colors.total += quantity;
						}
						if (c == 5) {
							colors.g += quantity; colors.total += quantity;
						}
						if (c == 6) {
							colors.c += quantity; colors.total += quantity;
						}
					});
				}
			}
		}
	});

	return colors;
}

//
function get_deck_export(deck) {
	var str = "";
	deck.mainDeck.forEach(function(card) {
		var grpid = card.id;
		var card_name = cardsDb.get(grpid).name;
		var card_set = cardsDb.get(grpid).set;
		var card_cn = cardsDb.get(grpid).cid;
		
		str += card.quantity+" "+card_name+" ("+get_set_code(card_set)+") "+card_cn+"\r\n";
	});

	str += "\r\n";

	deck.sideboard.forEach(function(card) {
		var grpid = card.id;
		var card_name = cardsDb.get(grpid).name;
		var card_set = cardsDb.get(grpid).set;
		var card_cn = cardsDb.get(grpid).cid;
		
		str += card.quantity+" "+card_name+" ("+get_set_code(card_set)+") "+card_cn+"\r\n";
	});

	return str;
}


//
function get_deck_export_txt(deck) {
	var str = "";
	deck.mainDeck.forEach(function(card) {
		var grpid = card.id;
		var card_name = cardsDb.get(grpid).name;
		var card_set = cardsDb.get(grpid).set;
		var card_cn = cardsDb.get(grpid).cid;
		
		str += card.quantity+" "+card_name+"\r\n";
	});

	str += "\r\n";

	deck.sideboard.forEach(function(card) {
		var grpid = card.id;
		var card_name = cardsDb.get(grpid).name;
		var card_set = cardsDb.get(grpid).set;
		var card_cn = cardsDb.get(grpid).cid;
		
		str += card.quantity+" "+card_name+"\r\n";
	});

	return str;
}

//
function get_frame_class(frame) {
	if (frame.length == 0) {
		return "tile_c";
	}
	if (frame.length == 1) {
		if (frame.includes(1)) {	return "tile_w"; }
		if (frame.includes(2)) {	return "tile_u"; }
		if (frame.includes(3)) {	return "tile_b"; }
		if (frame.includes(4)) {	return "tile_r"; }
		if (frame.includes(5)) {	return "tile_g"; }
	}
	if (frame.length == 2) {
		if (frame.includes(4) && frame.includes(1)) {	return "tile_wr"; }
		if (frame.includes(1) && frame.includes(3)) {	return "tile_wb"; }
		if (frame.includes(1) && frame.includes(2)) {	return "tile_uw"; }
		if (frame.includes(2) && frame.includes(4)) {	return "tile_ur"; }
		if (frame.includes(2) && frame.includes(5)) {	return "tile_ug"; }
		if (frame.includes(2) && frame.includes(3)) {	return "tile_ub"; }
		if (frame.includes(4) && frame.includes(5)) {	return "tile_rg"; }
		if (frame.includes(5) && frame.includes(1)) {	return "tile_gw"; }
		if (frame.includes(3) && frame.includes(4)) {	return "tile_br"; }
		if (frame.includes(3) && frame.includes(5)) {	return "tile_bg"; }
	}
	if (frame.length > 2) {
		return "tile_multi";
	}
}

//
function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = Math.floor(seconds / 31536000);
  if (interval > 0) {
    return interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 0) {
    return interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 0) {
    return interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 0) {
    return interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 0) {
    return interval + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

//
function daysPast(date) {
	var firstDate = new Date();
	var secondDate = new Date(date);
	return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(24*60*60*1000)));
}

//
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

//
function makeId(length) {
    var ret = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++)
    ret += possible.charAt(Math.floor(Math.random() * possible.length));

    return ret;
}
