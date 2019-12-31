var fs = require('fs');

var enums = [
        'ACCURACY',
        'ACTIONS',
        'ACTION',
        'ACTION_TEXT',
        'ACTION_ANIMATION',
        'ACTION_SWAP',
        'ACTION_DAMAGE',
        'ACTION_PLAYSOUND',
        'ACTION_TURNEND',
        'ADDPC',
        'ADDPOKEMON',
        'AMOUNT',
        'ALL',
        'ALLPKMN',
        'ALLY',
        'ATTACK',
        'ATTACKDONE',
        'ATTACKEV',
        'ATTACKIV',

        'BALL',
        'BATTLE', 
        'BATTLEEND', 
        'BATTLECHAT',
        'BATTLEDATA', //new battle action to client
        'BATTLEPKMN',
        'BATTLESWAP',
        'BATTLEUPDATE', //receviing battle update from client

        'CASTTIME',
        'CHANGEMAP',
        'CHARACTER',
        'CHARACTERS',
        'CHARGECOUNTER',
        'CLIENTCOMMAND',
        'CLIENTID',
        'COMMAND',
        'CONNINFO',
        'CREATEUSER',
        'CURRENTHP',
        'CURRENTPP',

        'DEFENSE',
        'DEFENSEEV',
        'DEFENSEIV',
        'DESCRIPTION',

        'ENEMY',
        'ENEMYTEAM',
        'EVASION',
        'EXECUTETURN',
        'EXP',
        'EXPTYPE',

        'FAINT',
        'FIELD',
        'FIELDPKMN',

        'GUESTLOGIN',

        'HP',
        'HPEV',
        'HPIV',
        'HPPERCENT',

        'ID',
        'INVENTORY',
        'ITEM',
        'ITEMS',

        'KEY',

        'LEVEL',
        'LOGINATTEMPT',
        'LOGGEDIN',
        'LOGOUT',
        'LOSERS',

        'MAIN',
        'MAP',
        'MAPID',
        'MAPNAME',
        'MAPDATA',
        'MONEY',
        'MOVEPC',
        'MOVEATTEMPT',
        'MOVES',
        'MOVEID',
        'MUSIC',

        'NAME',
        'NEWCHAR',
        'NEWPKMN',
        'NICKNAME',
        'NUMBER',

        'OPEN',
        'ORDER',
        'OVERLAYRESOURCE',
        'OWNER',

        'PASSWORD',
        'PING',
        'PLAYERUPDATE',
        'PLAYERS',
        'POKEMON',
        'POKEMON1',
        'POKEMON2',
        'POWER',
        'PP',
        'PRICE',
        'PWERRORUSEREXISTS',
        'PWERRORSNLENGTH',
        'PWERRORWRONGPASS',
        'PWERRORPLENGTH',

        'READY',
        'REMOVEPC',
        'REQUESTMAPDATA',
        'RESOURCE',
        'RESUME',
        'ROUNDREADY',
        'RUN',

        'SAY',
        'SECTOR',
        'SECTORARRAY',
        'SELF',
        'SERVERUPDATE',
        'SETLOGINERRORTEXT',
        'SETUNITSTAT',
        'SINGLE',
        'SLOT',
        'SPECIALATTACK',
        'SPECIALATTACKEV',
        'SPECIALATTACKIV',
        'SPECIALDEFENSE',
        'SPECIALDEFENSEEV',
        'SPECIALDEFENSEIV',
        'SPEED',
        'SPEEDEV',
        'SPEEDIV',
        'STAT',
        'START',
        'STARTBATTLE',
        'STARTGAME',
        'SWAPPKMN',

        'T',
        'TARGET',
        'TARGETTYPE',
        'TEAM',
        'TEAM1',
        'TEAM2',
        'TEAM1POKEMON',
        'TEAM2POKEMON',
        'TEXT',
        'TILE',
        'TILES',
        'TM',
        'TRIGGERS',
        'TURNINVALID',
        'TYPE',
        'TYPES',
        'TYPE_FIRE',
        'TYPE_NORMAL',
        'TYPE_WATER',
        'TYPE_GRASS',
        'TYPE_FIGHTING',
        'TYPE_FLYING',
        'TYPE_POISON',
        'TYPE_GROUND',
        'TYPE_ROCK',
        'TYPE_BUG',
        'TYPE_GHOST',
        'TYPE_STEEL',
        'TYPE_ELECTRIC',
        'TYPE_PSYCHIC',
        'TYPE_ICE',
        'TYPE_DRAGON',
        'TYPE_DARK',
        'TYPE_FAIRY',

        'USER',


        'VALUE',

        'WAITING',
        'WILD',

        'X',

        'Y',

        'ZONEDATA',
	
]

function init(){

    fs.truncate('enums.txt', 0, function(){console.log('enums.txt cleared')})
    var writeStream = fs.createWriteStream('enums.txt', {AutoClose: true});
    for (var i = 0; i < enums.length;i++){
    	var text = '    ' + enums[i] + ': ' + i + ''
    	if (i < enums.length-1){
    		text += ',';
    	}
    	text += '\n';
    	writeStream.write(text);
    }
}


init();