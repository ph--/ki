// ==UserScript==
// @include http://www.kraland.org/*
// ==/UserScript==

(function() {

	document.addEventListener("DOMContentLoaded", function() {
		var node = document.querySelector("#central-text .display");
		if(node != null && node.innerHTML.match(/(?:Action (?:Réussie|Ratée)|Réussite critique \!|Échec critique !) \(chances: ([0-9]+)% - jet: ([0-9]+)\)/)) {
			var jet			= parseInt(RegExp.$2, 10);
			var chances		= parseInt(RegExp.$1, 10);
			var timestamp	= parseInt((new Date()).getTime() / 1000, 10);
			var json = JSON.stringify({
				"timestamp": timestamp,
				"chances": chances,
				"jet": jet,
				"result": ((jet <= chances)),
				"data": document.querySelector("#central-text .display p").innerHTML
			});
			window.localStorage.setItem("stat_" + timestamp, json);
		}
	}, false);

})();

// Réussite Critique ! (chances: 50% - jet: 1)