var fs = require('fs'),
	Jimp = require('jimp');

var interval,
	columns = 2,
	rows = 7,
	s = 16,
	x = -1,
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
		if (y == rows+1){
			end = true;
		}
		cutImage();
		next = false;
	}
}
function cutImage(){
	Jimp.read('file.png', function (err,image){
		if (err){throw err}
		console.log('cutting ' + x + 'x' + y);
		image.opaque()
			  .crop(x*s,y*s,s,s);
		var file = 'pkmn_menu_' + (y+1) + '-' + (x+1) + '.'  + image.getExtension();
		image.write(file);
		next = true;
		if (end){
			clearInterval(interval);
			console.log('done');
		}
	});
}


init();



