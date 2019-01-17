//triggers.js

TriggerEnums = {
	ChangeMap: 'changeMap',
	PlaySound: 'playSound',
	PlayMusic: 'playMusic',
	BlocksMovement: 'blocksMovement',
	DownwardHop: 'downwardHop',
	LeftHop: 'leftHop',
	RightHop: 'RightHop'
};

(function(window) {

	Triggers = {

		changeMap: function(data){
			Game.screenChange = true;
			for (var i in Game.pcs){
				Game.removePC(i);
			}
			if (!Game.requestMade && typeof Game.mapsCache[data.map] == 'undefined'){
				var sData = {};
                Acorn.Net.socket_.emit('playerUpdate',{command: 'requestMapData',name: data.map});
                Game.requestMade = true;
            }
			return true;
		},

		playSound: function(data){
			try{
				Acorn.Sound.play(data.sound);
			}catch(e){}
			return false;
		},

		playMusic: function(data){
			try{
				Acorn.Sound.play(data.sound);
			}catch(e){}
			return false;
		},

		blocksMovement: function(data){
			return true;
		},

		downwardHop: function(data){
			Player.move(0,2);
			return true;
		},

		leftHop: function(data){
			Player.move(-2,0);
			return true;
		},

		rightHop: function(data){
			Player.move(2,0);
			return true;
		},

		doTrigger: function(trigger){
			try{
				switch(trigger.do){
					case TriggerEnums.ChangeMap:
						 return this.changeMap(trigger.data);
						break;
					case TriggerEnums.PlaySound:
						return this.playSound(trigger.data);
						break;
					case TriggerEnums.PlayMusic:
						return this.playMusic(trigger.data);
						break;
					case TriggerEnums.BlocksMovement:
						return this.blocksMovement(trigger.data);
						break;
					case TriggerEnums.DownwardHop:
						return this.downwardHop(trigger.data);
						break;
					case TriggerEnums.LeftHop:
						return this.leftHop(trigger.data);
						break;
					case TriggerEnums.RightHop:
						return this.rightHop(trigger.data);
						break;
				}
			}catch(e){
				console.log('Do Trigger Error');
				console.log(e);
				console.log(trigger);
			}
		}
	}

	window.Triggers = Triggers;
})(window);