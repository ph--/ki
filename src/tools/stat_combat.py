#!/usr/bin/python
#coding: utf-8

import sys
import getopt
import re
import requests
import json
import os

from os import listdir
from os.path import isfile, join
from bs4 import BeautifulSoup

user = {
	"login": "",
	"password": "",
	"id": 0
}

root = "http://www.kraland.org/"
url_login = root + "main.php?p=1&a=100"
url_test  = root + "main.php?p=2_3"
url_fightDefinitions = root + "report.php?p=2&p1="

directory_save = "/tmp/"
file_fightDefinition_prefix = 'KI Combat - '

proxyDict = {
	#"http"  : ""
}

def usage(errorcode):
	print "\nUsage: " + sys.argv[0] + " [--get] [--file=<fichier à importer>] [--directory=<dossier à importer>] [--exportAll=<fichier CSV de sortie>] [--exportSummary=<fichier CSV de sortie>]"
	print ""
	print "	--get: Permet de récupérer au format HTML tous les combats visibles dans la liste des combats."
	print "	--file<fichier à importer> : Permet d'importer un fichier HTML d'un combat"
	print "	--directory<dossier à importer> : Permet d'importer un répertoire dans lequel se trouvent des fichiers HTML d'un combat. Fait la même chose que --file=<fichier> mais avec un répertoire."
	print " --exportAll=<fichier CSV de sortie>: Retourne au format CSV la liste de tous les combats et de tous les participants, avec un certain nombre de statistiques."
	print " --exportSummary=<fichier CSV de sortie>: Retourne au format CSV la liste de tous les participants et un certain nombre de statistiques."
	print ""
	print "Exemple de exportAll:"
	print "	Combat;Personnage;Nombre de rounds;Dégâts infligés;Dégâts reçus;Nombre d'attaques;Nombre d'attaques réussies;Nombre de parades;Nombre de parades réussies"
	print "	89351-Tyrant Kane VS 2 Policiers;Dragonneau;9;35;24;9;7;17;8"
	print "	89351-Tyrant Kane VS 2 Policiers;2 Policiers;5;13;41;15;3;9;5"
	print "	89351-Tyrant Kane VS 2 Policiers;Tyrant Kane;2;19;6;4;2;5;3"
	print "	89351-Tyrant Kane VS 2 Policiers;Policier;4;17;13;7;2;4;0"
	print ""
	print "Exemple de exportSummary:"
	print "	Personnage;Nombre de rounds;Dégâts infligés;Dégâts reçus;Ciblé;Nombre d'attaques;Nombre d'attaques réussies;Nombre de parades;Nombre de parades réussies"
	print "	2 Policiers;5;13;41;9;15;3;9;5"
	print "	Dragonneau;10;38;43;20;10;8;20;11"
	print "	Tyrant Kane;2;19;6;5;4;2;5;3"
	print "	Policier;4;17;13;4;7;2;4;0"


	print ""
	sys.exit(errorcode)

def main(argv):
	try:
		opts, args = getopt.getopt(argv, "", ["get", "file=", "directory=", "exportAll=", "exportSummary="])
	except getopt.GetoptError:
		usage(2)

	u = StatCombat(user["login"], user["password"], user["id"])
	u.login()

	fightDefinitions = []
	fights = []
	for opt, arg in opts:

		if opt == '-h':
			usage(0)

		elif opt in ("--get"):
			fightDefinitions = u.getFights()
			u.saveFightDefinition(fightDefinitions)
			fights = u.parseFights(fightDefinitions)

		elif opt in ("--file"):
			fightDefinitions = u.importFile(arg)
			u.parseFights(fightDefinitions)

		elif opt in ("--directory"):
			fightDefinitions = u.importDirectory(arg)
			fights = u.parseFights(fightDefinitions)

		elif opt in ("--exportAll"):
			u.exportAll(fights, arg)

		elif opt in ("--exportSummary"):
			u.exportSummary(fights, arg)

		else:
			usage(2)


