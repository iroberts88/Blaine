

(function(window) {
    var Action = function(){ }

    var actionEnums = {
        MOVE: 1,
        TEXT: 2,
        DAMAGE: 3,
        SWAP: 4,
        ANIMATION: 5,
        FAINT: 6,
        CATCHATTEMPT: 7,
        BATTLEEND: 8,
        NEWPKMN: 9
    };
    var moveEnums = {
        SCRATCH: 1,
    };

    Action.prototype.init = function(data){
        this.actionData = data;
        this.t = 0;
        this.clientid = data[CENUMS.ACTION];

        this.end = false;

    };

    Action.prototype.update = function(dt){
        var action = this.getAction(this.clientid);
        action(dt,this,this.actionData);
    };

    Action.prototype.getAction = function(a){
        switch(a){
            case actionEnums.TEXT:
                return this.text;
                break;
            case actionEnums.DAMAGE:
                return this.damage;
                break;
            case actionEnums.MOVE:
                return this.move;
                break;
            case actionEnums.SWAP:
                return this.swap;
                break;
            case actionEnums.ANIMATION:
                return this.animation;
                break;
            case actionEnums.FAINT:
                return this.faint;
                break;
            case actionEnums.CATCHATTEMPT:
                return this.catchAttempt;
                break;
            case actionEnums.BATTLEEND:
                return this.battleEnd;
                break;
            case actionEnums.NEWPKMN:
                return this.newPokemon;
                break;
        }
    };
    Action.prototype.getMove = function(a){
        switch(a){
            case actionEnums.SCRATCH:
                return this.scratch;
                break;
        }
    };
    //MOVES
    Action.prototype.scratch = function(dt,action,data){
        if (typeof data.lmd == 'undefined'){
            //update last action use of pokemon!
            action.pokemon = Battle.pokemonContainer[data[CENUMS.POKEMON]];
            action.target = Battle.pokemonContainer[data[CENUMS.TARGET]];
            action.pokemonSC = Battle.pokemonSpriteContainer[data[CENUMS.POKEMON]];
            action.targetSC = Battle.pokemonSpriteContainer[data[CENUMS.TARGET]];
            Battle.drawLastMoveDisplay(action.pokemonSC,data[CENUMS.NAME]);
            data.lmd = true;
            data.timeCount = 0;
        }
        data.timeCount += dt;
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
                console.log('TIME COUNT... ' + data.timeCount)
                Battle.pokemonSpriteContainer[action.pokemon.id].lastMoveDisplay.visible = false;
                Graphics.uiContainer2.removeChild(data.sprite);
                return;
            }
            data.sprite._texture = Graphics.getResource('e_scratch' + data.spriteNum);
            action.t -= 0.075;
        }
    };

    //OTHER
    Action.prototype.damage = function(dt,action,data){
        if (typeof data.blinks == 'undefined'){
            data.blinks = 0;
            action.pokemonSC = Battle.pokemonSpriteContainer[data[CENUMS.POKEMON]];
        }
        action.t += dt;
        if(action.t > (data[CENUMS.T]/10)){
            data.blinks += 1;
            if (action.pokemonSC.sprite.visible){
                action.pokemonSC.sprite.visible = false;
            }else{
                action.pokemonSC.sprite.visible = true;
            }

            action.t -= (data[CENUMS.T]/10);
            if (data.blinks > 10){
                //also reduce HP

                var pkmn = Battle.pokemonContainer[data[CENUMS.POKEMON]];
                data[CENUMS.STAT] = CENUMS.HPPERCENT;
                if (pkmn){
                    pkmn.setStat(data);
                }
                action.end = true;
                action.pokemonSC.sprite.visible = true;
            }
        }
    };
    Action.prototype.text = function(dt,action,data){
        if (typeof data.added == 'undefined'){
            data.added = true;
            Battle.addChat(data[CENUMS.TEXT])
        }
        action.t += dt;
        if (action.t >= data[CENUMS.T]){
            action.end = true;
        }
    };
    Action.prototype.faint = function(dt,action,data){
        if (typeof data.added == 'undefined'){
            data.added = true;
            data.pokemon = Battle.pokemonContainer[data[CENUMS.POKEMON]];
            Battle.addChat(data.pokemon.nickname + ' fainted!');
        }
        var sc = Battle.pokemonSpriteContainer[data[CENUMS.POKEMON]];
        sc.sprite.alpha *= 0.99;
        action.t += dt;
        if (action.t >= data[CENUMS.T]){
            action.end = true;
        }
    };
    Action.prototype.battleEnd = function(dt,action,data){
        //figure out which side lost based on data
        var lost = false;
        for (var i = 0; i < data[CENUMS.LOSERS].length;i++){
            if (Player.character.id == data[CENUMS.LOSERS][i]){
                lost = true;
            }
        }
        Party.reset();
        AfterBattle.lost = lost;
        Battle.fadeOut = true;
        Battle.fadeOutTicker = 0;
    };
    Action.prototype.catchAttempt = function(dt,action,data){
        if (typeof data.added == 'undefined'){
            console.log(action);
            data.added = true;
        }
        action.t += dt;
        if (action.t >= data[CENUMS.T]){
            action.end = true;
        }
    };
    Action.prototype.move = function(dt,action,data){
        action.pokemon = Battle.pokemonContainer[data[CENUMS.POKEMON]];
        var M = action.getMove(data[CENUMS.CLIENTID]);
        M(dt,action,data);
        if  (action.end){
            Battle.pokemonContainer[data[CENUMS.POKEMON]].charge = 0;
            Battle.pokemonSpriteContainer[data[CENUMS.POKEMON]].nextMoveText.text = '';
            Battle.pokemonContainer[data[CENUMS.POKEMON]].reset();
            if (!Battle.currentPokemon){
                Battle.showTurnOptions();
            }
        }
    };
    Action.prototype.swap = function(dt,action,data){
        action.t += dt;

        if (typeof data.team == 'undefined'){
            data.p1 = Battle.pokemonContainer[data[CENUMS.POKEMON1]];
            data.n = data.p1.n;
            if (Party.getPokemon(data[CENUMS.POKEMON2][CENUMS.ID])){
                data.p2 = Party.getPokemon(data[CENUMS.POKEMON2][CENUMS.ID]);
            }else{
                data.p2 = new Pokemon();
                data.p2.init(data[CENUMS.POKEMON2])
            }
            data.team = data.p1.team;
            Battle.addChat("& " + Battle.trainers[data.p1.owner].name + ' withdraws ' + data.p1.nickname + '!');

        }
        if (action.t >= data[CENUMS.VALUE]/2){
            //remove the pokemon
            if (typeof data.removed == 'undefined'){
                Battle.removePokemon(data.p1);
                data.removed = true;
            }
            if (action.t >= data[CENUMS.VALUE]){
                action.end = true;
                Battle.paused = false;
                console.log(data);
                Battle.addPokemon(data.p2,data.n,data.team);
                Battle.addChat("& " + Battle.trainers[data.p1.owner].name + ' sends out ' + data.p2.nickname + '!');
            }
        }
        if (action.t >= data[CENUMS.T]){
            action.end = true;
        }
    };
    Action.prototype.newPokemon = function(dt,action,data){
        action.t += dt;

        if (typeof data.added == 'undefined'){
            //new battle pokemon
            if (Party.getPokemon(data[CENUMS.POKEMON][CENUMS.ID])){
                data.newPoke = Party.getPokemon(data[CENUMS.POKEMON][CENUMS.ID]);
                Battle.addChat("& " + 'Go, ' + data.newPoke.nickname + '!');
            }else{
                data.newPoke = new Pokemon();
                data.newPoke.init(data[CENUMS.POKEMON]);
                Battle.addChat("& " + Battle.trainers[data.newPoke.owner].name + ' sends out ' + data.newPoke.nickname + '!');
            }
            data.added = true;
        }
        if (action.t >= data[CENUMS.T]){
            Battle.checkBattleCommand();
            Battle.addPokemon(data.newPoke,data[CENUMS.SLOT],Battle.trainers[data.newPoke.owner].team);
            action.end = true;
        }
    };


    

    
    window.Action = Action;
})(window);
