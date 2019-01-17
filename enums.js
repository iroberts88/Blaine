//----------------------------------------------------------------
//enums.js
//----------------------------------------------------------------
var enums = {
        CHANGEMAP: 'chm',
        CHARACTER: 'cha',
        CONNINFO: 'coi',

        ID: 'i',

        MAP: 'm',
        MAPID: 'mid',
        MAPNAME: 'mna',
        MAPDATA: 'mda',
        MOVEPC: 'mpc',
        MUSIC: 'mu',

        NAME: 'nam',

        OPEN: 'op',
        OVERLAYRESOURCE: 'ov',

        PLAYERS: 'pla',

        REQUESTMAPDATA: 'req',
        RESOURCE: 're',

        SECTOR: 'sec',
        SECTORARRAY: 'sar',
        SERVERUPDATE: 'seu',
        START: 'sta',
        STARTGAME: 'stg',

        TILE: 'til',
        TILES: 'tis',
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