//triggers.js

TriggerEnums = {
	ChangeMap: 'changeMap',
	PlaySound: 'playSound',
	PlayMusic: 'playMusic',
	BlocksMovement: 'blocksMovement'
};

(function(window) {

	Triggers = {

		changeMap: function(data){
			console.log('changing map');
			console.log(data);
			Game.screenChange = true;
            Acorn.Net.socket_.emit('playerUpdate',{command:'changeMap',map:data.map,sector:data.sector,tile:data.tile});
			for (var i in Game.pcs){
				Game.removePC(i);
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