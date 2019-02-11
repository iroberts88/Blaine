

(function(window) {
    var Action = function(){ }

    var actionEnums = {
        SCRATCH: 1,
        DAMAGE: 2,
        MISS: 3,
        NVE: 4, //Not very effective
        SUPERE: 5, //super effective!
    };

    Action.prototype.init = function(data){
        this.id = data[CENUMS.ID];
        this.actionData = data;
        this.t = 0;
        this.pokemon = Battle.pokemonContainer[data[CENUMS.POKEMON]];
        this.target = Battle.pokemonContainer[data[CENUMS.TARGET]];
        this.pokemonSC = Battle.pokemonSpriteContainer[data[CENUMS.POKEMON]];
        this.targetSC = Battle.pokemonSpriteContainer[data[CENUMS.TARGET]];
        this.clientId = data[CENUMS.CLIENTID];
        this.mname = data[CENUMS.NAME];

        this.end = false;

        //update last action use of pokemon!
        Battle.drawLastMoveDisplay(this.pokemonSC,this.mname);
    };

    Action.prototype.update = function(dt){
        var action = this.getAction(this.clientid);
        action(dt,this,this.actionData);
    };

    Action.prototype.getAction = function(a){
        switch(a){
            case actionEnums.SCRATCH:
                return this.scratch;
                break;
            case actionEnums.DAMAGE:
                return this.damage;
                break;
            default:
                return this.scratch;
                break;
        }
    };

    Action.prototype.scratch = function(dt,action,data){
        action.t += dt;
        if (action.t < 1){
            return;
        }
        if (typeof data.sprite == 'undefined'){
            data.sprite = Graphics.getSprite('e_scratch4');
            data.spriteNum = 4;
            data.sprite.anchor.x = 0;
            data.sprite.anchor.y = 1;
            data.sprite.scale.x = 3;
            data.sprite.scale.y = 3;
            data.sprite.position.x = action.targetSC.sprite.position.x-action.targetSC.sprite.width/2;
            data.sprite.position.y = action.targetSC.sprite.position.y+action.targetSC.sprite.height/2;
            Graphics.uiContainer2.addChild(data.sprite);
        }
        if(action.t > 1.075){
            data.spriteNum -= 1;
            if (data.spriteNum < 1){
                action.end = true;
                Graphics.uiContainer2.removeChild(data.sprite);
                return;
            }
            data.sprite._texture = Graphics.getResource('e_scratch' + data.spriteNum);
            action.t -= 0.075;
        }
    };
    Action.prototype.damage = function(dt,action,data){
        if (data.blinks == 'undefined'){
            data.blinks = 0;
        }
        action.t += dt;
        if(action.t > 0.15){
            data.blinks += 1;
            if (actions.pokemonSC.sprite.visible){
                actions.pokemonSC.sprite.visible = false;
            }else{
                actions.pokemonSC.sprite.visible = true;
            }

            action.t -= 0.15;
            if (data.blinks >= 10){
                action.end = true;
                actions.pokemonSC.sprite.visible = true;
            }
        }
    };

    
    window.Action = Action;
})(window);
