var fs = require('fs'),
	Jimp = require('jimp');

var interval,
	columns = 38,
	rows = 41,
	s = 16,
	x = 0,
	y = 0,
	next = true,
	end = false;

function init(){
	interval = setInterval(tick,20);
}

function tick(){
	if (next && !end){
		x += 1;
		if (x == columns){
			x = 0;
			y += 1;
		}
		if (y == rows){
			end = true;
		}
		cutImage();
		next = false;
	}
}
function cutImage(){
	Jimp.read('sprites.png', function (err,image){
		if (err){throw err}
		console.log('cutting ' + x + 'x' + y);
		image.opaque()
			  .crop(x*s,y*s,s,s);
		var file = x + 'x' + y + '.' + image.getExtension();
		image.write(file);
		next = true;
		if (end){
			clearInterval(interval);
			console.log('done');
		}
	});
}


init();



