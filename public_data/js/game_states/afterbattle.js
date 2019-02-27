
(function(window) {
    AfterBattle = {
    	lost: false,
        init: function() { 
            Graphics.ui.alpha = 1.0;

            Graphics.uiPrimitives1.clear();
            Graphics.uiContainer2.removeChildren();
            var uiTex = Game.getBoxTexture();
            var uiSprite = new PIXI.Sprite(uiTex)
            Graphics.uiContainer2.addChild(uiSprite);
            var t = 'You Lost!';
            if (!this.lost){
            	t = 'You won!!';
            }
            this.winLoseText = new PIXI.Text(t,AcornSetup.style1);
            this.winLoseText.anchor.x = 0.5;
            this.winLoseText.anchor.y = 0.5;
            this.winLoseText.position.x = Graphics.width/2;
            this.winLoseText.position.y = Graphics.height/10;
            Graphics.uiContainer2.addChild(this.winLoseText);

            this.spriteContainer = [];
            for (var i in Party.pokemon){
            	var p = Party.pokemon[i];
            	if (p == ''){continue;}
            	this.spriteContainer.push(this.getPokemonSprite(p));
            }
        },

        getPokemonSprite: function(p){

        	var yStart = (p.slot-1)*(Graphics.height/7) + 300;
        	var alpha = 0.35;
        	var participated = false;
        	if (p.exp - p.previousStatValues.exp > 0){
        		participated = true;
        		alpha = 1;
        	}
        	var cont = {};
        	cont.pokemon = p;

        	cont.sprite = Graphics.getSprite(p.number);
            cont.sprite.scale.x = 3;
            cont.sprite.scale.y = 3;
            cont.sprite.anchor.y = 0.5;
            cont.sprite.position.x = 50;
            cont.sprite.position.y = yStart;
            cont.sprite.alpha = alpha;
            Graphics.uiContainer2.addChild(cont.sprite);
            cont.nameText = new PIXI.Text(p.nickname,AcornSetup.style2)
            cont.nameText.anchor.x = 0.5;
            cont.nameText.position.x = 300;
            cont.nameText.position.y = yStart-cont.nameText.height/2-5
            cont.nameText.alpha = alpha;
            Graphics.uiContainer2.addChild(cont.nameText);
            cont.lvlText = new PIXI.Text('LvL: ' + p.level,AcornSetup.style2)
            cont.lvlText.anchor.x = 0.5;
            cont.lvlText.position.x = 300;
            cont.lvlText.position.y = yStart+cont.nameText.height/2+5
            cont.lvlText.alpha = alpha;
            Graphics.uiContainer2.addChild(cont.lvlText);
        },
        update: function(dt){ 
           
        }

    }
    window.AfterBattle = AfterBattle;
})(window);
