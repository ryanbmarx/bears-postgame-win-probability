var cmd = require('node-cmd');
var colors = require('colors');

// This is an array of the season
var games = [
	51804,
	51832,
	51847,
	51853,
	51867,
	51880,
	51893,
	51920,
	51940,
	51956,
	51965,
	51981,
	51997,
	52011,
	52028,
	52045
];

for (var i = 0; i < games.length; i++){
	
	// node generateTopPlays.js id=46932
	// python get_game_stats.py --cycles 1 51801
	var gameID = games[i];

	cmd.get(`python get_game_stats.py --cycles 1 ${gameID}`,(data) => {
		console.log(`Generated play-by-play win probability for game id: ${gameID}`.green);
		if(data){
			cmd.get(`node generateTopPlays.js id=${gameID}`,(data) => {
				console.log(`Generated top plays for game id: ${gameID}`.green);
			});
		}
	});
	
}
