//----------------------------------------------------------------
//enums.js
//----------------------------------------------------------------
var enums = {
	CHARACTER: 'cha',
	CONNINFO: 'coi',

	ID: 'i',

	MAP: 'm',
	MAPID: 'mid',
	MAPNAME: 'mna',
	MAPDATA: 'mda',
	MUSIC: 'mu',

	OPEN: 'op',
	OVERLAYRESOURCE: 'ov',

	PLAYERS: 'pla',

	RESOURCE: 're',

	SECTORARRAY: 'sar',
	SERVERUPDATE: 'seu',
	STARTGAME: 'stg',

	TILES: 'ti',
	TRIGGERS: 'triggers',

	X: 'x',

	Y: 'y',

	ZONEDATA: 'zod'
};

var Enums = function() {};

Enums.prototype.init = function(){
	for (var i in enums){
		this[i] = enums[i];
	}
}

exports.Enums = new Enums();