class StatCombat:
	username = ""
	password = ""
	userid = 0
	cookies = ""
	session = requests.Session()

	def __init__(self, username, password, userid):
		self.username = username
		self.password = password
		self.userid = userid

	##
	## Se connecte à KI
	##
	def login(self):
		# Authenticate
		data = {"p1": self.username, "p2": self.password}
		r = self.session.post(url_login, proxies=proxyDict, params = data) 
		self.cookies = r.cookies

		# Check authentication
		r = self.session.get(url_test, cookies = self.cookies, proxies=proxyDict)
		soup = BeautifulSoup(r.content)
		for p in soup.find_all("p", class_="right-boxprofile-name"):
			print " -> Connecté en tant que " + str(p.text)

	##
	## Récupère les informations des combats du personnage courant
	##
	def getFights(self):
		# print "-- Getting fightDefinitions --"
		r = self.session.get(url_fightDefinitions + str(self.userid), proxies=proxyDict)
		r.content
		fightDefinitions = []
		soup = BeautifulSoup(r.content)
		for li in soup.find_all("li"):
			link = li.find("a", text=re.compile(r'VS'))

			if link != None:
				m = re.search('.*=([0-9]+)$', link["href"])
				id = "0"
				if m:
					id = m.group(1)
				r = requests.get(root + link["href"], cookies = self.cookies, proxies=proxyDict)
				fightDefinitions.append({
					"title": id + "-" + link.text,
					"url": link["href"],
					"content": r.content
				})
		return fightDefinitions

	##
	## Lit un fichier en particulier, et recupère son contenu
	##
	def importFile(self, file):
		# print "Importing " + file
		f = open(file, "r");
		fightDefinitions = [{
			"url": "999",
			"content": f.read(),
			"title": file_fightDefinition_prefix + os.path.basename(file)
		}]
		return fightDefinitions

	##
	## Lit le contenu d'un répertoire, lit tous les fichiers trouvés, et récupère leur contenu
	##
	def importDirectory(self, path):
		# print "Importing " + path
		files = [ f for f in listdir(path) if isfile(join(path, f)) ]
		fightDefinitions = []
		for file in files:
			f = open(path + file, "r");
			fightDefinitions.append({
				"url": "999",
				"content": f.read(),
				"title": file_fightDefinition_prefix + os.path.splitext(os.path.basename(file))[0]
			})
		return fightDefinitions

	##
	## Sauvegarde le HTML des définitions de combat
	##
	def saveFightDefinition(self, fightDefinitions):
		# print "-- Saving fightDefinitions --"
		for fightDefinition in fightDefinitions:
			m = re.search('.*=([0-9]+)$', fightDefinition["url"])
			if m:
				fightDefinitionid = m.group(1)
				fh = open(directory_save + "/" + fightDefinition["title"] + ".html", "w")
				fh.write(fightDefinition["content"])
				fh.close();
			else:
				print "Mauvaise URL de combat : " + fightDefinition["url"]

	##
	## Parse le HTML des définitions de combat passées en paramètre
	##
	def parseFights(self, fightDefinitions):
		fights = {}
		for fightDefinition in fightDefinitions:
			# print "-- Parsing fightDefinition " + fightDefinition["title"] + " --"

			fights[fightDefinition["title"]] = {}
			personnages = fights[fightDefinition["title"]] = {}
			lastPersonnage = ''

			soup = BeautifulSoup(fightDefinition["content"])

			nbRounds = len(soup.find_all("p", class_="t", text=re.compile(r'Round')))
			currentRound = 1


			for table in soup.find_all("table"):
				for row in table.find_all("tr"):
					if len(row.find_all('td')) > 1:
						cells = row.find_all('td', class_="tdb")
						if len(cells) < 3:
							continue

						modifier = 0
						if len(cells) == 6:
							lastPersonnage = cells[0].text
							if lastPersonnage not in personnages:
								personnages[lastPersonnage] = {
									"Nom": lastPersonnage,
									"Rounds": {},
									"DegatsRecus": 0,
									"DegatsInfliges": 0
								}
						elif len(cells) == 5:
							modifier = -1

						attaqueCell = cells[2 + modifier].text
						cibleCell 	= cells[3 + modifier].text
						paradeCell 	= cells[4 + modifier].text
						degatsCell 	= str(cells[5 + modifier].text)

						# init
						nomAttaque = ''
						jetAttaque = 0
						chanceAttaque = 0
						nomParade = ''
						jetParade = 0
						chanceParade = 0
						degatsRecus = 0
						degatsInfliges = 0

						# A attaqué
						m = re.search('^(?:([^\(]+)|-)\(([0-9]+)/([0-9]+)%\)', attaqueCell)
						if m:
							nomAttaque = m.group(1)
							jetAttaque = m.group(2)
							chanceAttaque = m.group(3)

						# A fait une parade
						m = re.search('^(?:([^\(]+)|-)\(([0-9]+)/([0-9]+)%\)', paradeCell)
						if m:
							nomParade = m.group(1)
							jetParade = m.group(2)
							chanceParade = m.group(3)

						# Dégâts infliges
						m = re.search('^.* ([0-9]+) PdV', degatsCell)
						if m:
							degatsInfliges = int(m.group(1))

						if cibleCell not in personnages:
							personnages[cibleCell] = {
								"Nom": cibleCell,
								"Rounds": {},
								"DegatsRecus": 0,
								"DegatsInfliges": 0
							}

						if "Round " + str(currentRound) not in personnages[cibleCell]["Rounds"]:
							personnages[cibleCell]["Rounds"]["Round " + str(currentRound)] = {
								"DegatsRecus": 0,
								"DegatsInfliges": 0,
								"Attaque": [],
								"Parade": [],
								"Cible": 0
							}

						# Cible
						if "DegatsRecus" not in personnages[cibleCell]:
							personnages[cibleCell]["DegatsRecus"] = 0

						if "DegatsRecus" not in personnages[cibleCell]["Rounds"]["Round " + str(currentRound)]:
							personnages[cibleCell]["Rounds"]["Round " + str(currentRound)]["DegatsRecus"] = 0

						personnages[cibleCell]["DegatsRecus"] += degatsInfliges
						personnages[cibleCell]["Rounds"]["Round " + str(currentRound)]["DegatsRecus"] += degatsInfliges
						personnages[cibleCell]["Rounds"]["Round " + str(currentRound)]["Cible"] += 1

						if nomParade != "":
							personnages[cibleCell]["Rounds"]["Round " + str(currentRound)]["Parade"].append({
								"Nom": nomParade,
								"Jet": int(jetParade),
								"Chances": int(chanceParade),
								"Résultat": (int(jetParade) < int(chanceParade))
							})

						# Personnage courant
						if "Round " + str(currentRound) not in personnages[lastPersonnage]["Rounds"]:
							personnages[lastPersonnage]["Rounds"]["Round " + str(currentRound)] = {
								"DegatsInfliges": 0,
								"Attaque": [],
								"Parade": [],
								"Cible": 0
							}

						personnages[lastPersonnage]["DegatsInfliges"] += degatsInfliges

						personnages[lastPersonnage]["Rounds"]["Round " + str(currentRound)]["DegatsInfliges"] += degatsInfliges
						if nomAttaque != "":
							personnages[lastPersonnage]["Rounds"]["Round " + str(currentRound)]["Attaque"].append({
								"Nom": nomAttaque,
								"Jet": int(jetAttaque),
								"Chances": int(chanceAttaque),
								"Résultat": (int(jetAttaque) < int(chanceAttaque)),
								"Infligés": degatsInfliges
							})

				currentRound += 1

			f = open(directory_save + '/' + fightDefinition["title"] + ".json", "w")
			f.write(json.dumps(fights[fightDefinition["title"]]))
			f.close()

		f = open(directory_save + "/all.json", "w")
		f.write(json.dumps(fights))
		f.close()

		return fights

	##
	## Retourne la liste de tous les combats et de tous les personnages, ainsi qu'un certain nombre d'informations
	##
	def exportAll(self, fights, outputFile):
		f = open(outputFile, 'w')
		f.write(u"Combat;Personnage;Nombre de rounds;Dégâts infligés;Dégâts reçus;Nombre d'attaques;Nombre d'attaques réussies;Nombre de parades;Nombre de parades réussies\n".encode("utf-8"))
		for fightKey, fightValue in fights.iteritems():

			for persoKey, persoValue in fights[fightKey].iteritems():
				nbRounds 	= len(persoValue["Rounds"])
				nbAttaquesSuccess = 0
				nbParadesSuccess = 0
				degatsRecus = 0
				degatsInfliges = 0
				nbAttaques = 0
				nbParades = 0
				for roundKey, roundValue in fights[fightKey][persoKey]["Rounds"].iteritems():
					nbAttaques 	+= len([ item for item in roundValue["Attaque"] if item["Chances"] > 0 ])
					nbParades 	+= len([ item for item in roundValue["Parade"] if item["Chances"] > 0 ])
					nbAttaquesSuccess += len([ item for item in roundValue["Attaque"] if item["Résultat"] == True ])
					nbParadesSuccess += len([ item for item in roundValue["Parade"] if item["Résultat"] == True ])

				degatsInfliges = persoValue["DegatsInfliges"]
				degatsRecus = persoValue["DegatsRecus"]

				row = fightKey + ";" + persoValue["Nom"] + ";" + str(nbRounds) + ";" + str(degatsInfliges) + ";" + str(degatsRecus) + ";" + str(nbAttaques) + ";" + str(nbAttaquesSuccess) + ";" + str(nbParades) + ";" + str(nbParadesSuccess)
				f.write(unicode(row).encode("utf-8") + "\n")

		f.close()

	##
	## Renvoie un rapport au format CSV par personnage avec un certain nombre d'informations
	##
	def exportSummary(self, fights, outputFile):
		personnages = {}
		for fightKey, fightValue in fights.iteritems():
			for persoKey, persoValue in fights[fightKey].iteritems():
				if persoKey not in personnages:
					personnages[persoKey] = {
						"Nombre de rounds": 0,
						"Dégats Infligés": 0,
						"Dégats Reçus": 0,
						"Nombre d'attaques": 0,
						"Nombre d'attaques réussies": 0,
						"Nombre de parades": 0,
						"Nombre de parades réussies": 0,
						"Ciblé": 0
					}

				personnages[persoKey]["Nombre de rounds"] += len(persoValue["Rounds"])
				personnages[persoKey]["Dégats Infligés"] += persoValue["DegatsInfliges"]
				personnages[persoKey]["Dégats Reçus"] += persoValue["DegatsRecus"]

				for roundKey, roundValue in fights[fightKey][persoKey]["Rounds"].iteritems():
					personnages[persoKey]["Ciblé"] += roundValue["Cible"]
					personnages[persoKey]["Nombre d'attaques"] += len([ item for item in roundValue["Attaque"] if item["Chances"] > 0 ])
					personnages[persoKey]["Nombre de parades"] += len([ item for item in roundValue["Parade"] if item["Chances"] > 0 ])
					personnages[persoKey]["Nombre d'attaques réussies"] += len([ item for item in roundValue["Attaque"] if item["Résultat"] == True ])
					personnages[persoKey]["Nombre de parades réussies"] += len([ item for item in roundValue["Parade"] if item["Résultat"] == True ])

		f = open(outputFile, "w")
		f.write("Personnage;Nombre de rounds;Dégâts infligés;Dégâts reçus;Ciblé;Nombre d'attaques;Nombre d'attaques réussies;Nombre de parades;Nombre de parades réussies\n")

		for key, value in personnages.iteritems():
			f.write(unicode(key + ";" + str(value["Nombre de rounds"]) + ";" +
			str(value["Dégats Infligés"]) + ";" +
			str(value["Dégats Reçus"]) + ";" +
			str(value["Ciblé"]) + ";" +
			str(value["Nombre d'attaques"]) + ";" +
			str(value["Nombre d'attaques réussies"]) + ";" + 
			str(value["Nombre de parades"]) + ";" +
			str(value["Nombre de parades réussies"])).encode("utf-8") + "\n")
		f.close()


def is_ascii(s):
    return all(ord(c) < 128 for c in s)



if __name__ == "__main__":
	main(sys.argv[1:])

