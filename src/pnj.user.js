// ==UserScript==
// @include http://www.kraland.org/main.php?p=3_14*
// @require http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require https://www.datatables.net/release-datatables/media/js/jquery.js
// @require https://www.datatables.net/release-datatables/media/js/jquery.dataTables.js
// @require https://raw.github.com/aaronpowell/db.js/master/src/db.js
// @grant none
// ==/UserScript==

(function() {
	var scripts = [];
	for(var i = 0, ii = scripts.length ; i < ii ; i++) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = scripts[i];
		document.head.appendChild(script);	
	}

	var style = document.createElement("style");
	style.type = "text/css";
	style.textContent = "\
		#pnjs {\
			width: 100%;\
			margin: 0;\
			background-color: none;\
		}\
		#pnjs th {\
			border: 1px solid #ccc;\
		}\
		#pnjs th:hover {\
			cursor: pointer;\
		}\
		#pnjs td {\
			border: 1px solid #ccc;\
			border-collapse: collapse;\
			text-align: center;\
			padding: 2px;\
		}\
	";
	document.head.appendChild(style);

	document.addEventListener("DOMContentLoaded", function() {
		function getCellValue(idx, cells) {
			return parseInt(cells[idx].innerHTML, 10);
		}

		function getCarriere(content) {
			return {
				"nom": trim(content.replace(/^([^\(]+)\(.*$/, "$1").replace(/^\s/, "").replace(/\s*$/, "")),
				"niveau": parseInt(trim(content.replace(/^([^\(]+)\(([0-9]+).*$/, "$2")), 10)
			};
		}

		function trim(str) {
			return str.replace(/^\s*/, "").replace(/\s*$/, "");
		}

		var pnjs = [];
		var nodes = unsafeWindow.document.querySelectorAll("#central-text > table > tbody > tr");
		var provinces = [];
		var pnjType = jQuery(".page-title-center").prop('textContent');

		if(nodes.length == 0) {
			return;
		}

		for(var i = 0, ii = nodes.length ; i < ii ; i++) {
			if(nodes[i].innerHTML.match(/Provinces : /)) {
				provinces = nodes[i].firstChild.innerHTML.replace(/Provinces\s*:\s*/, "").split(/\s*,\s*/);
				continue;
			}
			else if($(nodes[i].firstChild).hasClass('thb')) {
				console.log(nodes[i].firstChild);
				provinces = [];
			}

			var pnjNode = nodes[i].firstChild.nextSibling;
			if(pnjNode == null) {
				continue;
			}

			var pnj = {};

			pnj.pnjType = pnjType;
			pnj.id 	= nodes[i].firstChild.querySelector("img").src.replace(/.*\/([0-9]+)\.jpg/, "$1");
			pnj.img = nodes[i].firstChild.querySelector("img").src;
			pnj.description = pnjNode.querySelectorAll("p")[1].innerHTML;
			pnj.armes = pnjNode.querySelectorAll("p")[2].innerHTML;
			pnj.provinces = provinces;

			var nom = (pnjNode.querySelector("strong").innerText == undefined) ? pnjNode.querySelector("strong").innerHTML : pnjNode.querySelector("strong").innerText;
			pnj.nom = trim(nom.replace(/^([^\(]+)\(.*$/, "$1"));
			pnjNode.querySelector("strong").innerHTML = '<a name="' + pnj.nom.replace(/\s/g, "_") + '">' + pnj.nom + '</a>';

			// Niveau du PNJ
			pnj.niveau = parseInt(trim(nom.replace(/^([^\(]+)\(niv\. ([0-9]+).*$/, "$2")), 10);

			// Récupération des carrières + niveaux
			var carrieresAll = pnjNode.querySelector("p").innerHTML.split("|");
			pnj.carriere 	= getCarriere(carrieresAll[0]);
			pnj.type 		= getCarriere(carrieresAll[1]);
			pnj.politique 	= getCarriere(carrieresAll[2]);
			pnj.combat 		= getCarriere(carrieresAll[3]);
			pnj.pouvoir 	= getCarriere(carrieresAll[4]);

			// Récupération des caractéristiques
			var cells = pnjNode.querySelectorAll("table tr")[1].querySelectorAll("td");
			pnj.carac = {
				"FOR": getCellValue(0, cells),
				"VOL": getCellValue(1, cells),
				"CHA": getCellValue(2, cells),
				"GES": getCellValue(3, cells),
				"INT": getCellValue(4, cells),
				"PER": getCellValue(5, cells)
			};

			// Récupération des compétences de combat
			pnj.competences = {
				"cb_mn":   getCellValue(8, cells),
				"cb_cc":   getCellValue(9, cells),
				"cb_dist": getCellValue(10, cells)
			};
			pnj.pdv 	= getCellValue(6, cells);
			pnj.armure 	= getCellValue(7, cells);

			pnjs.push(pnj);
		}
		window.pnjsObj = pnjs;

		// Mise à jour de la datable
		refreshTable(pnjs);

		// Ajout d'un bouton pour mettre à jour les données dans la base
		if(jQuery(".update-db").size() == 0) {
			var title = jQuery(".page-title-center").prop('textContent');
			jQuery(".page-title-center").html("");
			jQuery(".page-title-center").append('<span>' + title + '</span>');
			jQuery(".page-title-center").append(jQuery('<button class="update-db">(Màj de la base)</button>'));
			jQuery(".update-db").on('click', updateDB);
		}
	}, false);

	function refreshTable(pnjs) {
		var pnjsArray = [];
		for(var i = 0, ii = pnjs.length ; i < ii ; i++) {
			pnjsArray.push([
				pnjs[i].nom,
				pnjs[i].niveau,
				pnjs[i].carriere.nom, pnjs[i].carriere.niveau,
				pnjs[i].type.nom, pnjs[i].type.niveau,
				pnjs[i].politique.nom, pnjs[i].politique.niveau,
				pnjs[i].combat.nom, pnjs[i].combat.niveau,
				pnjs[i].pouvoir.nom, pnjs[i].pouvoir.niveau,
				pnjs[i].carac.FOR, pnjs[i].carac.VOL, pnjs[i].carac.CHA, pnjs[i].carac.GES, pnjs[i].carac.INT, pnjs[i].carac.PER,
				pnjs[i].pdv,
				pnjs[i].armure,
				pnjs[i].competences.cb_mn, pnjs[i].competences.cb_cc, pnjs[i].competences.cb_dist,
				pnjs[i].provinces
			]);
		}

		$('<table cellpadding="0" style="width:100%; float: left; margin: 0" cellspacing="0" border="0" class="display" id="pnjs"></table>').insertAfter(".page-title:first");
		$("#pnjs").dataTable({
			"iDisplayLength": 50,
			"aaData": pnjsArray,
			"aoColumns": [
				{
					"sTitle": "Nom",
					"mRender": function(val, type, row) {
						return '<a href="#' + val.replace(/\s/g, "_") + '" title="' + row[row.length - 1].join(', ') + '">' + val + '</a';
					}
				},
				{"sTitle": "Niveau"},
				{"sTitle": "Car. nom"}, {"sTitle": "Car. niveau"},
				{"sTitle": "Type. nom"}, {"sTitle": "Type. niveau"},
				{"sTitle": "Pol. nom"}, {"sTitle": "Pol. niveau"},
				{"sTitle": "Cb. nom"}, {"sTitle": "Cb. niveau"},
				{"sTitle": "Pv. nom"}, {"sTitle": "Pv. niveau"},
				{"sTitle": "FOR"}, {"sTitle": "VOL"}, {"sTitle": "CHA"}, {"sTitle": "GES"}, {"sTitle": "INT"}, {"sTitle": "PER"},
				{"sTitle": "Pdv"},
				{"sTitle": "Armure"},
				{"sTitle": "Cb mn"}, {"sTitle": "Cb cc"}, {"sTitle": "Cb dist"},
				{"sTitle": "Provinces", "bVisible": false}
			]
		});
	}

	var updating = false;
	function updateDB() {
		if (!window.indexedDB) {
			alert("Votre navigateur ne gère pas la fonctionnalité indexedDB");
 		}

 		if(updating == true) {
 			alert("Mise à jour en cours, veuillez patienter");
 			return;
 		}

 		updating = true;
 		var waitingMessage = "En cours...";
 		jQuery(".update-db").html(waitingMessage);

		var server;
		db.open( {
			server: 'pnj',
			version: 1,
			schema: {
				pnj: {
					key: { keyPath: 'id'},

					// Optionally add indexes
					indexes: {
						id: { unique: true }
					}
				}
			}
		})
		.done(function (s) {
			server = s;
			var added = 0;
			var toAdd = window.pnjsObj.length;

			for(var i = 0, ii = window.pnjsObj.length ; i < ii ; i++) {
				server.pnj.query()
					.filter("id", window.pnjsObj[i].id.toString())
					.execute()
					.done($.proxy(function(pnj, results) {
						if(results.length > 0) {
							console.log("already exists, updating", pnj);
							server.pnj.remove(pnj.id).done(jQuery.proxy(function(pnj) {
								server.pnj.add(pnj).done(function(item) {
									console.log("new item added", item);
									added++;
									if(added == toAdd) {
 										jQuery(".update-db").html("(Màj de la base)");
 										updating = false;
									}
									else {
										jQuery(".update-db").html(waitingMessage + ' ' + added + '/' + toAdd);
									}
								});
							}, this, pnj));
						}
						else {
							server.pnj.add(pnj).done(function(item) {
								console.log("new item added", item);
								added++;
								if(added == toAdd) {
									jQuery(".update-db").html("(Màj de la base)");
									updating = false;
								}
								else {
									jQuery(".update-db").html(waitingMessage + ' ' + added + '/' + toAdd);
								}
							});
						}
				}, this, window.pnjsObj[i]));
			}
		});
	}
})();