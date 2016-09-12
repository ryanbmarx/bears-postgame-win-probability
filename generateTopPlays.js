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
	nextProb,
	retval={},
	sortedPlays=[];



	plays.forEach( (value, index, array) => {
			// We want to skip the first play, b/c there is no change from previous play. 
			
			currentProb = value["prob"][homeAwayTeam]
			nextProb = index + 1 < plays.length ? plays[(index+1)]["prob"][homeAwayTeam] : 0;

			sortedPlays.push({
				seconds_remaining:value["seconds_remaining"],
				probDiffAbs:Math.abs(nextProb-currentProb),
				probDiff:(nextProb-currentProb)
			});
	});

	// take the array of times/winProbJumps and sort it by most impactful
	// plays (absolute value of win prob difference), not time.
	sortedPlays = _collection.orderBy(sortedPlays, 'probDiffAbs', 'desc');

	// Add most negative plays for home team to return value
	retval = _array.slice(sortedPlays, 0, 10);
	// console.log(retval);
	return retval
}

function filterPlaysList(plays, topPlays){
	/*
	Takes the array of all plays and reduces it down to the most impactful plays It
	uses the result of makePlaysList and uses the seconds_remaining as a key
	*/

	console.log('>>> Plucking top plays from master list'.green);

	var retval = [];
	topPlays.forEach((value, index) => {
		// Go play by play through the top plays lists
		var timeSought = value['seconds_remaining'];
		var probChange = value['probDiff'];
		plays.forEach((value, index) => {
			// Go through each play, looking for a matching time index
			if (value['seconds_remaining'] == timeSought){
				// If there is a match, push the value into the return object.
				value['resultingChangeInWinProb'] = probChange;
				value['playIndex'] = index;
				retval.push(value);
			}
		});
	});
	// console.log(retval);
	return retval;
}

var gameID = "No game id set";

process.argv.forEach((val, index) => {
	// Cycle through the arguments to find the id
	if(val.indexOf('id') > -1){
		gameID = val.split('=')[1];
	}
	  
});

console.log(gameID);

const playsData = gameID;

fs.readFile(`data/winprobability__${playsData}.json`, 'utf8', (err, data) => {
	if (err) throw err;
	const jsonData = JSON.parse(data);
	const plays = jsonData['plays'];
	const homeAwayTeam = jsonData['metadata']['home'] == 'Chicago' ? 'home' : 'away';

	console.log(homeAwayTeam);
//"metadata": {"home": "Chicago", "away": "Green Bay", "is_finished": true}}


	const topPlays = makePlaysList(plays, homeAwayTeam);
	const filteredPlays = filterPlaysList(plays, topPlays);

	console.log(">>> Writing file to external".green);
	fs.writeFile(`data/top_plays/top_plays_${playsData}.json`, JSON.stringify(filteredPlays), (err) => {
		if(err) {
			return console.log(err.red.inverse);
		}
		console.log(">>> The file was saved!".green.inverse);
	}); 
});
