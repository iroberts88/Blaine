//triggers.js


var Triggers = function(){
	this.TriggerEnums = {
		ChangeMap: 'changeMap',
		PlaySound: 'playSound',
		PlayMusic: 'playMusic',
		BlocksMovement: 'blocksMovement',
		DownwardHop: 'downwardHop',
		LeftHop: 'leftHop',
		RightHop: 'rightHop'
	}
};

Triggers.prototype.changeMap = function(character,data){
	try{
        console.log(data);
        //check current Tile
        var zone = character.gameEngine.zones[character.currentMap]
        var tile = zone.map[character.currentSector].tiles[character.currentTile[0]][character.currentTile[1]];

        character.gameEngine.removePlayerFromZone(character.owner,character.currentMap);
        character.currentSector = data.sector;
        var c = zone.getSectorXY(data.tile);
        character.currentTile = [c.x,c.y];
        character.currentMap = data.map;
        character.gameEngine.addPlayerToZone(character.owner,data.map);
        var newZone = character.gameEngine.zones[character.currentMap];
        var newSector = newZone.map[character.currentSector];
        var players = newZone.getPlayers(newSector);
        character.gameEngine.queuePlayer(character.owner,'changeMap',{
            map: character.currentMap,
            sector: character.currentSector,
            tile: character.currentTile,
            players: players
        });

    }catch(e){
        console.log("error changing map...reset pos?");
        character.gameEngine.debug(character.woner,{id: 'changeMapError', error: e.stack});
    }
	return true;
};

Triggers.prototype.playSound = function(character,data){
	return false;
};

Triggers.prototype.playMusic = function(character,data){
	character.currentMusic = data.sound;
	console.log(character.currentMusic)
	return false;
};

Triggers.prototype.blocksMovement = function(character,data){
	return true;
};

Triggers.prototype.downwardHop = function(character,data){
	return true;
};

Triggers.prototype.leftHop = function(character,data){
	return true;
};

Triggers.prototype.rightHop = function(character,data){
	return true;
};

Triggers.prototype.doTrigger = function(character,trigger){
	console.log(trigger);
	try{
		switch(trigger.do){
			case this.TriggerEnums.ChangeMap:
				 return this.changeMap(character,trigger.data);
				break;
			case this.TriggerEnums.PlaySound:
				return this.playSound(character,trigger.data);
				break;
			case this.TriggerEnums.PlayMusic:
				return this.playMusic(character,trigger.data);
				break;
			case this.TriggerEnums.BlocksMovement:
				return this.blocksMovement(character,trigger.data);
				break;
			case this.TriggerEnums.DownwardHop:
				return this.downwardHop(character,trigger.data);
				break;
			case this.TriggerEnums.LeftHop:
				return this.leftHop(character,trigger.data);
				break;
			case this.TriggerEnums.RightHop:
				return this.rightHop(character,trigger.data);
				break;
		}
	}catch(e){
		console.log('Do Trigger Error');
		console.log(e);
		console.log(trigger);
	}
}

exports.Triggers = new Triggers();