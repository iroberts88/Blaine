var fs = require('fs'),
	Jimp = require('jimp');

var next = true,
	end = false,
	num = 1;

function init(){
	interval = setInterval(tick,20);
}

function tick(){
	if (next && !end){
		processImage(num + '.png');
		next = false;
	}
}
function processImage(imgname){
	Jimp.read(imgname, function (err,image){
		if (err){throw err}
		var file = 'b' + num + '.' + image.getExtension();
		image.write(file);
		next = true;
		num += 1;
		if (num == 152){
			clearInterval(interval);
			console.log('done');
		}
	});
}

init();



