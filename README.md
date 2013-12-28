Kraland
==
Cette page contient un certain nombre de scripts utilisables sur les pages de Kraland.org.

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

