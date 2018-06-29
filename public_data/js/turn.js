



(function(window) {
    var Turn = function(){ }

    Turn.prototype.init = function(tArr){
        this.end = false;
        this.actions = tArr;
        this.currentAction = null;
        this.actionIndex = 0;
    };

    Turn.prototype.actionEnums = {
        Text: 'text',
        GetNickname: 'getnickname',
        CatchAttempt: 'catchattempt',
        EndBattle: 'endbattle',
        Swap: 'swap'
    };

    Turn.prototype.update = function(dt){
        if (this.end){return;}
        if (this.currentAction == null){
            this.currentAction = this.actions[this.actionIndex];
        }else{
            var actionFunc = this.getAction(this.currentAction.action);
            actionFunc(dt,this,this.currentAction);
        }
    };

    Turn.prototype.endAction = function(){
        this.currentAction = null;
        this.actionIndex += 1;
        if (this.actionIndex == this.actions.length){
            this.end = true;
        }
    };

    Turn.prototype.getAction = function(a){
        switch(a){
            case this.actionEnums.Text:
                return this.text;
                break;
            case this.actionEnums.GetNickname:
                return this.getnickname;
                break;
            case this.actionEnums.CatchAttempt:
                return this.catchattempt;
                break;
            case this.actionEnums.EndBattle:
                return this.endbattle;
                break;
            case this.actionEnums.Swap:
                return this.swap;
                break;
            default:
                return this.text;
                break;
        }
    };

    Turn.prototype.text = function(dt,turn,data){
        if (typeof data.textAdded == 'undefined'){
            Battle.addChat( '& ' + data.text);
            data.textAdded = true;
        }
        if (typeof data.endTime == 'undefined'){data.endTime = Settings.nSpeed}
        data.ticker = (typeof data.ticker == 'undefined') ? 0 : data.ticker + dt;
        if (data.ticker >= data.endTime){
            turn.endAction();
        }
    };

    Turn.prototype.getnickname = function(dt,turn,data){
        Battle.addChat("TODO: get nickname");
        turn.endAction();
    };

    Turn.prototype.catchattempt = function(dt,turn,data){
        if (typeof data.shake == 'undefined'){
            data.shake = 0;
        }
        if (typeof data.ticker == 'undefined'){data.ticker = 0}
        if (typeof data.animating == 'undefined'){data.animating = false}
        var pokemonName = Battle.pokemonContainer[data.pokemon].nickname;
        if (data.animating){
            data.ticker += dt;
            if (data.ticker >= Settings.nSpeed){
                data.shake += 1;
                data.animating = false;
            }
        }else{
            if (data.shakes == data.shake || data.shake == 3){
                if (data.shakes == 4){
                    Battle.addChat('& Caught ' + pokemonName + '!');
                }else{
                    Battle.addChat('& ' + pokemonName + ' broke free!');
                }
                turn.endAction();
            }else{
                Battle.addChat('& ~Shake~');
                data.animating = true;
                data.ticker = 0;
            }
        }
    };

    clientTurnData.push({
                    action: 'swap',
                    idToSwap: i,
                    newPokemon: pkmnToSwapWith.getLessClientData()
                });

    Turn.prototype.swap = function(dt,turn,data){
        Battle.addChat('Swapped ' + Battle.pokemonContainer[data.idToSwap].nickname + ' for ' + newPokemon.nickname + '!');
        //TODO - do swap stuff

        turn.endAction();
    };

    Turn.prototype.endbattle = function(dt,turn,data){
        Battle.end = true;
    };
    
    window.Turn = Turn;
})(window);
