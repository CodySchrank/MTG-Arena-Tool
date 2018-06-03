const emuns = {"Phase":{"0":"","1":"Beginning","2":"1st Main","3":"Combat","4":"2nd Main","5":"Ending"},"CardType":{"1":"Artifact","2":"Creature","3":"Enchantment","4":"Instant","5":"Land","6":"Phenomenon","7":"Plane","8":"Planeswalker","9":"Scheme","10":"Sorcery","11":"Tribal","12":"Vanguard"},"SuperType":{"1":"Basic","2":"Legendary","3":"Ongoing","4":"Snow","5":"World"},"SubType":{"1":"Angel","2":"Archer","3":"Archon","4":"Artificer","5":"Assassin","6":"Aura","7":"Basilisk","8":"Bat","9":"Bear","10":"Beast","11":"Berserker","12":"Bird","13":"Boar","14":"Cat","15":"Chandra","16":"Cleric","17":"Construct","18":"Crocodile","19":"Demon","20":"Djinn","21":"Dragon","22":"Drake","23":"Druid","24":"Fish","25":"Elemental","26":"Elephant","27":"Elf","28":"Equipment","29":"Forest","30":"Garruk","31":"Gate","32":"Giant","33":"Gideon","34":"Goblin","35":"Golem","36":"Griffin","37":"Horse","38":"Hound","39":"Human","40":"Hydra","41":"Illusion","42":"Insect","43":"Island","44":"Jace","45":"Knight","46":"Merfolk","47":"Minotaur","48":"Monk","49":"Mountain","50":"Ogre","51":"Ooze","52":"Pegasus","53":"Phoenix","54":"Plains","55":"Rhino","56":"Rogue","57":"Salamander","58":"Scout","59":"Serpent","60":"Shade","61":"Shaman","62":"Siren","63":"Skeleton","64":"Soldier","65":"Sorin","66":"Sphinx","67":"Spider","68":"Spirit","69":"Swamp","70":"Tower","71":"Treefolk","72":"Troll","73":"Urza's","74":"Vampire","75":"Vedalken","76":"Wall","77":"Warrior","78":"Wizard","79":"Wolf","80":"Wurm","81":"Zombie","82":"Mine","83":"Power-Plant","84":"Saproling","85":"Avatar","86":"Sliver","87":"Samurai","88":"Pest","89":"Thalakos","90":"Dauthi","91":"Minion","92":"Advisor","93":"Ajani","94":"Alara","95":"Ally","96":"Anteater","97":"Antelope","98":"Ape","99":"Arcane","100":"Arkhos","101":"Ashiok","102":"Assembly-Worker","103":"Atog","104":"Aurochs","105":"Azgol","106":"Badger","107":"Barbarian","108":"Beeble","109":"Belenon","110":"Bolas","111":"Bolass","112":"Bringer","113":"Brushwagg","114":"Camel","115":"Carrier","116":"Centaur","117":"Cephalid","118":"Chimera","119":"Cockatrice","120":"Crab","121":"Curse","122":"Cyclops","123":"Desert","124":"Devil","125":"Dominaria","126":"Domri","127":"Dreadnought","128":"Drone","129":"Dryad","130":"Dwarf","131":"Efreet","132":"Elder","133":"Eldrazi","134":"Elk","135":"Elspeth","136":"Equilor","137":"Ergamon","138":"Eye","139":"Fabacin","140":"Faerie","141":"Ferret","142":"Flagbearer","143":"Fortification","144":"Fox","145":"Frog","146":"Fungus","147":"Gargoyle","148":"Gnome","149":"Goat","150":"God","151":"Gorgon","152":"Gremlin","153":"Hag","154":"Harpy","155":"Hellion","156":"Hippo","157":"Hippogriff","158":"Homarid","159":"Homunculus","160":"Horror","161":"Hyena","162":"Imp","163":"Incarnation","164":"Innistrad","165":"Iquatana","166":"Ir","167":"Jellyfish","168":"Juggernaut","169":"Kaldheim","170":"Kamigawa","171":"Karn","172":"Karsus","173":"Kavu","174":"Kephalai","175":"Kirin","176":"Kithkin","177":"Kobold","178":"Kolbahan","179":"Kor","180":"Koth","181":"Kraken","182":"Kyneth","183":"Lair","184":"Lammasu","185":"Leech","186":"Leviathan","187":"Lhurgoyf","188":"Licid","189":"Liliana","190":"Lizard","191":"Locus","192":"Lorwyn","193":"Luvion","194":"Manticore","195":"Masticore","196":"Meditation","197":"Mercadia","198":"Mercenary","199":"Metathran","200":"Mirrodin","201":"Moag","202":"Monger","203":"Mongoose","204":"Mongseng","205":"Moonfolk","206":"Muraganda","207":"Mutant","208":"Myr","209":"Mystic","210":"Nautilus","211":"Nephilim","212":"New","213":"Nightmare","214":"Nightstalker","215":"Ninja","216":"Nissa","217":"Noggle","218":"Nomad","219":"Nymph","220":"Octopus","221":"Orc","222":"Orgg","223":"Ouphe","224":"Ox","225":"Oyster","226":"Phelddagrif","227":"Phyrexia","228":"Pirate","229":"Plant","230":"Praetor","231":"Pyrulea","232":"Rabbit","233":"Rabiah","234":"Ral","235":"Rat","236":"Rath","237":"Ravnica","238":"Realm","239":"Rebel","240":"Regatha","241":"Rigger","242":"Sable","243":"Sarkhan","244":"Satyr","245":"Scarecrow","246":"Scorpion","247":"Segovia","248":"Serras","249":"Shadowmoor","250":"Shandalar","251":"Shapeshifter","252":"Sheep","253":"Shrine","254":"Slith","255":"Slug","256":"Snake","257":"Soltari","258":"Spawn","259":"Specter","260":"Spellshaper","261":"Spike","262":"Sponge","263":"Squid","264":"Squirrel","265":"Starfish","266":"Surrakar","267":"Tamiyo","268":"Tezzeret","269":"Thopter","270":"Thrull","271":"Tibalt","272":"Trap","273":"Turtle","274":"Ulgrotha","275":"Unicorn","276":"Valla","277":"Venser","278":"Viashino","279":"Volver","280":"Vraska","281":"Vryn","282":"Weird","283":"Werewolf","284":"Whale","285":"Wildfire","286":"Wolverine","287":"Wombat","288":"Worm","289":"Wraith","290":"Xenagos","291":"Xerex","292":"Yeti","293":"Zendikar","294":"Zubera","295":"Germ","296":"Contraption","297":"Citizen","298":"Coward","299":"Deserter","300":"Prism","301":"Reflection","302":"Sand","303":"Serf","304":"Dack","305":"Kiora","306":"AllCreatureTypes","307":"Blinkmoth","308":"Camarid","309":"Caribou","310":"Graveborn","311":"Lamia","312":"Orb","313":"Pentavite","314":"Pincher","315":"Splinter","316":"Survivor","317":"Tetravite","318":"Triskelavite","319":"Scion","320":"Processor","321":"Arlinn","322":"Mole","323":"Nahiri","324":"Clue","325":"Teferi","326":"Daretti","327":"Freyalise","328":"Nixilis","329":"Narset","330":"Ugin","331":"Vehicle","332":"Servo","333":"Dovin","334":"Saheeli","335":"Monkey","336":"Aetherborn","337":"Pilot","338":"Jackal","339":"Naga","340":"Cartouche","341":"Samut","342":"Dinosaur","343":"Treasure","344":"Huatli","345":"Angrath","346":"Trilobite","347":"Saga","348":"Jaya","349":"PlaceholderSubType1","350":"PlaceholderSubType2","351":"PlaceholderSubType3","352":"PlaceholderSubType4","353":"PlaceholderSubType5"},"FailureReason":{"0":"","1":"Request made with out of date game state.","2":"Player has acted out of turn.","3":"Response does not match the pending request.","4":"Attempted to batch actions that must be performed one at at time.","5":"Attempted to perform an action not currently on the list of legal actions.","6":"An optional field in the message should have been supplied based on the contents of the required fields, but was not.","7":"Selected an option that is not on the list of legal options.","8":"Message contains a bad enum.","9":"Targeted spell or ability does not have sufficient valid targets.","10":"Target specified for out-of-range target index.","11":"Specified target is not on the legal targets list.","12":"Specified mana does not exist.","13":"Specified option selection is not valid.","14":"The message received was not expected by the GRE.","15":"Player input is below a specified minimum or above a specified maximum."},"Step":{"0":"","1":"Untap","2":"Upkeep","3":"Draw","4":"Begin Combat","5":"Declare Attackers","6":"Declare Blockers","7":"Combat Damage","8":"End Combat","9":"End","10":"Cleanup","11":"First Strike Damage"},"MatchState":{"0":"","1":"Game In Progress","2":"Game Complete, Match In Progress","3":"Match Complete","4":"Sideboarding"},"CounterType":{"1":"+1\/+1","2":"-1\/-1","3":"Poison","4":"Wind","5":"Time","6":"Fade","7":"Loyalty","8":"Wish","9":"Age","10":"Aim","11":"Arrow","12":"Arrowhead","13":"Awakening","14":"Blaze","15":"Blood","16":"Bounty","17":"Bribery","18":"Carrion","19":"Charge","20":"Control","21":"Corpse","22":"Credit","23":"Cube","24":"Currency","25":"Death","26":"Delay","27":"Depletion","28":"Despair","29":"Devotion","30":"Divinity","31":"Doom","32":"Dream","33":"Echo","34":"Elixir","35":"Energy","36":"Eon","37":"Eyeball","38":"Fate","39":"Feather","40":"Filibuster","41":"Flame","42":"Flood","43":"Fungus","44":"Fuse","45":"Glyph","46":"Gold","47":"Growth","48":"Hatchling","49":"Healing","50":"Hoofprint","51":"Hourglass","52":"Hunger","53":"Ice","54":"Infection","55":"Intervention","56":"Javelin","57":"Ki","58":"Level","59":"Luck","60":"Magnet","61":"Mannequin","62":"Matrix","63":"May","64":"Mine","65":"Mining","66":"Mire","67":"Muster","68":"Net","69":"Omen","70":"Ore","71":"Page","72":"Pain","73":"Paralyzation","74":"Petal","75":"Petrification","76":"Phylactery","77":"Pin","78":"Plague","79":"Polyp","80":"Pressure","81":"Pupa","82":"Quest","83":"Scream","84":"Scroll","85":"Shell","86":"Shield","87":"Shred","88":"Sleep","89":"Sleight","90":"Slime","91":"Soot","92":"Spell","93":"Spore","94":"Storage","95":"Strife","96":"Study","97":"Theft","98":"Tide","100":"Tower","101":"Training","102":"Trap","103":"Treasure","104":"Verse","105":"Vitality","106":"Wage","107":"Winch","108":"Lore","109":"+1\/+2","110":"+0\/+1","111":"+0\/+2","112":"+1\/+0","113":"+2\/+2","114":"-0\/-1","115":"-0\/-2","116":"-1\/-0","117":"-2\/-1","118":"-2\/-2","119":"Manifestation","120":"Gem","121":"Crystal","122":"Isolation","123":"Hour","124":"Unity","125":"Velocity","126":"Brick","127":"Landmark","128":"Prey","129":"Silver","130":"Egg","131":"PlaceholderCounterType1","132":"PlaceholderCounterType2","133":"PlaceholderCounterType3","134":"PlaceholderCounterType4","135":"PlaceholderCounterType5"},"ResultCode":{"0":"","1":"Success","2":"Failure","3":"Creature cannot attack","4":"Attacking costs not paid","5":"Creature cannot block","6":"Blocker cannot block attacker","7":"Damage ordering contains omissions or additions","8":"Damage sources contain omissions","9":"Damage sources contain additions","10":"Attempt to assign damage such that non-lethal damage is assigned to anything other than the last recipient in the order","12":"Too many targets selected","13":"Not enough targets selected","14":"Selected target is not valid"}};

