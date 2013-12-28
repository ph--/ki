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
		'#HuntingHelper-container textarea {'+
		'	width: 100%;'+
		'	height: 5em;'+
		'	margin: 0 0 5px 0;'+
		'}'+
		'#HuntingHelper-container button {'+
		'	border: 1px solid #888;'+
		'	background-color: #eee;'+
		'	border-radius: 7px;'+
		'	padding: 5px 7px;'+
		'	float: right;'+
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
		'	border-radius:50%;'+
		'}'+
		'.hunting-helper-status-0 {'+
		'	background-image: -moz-radial-gradient(45px 45px 45deg, circle farthest-corner, #AA0000 0%, #FF4040 100%, #FF0000 5%);'+
		'	background-image: radial-gradient(45px 45px 45deg, circle farthest-corner, #AA0000 0%, #FF4040 100%, #FF0000 5%);'+
		'}'+
		'.hunting-helper-status-25 {'+
		'	background-image: -moz-radial-gradient(45px 45px 45deg, circle farthest-corner, #EE0000 0%, #FFDD00 100%, #aa5000 5%);'+
		'	background-image: radial-gradient(45px 45px 45deg, circle farthest-corner, #EE0000 0%, #FFDD00 100%, #aa5000 5%);'+
		'}'+
		'.hunting-helper-status-50 {'+
		'	background-image: -moz-radial-gradient(45px 45px 45deg, circle farthest-corner, #CCCC00 0%, #FFFF00 100%, #aa5000 5%);'+
		'	background-image: radial-gradient(45px 45px 45deg, circle farthest-corner, #CCCC00 0%, #FFFF00 100%, #aa5000 5%);'+
		'}'+
		'.hunting-helper-status-75 {'+
		'	background-image: -moz-radial-gradient(45px 45px 45deg, circle farthest-corner, #009900 0%, #00FF00 100%, #0000FF 5%);'+
		'	background-image: radial-gradient(45px 45px 45deg, circle farthest-corner, #009900 0%, #00FF00 100%, #0000FF 5%);'+
		'}'+
		'.hunting-helper-status-100 {'+
		'	background-image: -moz-radial-gradient(45px 45px 45deg, circle farthest-corner, #000000 0%, #00CC00 100%, #0000FF 5%);'+
		'	background-image: radial-gradient(45px 45px 45deg, circle farthest-corner, #000000 0%, #00CC00 100%, #0000FF 5%);'+
		'}'+
	'';

		/*jQuery(".sl").append(jQuery('<div style="background-image:-moz-radial-gradient(45px 45px 45deg, circle farthest-corner, #AA0000 0%, #FF4040 100%, #FF0000 5%);height:16px;width:16px;border-radius:50%"></div>'));
		jQuery(".sl").append(jQuery('<div style="background-image:-moz-radial-gradient(45px 45px 45deg, circle farthest-corner, #EE0000 0%, #FFDD00 100%, #aa5000 5%);height:16px;width:16px;border-radius:50%"></div>'));
		jQuery(".sl").append(jQuery('<div style="background-image:-moz-radial-gradient(45px 45px 45deg, circle farthest-corner, #CCCC00 0%, #FFFF00 100%, #aa5000 5%);height:16px;width:16px;border-radius:50%"></div>'));
		jQuery(".sl").append(jQuery('<div style="background-image:-moz-radial-gradient(45px 45px 45deg, circle farthest-corner, #009900 0%, #00FF00 100%, #0000FF 5%);height:16px;width:16px;border-radius:50%"></div>'));
		jQuery(".sl").append(jQuery('<div style="background-image:-moz-radial-gradient(45px 45px 45deg, circle farthest-corner, #000000 0%, #00CC00 100%, #0000FF 5%);height:16px;width:16px;border-radius:50%"></div>'));*/

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
		var nodes = $("#central-content .left-frame h5:nth-of-type(3)");
		if(nodes.length > 0) {
			this.parseTrophies(nodes[0].nextSibling.textContent);	
		}

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
		jQuery(".left-frame").append(jQuery('<div id="HuntingHelper-container">'+
			'<h5>Saisir des trophées manuellement</h5>'+
			'<p><textarea id="custom-hunting"></textarea><button id="custom-hunting-button">Valider</button><div style="clear:right">&nbsp;</div></p>'+
			'<div id="HuntingHelper-container-results"></div>'));

		jQuery("#custom-hunting-button").on('click', jQuery.proxy(this.onCustomHuntingClick, this));
		this.processTrophies();

	}

	HuntingHelper.prototype.onCustomHuntingClick = function() {
		console.log('HuntingHelper::onCustomHuntingClick');
		this.parseTrophies(jQuery("#custom-hunting").val());
		this.processTrophies();
	};

	HuntingHelper.prototype.processTrophies = function() {
		console.log('HuntingHelper::processTrophies');
		jQuery("#HuntingHelper-container-results").html("");
		this.server.pnj.query()
			.filter()
			.execute()
			.done(jQuery.proxy(function(results) {
				this.displayByProvinces(results);
				this.displayByKey(results, 'pnjType', 'Trophées par type de PNJ');
				this.displayByKey(results, 'niveau', 'Trophées par niveau', function(str) { return 'Niveau ' + str});
			}, this));
	};

	/**
	* Récupère la liste de tous les trophées et créé un objet JSON du type :
	* {
	*	"Brigand": 12,
	*	"Aigle Géant": 2,
	*	"Mouton": 5
	* }
	*/
	HuntingHelper.prototype.parseTrophies = function(trophies) {
		console.log('HuntingHelper::parseTrophies');
		this.trophies = [];
		var trophiesArr = trophies.split(/ - /);
		for(var i = 0, ii = trophiesArr.length ; i < ii ; i++) {
			var nom = trophiesArr[i].replace(/^([^\(]+)\(?.*/, "$1").trim();
			var nb = parseInt(trophiesArr[i].replace(/^.*\(([0-9]+)\).*$/, "$1"), 10);
			if(isNaN(nb)) {
				nb = 1;
			}
			this.trophies[nom] = nb;
		}
	};

	/**
	* Affiche les résultats par provinces.
	* Le traitement entre displayByProvinces et displayByKey est légèrement différent, donc je n'ai pas cherché à les fusionner.
	* @param results Tableau qui contient tous les PNJ.
	*/
	HuntingHelper.prototype.displayByProvinces = function(results) {
		console.log('HuntingHelper::displayByProvinces');

		jQuery("#HuntingHelper-container-results").append(jQuery('<h5>Trophées par province (<span id="hunting-helper-provinces-show-all" class="hunting-helper-show-all">Tout afficher/cacher</span>)</h5>'+
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

		jQuery("#HuntingHelper-container-results").append(jQuery('<h5>' + title + ' (<span id="hunting-helper-' + key + '-show-all" class="hunting-helper-show-all">Tout afficher/cacher</span>)</h5>'+
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

				var percentKills = Math.floor(((data[key].kills / data[key].total) * 10000)) / 100;
				if(percentKills == 0) {
					killingStatus = '0';
				}
				else if(percentKills < 25) {
					killingStatus = '25';
				}
				else if(percentKills < 75) {
					killingStatus = '50';
				}
				else if(percentKills < 100) {
					killingStatus = '75';
				}
				else if(percentKills == 100) {
					killingStatus = '100';
				}

				jQuery("#HuntingHelper-" + type + "-container").append(jQuery('<div class="hunting-helper-title" id="' + shortId + '-' + type + '-title">' +
					data[key].name + " - " + data[key].kills + "/" + data[key].total +
					'<span class="f-right hunting-helper-status hunting-helper-status-' + killingStatus + '" title="' + percentKills + ' %">&nbsp;</span>'+
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
