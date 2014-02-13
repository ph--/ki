Kraland
==
Cette page contient un certain nombre de scripts utilisables sur les pages de Kraland.org.

Remarques sur les scripts
--
- Aucune information n'est envoyée vers l'extérieur.
- Aucune information n'est stockée en dehors de votre navigateur.
- Les techniques de stockage utilisées sont toutes locales, et sont gérées par le navigateur : IndexedDB, localStorage.
- Certains librairies ont été utilisées : db.js, jQuery, DataTables.

Bestiaire sous forme de tableau triable/filtrable
--
Le premier script (pnj.user.js) permet d'avoir une mise en forme plus interactive du bestiaire.
Chaque page du bestiaire est disponible sous la forme d'un tableau triable, filtrable sur de nombreuses informations (niveau, carrières, nom, province, etc.).

![alt tag](http://i.imgur.com/gfETyud.png)

Il permet également de stocker les informations de ces PNJ dans une base de données au sein du navigateur (via IndexedDB) sous la forme d'objets JSON.

Exemple d'objet :
```javascript
{
   "pnjType":"Créatures",
   "id":"222",
   "img":"http://www.kramages.org/2/npc/2/222.jpg",
   "description":"Hésitant entre violence et méchanceté, le démon majeur combine généralement les deux dans ses relations avec les êtres humains. Il peut être invoqué par un puissant sorcier pour agresser quelqu´un.",
   "armes":"Arme de contact : Épée Courte (+3) - Arme de distance : Arc (+2)",
   "provinces":[
      "Accalmie",
      "Désert Démoniaque",
      "Pédestrie"
   ],
   "nom":"Démon Majeur",
   "niveau":4,
   "carriere":{
      "nom":"Mercenaire",
      "niveau":2
   },
   "type":{
      "nom":"Démon",
      "niveau":4
   },
   "politique":{
      "nom":"Aucune",
      "niveau":0
   },
   "combat":{
      "nom":"Lame Précise",
      "niveau":3
   },
   "pouvoir":{
      "nom":"Aucune",
      "niveau":0
   },
   "carac":{
      "FOR":6,
      "VOL":4,
      "CHA":1,
      "GES":2,
      "INT":4,
      "PER":5
   },
   "competences":{
      "cb_mn":6,
      "cb_cc":5,
      "cb_dist":3
   },
   "pdv":55,
   "armure":2
}
```
Mise en forme des trophées
--
Le second script (hunting.user.js) permet de faire des regroupements des différents trophées. Pour fonctionner, il est nécessaire d'avoir installé le script du bestiaire (pnj.user.js) et d'avoir mis à jour la base dans chacune des pages du bestaire (Ex : Dans la section « Créatures » du bestiaire, il faut cliquer sur le bouton « (Màj de la base) » qui se trouve dans le titre de la page).

Ensuite, il faut se rendre dans la section « Profil détaillé » et visualiser les différents regroupements (par province, par type de PNJ, par niveau).

![alt tag](http://i.imgur.com/Wwwwpyx.png)
![alt tag](http://i.imgur.com/Ho74k9B.png)


Journalisation des ordres effectués
--
Ce script permet de conserver dans le navigateur une trace de tous les ordres qui ont été effectués. Les ordres sont stockés sous forme d'objets JSON via localStorage :
```javascript
{
    "timestamp": 1381778220,
    "chances": 28,
    "jet": 52,
    "result": false,
    "data": "Vous êtes entré, sans réussir à être discret, dans le bâtiment Hôtel « Le Jus de Citrouille » [19,8]."
}
```
On retrouve :
 - timestamp : correspond à la date (ici 14/10/2013 à 21:17)
 - chances : les chances de réussir l'action
 - jet : le jet réalisé
 - result : action réussie ou ratée (true = réussie, false = ratée)
 - data : le message associé à l'ordre (ça peut être un discours complet)
 
À partir de ces informations, il est ensuite possible de réaliser des statistiques, par exemple (via la console Javascript de votre navigateur) :
```javascript
var nb = 0;
var totalJet = 0;
var totalPotentiel = 0;
for(var key in localStorage) {
    if(key.indexOf("stat_") != -1) {
        var json = JSON.parse(localStorage.getItem(key));
        var message = "" + json.data;
        if(!message.match(/pas réussi à vous cacher/)) {
            totalJet += json.jet;
            totalPotentiel += json.chances;
            nb++;
        }
    }
}
console.log("Potentiel moyen", totalPotentiel/nb);
console.log("Jet moyen", totalJet/nb);
console.log("Total", nb);
```

Dans cet exemple, j'ai enlevé les échecs pour se cacher car ça me pourrissait un peu les résultats. Et cela pourrait donner :
```
Potentiel moyen, 65.05671077504726
Jet moyen, 45.555765595463136
Total, 529
```

Qui a dit que la moyenne devrait être de 50 ? ;-)

Formulaire de recherche dans la liste des ordres
--
Ce script permet, comme le titre l'indique, de pouvoir chercher des informations directement dans la liste des ordres par :
 - nom de l'ordre
 - jet utilisé pour l'ordre
 - description de l'ordre

Le formulaire de recherche se trouve au-dessus de chaque liste (personnage, bâtiments, rencontres, etc.).