//
function addCardTile(grpId, indent, quantity, element) {
	var cont = $('<div class="card_tile_container"></div>');
	cont.append('<div class="card_tile_quantity"><span>'+quantity+'</span></div>');
	element.append(cont);
	
	var div = $('<div id="t'+grpId+indent+'" class="card_tile '+get_frame_class(database[grpId].frame)+'"></div>');
	cont.append(div);

	// Glow hover
	var glow = $('<div id="t'+grpId+indent+'" class="card_tile_glow"></div>');
	cont.append(glow);
	glow.on('mouseenter', function(e) {
		var domid = $(this).attr('id');
	    $('#'+domid).css('margin-top', '0px');

		$('.main_hover').css("opacity", 1);
		let dfc = '';
		if (database[grpId].dfc == 'DFC_Back')	dfc = 'a';
		if (database[grpId].dfc == 'DFC_Front')	dfc = 'b';
		if (database[grpId].dfc == 'SplitHalf')	dfc = 'a';
		$('.main_hover').attr("src", "https://img.scryfall.com/cards/normal/en/"+get_set_scryfall(database[grpId].set)+"/"+database[grpId].cid+dfc+".jpg");
	});

	glow.on('mouseleave', function(e) {
		var domid = $(this).attr('id');
		$('.main_hover').css("opacity", 0);
	    $('#'+domid).css('margin-top', '3px');
	});

	//
	var fl = $('<div class="flex_item"></div>');
	fl.append('<div class="card_tile_name">'+database[grpId].name+'</div>');
	div.append(fl);

	fl = $('<div class="flex_item"></div>"');
	div.append(fl);
	database[grpId].cost.forEach(function(cost) {
		if (cost.color > 0 && cost.color < 7 || cost.color == 8) {
			for (var i=0; i<cost.count; i++) {
				fl.append('<div class="mana_16 flex_end mana_'+mana[cost.color]+'"></div>');
			}
		}
		else if (cost.color == 7) {
			fl.append('<div class="mana_16 flex_end mana_g'+cost.count+'"></div>');
		}
	});
}

