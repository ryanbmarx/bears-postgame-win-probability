#!/usr/bin/env node

var fs = require('fs');
var colors = require('colors');
var xml2js = require('xml2js');
 
var parser = new xml2js.Parser();

fs.readFile(`data/schedule_NFL.xml`, 'utf8', (err, data) => {
	console.log(">>> Generating <options> for dropdown");
	if (err) throw err;

	var bearsGames = "",
		gameCounter = 16,
		atOrVersus = "",
		opponent = "",
		selected="",
		disabled="";

    parser.parseString(data, function (err, result) {
        
    	var sked = result['sport:content']['team-sport-content'][0]['league-content'][0]['season-content'][0]['competition'];
  
		for(var i = sked.length -1; i >= 0; i--){
			var game = sked[i];
			var homeTeam = game['home-team-content'][0]['team'][0]['name'][0];
			var awayTeam = game['away-team-content'][0]['team'][0]['name'][0];
			var startDate = Date.parse(game['start-date'][0]);
			
				if (homeTeam == "Chicago" || awayTeam == "Chicago"){
					if (homeTeam == "Chicago") {
						atOrVersus = "vs.";
						opponent = awayTeam;
					} else {
						atOrVersus = "at"
						opponent = homeTeam;
					}
				if (startDate > Date.now()){
					disabled='disabled';
				}	
					bearsGames += `<option ${disabled} ${selected} value="${ game['id'][0].split(':')[1] }">Game ${ gameCounter }: ${ atOrVersus } ${ opponent }</option>`;
					gameCounter--;
				}
			}
		
    });

	fs.writeFile(`_options.html`, bearsGames, (err) => {
		if(err) {
			return console.log(err.red.inverse);
		}
		console.log(">>> The file was saved!".green.inverse);
	}); 
});
