// ==UserScript==
// @include http://www.kraland.org/main.php?p=2_3
// @require http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require https://raw.github.com/aaronpowell/db.js/master/src/db.js
// ==/UserScript==

(function() {

	var style = '' +
		'.hunting-helper-title {' +
		'	margin: 5px 0;'+
		'	padding: 5px 7px;'+
		'	border-bottom: 1px solid #ccc;'+
		'	width: 100%'+
		'}'+
		'.hunting-helper-title:hover {' +
		'	cursor: pointer;'+
		'}'+
		'.hunting-helper-sub-container {'+
		'	margin: 2px 0;'+
		'	list-style-type: none;'+
		'}'+
		'.hunting-helper-sub-container > img {'+
		'	width: 30px;'+
		'	border: 1px solid #ccc;'+
		'	vertical-align: middle;'+
		'	display: inline-block;'+
		'	min-width: 30px;'+
		'	min-height: 30px;'+
		'}'+
		'.hunting-helper-container {'+
		'	display: none;'+
		'	padding: 0 0 0 1em;'+
		'}'+
		'.hunting-helper-show-all:hover {'+
		'	cursor: pointer;'+
		'}'+
		'.f-right {'+
		'	float: right;'+
		'}'+
		'.hunting-helper-status {'+
		'	width: 16px;'+
		'	height: 16px;'+
		'}'+
		'.hunting-helper-status-ok {'+
		'	background: url(https://cdn2.iconfinder.com/data/icons/basicset/tick_16.png);'+
		'}'+
		'.hunting-helper-status-ko {'+
		'	background: url(https://cdn1.iconfinder.com/data/icons/basicset/delete_16.png);'+
	'}';

	String.prototype.trim = function() {
		return this.replace(/^\s*/, "").replace(/\s*$/, "");
	}

	function $(selector, node) {
		return ((node != null || typeof(node) != "undefined") ? node : document).querySelectorAll(selector);
	}

	/**
	* Constructeur de l'objet HuntingHelper
	*/
	function HuntingHelper() {
		this.definitions = {};
		this.trophies = [];
		this.server = null;
	}

	/**
	* Initialise le traitement des trophées :
	*  - extraction des trophées
	*  - connexion à IndexedDB
	*/
	HuntingHelper.prototype.init = function() {
		console.log('HuntingHelper::init');
		this.parseTrophies();
		db.open( {
			server: 'pnj',
			version: 1,
			schema: {
				pnj: {
					key: { keyPath: 'nom'},

					// Optionally add indexes
					indexes: {
						nom: { unique: true }
					}
				}
			}
		}).done(jQuery.proxy(this.ready, this));
	}

	/**
	* Cette méthode est appelée quand la connexion à IndexedDB est prête.
	* Puis on va récupérer la liste de tous les PNJ existants et on va afficher les kills par :
	*  - province
	*  - type de pnj
	*  - niveau du pnj
	* @param s Objet serveur d'IndexedDB
	*/
	HuntingHelper.prototype.ready = function(s) {
		console.log('HuntingHelper::ready');
		this.server = s;
		jQuery(".left-frame").append(jQuery('<div id="HuntingHelper-container"></div>'));

		this.server.pnj.query()
			.filter()
			.execute()
			.done(jQuery.proxy(function(results) {
				for(var i = 20 ; i < 45 ; i++) {
					console.log(JSON.stringify(results[i]));
				}
				this.displayByProvinces(results);
				this.displayByKey(results, 'pnjType', 'Trophées par type de PNJ');
				this.displayByKey(results, 'niveau', 'Trophées par niveau', function(str) { return 'Niveau ' + str});
			}, this));
	}

	/**
	* Récupère la liste de tous les trophées et créé un objet JSON du type :
	* {
	*	"Brigand": 12,
	*	"Aigle Géant": 2,
	*	"Mouton": 5
	* }
	*/
	HuntingHelper.prototype.parseTrophies = function() {
		console.log('HuntingHelper::parseTrophies');
		var nodes = $("#central-content .left-frame h5:nth-of-type(3)");
		if(nodes.length === 1) {
			var trophiesTmp = nodes[0].nextSibling.textContent.split(/ - /);
			for(var i = 0, ii = trophiesTmp.length ; i < ii ; i++) {
				var nom = trophiesTmp[i].replace(/^([^\(]+)\(?.*/, "$1").trim();
				var nb = parseInt(trophiesTmp[i].replace(/^.*\(([0-9]+)\).*$/, "$1"), 10);
				if(isNaN(nb)) {
					nb = 1;
				}
				this.trophies[nom] = nb;
			}
		}
	};

	/**
	* Affiche les résultats par provinces.
	* Le traitement entre displayByProvinces et displayByKey est légèrement différent, donc je n'ai pas cherché à les fusionner.
	* @param results Tableau qui contient tous les PNJ.
	*/
	HuntingHelper.prototype.displayByProvinces = function(results) {
		console.log('HuntingHelper::displayByProvinces');

		jQuery("#HuntingHelper-container").append(jQuery('<h5>Trophées par province (<span id="hunting-helper-provinces-show-all" class="hunting-helper-show-all">Tout afficher/cacher</span>)</h5>'+
			'<div id="HuntingHelper-provinces-container"></div>'));

		jQuery("#hunting-helper-provinces-show-all").on('click', function() {
			jQuery("#HuntingHelper-provinces-container .hunting-helper-container").fadeToggle('fast', 'linear');
		});

		var data = {}
		for(var i = 0, ii = results.length ; i < ii ; i++) {
			for(var j = 0, jj = results[i].provinces.length ; j < jj ; j++) {
				if(typeof(data[results[i].provinces[j]]) == "undefined") {
					data[results[i].provinces[j]] = {
						"name": results[i].provinces[j],
						"kills": 0,
						"total": 0,
						"pnj": []
					}
				}
				data[results[i].provinces[j]].pnj.push({
					"nom": results[i].nom,
					"kills": this.trophies[results[i].nom],
					"id": results[i].id,
					"img": results[i].img
				});
				data[results[i].provinces[j]].total++;
				if(this.trophies[results[i].nom] > 0) {
					data[results[i].provinces[j]].kills++;
				}
			}
		}
		this.showResults('provinces', data);
	}

	/**
	* Affiche les résultats en fonction de la clé passée en paramètre.
	* Le traitement entre displayByProvinces et displayByKey est légèrement différent, donc je n'ai pas cherché à les fusionner.
	* @param results Tableau qui contient tous les PNJ.
	* @param key Clé avec laquelle il faut grouper les résultats
	* @param title Titre de la section
	* @param cbLabel Fonction permet de modifier le libellé de sous-sections comme on veut
	*/
	HuntingHelper.prototype.displayByKey = function(results, key, title, cbLabel) {
		console.log('HuntingHelper::displayByPnjTypes');

		jQuery("#HuntingHelper-container").append(jQuery('<h5>' + title + ' (<span id="hunting-helper-' + key + '-show-all" class="hunting-helper-show-all">Tout afficher/cacher</span>)</h5>'+
			'<div id="HuntingHelper-' + key + '-container"></div>'));

		jQuery("#hunting-helper-" + key + "-show-all").on('click', function() {
			jQuery("#HuntingHelper-" + key + "-container .hunting-helper-container").fadeToggle('fast', 'linear');
		});

		var data = {}
		for(var i = 0, ii = results.length ; i < ii ; i++) {
			if(typeof(data[results[i][key]]) == "undefined") {
				data[results[i][key]] = {
					"name": (((typeof(cbLabel) === "function")) ? cbLabel(results[i][key]) : results[i][key]),
					"kills": 0,
					"total": 0,
					"pnj": []
				}
			}

			data[results[i][key]].pnj.push({
				"nom": results[i].nom,
				"kills": this.trophies[results[i].nom],
				"id": results[i].id,
				"img": results[i].img
			});

			data[results[i][key]].total++;
			if(this.trophies[results[i].nom] > 0) {
				data[results[i][key]].kills++;
			}
		}
		this.showResults(key, data);
	}

	/**
	* Cette méthode va afficher les résultats obtenus
	* @param type Type de liste (provinces, types, etc.)
	* @param data Données à mettre en forme
	*/
	HuntingHelper.prototype.showResults = function(type, data) {
		console.log('HuntingHelper::showResults');
		var keys = Object.keys(data).sort();
		for(var i = 0, ii = keys.length ; i < ii ; i++) {
			var key = keys[i];
			if(data.hasOwnProperty(key)) {
				var shortId = data[key].name.replace(/[\s\.]/g, "_");

				jQuery("#HuntingHelper-" + type + "-container").append(jQuery('<div class="hunting-helper-title" id="' + shortId + '-' + type + '-title">' +
					data[key].name + " - " + data[key].kills + "/" + data[key].total +
					'<span class="f-right hunting-helper-status hunting-helper-status-' + ((data[key].kills == data[key].total) ? 'ok' : 'ko' ) + '">&nbsp;</span>'+
					'</div>'+
					'<ul class="hunting-helper-container "id="' + shortId + '-' + type + '-container"></ul>'));

				var cb = function(id) {
					return function() {
						jQuery('#' + id + '-' + type + '-container').fadeToggle("fast", "linear");
					};
				}(shortId);

				jQuery('#' + shortId + '-' + type + '-title').on('click', cb);

				var sortedData = data[key].pnj.sort(function(a,b) {
					return a.nom > b.nom;
				});
				for(var j = 0, jj = sortedData.length ; j < jj ; j++) {
					var kills = this.trophies[sortedData[j].nom];
					if(typeof(kills) == "undefined") {
						kills = 0;
					}
					jQuery('#' + shortId + '-' + type + '-container').append(jQuery('<li class="hunting-helper-sub-container" id="' + shortId + '-' + type + '-sub-container">'+
					'   <img src="' + sortedData[j].img + '" />'+
					'   <span style="">' + sortedData[j].nom + ' : ' + kills + '</span>'+
					'</li>'));
				}
			}
		}
	}

	// On lance le traitement quand le DOM est prêt
	document.addEventListener("DOMContentLoaded", function() {
		var ht = new HuntingHelper();
		ht.init();
		jQuery("body").append(jQuery('<style type="text/css">' + style + '</style>'));
	}, false);

})();