//
function get_rank_index(_rank, _tier) {
    var ii = 25;
    if (_rank == "Bronze" || _rank == "Beginner")       ii = 0  + _tier;
    if (_rank == "Silver" || _rank == "Intermediate")   ii = 5  + _tier;
    if (_rank == "Gold" || _rank == "Advanced")         ii = 10 + _tier;
    if (_rank == "Diamond")                             ii = 15 + _tier;
    if (_rank == "Master")                              ii = 20 + _tier;
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
	a = database[a.id];
	b = database[b.id];
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
function get_set_scryfall(set) {
	switch (set) {
	    case "Dominaria": return "dom";
	    case "Rivals of Ixalan": return "rix";
	    case "Ixalan": return "xln";
	    case "Hour of Devastation": return "hou";
	    case "Amonkhet": return "akh";
	    default: return "dom";
	}
}


//
function get_deck_colors(deck) {
	deck.colors = [];
	deck.mainDeck.forEach(function(card) {
		var grpid = card.id;
		var card_name = database[grpid].name;
		var card_cost = database[grpid].cost;
		card_cost.forEach(function(c) {
			if (!deck.colors.includes(c.color) && c.color != 0 && c.color < 7) {
				deck.colors.push(c.color);
			}
		});
	});

	deck.sideboard.forEach(function(card) {
		var grpid = card.id;
		var card_name = database[grpid].name;
		var card_cost = database[grpid].cost;
		card_cost.forEach(function(c) {
			if (!deck.colors.includes(c.color) && c.color != 0 && c.color < 7) {
				deck.colors.push(c.color);
			}
		});
	});
	return deck.colors;
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
