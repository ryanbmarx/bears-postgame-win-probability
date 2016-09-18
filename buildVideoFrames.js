var page = require('webpage').create();
var d3 = require('d3');

var frameRate = 1,
	maxFrames = 50;

//viewportSize being the actual size of the headless browser
page.viewportSize = { width: 1920, height: 1080 };

//the clipRect is the portion of the page you are taking a screenshot of
page.clipRect = { top: 0, left: 0, width: 1920, height: 1080 };


page.open('http://127.0.0.1:5000/test.html', function() {
	page.evaluate(function() {
    document.body.bgColor = 'white';
	});

  	setTimeout(function(){
		var frameCount = 1;
		setInterval( function() {
			var frameLabel = d3.format('05')(frameCount);
			console.log('rendering frames/frame_' + frameLabel + '.png');
			page.render('frames/frame_' + frameLabel + '.png');
			frameCount++;
			if (frameCount > maxFrames){
				phantom.exit();
			}
		}, frameRate);
	}, 0);
});



