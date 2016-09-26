#!/usr/bin/env node

/*
1. make a master array of objects:
playsList = [
{
	"timeIndex":XXXXXXX,
	"homeTeamProbDiff":99999
},
...
{
	"timeIndex":XXXXXXX,
	"homeTeamProbDiff":-99999
}
]

2. Take that list, and use it to pluck the actual plays from the play-by-play.
3. Write the list to an external file.
*/

var d3 = require('d3');
var fs = require('fs');
var _collection = require('lodash/collection');
var _array = require('lodash/array');
var colors = require('colors');

function makePlaysList(plays, homeAwayTeam){
	/*
	returns an object which of the 10 omst impactful plays (largest swings in winprob, 
	sorted by the absolute value of change in win prob for that team
	*/

	console.log('>>> Making top plays lists'.green)
	var currentProb,
	nextProb;


	for (var i=0; i < plays.length; i++){

			currentProb = plays[i]["prob"][homeAwayTeam]
			nextProb = i + 1 < plays.length ? plays[(i+1)]["prob"][homeAwayTeam] : 0;
			if(i == 0){
				// We want to skip the kickoff. 
				plays[i]["probDiffAbs"] = 0;
			} else {
				plays[i]["probDiffAbs"] = Math.abs(nextProb-currentProb);
			}
			plays[i]['resultingChangeInWinProb'] = (nextProb-currentProb);
			plays[i]["playIndex"] = i;
	}

	// take the array of times/winProbJumps and sort it by most impactful
	// plays (absolute value of win prob difference), not time.
	sortedPlays = _collection.orderBy(plays, 'probDiffAbs', 'desc');

	// Filter the list down to just the top 10 plays by abs value
	retval = _array.slice(sortedPlays, 0, 10);
	return retval
}


var gameID = "No game id set";

process.argv.forEach((val, index) => {
	// Cycle through the arguments to find the id
	if(val.indexOf('id') > -1){
		gameID = val.split('=')[1];
	}
	  
});

const playsData = gameID;

fs.readFile(`data/winprobability__${playsData}.json`, 'utf8', (err, data) => {
	if (err) throw err;
	const jsonData = JSON.parse(data);
	const plays = jsonData['plays'];
	const homeAwayTeam = jsonData['metadata']['home'] == 'Chicago' ? 'home' : 'away';


	const topPlays = makePlaysList(plays, homeAwayTeam);
	// const filteredPlays = filterPlaysList(plays, topPlays);

	console.log(">>> Writing file to external".green);
	fs.writeFile(`data/top_plays/top_plays_${playsData}.json`, JSON.stringify(topPlays), (err) => {
		if(err) {
			return console.log(err.red.inverse);
		}
		console.log(">>> The file was saved!".green.inverse);
	}); 
});
