/* compromise-readability 0.0.1 MIT */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.compromiseReadability = factory());
}(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getAugmentedNamespace(n) {
		if (n.__esModule) return n;
		var a = Object.defineProperty({}, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	function createCommonjsModule(fn) {
	  var module = { exports: {} };
		return fn(module, module.exports), module.exports;
	}

	function commonjsRequire (target) {
		throw new Error('Could not dynamically require "' + target + '". Please configure the dynamicRequireTargets option of @rollup/plugin-commonjs appropriately for this require call to behave properly.');
	}

	/* global define */
	var pluralize = createCommonjsModule(function (module, exports) {
	  (function (root, pluralize) {
	    /* istanbul ignore else */
	    if (typeof commonjsRequire === 'function' && 'object' === 'object' && 'object' === 'object') {
	      // Node.
	      module.exports = pluralize();
	    } else {
	      // Browser global.
	      root.pluralize = pluralize();
	    }
	  })(commonjsGlobal, function () {
	    // Rule storage - pluralize and singularize need to be run sequentially,
	    // while other rules can be optimized using an object for instant lookups.
	    var pluralRules = [];
	    var singularRules = [];
	    var uncountables = {};
	    var irregularPlurals = {};
	    var irregularSingles = {};
	    /**
	     * Sanitize a pluralization rule to a usable regular expression.
	     *
	     * @param  {(RegExp|string)} rule
	     * @return {RegExp}
	     */

	    function sanitizeRule(rule) {
	      if (typeof rule === 'string') {
	        return new RegExp('^' + rule + '$', 'i');
	      }

	      return rule;
	    }
	    /**
	     * Pass in a word token to produce a function that can replicate the case on
	     * another word.
	     *
	     * @param  {string}   word
	     * @param  {string}   token
	     * @return {Function}
	     */


	    function restoreCase(word, token) {
	      // Tokens are an exact match.
	      if (word === token) return token; // Lower cased words. E.g. "hello".

	      if (word === word.toLowerCase()) return token.toLowerCase(); // Upper cased words. E.g. "WHISKY".

	      if (word === word.toUpperCase()) return token.toUpperCase(); // Title cased words. E.g. "Title".

	      if (word[0] === word[0].toUpperCase()) {
	        return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
	      } // Lower cased words. E.g. "test".


	      return token.toLowerCase();
	    }
	    /**
	     * Interpolate a regexp string.
	     *
	     * @param  {string} str
	     * @param  {Array}  args
	     * @return {string}
	     */


	    function interpolate(str, args) {
	      return str.replace(/\$(\d{1,2})/g, function (match, index) {
	        return args[index] || '';
	      });
	    }
	    /**
	     * Replace a word using a rule.
	     *
	     * @param  {string} word
	     * @param  {Array}  rule
	     * @return {string}
	     */


	    function replace(word, rule) {
	      return word.replace(rule[0], function (match, index) {
	        var result = interpolate(rule[1], arguments);

	        if (match === '') {
	          return restoreCase(word[index - 1], result);
	        }

	        return restoreCase(match, result);
	      });
	    }
	    /**
	     * Sanitize a word by passing in the word and sanitization rules.
	     *
	     * @param  {string}   token
	     * @param  {string}   word
	     * @param  {Array}    rules
	     * @return {string}
	     */


	    function sanitizeWord(token, word, rules) {
	      // Empty string or doesn't need fixing.
	      if (!token.length || uncountables.hasOwnProperty(token)) {
	        return word;
	      }

	      var len = rules.length; // Iterate over the sanitization rules and use the first one to match.

	      while (len--) {
	        var rule = rules[len];
	        if (rule[0].test(word)) return replace(word, rule);
	      }

	      return word;
	    }
	    /**
	     * Replace a word with the updated word.
	     *
	     * @param  {Object}   replaceMap
	     * @param  {Object}   keepMap
	     * @param  {Array}    rules
	     * @return {Function}
	     */


	    function replaceWord(replaceMap, keepMap, rules) {
	      return function (word) {
	        // Get the correct token and case restoration functions.
	        var token = word.toLowerCase(); // Check against the keep object map.

	        if (keepMap.hasOwnProperty(token)) {
	          return restoreCase(word, token);
	        } // Check against the replacement map for a direct word replacement.


	        if (replaceMap.hasOwnProperty(token)) {
	          return restoreCase(word, replaceMap[token]);
	        } // Run all the rules against the word.


	        return sanitizeWord(token, word, rules);
	      };
	    }
	    /**
	     * Check if a word is part of the map.
	     */


	    function checkWord(replaceMap, keepMap, rules, bool) {
	      return function (word) {
	        var token = word.toLowerCase();
	        if (keepMap.hasOwnProperty(token)) return true;
	        if (replaceMap.hasOwnProperty(token)) return false;
	        return sanitizeWord(token, token, rules) === token;
	      };
	    }
	    /**
	     * Pluralize or singularize a word based on the passed in count.
	     *
	     * @param  {string}  word      The word to pluralize
	     * @param  {number}  count     How many of the word exist
	     * @param  {boolean} inclusive Whether to prefix with the number (e.g. 3 ducks)
	     * @return {string}
	     */


	    function pluralize(word, count, inclusive) {
	      var pluralized = count === 1 ? pluralize.singular(word) : pluralize.plural(word);
	      return (inclusive ? count + ' ' : '') + pluralized;
	    }
	    /**
	     * Pluralize a word.
	     *
	     * @type {Function}
	     */


	    pluralize.plural = replaceWord(irregularSingles, irregularPlurals, pluralRules);
	    /**
	     * Check if a word is plural.
	     *
	     * @type {Function}
	     */

	    pluralize.isPlural = checkWord(irregularSingles, irregularPlurals, pluralRules);
	    /**
	     * Singularize a word.
	     *
	     * @type {Function}
	     */

	    pluralize.singular = replaceWord(irregularPlurals, irregularSingles, singularRules);
	    /**
	     * Check if a word is singular.
	     *
	     * @type {Function}
	     */

	    pluralize.isSingular = checkWord(irregularPlurals, irregularSingles, singularRules);
	    /**
	     * Add a pluralization rule to the collection.
	     *
	     * @param {(string|RegExp)} rule
	     * @param {string}          replacement
	     */

	    pluralize.addPluralRule = function (rule, replacement) {
	      pluralRules.push([sanitizeRule(rule), replacement]);
	    };
	    /**
	     * Add a singularization rule to the collection.
	     *
	     * @param {(string|RegExp)} rule
	     * @param {string}          replacement
	     */


	    pluralize.addSingularRule = function (rule, replacement) {
	      singularRules.push([sanitizeRule(rule), replacement]);
	    };
	    /**
	     * Add an uncountable word rule.
	     *
	     * @param {(string|RegExp)} word
	     */


	    pluralize.addUncountableRule = function (word) {
	      if (typeof word === 'string') {
	        uncountables[word.toLowerCase()] = true;
	        return;
	      } // Set singular and plural references for the word.


	      pluralize.addPluralRule(word, '$0');
	      pluralize.addSingularRule(word, '$0');
	    };
	    /**
	     * Add an irregular word definition.
	     *
	     * @param {string} single
	     * @param {string} plural
	     */


	    pluralize.addIrregularRule = function (single, plural) {
	      plural = plural.toLowerCase();
	      single = single.toLowerCase();
	      irregularSingles[single] = plural;
	      irregularPlurals[plural] = single;
	    };
	    /**
	     * Irregular rules.
	     */


	    [// Pronouns.
	    ['I', 'we'], ['me', 'us'], ['he', 'they'], ['she', 'they'], ['them', 'them'], ['myself', 'ourselves'], ['yourself', 'yourselves'], ['itself', 'themselves'], ['herself', 'themselves'], ['himself', 'themselves'], ['themself', 'themselves'], ['is', 'are'], ['was', 'were'], ['has', 'have'], ['this', 'these'], ['that', 'those'], // Words ending in with a consonant and `o`.
	    ['echo', 'echoes'], ['dingo', 'dingoes'], ['volcano', 'volcanoes'], ['tornado', 'tornadoes'], ['torpedo', 'torpedoes'], // Ends with `us`.
	    ['genus', 'genera'], ['viscus', 'viscera'], // Ends with `ma`.
	    ['stigma', 'stigmata'], ['stoma', 'stomata'], ['dogma', 'dogmata'], ['lemma', 'lemmata'], ['schema', 'schemata'], ['anathema', 'anathemata'], // Other irregular rules.
	    ['ox', 'oxen'], ['axe', 'axes'], ['die', 'dice'], ['yes', 'yeses'], ['foot', 'feet'], ['eave', 'eaves'], ['goose', 'geese'], ['tooth', 'teeth'], ['quiz', 'quizzes'], ['human', 'humans'], ['proof', 'proofs'], ['carve', 'carves'], ['valve', 'valves'], ['looey', 'looies'], ['thief', 'thieves'], ['groove', 'grooves'], ['pickaxe', 'pickaxes'], ['passerby', 'passersby']].forEach(function (rule) {
	      return pluralize.addIrregularRule(rule[0], rule[1]);
	    });
	    /**
	     * Pluralization rules.
	     */

	    [[/s?$/i, 's'], [/[^\u0000-\u007F]$/i, '$0'], [/([^aeiou]ese)$/i, '$1'], [/(ax|test)is$/i, '$1es'], [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es'], [/(e[mn]u)s?$/i, '$1s'], [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, '$1'], [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i'], [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'], [/(seraph|cherub)(?:im)?$/i, '$1im'], [/(her|at|gr)o$/i, '$1oes'], [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, '$1a'], [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a'], [/sis$/i, 'ses'], [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'], [/([^aeiouy]|qu)y$/i, '$1ies'], [/([^ch][ieo][ln])ey$/i, '$1ies'], [/(x|ch|ss|sh|zz)$/i, '$1es'], [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'], [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice'], [/(pe)(?:rson|ople)$/i, '$1ople'], [/(child)(?:ren)?$/i, '$1ren'], [/eaux$/i, '$0'], [/m[ae]n$/i, 'men'], ['thou', 'you']].forEach(function (rule) {
	      return pluralize.addPluralRule(rule[0], rule[1]);
	    });
	    /**
	     * Singularization rules.
	     */

	    [[/s$/i, ''], [/(ss)$/i, '$1'], [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'], [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'], [/ies$/i, 'y'], [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, '$1ie'], [/\b(mon|smil)ies$/i, '$1ey'], [/\b((?:tit)?m|l)ice$/i, '$1ouse'], [/(seraph|cherub)im$/i, '$1'], [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, '$1'], [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, '$1sis'], [/(movie|twelve|abuse|e[mn]u)s$/i, '$1'], [/(test)(?:is|es)$/i, '$1is'], [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1us'], [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, '$1um'], [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, '$1on'], [/(alumn|alg|vertebr)ae$/i, '$1a'], [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'], [/(matr|append)ices$/i, '$1ix'], [/(pe)(rson|ople)$/i, '$1rson'], [/(child)ren$/i, '$1'], [/(eau)x?$/i, '$1'], [/men$/i, 'man']].forEach(function (rule) {
	      return pluralize.addSingularRule(rule[0], rule[1]);
	    });
	    /**
	     * Uncountable rules.
	     */

	    [// Singular words with no plurals.
	    'adulthood', 'advice', 'agenda', 'aid', 'aircraft', 'alcohol', 'ammo', 'analytics', 'anime', 'athletics', 'audio', 'bison', 'blood', 'bream', 'buffalo', 'butter', 'carp', 'cash', 'chassis', 'chess', 'clothing', 'cod', 'commerce', 'cooperation', 'corps', 'debris', 'diabetes', 'digestion', 'elk', 'energy', 'equipment', 'excretion', 'expertise', 'firmware', 'flounder', 'fun', 'gallows', 'garbage', 'graffiti', 'hardware', 'headquarters', 'health', 'herpes', 'highjinks', 'homework', 'housework', 'information', 'jeans', 'justice', 'kudos', 'labour', 'literature', 'machinery', 'mackerel', 'mail', 'media', 'mews', 'moose', 'music', 'mud', 'manga', 'news', 'only', 'personnel', 'pike', 'plankton', 'pliers', 'police', 'pollution', 'premises', 'rain', 'research', 'rice', 'salmon', 'scissors', 'series', 'sewage', 'shambles', 'shrimp', 'software', 'species', 'staff', 'swine', 'tennis', 'traffic', 'transportation', 'trout', 'tuna', 'wealth', 'welfare', 'whiting', 'wildebeest', 'wildlife', 'you', /pok[eé]mon$/i, // Regexes.
	    /[^aeiou]ese$/i, // "chinese", "japanese"
	    /deer$/i, // "deer", "reindeer"
	    /fish$/i, // "fish", "blowfish", "angelfish"
	    /measles$/i, /o[iu]s$/i, // "carnivorous"
	    /pox$/i, // "chickpox", "smallpox"
	    /sheep$/i].forEach(pluralize.addUncountableRule);
	    return pluralize;
	  });
	});

	var require$$0$1 = {
		"105": "i",
		"192": "A",
		"193": "A",
		"194": "A",
		"195": "A",
		"196": "A",
		"197": "A",
		"199": "C",
		"200": "E",
		"201": "E",
		"202": "E",
		"203": "E",
		"204": "I",
		"205": "I",
		"206": "I",
		"207": "I",
		"209": "N",
		"210": "O",
		"211": "O",
		"212": "O",
		"213": "O",
		"214": "O",
		"216": "O",
		"217": "U",
		"218": "U",
		"219": "U",
		"220": "U",
		"221": "Y",
		"224": "a",
		"225": "a",
		"226": "a",
		"227": "a",
		"228": "a",
		"229": "a",
		"231": "c",
		"232": "e",
		"233": "e",
		"234": "e",
		"235": "e",
		"236": "i",
		"237": "i",
		"238": "i",
		"239": "i",
		"241": "n",
		"242": "o",
		"243": "o",
		"244": "o",
		"245": "o",
		"246": "o",
		"248": "o",
		"249": "u",
		"250": "u",
		"251": "u",
		"252": "u",
		"253": "y",
		"255": "y",
		"256": "A",
		"257": "a",
		"258": "A",
		"259": "a",
		"260": "A",
		"261": "a",
		"262": "C",
		"263": "c",
		"264": "C",
		"265": "c",
		"266": "C",
		"267": "c",
		"268": "C",
		"269": "c",
		"270": "D",
		"271": "d",
		"272": "D",
		"273": "d",
		"274": "E",
		"275": "e",
		"276": "E",
		"277": "e",
		"278": "E",
		"279": "e",
		"280": "E",
		"281": "e",
		"282": "E",
		"283": "e",
		"284": "G",
		"285": "g",
		"286": "G",
		"287": "g",
		"288": "G",
		"289": "g",
		"290": "G",
		"291": "g",
		"292": "H",
		"293": "h",
		"294": "H",
		"295": "h",
		"296": "I",
		"297": "i",
		"298": "I",
		"299": "i",
		"300": "I",
		"301": "i",
		"302": "I",
		"303": "i",
		"304": "I",
		"308": "J",
		"309": "j",
		"310": "K",
		"311": "k",
		"313": "L",
		"314": "l",
		"315": "L",
		"316": "l",
		"317": "L",
		"318": "l",
		"319": "L",
		"320": "l",
		"321": "L",
		"322": "l",
		"323": "N",
		"324": "n",
		"325": "N",
		"326": "n",
		"327": "N",
		"328": "n",
		"332": "O",
		"333": "o",
		"334": "O",
		"335": "o",
		"336": "O",
		"337": "o",
		"338": "O",
		"339": "o",
		"340": "R",
		"341": "r",
		"342": "R",
		"343": "r",
		"344": "R",
		"345": "r",
		"346": "S",
		"347": "s",
		"348": "S",
		"349": "s",
		"350": "S",
		"351": "s",
		"352": "S",
		"353": "s",
		"354": "T",
		"355": "t",
		"356": "T",
		"357": "t",
		"358": "T",
		"359": "t",
		"360": "U",
		"361": "u",
		"362": "U",
		"363": "u",
		"364": "U",
		"365": "u",
		"366": "U",
		"367": "u",
		"368": "U",
		"369": "u",
		"370": "U",
		"371": "u",
		"372": "W",
		"373": "w",
		"374": "Y",
		"375": "y",
		"376": "Y",
		"377": "Z",
		"378": "z",
		"379": "Z",
		"380": "z",
		"381": "Z",
		"382": "z",
		"384": "b",
		"385": "B",
		"386": "B",
		"387": "b",
		"390": "O",
		"391": "C",
		"392": "c",
		"393": "D",
		"394": "D",
		"395": "D",
		"396": "d",
		"398": "E",
		"400": "E",
		"401": "F",
		"402": "f",
		"403": "G",
		"407": "I",
		"408": "K",
		"409": "k",
		"410": "l",
		"412": "M",
		"413": "N",
		"414": "n",
		"415": "O",
		"416": "O",
		"417": "o",
		"420": "P",
		"421": "p",
		"422": "R",
		"427": "t",
		"428": "T",
		"429": "t",
		"430": "T",
		"431": "U",
		"432": "u",
		"434": "V",
		"435": "Y",
		"436": "y",
		"437": "Z",
		"438": "z",
		"461": "A",
		"462": "a",
		"463": "I",
		"464": "i",
		"465": "O",
		"466": "o",
		"467": "U",
		"468": "u",
		"477": "e",
		"484": "G",
		"485": "g",
		"486": "G",
		"487": "g",
		"488": "K",
		"489": "k",
		"490": "O",
		"491": "o",
		"500": "G",
		"501": "g",
		"504": "N",
		"505": "n",
		"512": "A",
		"513": "a",
		"514": "A",
		"515": "a",
		"516": "E",
		"517": "e",
		"518": "E",
		"519": "e",
		"520": "I",
		"521": "i",
		"522": "I",
		"523": "i",
		"524": "O",
		"525": "o",
		"526": "O",
		"527": "o",
		"528": "R",
		"529": "r",
		"530": "R",
		"531": "r",
		"532": "U",
		"533": "u",
		"534": "U",
		"535": "u",
		"536": "S",
		"537": "s",
		"538": "T",
		"539": "t",
		"542": "H",
		"543": "h",
		"544": "N",
		"545": "d",
		"548": "Z",
		"549": "z",
		"550": "A",
		"551": "a",
		"552": "E",
		"553": "e",
		"558": "O",
		"559": "o",
		"562": "Y",
		"563": "y",
		"564": "l",
		"565": "n",
		"566": "t",
		"567": "j",
		"570": "A",
		"571": "C",
		"572": "c",
		"573": "L",
		"574": "T",
		"575": "s",
		"576": "z",
		"579": "B",
		"580": "U",
		"581": "V",
		"582": "E",
		"583": "e",
		"584": "J",
		"585": "j",
		"586": "Q",
		"587": "q",
		"588": "R",
		"589": "r",
		"590": "Y",
		"591": "y",
		"592": "a",
		"593": "a",
		"595": "b",
		"596": "o",
		"597": "c",
		"598": "d",
		"599": "d",
		"600": "e",
		"603": "e",
		"604": "e",
		"605": "e",
		"606": "e",
		"607": "j",
		"608": "g",
		"609": "g",
		"610": "g",
		"613": "h",
		"614": "h",
		"616": "i",
		"618": "i",
		"619": "l",
		"620": "l",
		"621": "l",
		"623": "m",
		"624": "m",
		"625": "m",
		"626": "n",
		"627": "n",
		"628": "n",
		"629": "o",
		"633": "r",
		"634": "r",
		"635": "r",
		"636": "r",
		"637": "r",
		"638": "r",
		"639": "r",
		"640": "r",
		"641": "r",
		"642": "s",
		"647": "t",
		"648": "t",
		"649": "u",
		"651": "v",
		"652": "v",
		"653": "w",
		"654": "y",
		"655": "y",
		"656": "z",
		"657": "z",
		"663": "c",
		"665": "b",
		"666": "e",
		"667": "g",
		"668": "h",
		"669": "j",
		"670": "k",
		"671": "l",
		"672": "q",
		"686": "h",
		"688": "h",
		"690": "j",
		"691": "r",
		"692": "r",
		"694": "r",
		"695": "w",
		"696": "y",
		"737": "l",
		"738": "s",
		"739": "x",
		"780": "v",
		"829": "x",
		"851": "x",
		"867": "a",
		"868": "e",
		"869": "i",
		"870": "o",
		"871": "u",
		"872": "c",
		"873": "d",
		"874": "h",
		"875": "m",
		"876": "r",
		"877": "t",
		"878": "v",
		"879": "x",
		"7424": "a",
		"7427": "b",
		"7428": "c",
		"7429": "d",
		"7431": "e",
		"7432": "e",
		"7433": "i",
		"7434": "j",
		"7435": "k",
		"7436": "l",
		"7437": "m",
		"7438": "n",
		"7439": "o",
		"7440": "o",
		"7441": "o",
		"7442": "o",
		"7443": "o",
		"7446": "o",
		"7447": "o",
		"7448": "p",
		"7449": "r",
		"7450": "r",
		"7451": "t",
		"7452": "u",
		"7453": "u",
		"7454": "u",
		"7455": "m",
		"7456": "v",
		"7457": "w",
		"7458": "z",
		"7522": "i",
		"7523": "r",
		"7524": "u",
		"7525": "v",
		"7680": "A",
		"7681": "a",
		"7682": "B",
		"7683": "b",
		"7684": "B",
		"7685": "b",
		"7686": "B",
		"7687": "b",
		"7690": "D",
		"7691": "d",
		"7692": "D",
		"7693": "d",
		"7694": "D",
		"7695": "d",
		"7696": "D",
		"7697": "d",
		"7698": "D",
		"7699": "d",
		"7704": "E",
		"7705": "e",
		"7706": "E",
		"7707": "e",
		"7710": "F",
		"7711": "f",
		"7712": "G",
		"7713": "g",
		"7714": "H",
		"7715": "h",
		"7716": "H",
		"7717": "h",
		"7718": "H",
		"7719": "h",
		"7720": "H",
		"7721": "h",
		"7722": "H",
		"7723": "h",
		"7724": "I",
		"7725": "i",
		"7728": "K",
		"7729": "k",
		"7730": "K",
		"7731": "k",
		"7732": "K",
		"7733": "k",
		"7734": "L",
		"7735": "l",
		"7738": "L",
		"7739": "l",
		"7740": "L",
		"7741": "l",
		"7742": "M",
		"7743": "m",
		"7744": "M",
		"7745": "m",
		"7746": "M",
		"7747": "m",
		"7748": "N",
		"7749": "n",
		"7750": "N",
		"7751": "n",
		"7752": "N",
		"7753": "n",
		"7754": "N",
		"7755": "n",
		"7764": "P",
		"7765": "p",
		"7766": "P",
		"7767": "p",
		"7768": "R",
		"7769": "r",
		"7770": "R",
		"7771": "r",
		"7774": "R",
		"7775": "r",
		"7776": "S",
		"7777": "s",
		"7778": "S",
		"7779": "s",
		"7786": "T",
		"7787": "t",
		"7788": "T",
		"7789": "t",
		"7790": "T",
		"7791": "t",
		"7792": "T",
		"7793": "t",
		"7794": "U",
		"7795": "u",
		"7796": "U",
		"7797": "u",
		"7798": "U",
		"7799": "u",
		"7804": "V",
		"7805": "v",
		"7806": "V",
		"7807": "v",
		"7808": "W",
		"7809": "w",
		"7810": "W",
		"7811": "w",
		"7812": "W",
		"7813": "w",
		"7814": "W",
		"7815": "w",
		"7816": "W",
		"7817": "w",
		"7818": "X",
		"7819": "x",
		"7820": "X",
		"7821": "x",
		"7822": "Y",
		"7823": "y",
		"7824": "Z",
		"7825": "z",
		"7826": "Z",
		"7827": "z",
		"7828": "Z",
		"7829": "z",
		"7835": "s",
		"7840": "A",
		"7841": "a",
		"7842": "A",
		"7843": "a",
		"7864": "E",
		"7865": "e",
		"7866": "E",
		"7867": "e",
		"7868": "E",
		"7869": "e",
		"7880": "I",
		"7881": "i",
		"7882": "I",
		"7883": "i",
		"7884": "O",
		"7885": "o",
		"7886": "O",
		"7887": "o",
		"7908": "U",
		"7909": "u",
		"7910": "U",
		"7911": "u",
		"7922": "Y",
		"7923": "y",
		"7924": "Y",
		"7925": "y",
		"7926": "Y",
		"7927": "y",
		"7928": "Y",
		"7929": "y",
		"8305": "i",
		"8341": "h",
		"8342": "k",
		"8343": "l",
		"8344": "m",
		"8345": "n",
		"8346": "p",
		"8347": "s",
		"8348": "t",
		"8450": "c",
		"8458": "g",
		"8459": "h",
		"8460": "h",
		"8461": "h",
		"8464": "i",
		"8465": "i",
		"8466": "l",
		"8467": "l",
		"8468": "l",
		"8469": "n",
		"8472": "p",
		"8473": "p",
		"8474": "q",
		"8475": "r",
		"8476": "r",
		"8477": "r",
		"8484": "z",
		"8488": "z",
		"8492": "b",
		"8493": "c",
		"8495": "e",
		"8496": "e",
		"8497": "f",
		"8498": "F",
		"8499": "m",
		"8500": "o",
		"8506": "q",
		"8513": "g",
		"8514": "l",
		"8515": "l",
		"8516": "y",
		"8517": "d",
		"8518": "d",
		"8519": "e",
		"8520": "i",
		"8521": "j",
		"8526": "f",
		"8579": "C",
		"8580": "c",
		"8765": "s",
		"8766": "s",
		"8959": "z",
		"8999": "x",
		"9746": "x",
		"9776": "i",
		"9866": "i",
		"10005": "x",
		"10006": "x",
		"10007": "x",
		"10008": "x",
		"10625": "z",
		"10626": "z",
		"11362": "L",
		"11364": "R",
		"11365": "a",
		"11366": "t",
		"11373": "A",
		"11374": "M",
		"11375": "A",
		"11390": "S",
		"11391": "Z",
		"19904": "i",
		"42893": "H",
		"42922": "H",
		"42923": "E",
		"42924": "G",
		"42925": "L",
		"42928": "K",
		"42929": "T",
		"62937": "x"
	};

	var normalizeStrings = createCommonjsModule(function (module) {
	  (function (global, factory) {
	    if (module.exports) {
	      module.exports = factory(global, global.document);
	    } else {
	      global.normalize = factory(global, global.document);
	    }
	  })(typeof window !== 'undefined' ? window : commonjsGlobal, function (window, document) {
	    var charmap = require$$0$1;
	    var regex = null;
	    var current_charmap;
	    var old_charmap;

	    function normalize(str, custom_charmap) {
	      old_charmap = current_charmap;
	      current_charmap = custom_charmap || charmap;
	      regex = regex && old_charmap === current_charmap ? regex : buildRegExp(current_charmap);
	      return str.replace(regex, function (charToReplace) {
	        return current_charmap[charToReplace.charCodeAt(0)] || charToReplace;
	      });
	    }

	    function buildRegExp(charmap) {
	      return new RegExp('[' + Object.keys(charmap).map(function (code) {
	        return String.fromCharCode(code);
	      }).join(' ') + ']', 'g');
	    }

	    return normalize;
	  });
	});

	var problematic = {
	  abalone: 4,
	  abare: 3,
	  abbruzzese: 4,
	  abed: 2,
	  aborigine: 5,
	  abruzzese: 4,
	  acreage: 3,
	  adame: 3,
	  adieu: 2,
	  adobe: 3,
	  anemone: 4,
	  anyone: 3,
	  apache: 3,
	  aphrodite: 4,
	  apostrophe: 4,
	  ariadne: 4,
	  cafe: 2,
	  calliope: 4,
	  catastrophe: 4,
	  chile: 2,
	  chloe: 2,
	  circe: 2,
	  coyote: 3,
	  daphne: 2,
	  epitome: 4,
	  eurydice: 4,
	  euterpe: 3,
	  every: 2,
	  everywhere: 3,
	  forever: 3,
	  gethsemane: 4,
	  guacamole: 4,
	  hermione: 4,
	  hyperbole: 4,
	  jesse: 2,
	  jukebox: 2,
	  karate: 3,
	  machete: 3,
	  maybe: 2,
	  naive: 2,
	  newlywed: 3,
	  penelope: 4,
	  people: 2,
	  persephone: 4,
	  phoebe: 2,
	  pulse: 1,
	  queue: 1,
	  recipe: 3,
	  riverbed: 3,
	  sesame: 3,
	  shoreline: 2,
	  simile: 3,
	  snuffleupagus: 5,
	  sometimes: 2,
	  syncope: 3,
	  tamale: 3,
	  waterbed: 3,
	  wednesday: 2,
	  yosemite: 4,
	  zoe: 2
	};

	var own = {}.hasOwnProperty; // Two expressions of occurrences which normally would be counted as two
	// syllables, but should be counted as one.

	var EXPRESSION_MONOSYLLABIC_ONE = new RegExp(['awe($|d|so)', 'cia(?:l|$)', 'tia', 'cius', 'cious', '[^aeiou]giu', '[aeiouy][^aeiouy]ion', 'iou', 'sia$', 'eous$', '[oa]gue$', '.[^aeiuoycgltdb]{2,}ed$', '.ely$', '^jua', 'uai', 'eau', '^busi$', '(?:[aeiouy](?:' + ['[bcfgklmnprsvwxyz]', 'ch', 'dg', 'g[hn]', 'lch', 'l[lv]', 'mm', 'nch', 'n[cgn]', 'r[bcnsv]', 'squ', 's[chkls]', 'th'].join('|') + ')ed$)', '(?:[aeiouy](?:' + ['[bdfklmnprstvy]', 'ch', 'g[hn]', 'lch', 'l[lv]', 'mm', 'nch', 'nn', 'r[nsv]', 'squ', 's[cklst]', 'th'].join('|') + ')es$)'].join('|'), 'g');
	var EXPRESSION_MONOSYLLABIC_TWO = new RegExp('[aeiouy](?:' + ['[bcdfgklmnprstvyz]', 'ch', 'dg', 'g[hn]', 'l[lv]', 'mm', 'n[cgns]', 'r[cnsv]', 'squ', 's[cklst]', 'th'].join('|') + ')e$', 'g'); // Four expression of occurrences which normally would be counted as one
	// syllable, but should be counted as two.

	var EXPRESSION_DOUBLE_SYLLABIC_ONE = new RegExp('(?:' + ['([^aeiouy])\\1l', '[^aeiouy]ie(?:r|s?t)', '[aeiouym]bl', 'eo', 'ism', 'asm', 'thm', 'dnt', 'snt', 'uity', 'dea', 'gean', 'oa', 'ua', 'react?', 'orbed', // Cancel `'.[^aeiuoycgltdb]{2,}ed$',`
	'shred', // Cancel `'.[^aeiuoycgltdb]{2,}ed$',`
	'eings?', '[aeiouy]sh?e[rs]'].join('|') + ')$', 'g');
	var EXPRESSION_DOUBLE_SYLLABIC_TWO = new RegExp(['creat(?!u)', '[^gq]ua[^auieo]', '[aeiou]{3}', '^(?:ia|mc|coa[dglx].)', '^re(app|es|im|us)', '(th|d)eist'].join('|'), 'g');
	var EXPRESSION_DOUBLE_SYLLABIC_THREE = new RegExp(['[^aeiou]y[ae]', '[^l]lien', 'riet', 'dien', 'iu', 'io', 'ii', 'uen', '[aeilotu]real', 'real[aeilotu]', 'iell', 'eo[^aeiou]', '[aeiou]y[aeiou]'].join('|'), 'g');
	var EXPRESSION_DOUBLE_SYLLABIC_FOUR = /[^s]ia/; // Expression to match single syllable pre- and suffixes.

	var EXPRESSION_SINGLE = new RegExp(['^(?:' + ['un', 'fore', 'ware', 'none?', 'out', 'post', 'sub', 'pre', 'pro', 'dis', 'side', 'some'].join('|') + ')', '(?:' + ['ly', 'less', 'some', 'ful', 'ers?', 'ness', 'cians?', 'ments?', 'ettes?', 'villes?', 'ships?', 'sides?', 'ports?', 'shires?', '[gnst]ion(?:ed|s)?'].join('|') + ')$'].join('|'), 'g'); // Expression to match double syllable pre- and suffixes.

	var EXPRESSION_DOUBLE = new RegExp(['^' + '(?:' + ['above', 'anti', 'ante', 'counter', 'hyper', 'afore', 'agri', 'infra', 'intra', 'inter', 'over', 'semi', 'ultra', 'under', 'extra', 'dia', 'micro', 'mega', 'kilo', 'pico', 'nano', 'macro', 'somer'].join('|') + ')', '(?:fully|berry|woman|women|edly|union|((?:[bcdfghjklmnpqrstvwxz])|[aeiou])ye?ing)$'].join('|'), 'g'); // Expression to match triple syllable suffixes.

	var EXPRESSION_TRIPLE = /(creations?|ology|ologist|onomy|onomist)$/g; // Wrapper to support multiple word-parts (GH-11).

	/**
	 * Syllable count
	 *
	 * @param {string} value
	 * @returns {number}
	 */

	function syllable$1(value) {
	  var values = normalizeStrings(String(value)).toLowerCase() // Remove apostrophes.
	  .replace(/['’]/g, '') // Split on word boundaries.
	  .split(/\b/g);
	  var index = -1;
	  var sum = 0;

	  while (++index < values.length) {
	    // Remove non-alphabetic characters from a given value.
	    sum += one(values[index].replace(/[^a-z]/g, ''));
	  }

	  return sum;
	}
	/**
	 * Get syllables in a given value.
	 *
	 * @param {string} value
	 * @returns {number}
	 */

	function one(value) {
	  var count = 0;
	  /** @type {number} */

	  var index;
	  /** @type {string} */

	  var singular;
	  /** @type {Array.<string>} */

	  var parts;
	  /** @type {ReturnType.<returnFactory>} */

	  var addOne;
	  /** @type {ReturnType.<returnFactory>} */

	  var subtractOne;

	  if (value.length === 0) {
	    return count;
	  } // Return early when possible.


	  if (value.length < 3) {
	    return 1;
	  } // If `value` is a hard to count, it might be in `problematic`.


	  if (own.call(problematic, value)) {
	    return problematic[value];
	  } // Additionally, the singular word might be in `problematic`.


	  singular = pluralize(value, 1);

	  if (own.call(problematic, singular)) {
	    return problematic[singular];
	  }

	  addOne = returnFactory(1);
	  subtractOne = returnFactory(-1); // Count some prefixes and suffixes, and remove their matched ranges.

	  value = value.replace(EXPRESSION_TRIPLE, countFactory(3)).replace(EXPRESSION_DOUBLE, countFactory(2)).replace(EXPRESSION_SINGLE, countFactory(1)); // Count multiple consonants.

	  parts = value.split(/[^aeiouy]+/);
	  index = -1;

	  while (++index < parts.length) {
	    if (parts[index] !== '') {
	      count++;
	    }
	  } // Subtract one for occurrences which should be counted as one (but are
	  // counted as two).


	  value.replace(EXPRESSION_MONOSYLLABIC_ONE, subtractOne).replace(EXPRESSION_MONOSYLLABIC_TWO, subtractOne); // Add one for occurrences which should be counted as two (but are counted as
	  // one).

	  value.replace(EXPRESSION_DOUBLE_SYLLABIC_ONE, addOne).replace(EXPRESSION_DOUBLE_SYLLABIC_TWO, addOne).replace(EXPRESSION_DOUBLE_SYLLABIC_THREE, addOne).replace(EXPRESSION_DOUBLE_SYLLABIC_FOUR, addOne); // Make sure at least on is returned.

	  return count || 1;
	  /**
	   * Define scoped counters, to be used in `String#replace()` calls.
	   * The scoped counter removes the matched value from the input.
	   *
	   * @param {number} addition
	   */

	  function countFactory(addition) {
	    return counter;
	    /**
	     * @returns {string}
	     */

	    function counter() {
	      count += addition;
	      return '';
	    }
	  }
	  /**
	   * This scoped counter does not remove the matched value from the input.
	   *
	   * @param {number} addition
	   */


	  function returnFactory(addition) {
	    return returner;
	    /**
	     * @param {string} $0
	     * @returns {string}
	     */

	    function returner($0) {
	      count += addition;
	      return $0;
	    }
	  }
	}

	var syllable$2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		syllable: syllable$1
	});

	var daleChall$1 = ['a', 'able', 'aboard', 'about', 'above', 'absent', 'accept', 'accident', 'account', 'ache', 'aching', 'acorn', 'acre', 'across', 'act', 'acts', 'add', 'address', 'admire', 'adventure', 'afar', 'afraid', 'after', 'afternoon', 'afterward', 'afterwards', 'again', 'against', 'age', 'aged', 'ago', 'agree', 'ah', 'ahead', 'aid', 'aim', 'air', 'airfield', 'airplane', 'airport', 'airship', 'airy', 'alarm', 'alike', 'alive', 'all', 'alley', 'alligator', 'allow', 'almost', 'alone', 'along', 'aloud', 'already', 'also', 'always', 'am', 'america', 'american', 'among', 'amount', 'an', 'and', 'angel', 'anger', 'angry', 'animal', 'another', 'answer', 'ant', 'any', 'anybody', 'anyhow', 'anyone', 'anything', 'anyway', 'anywhere', 'apart', 'apartment', 'ape', 'apiece', 'appear', 'apple', 'april', 'apron', 'are', "aren't", 'arise', 'arithmetic', 'arm', 'armful', 'army', 'arose', 'around', 'arrange', 'arrive', 'arrived', 'arrow', 'art', 'artist', 'as', 'ash', 'ashes', 'aside', 'ask', 'asleep', 'at', 'ate', 'attack', 'attend', 'attention', 'august', 'aunt', 'author', 'auto', 'automobile', 'autumn', 'avenue', 'awake', 'awaken', 'away', 'awful', 'awfully', 'awhile', 'ax', 'axe', 'baa', 'babe', 'babies', 'back', 'background', 'backward', 'backwards', 'bacon', 'bad', 'badge', 'badly', 'bag', 'bake', 'baker', 'bakery', 'baking', 'ball', 'balloon', 'banana', 'band', 'bandage', 'bang', 'banjo', 'bank', 'banker', 'bar', 'barber', 'bare', 'barefoot', 'barely', 'bark', 'barn', 'barrel', 'base', 'baseball', 'basement', 'basket', 'bat', 'batch', 'bath', 'bathe', 'bathing', 'bathroom', 'bathtub', 'battle', 'battleship', 'bay', 'be', 'beach', 'bead', 'beam', 'bean', 'bear', 'beard', 'beast', 'beat', 'beating', 'beautiful', 'beautify', 'beauty', 'became', 'because', 'become', 'becoming', 'bed', 'bedbug', 'bedroom', 'bedspread', 'bedtime', 'bee', 'beech', 'beef', 'beefsteak', 'beehive', 'been', 'beer', 'beet', 'before', 'beg', 'began', 'beggar', 'begged', 'begin', 'beginning', 'begun', 'behave', 'behind', 'being', 'believe', 'bell', 'belong', 'below', 'belt', 'bench', 'bend', 'beneath', 'bent', 'berries', 'berry', 'beside', 'besides', 'best', 'bet', 'better', 'between', 'bib', 'bible', 'bicycle', 'bid', 'big', 'bigger', 'bill', 'billboard', 'bin', 'bind', 'bird', 'birth', 'birthday', 'biscuit', 'bit', 'bite', 'biting', 'bitter', 'black', 'blackberry', 'blackbird', 'blackboard', 'blackness', 'blacksmith', 'blame', 'blank', 'blanket', 'blast', 'blaze', 'bleed', 'bless', 'blessing', 'blew', 'blind', 'blindfold', 'blinds', 'block', 'blood', 'bloom', 'blossom', 'blot', 'blow', 'blue', 'blueberry', 'bluebird', 'blush', 'board', 'boast', 'boat', 'bob', 'bobwhite', 'bodies', 'body', 'boil', 'boiler', 'bold', 'bone', 'bonnet', 'boo', 'book', 'bookcase', 'bookkeeper', 'boom', 'boot', 'born', 'borrow', 'boss', 'both', 'bother', 'bottle', 'bottom', 'bought', 'bounce', 'bow', 'bow-wow', 'bowl', 'box', 'boxcar', 'boxer', 'boxes', 'boy', 'boyhood', 'bracelet', 'brain', 'brake', 'bran', 'branch', 'brass', 'brave', 'bread', 'break', 'breakfast', 'breast', 'breath', 'breathe', 'breeze', 'brick', 'bride', 'bridge', 'bright', 'brightness', 'bring', 'broad', 'broadcast', 'broke', 'broken', 'brook', 'broom', 'brother', 'brought', 'brown', 'brush', 'bubble', 'bucket', 'buckle', 'bud', 'buffalo', 'bug', 'buggy', 'build', 'building', 'built', 'bulb', 'bull', 'bullet', 'bum', 'bumblebee', 'bump', 'bun', 'bunch', 'bundle', 'bunny', 'burn', 'burst', 'bury', 'bus', 'bush', 'bushel', 'business', 'busy', 'but', 'butcher', 'butt', 'butter', 'buttercup', 'butterfly', 'buttermilk', 'butterscotch', 'button', 'buttonhole', 'buy', 'buzz', 'by', 'bye', 'cab', 'cabbage', 'cabin', 'cabinet', 'cackle', 'cage', 'cake', 'calendar', 'calf', 'call', 'caller', 'calling', 'came', 'camel', 'camp', 'campfire', 'can', "can't", 'canal', 'canary', 'candle', 'candlestick', 'candy', 'cane', 'cannon', 'cannot', 'canoe', 'canyon', 'cap', 'cape', 'capital', 'captain', 'car', 'card', 'cardboard', 'care', 'careful', 'careless', 'carelessness', 'carload', 'carpenter', 'carpet', 'carriage', 'carrot', 'carry', 'cart', 'carve', 'case', 'cash', 'cashier', 'castle', 'cat', 'catbird', 'catch', 'catcher', 'caterpillar', 'catfish', 'catsup', 'cattle', 'caught', 'cause', 'cave', 'ceiling', 'cell', 'cellar', 'cent', 'center', 'cereal', 'certain', 'certainly', 'chain', 'chair', 'chalk', 'champion', 'chance', 'change', 'chap', 'charge', 'charm', 'chart', 'chase', 'chatter', 'cheap', 'cheat', 'check', 'checkers', 'cheek', 'cheer', 'cheese', 'cherry', 'chest', 'chew', 'chick', 'chicken', 'chief', 'child', 'childhood', 'children', 'chill', 'chilly', 'chimney', 'chin', 'china', 'chip', 'chipmunk', 'chocolate', 'choice', 'choose', 'chop', 'chorus', 'chose', 'chosen', 'christen', 'christmas', 'church', 'churn', 'cigarette', 'circle', 'circus', 'citizen', 'city', 'clang', 'clap', 'class', 'classmate', 'classroom', 'claw', 'clay', 'clean', 'cleaner', 'clear', 'clerk', 'clever', 'click', 'cliff', 'climb', 'clip', 'cloak', 'clock', 'close', 'closet', 'cloth', 'clothes', 'clothing', 'cloud', 'cloudy', 'clover', 'clown', 'club', 'cluck', 'clump', 'coach', 'coal', 'coast', 'coat', 'cob', 'cobbler', 'cocoa', 'coconut', 'cocoon', 'cod', 'codfish', 'coffee', 'coffeepot', 'coin', 'cold', 'collar', 'college', 'color', 'colored', 'colt', 'column', 'comb', 'come', 'comfort', 'comic', 'coming', 'company', 'compare', 'conductor', 'cone', 'connect', 'coo', 'cook', 'cooked', 'cookie', 'cookies', 'cooking', 'cool', 'cooler', 'coop', 'copper', 'copy', 'cord', 'cork', 'corn', 'corner', 'correct', 'cost', 'cot', 'cottage', 'cotton', 'couch', 'cough', 'could', "couldn't", 'count', 'counter', 'country', 'county', 'course', 'court', 'cousin', 'cover', 'cow', 'coward', 'cowardly', 'cowboy', 'cozy', 'crab', 'crack', 'cracker', 'cradle', 'cramps', 'cranberry', 'crank', 'cranky', 'crash', 'crawl', 'crazy', 'cream', 'creamy', 'creek', 'creep', 'crept', 'cried', 'cries', 'croak', 'crook', 'crooked', 'crop', 'cross', 'cross-eyed', 'crossing', 'crow', 'crowd', 'crowded', 'crown', 'cruel', 'crumb', 'crumble', 'crush', 'crust', 'cry', 'cub', 'cuff', 'cup', 'cupboard', 'cupful', 'cure', 'curl', 'curly', 'curtain', 'curve', 'cushion', 'custard', 'customer', 'cut', 'cute', 'cutting', 'dab', 'dad', 'daddy', 'daily', 'dairy', 'daisy', 'dam', 'damage', 'dame', 'damp', 'dance', 'dancer', 'dancing', 'dandy', 'danger', 'dangerous', 'dare', 'dark', 'darkness', 'darling', 'darn', 'dart', 'dash', 'date', 'daughter', 'dawn', 'day', 'daybreak', 'daytime', 'dead', 'deaf', 'deal', 'dear', 'death', 'december', 'decide', 'deck', 'deed', 'deep', 'deer', 'defeat', 'defend', 'defense', 'delight', 'den', 'dentist', 'depend', 'deposit', 'describe', 'desert', 'deserve', 'desire', 'desk', 'destroy', 'devil', 'dew', 'diamond', 'did', "didn't", 'die', 'died', 'dies', 'difference', 'different', 'dig', 'dim', 'dime', 'dine', 'ding-dong', 'dinner', 'dip', 'direct', 'direction', 'dirt', 'dirty', 'discover', 'dish', 'dislike', 'dismiss', 'ditch', 'dive', 'diver', 'divide', 'do', 'dock', 'doctor', 'does', "doesn't", 'dog', 'doll', 'dollar', 'dolly', "don't", 'done', 'donkey', 'door', 'doorbell', 'doorknob', 'doorstep', 'dope', 'dot', 'double', 'dough', 'dove', 'down', 'downstairs', 'downtown', 'dozen', 'drag', 'drain', 'drank', 'draw', 'drawer', 'drawing', 'dream', 'dress', 'dresser', 'dressmaker', 'drew', 'dried', 'drift', 'drill', 'drink', 'drip', 'drive', 'driven', 'driver', 'drop', 'drove', 'drown', 'drowsy', 'drub', 'drum', 'drunk', 'dry', 'duck', 'due', 'dug', 'dull', 'dumb', 'dump', 'during', 'dust', 'dusty', 'duty', 'dwarf', 'dwell', 'dwelt', 'dying', 'each', 'eager', 'eagle', 'ear', 'early', 'earn', 'earth', 'east', 'eastern', 'easy', 'eat', 'eaten', 'edge', 'egg', 'eh', 'eight', 'eighteen', 'eighth', 'eighty', 'either', 'elbow', 'elder', 'eldest', 'electric', 'electricity', 'elephant', 'eleven', 'elf', 'elm', 'else', 'elsewhere', 'empty', 'end', 'ending', 'enemy', 'engine', 'engineer', 'english', 'enjoy', 'enough', 'enter', 'envelope', 'equal', 'erase', 'eraser', 'errand', 'escape', 'eve', 'even', 'evening', 'ever', 'every', 'everybody', 'everyday', 'everyone', 'everything', 'everywhere', 'evil', 'exact', 'except', 'exchange', 'excited', 'exciting', 'excuse', 'exit', 'expect', 'explain', 'extra', 'eye', 'eyebrow', 'fable', 'face', 'facing', 'fact', 'factory', 'fail', 'faint', 'fair', 'fairy', 'faith', 'fake', 'fall', 'false', 'family', 'fan', 'fancy', 'far', 'far-off', 'faraway', 'fare', 'farm', 'farmer', 'farming', 'farther', 'fashion', 'fast', 'fasten', 'fat', 'father', 'fault', 'favor', 'favorite', 'fear', 'feast', 'feather', 'february', 'fed', 'feed', 'feel', 'feet', 'fell', 'fellow', 'felt', 'fence', 'fever', 'few', 'fib', 'fiddle', 'field', 'fife', 'fifteen', 'fifth', 'fifty', 'fig', 'fight', 'figure', 'file', 'fill', 'film', 'finally', 'find', 'fine', 'finger', 'finish', 'fire', 'firearm', 'firecracker', 'fireplace', 'fireworks', 'firing', 'first', 'fish', 'fisherman', 'fist', 'fit', 'fits', 'five', 'fix', 'flag', 'flake', 'flame', 'flap', 'flash', 'flashlight', 'flat', 'flea', 'flesh', 'flew', 'flies', 'flight', 'flip', 'flip-flop', 'float', 'flock', 'flood', 'floor', 'flop', 'flour', 'flow', 'flower', 'flowery', 'flutter', 'fly', 'foam', 'fog', 'foggy', 'fold', 'folks', 'follow', 'following', 'fond', 'food', 'fool', 'foolish', 'foot', 'football', 'footprint', 'for', 'forehead', 'forest', 'forget', 'forgive', 'forgot', 'forgotten', 'fork', 'form', 'fort', 'forth', 'fortune', 'forty', 'forward', 'fought', 'found', 'fountain', 'four', 'fourteen', 'fourth', 'fox', 'frame', 'free', 'freedom', 'freeze', 'freight', 'french', 'fresh', 'fret', 'friday', 'fried', 'friend', 'friendly', 'friendship', 'frighten', 'frog', 'from', 'front', 'frost', 'frown', 'froze', 'fruit', 'fry', 'fudge', 'fuel', 'full', 'fully', 'fun', 'funny', 'fur', 'furniture', 'further', 'fuzzy', 'gain', 'gallon', 'gallop', 'game', 'gang', 'garage', 'garbage', 'garden', 'gas', 'gasoline', 'gate', 'gather', 'gave', 'gay', 'gear', 'geese', 'general', 'gentle', 'gentleman', 'gentlemen', 'geography', 'get', 'getting', 'giant', 'gift', 'gingerbread', 'girl', 'give', 'given', 'giving', 'glad', 'gladly', 'glance', 'glass', 'glasses', 'gleam', 'glide', 'glory', 'glove', 'glow', 'glue', 'go', 'goal', 'goat', 'gobble', 'god', 'godmother', 'goes', 'going', 'gold', 'golden', 'goldfish', 'golf', 'gone', 'good', 'good-by', 'good-bye', 'good-looking', 'goodbye', 'goodness', 'goods', 'goody', 'goose', 'gooseberry', 'got', 'govern', 'government', 'gown', 'grab', 'gracious', 'grade', 'grain', 'grand', 'grandchild', 'grandchildren', 'granddaughter', 'grandfather', 'grandma', 'grandmother', 'grandpa', 'grandson', 'grandstand', 'grape', 'grapefruit', 'grapes', 'grass', 'grasshopper', 'grateful', 'grave', 'gravel', 'graveyard', 'gravy', 'gray', 'graze', 'grease', 'great', 'green', 'greet', 'grew', 'grind', 'groan', 'grocery', 'ground', 'group', 'grove', 'grow', 'guard', 'guess', 'guest', 'guide', 'gulf', 'gum', 'gun', 'gunpowder', 'guy', 'ha', 'habit', 'had', "hadn't", 'hail', 'hair', 'haircut', 'hairpin', 'half', 'hall', 'halt', 'ham', 'hammer', 'hand', 'handful', 'handkerchief', 'handle', 'handwriting', 'hang', 'happen', 'happily', 'happiness', 'happy', 'harbor', 'hard', 'hardly', 'hardship', 'hardware', 'hare', 'hark', 'harm', 'harness', 'harp', 'harvest', 'has', "hasn't", 'haste', 'hasten', 'hasty', 'hat', 'hatch', 'hatchet', 'hate', 'haul', 'have', "haven't", 'having', 'hawk', 'hay', 'hayfield', 'haystack', 'he', "he'd", "he'll", "he's", 'head', 'headache', 'heal', 'health', 'healthy', 'heap', 'hear', 'heard', 'hearing', 'heart', 'heat', 'heater', 'heaven', 'heavy', 'heel', 'height', 'held', 'hell', 'hello', 'helmet', 'help', 'helper', 'helpful', 'hem', 'hen', 'henhouse', 'her', 'herd', 'here', "here's", 'hero', 'hers', 'herself', 'hey', 'hickory', 'hid', 'hidden', 'hide', 'high', 'highway', 'hill', 'hillside', 'hilltop', 'hilly', 'him', 'himself', 'hind', 'hint', 'hip', 'hire', 'his', 'hiss', 'history', 'hit', 'hitch', 'hive', 'ho', 'hoe', 'hog', 'hold', 'holder', 'hole', 'holiday', 'hollow', 'holy', 'home', 'homely', 'homesick', 'honest', 'honey', 'honeybee', 'honeymoon', 'honk', 'honor', 'hood', 'hoof', 'hook', 'hoop', 'hop', 'hope', 'hopeful', 'hopeless', 'horn', 'horse', 'horseback', 'horseshoe', 'hose', 'hospital', 'host', 'hot', 'hotel', 'hound', 'hour', 'house', 'housetop', 'housewife', 'housework', 'how', 'however', 'howl', 'hug', 'huge', 'hum', 'humble', 'hump', 'hundred', 'hung', 'hunger', 'hungry', 'hunk', 'hunt', 'hunter', 'hurrah', 'hurried', 'hurry', 'hurt', 'husband', 'hush', 'hut', 'hymn', 'i', "i'd", "i'll", "i'm", "i've", 'ice', 'icy', 'idea', 'ideal', 'if', 'ill', 'important', 'impossible', 'improve', 'in', 'inch', 'inches', 'income', 'indeed', 'indian', 'indoors', 'ink', 'inn', 'insect', 'inside', 'instant', 'instead', 'insult', 'intend', 'interested', 'interesting', 'into', 'invite', 'iron', 'is', 'island', "isn't", 'it', "it's", 'its', 'itself', 'ivory', 'ivy', 'jacket', 'jacks', 'jail', 'jam', 'january', 'jar', 'jaw', 'jay', 'jelly', 'jellyfish', 'jerk', 'jig', 'job', 'jockey', 'join', 'joke', 'joking', 'jolly', 'journey', 'joy', 'joyful', 'joyous', 'judge', 'jug', 'juice', 'juicy', 'july', 'jump', 'june', 'junior', 'junk', 'just', 'keen', 'keep', 'kept', 'kettle', 'key', 'kick', 'kid', 'kill', 'killed', 'kind', 'kindly', 'kindness', 'king', 'kingdom', 'kiss', 'kitchen', 'kite', 'kitten', 'kitty', 'knee', 'kneel', 'knew', 'knife', 'knit', 'knives', 'knob', 'knock', 'knot', 'know', 'known', 'lace', 'lad', 'ladder', 'ladies', 'lady', 'laid', 'lake', 'lamb', 'lame', 'lamp', 'land', 'lane', 'language', 'lantern', 'lap', 'lard', 'large', 'lash', 'lass', 'last', 'late', 'laugh', 'laundry', 'law', 'lawn', 'lawyer', 'lay', 'lazy', 'lead', 'leader', 'leaf', 'leak', 'lean', 'leap', 'learn', 'learned', 'least', 'leather', 'leave', 'leaving', 'led', 'left', 'leg', 'lemon', 'lemonade', 'lend', 'length', 'less', 'lesson', 'let', "let's", 'letter', 'letting', 'lettuce', 'level', 'liberty', 'library', 'lice', 'lick', 'lid', 'lie', 'life', 'lift', 'light', 'lightness', 'lightning', 'like', 'likely', 'liking', 'lily', 'limb', 'lime', 'limp', 'line', 'linen', 'lion', 'lip', 'list', 'listen', 'lit', 'little', 'live', 'lively', 'liver', 'lives', 'living', 'lizard', 'load', 'loaf', 'loan', 'loaves', 'lock', 'locomotive', 'log', 'lone', 'lonely', 'lonesome', 'long', 'look', 'lookout', 'loop', 'loose', 'lord', 'lose', 'loser', 'loss', 'lost', 'lot', 'loud', 'love', 'lovely', 'lover', 'low', 'luck', 'lucky', 'lumber', 'lump', 'lunch', 'lying', 'ma', 'machine', 'machinery', 'mad', 'made', 'magazine', 'magic', 'maid', 'mail', 'mailbox', 'mailman', 'major', 'make', 'making', 'male', 'mama', 'mamma', 'man', 'manager', 'mane', 'manger', 'many', 'map', 'maple', 'marble', 'march', 'mare', 'mark', 'market', 'marriage', 'married', 'marry', 'mask', 'mast', 'master', 'mat', 'match', 'matter', 'mattress', 'may', 'maybe', 'mayor', 'maypole', 'me', 'meadow', 'meal', 'mean', 'means', 'meant', 'measure', 'meat', 'medicine', 'meet', 'meeting', 'melt', 'member', 'men', 'mend', 'meow', 'merry', 'mess', 'message', 'met', 'metal', 'mew', 'mice', 'middle', 'midnight', 'might', 'mighty', 'mile', 'miler', 'milk', 'milkman', 'mill', 'million', 'mind', 'mine', 'miner', 'mint', 'minute', 'mirror', 'mischief', 'miss', 'misspell', 'mistake', 'misty', 'mitt', 'mitten', 'mix', 'moment', 'monday', 'money', 'monkey', 'month', 'moo', 'moon', 'moonlight', 'moose', 'mop', 'more', 'morning', 'morrow', 'moss', 'most', 'mostly', 'mother', 'motor', 'mount', 'mountain', 'mouse', 'mouth', 'move', 'movie', 'movies', 'moving', 'mow', 'mr.', 'mrs.', 'much', 'mud', 'muddy', 'mug', 'mule', 'multiply', 'murder', 'music', 'must', 'my', 'myself', 'nail', 'name', 'nap', 'napkin', 'narrow', 'nasty', 'naughty', 'navy', 'near', 'nearby', 'nearly', 'neat', 'neck', 'necktie', 'need', 'needle', "needn't", 'negro', 'neighbor', 'neighborhood', 'neither', 'nerve', 'nest', 'net', 'never', 'nevermore', 'new', 'news', 'newspaper', 'next', 'nibble', 'nice', 'nickel', 'night', 'nightgown', 'nine', 'nineteen', 'ninety', 'no', 'nobody', 'nod', 'noise', 'noisy', 'none', 'noon', 'nor', 'north', 'northern', 'nose', 'not', 'note', 'nothing', 'notice', 'november', 'now', 'nowhere', 'number', 'nurse', 'nut', "o'clock", 'oak', 'oar', 'oatmeal', 'oats', 'obey', 'ocean', 'october', 'odd', 'of', 'off', 'offer', 'office', 'officer', 'often', 'oh', 'oil', 'old', 'old-fashioned', 'on', 'once', 'one', 'onion', 'only', 'onward', 'open', 'or', 'orange', 'orchard', 'order', 'ore', 'organ', 'other', 'otherwise', 'ouch', 'ought', 'our', 'ours', 'ourselves', 'out', 'outdoors', 'outfit', 'outlaw', 'outline', 'outside', 'outward', 'oven', 'over', 'overalls', 'overcoat', 'overeat', 'overhead', 'overhear', 'overnight', 'overturn', 'owe', 'owing', 'owl', 'own', 'owner', 'ox', 'pa', 'pace', 'pack', 'package', 'pad', 'page', 'paid', 'pail', 'pain', 'painful', 'paint', 'painter', 'painting', 'pair', 'pal', 'palace', 'pale', 'pan', 'pancake', 'pane', 'pansy', 'pants', 'papa', 'paper', 'parade', 'pardon', 'parent', 'park', 'part', 'partly', 'partner', 'party', 'pass', 'passenger', 'past', 'paste', 'pasture', 'pat', 'patch', 'path', 'patter', 'pave', 'pavement', 'paw', 'pay', 'payment', 'pea', 'peace', 'peaceful', 'peach', 'peaches', 'peak', 'peanut', 'pear', 'pearl', 'peas', 'peck', 'peek', 'peel', 'peep', 'peg', 'pen', 'pencil', 'penny', 'people', 'pepper', 'peppermint', 'perfume', 'perhaps', 'person', 'pet', 'phone', 'piano', 'pick', 'pickle', 'picnic', 'picture', 'pie', 'piece', 'pig', 'pigeon', 'piggy', 'pile', 'pill', 'pillow', 'pin', 'pine', 'pineapple', 'pink', 'pint', 'pipe', 'pistol', 'pit', 'pitch', 'pitcher', 'pity', 'place', 'plain', 'plan', 'plane', 'plant', 'plate', 'platform', 'platter', 'play', 'player', 'playground', 'playhouse', 'playmate', 'plaything', 'pleasant', 'please', 'pleasure', 'plenty', 'plow', 'plug', 'plum', 'pocket', 'pocketbook', 'poem', 'point', 'poison', 'poke', 'pole', 'police', 'policeman', 'polish', 'polite', 'pond', 'ponies', 'pony', 'pool', 'poor', 'pop', 'popcorn', 'popped', 'porch', 'pork', 'possible', 'post', 'postage', 'postman', 'pot', 'potato', 'potatoes', 'pound', 'pour', 'powder', 'power', 'powerful', 'praise', 'pray', 'prayer', 'prepare', 'present', 'pretty', 'price', 'prick', 'prince', 'princess', 'print', 'prison', 'prize', 'promise', 'proper', 'protect', 'proud', 'prove', 'prune', 'public', 'puddle', 'puff', 'pull', 'pump', 'pumpkin', 'punch', 'punish', 'pup', 'pupil', 'puppy', 'pure', 'purple', 'purse', 'push', 'puss', 'pussy', 'pussycat', 'put', 'putting', 'puzzle', 'quack', 'quart', 'quarter', 'queen', 'queer', 'question', 'quick', 'quickly', 'quiet', 'quilt', 'quit', 'quite', 'rabbit', 'race', 'rack', 'radio', 'radish', 'rag', 'rail', 'railroad', 'railway', 'rain', 'rainbow', 'rainy', 'raise', 'raisin', 'rake', 'ram', 'ran', 'ranch', 'rang', 'rap', 'rapidly', 'rat', 'rate', 'rather', 'rattle', 'raw', 'ray', 'reach', 'read', 'reader', 'reading', 'ready', 'real', 'really', 'reap', 'rear', 'reason', 'rebuild', 'receive', 'recess', 'record', 'red', 'redbird', 'redbreast', 'refuse', 'reindeer', 'rejoice', 'remain', 'remember', 'remind', 'remove', 'rent', 'repair', 'repay', 'repeat', 'report', 'rest', 'return', 'review', 'reward', 'rib', 'ribbon', 'rice', 'rich', 'rid', 'riddle', 'ride', 'rider', 'riding', 'right', 'rim', 'ring', 'rip', 'ripe', 'rise', 'rising', 'river', 'road', 'roadside', 'roar', 'roast', 'rob', 'robber', 'robe', 'robin', 'rock', 'rocket', 'rocky', 'rode', 'roll', 'roller', 'roof', 'room', 'rooster', 'root', 'rope', 'rose', 'rosebud', 'rot', 'rotten', 'rough', 'round', 'route', 'row', 'rowboat', 'royal', 'rub', 'rubbed', 'rubber', 'rubbish', 'rug', 'rule', 'ruler', 'rumble', 'run', 'rung', 'runner', 'running', 'rush', 'rust', 'rusty', 'rye', 'sack', 'sad', 'saddle', 'sadness', 'safe', 'safety', 'said', 'sail', 'sailboat', 'sailor', 'saint', 'salad', 'sale', 'salt', 'same', 'sand', 'sandwich', 'sandy', 'sang', 'sank', 'sap', 'sash', 'sat', 'satin', 'satisfactory', 'saturday', 'sausage', 'savage', 'save', 'savings', 'saw', 'say', 'scab', 'scales', 'scare', 'scarf', 'school', 'schoolboy', 'schoolhouse', 'schoolmaster', 'schoolroom', 'scorch', 'score', 'scrap', 'scrape', 'scratch', 'scream', 'screen', 'screw', 'scrub', 'sea', 'seal', 'seam', 'search', 'season', 'seat', 'second', 'secret', 'see', 'seed', 'seeing', 'seek', 'seem', 'seen', 'seesaw', 'select', 'self', 'selfish', 'sell', 'send', 'sense', 'sent', 'sentence', 'separate', 'september', 'servant', 'serve', 'service', 'set', 'setting', 'settle', 'settlement', 'seven', 'seventeen', 'seventh', 'seventy', 'several', 'sew', 'shade', 'shadow', 'shady', 'shake', 'shaker', 'shaking', 'shall', 'shame', "shan't", 'shape', 'share', 'sharp', 'shave', 'she', "she'd", "she'll", "she's", 'shear', 'shears', 'shed', 'sheep', 'sheet', 'shelf', 'shell', 'shepherd', 'shine', 'shining', 'shiny', 'ship', 'shirt', 'shock', 'shoe', 'shoemaker', 'shone', 'shook', 'shoot', 'shop', 'shopping', 'shore', 'short', 'shot', 'should', 'shoulder', "shouldn't", 'shout', 'shovel', 'show', 'shower', 'shut', 'shy', 'sick', 'sickness', 'side', 'sidewalk', 'sideways', 'sigh', 'sight', 'sign', 'silence', 'silent', 'silk', 'sill', 'silly', 'silver', 'simple', 'sin', 'since', 'sing', 'singer', 'single', 'sink', 'sip', 'sir', 'sis', 'sissy', 'sister', 'sit', 'sitting', 'six', 'sixteen', 'sixth', 'sixty', 'size', 'skate', 'skater', 'ski', 'skin', 'skip', 'skirt', 'sky', 'slam', 'slap', 'slate', 'slave', 'sled', 'sleep', 'sleepy', 'sleeve', 'sleigh', 'slept', 'slice', 'slid', 'slide', 'sling', 'slip', 'slipped', 'slipper', 'slippery', 'slit', 'slow', 'slowly', 'sly', 'smack', 'small', 'smart', 'smell', 'smile', 'smoke', 'smooth', 'snail', 'snake', 'snap', 'snapping', 'sneeze', 'snow', 'snowball', 'snowflake', 'snowy', 'snuff', 'snug', 'so', 'soak', 'soap', 'sob', 'socks', 'sod', 'soda', 'sofa', 'soft', 'soil', 'sold', 'soldier', 'sole', 'some', 'somebody', 'somehow', 'someone', 'something', 'sometime', 'sometimes', 'somewhere', 'son', 'song', 'soon', 'sore', 'sorrow', 'sorry', 'sort', 'soul', 'sound', 'soup', 'sour', 'south', 'southern', 'space', 'spade', 'spank', 'sparrow', 'speak', 'speaker', 'spear', 'speech', 'speed', 'spell', 'spelling', 'spend', 'spent', 'spider', 'spike', 'spill', 'spin', 'spinach', 'spirit', 'spit', 'splash', 'spoil', 'spoke', 'spook', 'spoon', 'sport', 'spot', 'spread', 'spring', 'springtime', 'sprinkle', 'square', 'squash', 'squeak', 'squeeze', 'squirrel', 'stable', 'stack', 'stage', 'stair', 'stall', 'stamp', 'stand', 'star', 'stare', 'start', 'starve', 'state', 'states', 'station', 'stay', 'steak', 'steal', 'steam', 'steamboat', 'steamer', 'steel', 'steep', 'steeple', 'steer', 'stem', 'step', 'stepping', 'stick', 'sticky', 'stiff', 'still', 'stillness', 'sting', 'stir', 'stitch', 'stock', 'stocking', 'stole', 'stone', 'stood', 'stool', 'stoop', 'stop', 'stopped', 'stopping', 'store', 'stories', 'stork', 'storm', 'stormy', 'story', 'stove', 'straight', 'strange', 'stranger', 'strap', 'straw', 'strawberry', 'stream', 'street', 'stretch', 'string', 'strip', 'stripes', 'strong', 'stuck', 'study', 'stuff', 'stump', 'stung', 'subject', 'such', 'suck', 'sudden', 'suffer', 'sugar', 'suit', 'sum', 'summer', 'sun', 'sunday', 'sunflower', 'sung', 'sunk', 'sunlight', 'sunny', 'sunrise', 'sunset', 'sunshine', 'supper', 'suppose', 'sure', 'surely', 'surface', 'surprise', 'swallow', 'swam', 'swamp', 'swan', 'swat', 'swear', 'sweat', 'sweater', 'sweep', 'sweet', 'sweetheart', 'sweetness', 'swell', 'swept', 'swift', 'swim', 'swimming', 'swing', 'switch', 'sword', 'swore', 'table', 'tablecloth', 'tablespoon', 'tablet', 'tack', 'tag', 'tail', 'tailor', 'take', 'taken', 'taking', 'tale', 'talk', 'talker', 'tall', 'tame', 'tan', 'tank', 'tap', 'tape', 'tar', 'tardy', 'task', 'taste', 'taught', 'tax', 'tea', 'teach', 'teacher', 'team', 'tear', 'tease', 'teaspoon', 'teeth', 'telephone', 'tell', 'temper', 'ten', 'tennis', 'tent', 'term', 'terrible', 'test', 'than', 'thank', 'thankful', 'thanks', 'thanksgiving', 'that', "that's", 'the', 'theater', 'thee', 'their', 'them', 'then', 'there', 'these', 'they', "they'd", "they'll", "they're", "they've", 'thick', 'thief', 'thimble', 'thin', 'thing', 'think', 'third', 'thirsty', 'thirteen', 'thirty', 'this', 'thorn', 'those', 'though', 'thought', 'thousand', 'thread', 'three', 'threw', 'throat', 'throne', 'through', 'throw', 'thrown', 'thumb', 'thunder', 'thursday', 'thy', 'tick', 'ticket', 'tickle', 'tie', 'tiger', 'tight', 'till', 'time', 'tin', 'tinkle', 'tiny', 'tip', 'tiptoe', 'tire', 'tired', 'title', 'to', 'toad', 'toadstool', 'toast', 'tobacco', 'today', 'toe', 'together', 'toilet', 'told', 'tomato', 'tomorrow', 'ton', 'tone', 'tongue', 'tonight', 'too', 'took', 'tool', 'toot', 'tooth', 'toothbrush', 'toothpick', 'top', 'tore', 'torn', 'toss', 'touch', 'tow', 'toward', 'towards', 'towel', 'tower', 'town', 'toy', 'trace', 'track', 'trade', 'train', 'tramp', 'trap', 'tray', 'treasure', 'treat', 'tree', 'trick', 'tricycle', 'tried', 'trim', 'trip', 'trolley', 'trouble', 'truck', 'true', 'truly', 'trunk', 'trust', 'truth', 'try', 'tub', 'tuesday', 'tug', 'tulip', 'tumble', 'tune', 'tunnel', 'turkey', 'turn', 'turtle', 'twelve', 'twenty', 'twice', 'twig', 'twin', 'two', 'ugly', 'umbrella', 'uncle', 'under', 'understand', 'underwear', 'undress', 'unfair', 'unfinished', 'unfold', 'unfriendly', 'unhappy', 'unhurt', 'uniform', 'united', 'unkind', 'unknown', 'unless', 'unpleasant', 'until', 'unwilling', 'up', 'upon', 'upper', 'upset', 'upside', 'upstairs', 'uptown', 'upward', 'us', 'use', 'used', 'useful', 'valentine', 'valley', 'valuable', 'value', 'vase', 'vegetable', 'velvet', 'very', 'vessel', 'victory', 'view', 'village', 'vine', 'violet', 'visit', 'visitor', 'voice', 'vote', 'wag', 'wagon', 'waist', 'wait', 'wake', 'waken', 'walk', 'wall', 'walnut', 'want', 'war', 'warm', 'warn', 'was', 'wash', 'washer', 'washtub', "wasn't", 'waste', 'watch', 'watchman', 'water', 'watermelon', 'waterproof', 'wave', 'wax', 'way', 'wayside', 'we', "we'd", "we'll", "we're", "we've", 'weak', 'weaken', 'weakness', 'wealth', 'weapon', 'wear', 'weary', 'weather', 'weave', 'web', 'wedding', 'wednesday', 'wee', 'weed', 'week', 'weep', 'weigh', 'welcome', 'well', 'went', 'were', 'west', 'western', 'wet', 'whale', 'what', "what's", 'wheat', 'wheel', 'when', 'whenever', 'where', 'which', 'while', 'whip', 'whipped', 'whirl', 'whiskey', 'whisky', 'whisper', 'whistle', 'white', 'who', "who'd", "who'll", "who's", 'whole', 'whom', 'whose', 'why', 'wicked', 'wide', 'wife', 'wiggle', 'wild', 'wildcat', 'will', 'willing', 'willow', 'win', 'wind', 'windmill', 'window', 'windy', 'wine', 'wing', 'wink', 'winner', 'winter', 'wipe', 'wire', 'wise', 'wish', 'wit', 'witch', 'with', 'without', 'woke', 'wolf', 'woman', 'women', 'won', "won't", 'wonder', 'wonderful', 'wood', 'wooden', 'woodpecker', 'woods', 'wool', 'woolen', 'word', 'wore', 'work', 'worker', 'workman', 'world', 'worm', 'worn', 'worry', 'worse', 'worst', 'worth', 'would', "wouldn't", 'wound', 'wove', 'wrap', 'wrapped', 'wreck', 'wren', 'wring', 'write', 'writing', 'written', 'wrong', 'wrote', 'wrung', 'yard', 'yarn', 'year', 'yell', 'yellow', 'yes', 'yesterday', 'yet', 'yolk', 'yonder', 'you', "you'd", "you'll", "you're", "you've", 'young', 'youngster', 'your', 'yours', 'yourself', 'yourselves', 'youth'];

	var daleChall$2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		daleChall: daleChall$1
	});

	var difficultWordWeight = 0.1579;
	var wordWeight$1 = 0.0496;
	var difficultWordThreshold = 0.05;
	var percentage$1 = 100;
	var adjustment$1 = 3.6365; // Grade map associated with the scores.

	var gradeMap = {
	  4: [0, 4],
	  5: [5, 6],
	  6: [7, 8],
	  7: [9, 10],
	  8: [11, 12],
	  9: [13, 15],
	  10: [16, Number.POSITIVE_INFINITY],
	  NaN: [Number.NaN, Number.NaN]
	};
	/**
	 * @typedef {Object.<string, number>} DaleChallFormulaCounts
	 * @property {number} sentence
	 * @property {number} word
	 * @property {number} difficultWord
	 */

	/**
	 * Given the number of words (`word`), the number of sentences (`sentence`), and the number of unique unfamiliar words in a document (`difficultWord`), returns the score associated with the document.
	 *
	 * @param {DaleChallFormulaCounts} counts
	 * @returns {number}
	 */

	function daleChallFormula$1(counts) {
	  /** @type {number} */
	  var percentageOfDifficultWords;
	  /** @type {number} */

	  var score;

	  if (!counts || !counts.sentence || !counts.word) {
	    return Number.NaN;
	  }

	  percentageOfDifficultWords = (counts.difficultWord || 0) / counts.word;
	  score = difficultWordWeight * percentageOfDifficultWords * percentage$1 + wordWeight$1 * counts.word / counts.sentence;

	  if (percentageOfDifficultWords > difficultWordThreshold) {
	    score += adjustment$1;
	  }

	  return score;
	}
	/**
	 * Mapping between a dale-chall score and a U.S. grade level.
	 *
	 * @param {number} score
	 * @returns {[number, number]}
	 */

	function daleChallGradeLevel$1(score) {
	  var floored = Math.floor(score);

	  if (floored < 5) {
	    floored = 4;
	  } else if (floored > 9) {
	    floored = 10;
	  } // eslint-ignore-next-line capitalized-comments
	  // type-coverage:ignore-next-line


	  return gradeMap[floored].concat();
	}

	var daleChallFormula$2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		daleChallFormula: daleChallFormula$1,
		daleChallGradeLevel: daleChallGradeLevel$1
	});

	var sentenceWeight$2 = 0.39;
	var wordWeight = 11.8;
	var adjustment = 15.59;
	/**
	 * @typedef {Object.<string, number>} FleschKincaidCounts
	 * @property {number} sentence
	 * @property {number} word
	 * @property {number} syllable
	 */

	/**
	 * Given an object containing the number of words (`word`), the number of sentences (`sentence`), and the number of syllables  (`syllable`) in a document, returns the U.S. grade level associated with the document.
	 * Values can theoretically start at `-3.40` and end at `Infinity`.
	 *
	 * @param {FleschKincaidCounts} counts
	 * @returns {number}
	 */

	function fleschKincaid$1(counts) {
	  if (!counts || !counts.sentence || !counts.word || !counts.syllable) {
	    return Number.NaN;
	  }

	  return sentenceWeight$2 * (counts.word / counts.sentence) + wordWeight * (counts.syllable / counts.word) - adjustment;
	}

	var fleschKincaid$2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		fleschKincaid: fleschKincaid$1
	});

	/**
	 * @typedef {Object} SmogFormulaCounts
	 * @property {number} sentence
	 * @property {number} [polysillabicWord]
	 */
	var sentenceSize = 30;
	var weight$1 = 1.043;
	var base$2 = 3.1291;
	/**
	 * Get the grade level of a given value according to the SMOG formula. More information is available at WikiPedia: <https://en.wikipedia.org/wiki/SMOG>.
	 *
	 * @param {SmogFormulaCounts} counts
	 * @returns {number}
	 */

	function smogFormula$1(counts) {
	  if (!counts || !counts.sentence) {
	    return Number.NaN;
	  }

	  return base$2 + weight$1 * Math.sqrt((counts.polysillabicWord || 0) * (sentenceSize / counts.sentence));
	}

	var smogFormula$2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		smogFormula: smogFormula$1
	});

	var letterWeight = 0.0588;
	var sentenceWeight$1 = 0.296;
	var base$1 = 15.8;
	var percentage = 100;
	/**
	 * @typedef {Object.<string, number>} ColemanLiauCounts
	 * @propert {number} sentence
	 * @propert {number} word
	 * @propert {number} letter
	 */

	/**
	 * Given an object containing the number of words (`word`), the number of sentences (`sentence`), and the number of letters  (`letter`) in a document, returns the grade level associated with the document.
	 *
	 * @param {ColemanLiauCounts} counts
	 * @returns {number}
	 */

	function colemanLiau$1(counts) {
	  if (!counts || !counts.sentence || !counts.word || !counts.letter) {
	    return Number.NaN;
	  }

	  return letterWeight * (counts.letter / counts.word * percentage) - sentenceWeight$1 * (counts.sentence / counts.word * percentage) - base$1;
	}

	var colemanLiau$2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		colemanLiau: colemanLiau$1
	});

	var complexWordWeight = 100;
	var weight = 0.4;
	/**
	 * @typedef {Object.<string, number>} GunningFogCounts
	 * @property {number} sentence
	 * @property {number} word
	 */

	/**
	 * Given an object containing the number of words (`word`), the number of sentences (`sentence`), and the number of complex (excluding jargon, proper nouns, compound words) polysillabic (three or more syllables) words (`complexPolysillabicWord`) in a document, returns the grade level associated with the document.
	 *
	 * @param {GunningFogCounts} counts
	 * @returns {number}
	 */

	function gunningFog$1(counts) {
	  if (!counts || !counts.sentence || !counts.word) {
	    return Number.NaN;
	  }

	  return weight * (counts.word / counts.sentence + complexWordWeight * ((counts.complexPolysillabicWord || 0) / counts.word));
	}

	var gunningFog$2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		gunningFog: gunningFog$1
	});

	var characterWeight = 4.71;
	var sentenceWeight = 0.5;
	var base = 21.43;
	/**
	 * @typedef {Object.<string, number>} AutomatedReadabilityCounts
	 * @property {number} sentence
	 * @property {number} word
	 * @property {number} character
	 */

	/**
	 * Given an object containing the number of words (`word`), the number of sentences (`sentence`), and the number of characters  (`character`) in a document, returns the grade level associated with the document.
	 *
	 * @param {AutomatedReadabilityCounts} counts
	 * @return {number}
	 */

	function automatedReadability$1(counts) {
	  if (!counts || !counts.sentence || !counts.word || !counts.character) {
	    return Number.NaN;
	  }

	  return characterWeight * (counts.character / counts.word) + sentenceWeight * (counts.word / counts.sentence) - base;
	}

	var automatedReadability$2 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		automatedReadability: automatedReadability$1
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(syllable$2);

	var require$$1 = /*@__PURE__*/getAugmentedNamespace(daleChall$2);

	var require$$2 = /*@__PURE__*/getAugmentedNamespace(daleChallFormula$2);

	var require$$3 = /*@__PURE__*/getAugmentedNamespace(fleschKincaid$2);

	var require$$4 = /*@__PURE__*/getAugmentedNamespace(smogFormula$2);

	var require$$5 = /*@__PURE__*/getAugmentedNamespace(colemanLiau$2);

	var require$$6 = /*@__PURE__*/getAugmentedNamespace(gunningFog$2);

	var require$$7 = /*@__PURE__*/getAugmentedNamespace(automatedReadability$2);

	var syllable = require$$0.syllable;
	var daleChall = require$$1.daleChall;
	var daleChallFormula = require$$2.daleChallFormula,
	    daleChallGradeLevel = require$$2.daleChallGradeLevel;
	var fleschKincaid = require$$3.fleschKincaid;
	var smogFormula = require$$4.smogFormula;
	var colemanLiau = require$$5.colemanLiau;
	var gunningFog = require$$6.gunningFog;
	var automatedReadability = require$$7.automatedReadability;
	var letterReg = /[a-zA-Z]/g;
	var digitReg = /[0-9]/g;
	var paragraphReg = /\n/;
	var simpleWords = new Set(daleChall);

	var getCounts = function getCounts(doc, options) {
	  var opts = Object.assign({
	    cache: true
	  }, options);
	  if (opts.cache && doc._countsCache && doc._countsCache.syllables !== undefined) return doc._countsCache;
	  var counts = {
	    paragraphs: 0,
	    sentences: 0,
	    words: 0,
	    characters: 0,
	    letters: 0,
	    digits: 0,
	    syllables: 0,
	    complexWords: 0,
	    polySyllabicWords: 0,
	    polySyllabicComplexWords: 0
	  };
	  var current = null;
	  doc.list.forEach(function (sentence) {
	    current = sentence;
	    counts.sentences++;
	    var terms = sentence.terms();
	    terms.forEach(function (term) {
	      var text = term.clean || term.text;

	      if (text) {
	        var syllables = syllable(term.text);
	        counts.words++;
	        counts.characters += term.text.length;
	        counts.syllables += syllables;
	        var m = text.match(letterReg);
	        if (m && m.length) counts.letters += m.length;
	        m = text.match(digitReg);
	        if (m && m.length) counts.digits += m.length;

	        if (syllables >= 3) {
	          counts.polySyllabicWords++;

	          if (term.pre != '-' && term.post != '-' && !term.tags.ProperNoun) {
	            if (text.endsWith("es") || text.endsWith("ed")) {
	              // don't count es or ed endings in complex syllable count
	              if (syllables >= 4) counts.polySyllabicComplexWords++;
	            } else {
	              counts.polySyllabicComplexWords++;
	            }
	          }
	        }

	        if (!simpleWords.has(text)) counts.complexWords++;
	      }

	      if (current && paragraphReg.test(term.post)) {
	        counts.paragraphs++;
	        current = null;
	      }
	    });
	  });
	  if (current) counts.paragraphs++;
	  if (opts.cache) doc._countsCache = counts;
	  return counts;
	};

	function runAlgorithms(stats) {
	  var data = {};
	  data.fleschKincaid = fleschKincaid({
	    sentence: stats.sentences,
	    word: stats.words,
	    syllable: stats.syllables
	  });
	  data.daleChall = daleChallFormula({
	    word: stats.words,
	    sentence: stats.sentences,
	    difficultWord: stats.complexWords
	  });
	  var arr = daleChallGradeLevel(data.daleChall);
	  arr = arr.filter(function (n) {
	    return n !== Number.POSITIVE_INFINITY && n !== Number.NaN;
	  });
	  data.daleChall = arr.reduce(function (a, b) {
	    return a + b;
	  }) / arr.length;
	  data.gunningFog = gunningFog({
	    sentence: stats.sentences,
	    word: stats.words,
	    complexPolysillabicWord: stats.polySyllabicComplexWords
	  });
	  data.colemanLiau = colemanLiau({
	    sentence: stats.sentences,
	    word: stats.words,
	    letter: stats.letters + stats.digits
	  });
	  data.automatedReadability = automatedReadability({
	    sentence: stats.sentences,
	    word: stats.words,
	    character: stats.letters + stats.digits
	  });
	  data.smog = smogFormula({
	    sentence: stats.sentences,
	    polysillabicWord: stats.polySyllabicWords
	  });
	  return data;
	}

	function estimateGrades(algorithms) {
	  var grade = {
	    min: 0,
	    max: 0,
	    mean: 0,
	    median: 0,
	    stddev: 0,
	    confidence: {}
	  };
	  var values = Object.values(algorithms);
	  values.sort(function (a, b) {
	    return a - b;
	  });
	  grade.min = values[0];
	  grade.max = values[values.length - 1];
	  grade.mean = values.reduce(function (a, b) {
	    return a + b;
	  }) / values.length;
	  var half = Math.floor(values.length / 2);
	  if (values.length % 2) grade.median = values[half];else grade.median = (values[half - 1] + values[half]) / 2.0;
	  grade.stddev = Math.sqrt(values.map(function (x) {
	    return Math.pow(x - grade.mean, 2);
	  }).reduce(function (a, b) {
	    return a + b;
	  }) / values.length); //grade.accuracy = 1 / grade.stddev

	  grade.confidence = {
	    college: 0,
	    highSchool: 0,
	    middleSchool: 0,
	    elementary: 0,
	    adult: 0
	  };

	  for (var _i = 0, _values = values; _i < _values.length; _i++) {
	    var val = _values[_i];
	    if (val >= 11.5) grade.confidence.college++;
	    if (val >= 8.5 && val < 13) grade.confidence.highSchool++;
	    if (val >= 8.5) grade.confidence.adult++;
	    if (val >= 5.5 && val < 9) grade.confidence.middleSchool++;
	    if (val >= 0 && val < 6) grade.confidence.elementary++;
	  }

	  grade.confidence.adult = grade.confidence.adult / values.length;
	  grade.confidence.college = grade.confidence.college / values.length;
	  grade.confidence.highSchool = grade.confidence.highSchool / values.length;
	  grade.confidence.middleSchool = grade.confidence.middleSchool / values.length;
	  grade.confidence.elementary = grade.confidence.elementary / values.length;
	  var max = Math.max(grade.confidence.college, grade.confidence.highSchool, grade.confidence.middleSchool, grade.confidence.elementary);
	  var levels = [];
	  if (max == grade.confidence.college) levels.push("College");
	  if (max == grade.confidence.highSchool) levels.push("High School");
	  if (max == grade.confidence.middleSchool) levels.push("Middle School");
	  if (max == grade.confidence.elementary) levels.push("Elementary School");

	  if (levels.length == 1) {
	    grade.level = levels[0];
	  } else {
	    if (grade.median >= 12) grade.level = 'College';else if (grade.median >= 9) grade.level = 'High School';else if (grade.median >= 6) grade.level = 'Middle School';else grade.level = 'Elementary School';
	  }

	  return grade;
	}

	var addMethod = function addMethod(Doc) {
	  Doc.prototype.readability = function (options) {
	    var opts = Object.assign({
	      cache: true
	    }, options);
	    var counts = getCounts(this, opts);
	    var algorithms = runAlgorithms(counts);
	    var grades = estimateGrades(algorithms);
	    return Object.assign({
	      algorithms: algorithms
	    }, grades);
	  };

	  return Doc;
	};

	var src = addMethod;

	return src;

})));
//# sourceMappingURL=compromise-readability.js.map
