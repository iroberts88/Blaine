var fs = require('fs'),
	Jimp = require('jimp');


function init(){
	Jimp.read('sprites.png', function (err,image){
		if (err){throw err}
		image.write('black.jpeg');
	});
}

init();



