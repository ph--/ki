// ==UserScript==
// @include http://www.kraland.org/main.php?p=3_15*
// ==/UserScript==

(function() {
        document.addEventListener("DOMContentLoaded", function() {

                /** Récupération des informations de tous les ordres de la page */
                var rules_foot = document.querySelectorAll(".rulefoot");
                var rules_title = document.querySelectorAll(".ruletitle");
                var rules_description = document.querySelectorAll(".ruleexpl");

                /** Ajout de liens à côtés des ordres, qui pointent vers la recherche */
                for(var i = 0, ii = rules_title.length ; i < ii ; i++) {
                        var a = document.createElement("a");
                        a.setAttribute("href", "http://www.kraland.org/main.php?p=1_0_1&p1=3&p2=" + rules_title[i].innerHTML.replace(/<.*>/g, "") + "&p3=1&Submit=Ok");
                        a.setAttribute("style", "width:12px; height:12px; display: inline-block; margin: 0 0 0 5px; background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAABGdBTUEAALGeYUxB9wAAACBjSFJNAAB6JQAAgIMAAPn/AACA6AAAUggAARVYAAA6lwAAF2/XWh+QAAABPlBMVEUAAADc0McVExM1NTCyssWhoboiIiIjISFEQ0MqKSkHBwctLS3g1s++wMLAxcjCxsnCxsm4urpraWfd0ce1uLyms723y9bN3ejN2+S+yM6Mj5AUEhLEw8Oqtb+Yt83O7PzZ7//d8P/Y6/emr7RQUE++wMOdr8Sn0e/I6f/Q6f/X7P/h9f+1wsxbXV4AAAC+wMOhs8m43vja9P/m9v/q+P/y/f/Dx89YWVkAAADBwcK1vsm11e3f+f/s+v/y/v/2/P2wsLVCQkEAAAAzJxunqay7xMzY7O/z/v7u8/TExcdsbG0MDAy0tLu5ub2YmJmMkpOcoqKTlZZgYGETExMAAACkpKy/v8inp6pDQ0ICAAAwLi4MCgkAAACLi6K0tMK3t7tmZmUAAACwsL6/v8WJiYkhISCNjpJ9fX1GRkYAAAA7bZc4AAAAanRSTlMAAAAAAAAAAAAAAAAGTqy5rloLA1S8u6uwwW4IHquZi4uLnMJCSLBvgISGh7dwAkmqdJaWlZW8dgUhpHKIk5GcyFoBAnK3iJuoxZUbHq3PmKuvfSMAFp7gVRooIQoai+x9Cn/tqhxUnT8A8O6mBwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAItJREFUCNdjYGBg5OHl4xcQFGJiAAJhEVExcQlJKWkQR0ZWTl5BUUlZBcRRVVPX0NTS1tHVA3L0DQyNjE1MzcwtgBxLK2sbWzt7B0cnIMfZxdXN3cPTy5uBgZnFx9fPPyAwKDiEgYE1NCw8IjIqOoYNqCg2Lj4hkZ2DkwtkcFJySio3AxSkpWdkwtgAyB0VvlrQTAIAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTMtMDYtMDVUMTQ6NDA6MzkrMDI6MDD49VZTAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDEzLTA2LTA1VDE0OjQwOjM5KzAyOjAwiaju7wAAAABJRU5ErkJggg==')");
                        rules_title[i].appendChild(a);
                }

                /** Ajout du formulaire de recherche */
                var div = document.createElement("div");
                div.innerHTML = '<br /><label for="search_rules_by_name" style="display: inline-block; width: 120px; margin: 0 0 5px 0">Nom de la règle</label>' +
                        '<input id="search_rules_by_name" value="" /><br />' +
                        '<label for="search_rules_by_jet" style="display: inline-block; width: 120px; margin: 0 0 5px 0">Jet</label>' +
                        '<input id="search_rules_by_jet" value="" /><br />' +
                        '<label for="search_rules_by_description" style="display: inline-block; width: 120px; margin: 0 0 5px 0">Description</label>' +
                        '<input id="search_rules_by_description" value="" /><br />' +
                        '<span>Résultats&nbsp;&nbsp;: <span id="nb_results"></span></span>';

                /** Écoute des évènements */
                document.querySelector(".page-title-center").parentNode.appendChild(div);
                document.querySelector("#search_rules_by_name").addEventListener('keyup', onNameChanged, false);
                document.querySelector("#search_rules_by_jet").addEventListener('keyup', onJetChanged, false);
                document.querySelector("#search_rules_by_description").addEventListener('keyup', onDescriptionChanged, false);

                function onNameChanged(e) {
                        empty("search_rules_by_description");
                        empty("search_rules_by_jet");
                        search(e.currentTarget.value, rules_title);
                }

                function onJetChanged(e) {
                        empty("search_rules_by_name");
                        empty("search_rules_by_description");
                        search(e.currentTarget.value, rules_foot);
                }

                function onDescriptionChanged(e) {
                        empty("search_rules_by_name");
                        empty("search_rules_by_jet");
                        search(e.currentTarget.value, rules_description);
                }

                function empty(id) {
                        document.querySelector("#" + id).value = '';
                }

                function search(value, nodes) {
                        var reg = new RegExp(value, "i");
                        var found = 0;
                        for(var i = 0, ii = nodes.length ; i < ii ; i++) {
                                if(nodes[i].innerHTML.match(reg)) {
                                        nodes[i].parentNode.style.display = 'block';
                                        found++;
                                }
                                else {
                                        nodes[i].parentNode.style.display = 'none';
                                }
                        }
                        document.querySelector("#nb_results").innerHTML = found;
                }
        }, false);
})();
