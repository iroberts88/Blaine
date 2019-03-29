//
//  trainer.js
//
//  trainer for the purpose of battles/

var Pokemon = require('./pokemon.js').Pokemon;

var Trainer = function(ge){
    this.engine = ge;
    this.MAX_POKEMON = 6;

    this.id = null;
    this.name = null;
    this.portrait = null;
    this.owner = null;

    this.battle = null;

    //inventory
    this.inventory = null;
    //active party of pokemon
    this.party = null;
    this.currentTeam = null;
    this.participated = {}; //list of pokemon that had participated in the current battle for exp purposes
    this.activePokemon = []; //a list of the currently active pokemon for use in a battle

    this.pkmnHasFainted = false;
    this.pkmnHasFaintedTicker = 0;
}

Trainer.prototype.init = function(data) {
    //Set up all stats and attributes

    this.party = [];
    this.id = this.engine.getId();
    this.name = "Test Trainer";
    this.portrait = 'ash';
    //is it a wild pokemon?

    for (var i = 0 ; i < data.pokemon.length;i++){
        var newPoke = new Pokemon();
        newPoke.init(this.engine.pokemon[data.pokemon[i]],{
            character: this,
            nickname: '',
            level: data.levels[i],
            id: this.engine.getId(),
            engine: this.engine
        })
        this.addPokemon(newPoke);
    }
    
};
Trainer.prototype.update = function(deltaTime) {

    if (this.hasFaintedPokemon()){
        this.checkBattleEnd();
        this.pkmnHasFaintedTicker += deltaTime;
        if (this.pkmnHasFaintedTicker >= 1.0){
            //send out new pokemon
            if (this.getWaitingPokemon()){
                //get the waiting pokemon
                var pkmn = this.getWaitingPokemon();
                var cData = {};
                var repNum = this.getFaintedPokemonSlot();
                cData[CENUMS.POKEMON] = pkmn.getLessClientData();
                cData[CENUMS.SLOT] = repNum+1;
                this.battle.queueData(CENUMS.NEWPKMN,cData);

                var team = this.battle.getTeamPkmn(this);
                team[repNum] = pkmn;

                this.activePokemon[pkmn.id] = pkmn;
                this.battle.activePokemon[pkmn.id] = pkmn;
                this.participated[pkmn.id] = true;

                if (!this.hasFaintedPokemon() || !this.hasWaitingPokemon()){
                    //still has a fainte pokemon?
                    this.battle.waitingTime = 1.5;
                    this.battle.waitingTicker = 0;
                }
            }
            this.pkmnHasFaintedTicker -= 1.0;
        }
    }
    for (var i in this.activePokemon){
        var pkmn = this.activePokemon[i];
        if (pkmn.currentTurnData == null){
            //for now just attack a random pokemon

            var eTeam = this.battle.getEnemyTeamPokemon(this);
            var move = pkmn.moves[Math.floor(Math.random()*pkmn.moves.length)]
            var target = null;
            switch(move.targetType){
                case CENUMS.SINGLE:
                    target = eTeam[Math.floor(Math.random()*eTeam.length)];
                    break;
                case CENUMS.ENEMY:
                    target = eTeam[Math.floor(Math.random()*eTeam.length)];
                    break;
                case CENUMS.ALLY:
                    var mTeam = this.battle.getTeamPokemon(this);
                    target = mTeam[Math.floor(Math.random()*mTeam.length)];
                    break;
                default:
                    target = pkmn;
                    break;

            }
            if (!target){
                continue;
            }
            pkmn.currentTurnData = {
                command: 'attack',
                id: this.engine.getId(),
                target: target,
                move: move
            }
        }
    }
};

Trainer.prototype.checkBattleEnd = function(){

    var end = false;
    if (!this.hasActivePokemon()){
        if (this.battle.waitingTicker >= this.battle.waitingTime){
            end = true;
        }
        if (!this.hasWaitingPokemon()){
            end = true;
        }
    }
    if (end){
        this.battle.checkEnd(this.currentTeam);
    }
};

Trainer.prototype.initBattle = function(battle,wild,team){
    this.activePokemon = {};
    this.team
    this.currentEnemyTeam = null;
    this.battle = battle;
    this.battleSlots = [];
    var n = 3;
    if (wild){n = 1};
    if (battle.type == 'team'){
        n = 2;
    };
    if (team == 1){
        this.currentEnemyTeam = battle.team2;
        this.currentTeam = battle.team1;
    }else{
        this.currentEnemyTeam = battle.team1;
        this.currentTeam = battle.team2;
    }
    for (var i = 0; i < n;i++){
        if (typeof this.party[i] == 'undefined'){
            continue;
        }
        if (this.party[i].currentHP <= 0){
            continue;
        }
        this.activePokemon[this.party[i].id] = this.party[i];
        battle.activePokemon[this.party[i].id] = this.party[i];
        if (team == 1){
            battle.team1Pokemon.push(this.party[i]);
            this.battleSlots.push(battle.team1Pokemon.length-1);
        }else{
            battle.team2Pokemon.push(this.party[i]);
            this.battleSlots.push(battle.team2Pokemon.length-1);
        }
    }
    for (var i = 0; i < this.party.length;i++){
        this.participated[this.party[i].id] = false;
    }
};

Trainer.prototype.addPokemon = function(p){
    if (this.party.length < this.MAX_POKEMON){
        this.party.push(p);
        p.slot = this.party.length;
    }
};

Trainer.prototype.hasActivePokemon = function(id){
    for (var i = 0; i < this.party.length; i++){
        if (this.activePokemon[this.party[i].id]){
            return true;
        }
    }
    return false;
};
Trainer.prototype.hasWaitingPokemon = function(id){
    for (var i = 0; i < this.party.length; i++){
        if (!this.activePokemon[this.party[i].id] && this.party[i].hpPercent.value != 0){
            return true;
        }
    }
    return false;
};
Trainer.prototype.getWaitingPokemon = function(id){
    for (var i = 0; i < this.party.length; i++){
        if (!this.activePokemon[this.party[i].id] && this.party[i].hpPercent.value != 0){
            return this.party[i];
        }
    }
    return null;
};

Trainer.prototype.hasFaintedPokemon = function(){
    for (var i = 0; i < this.battleSlots.length;i++){
        if (this.team == 1){
            if (!this.battle.team1Pokemon[this.battleSlots[i]]){
                return true;
            }
        }else{
            if (!this.battle.team2Pokemon[this.battleSlots[i]]){
                return true;
            }
        }
    }
    return false;
};
Trainer.prototype.getFaintedPokemonSlot = function(){
    for (var i = 0; i < this.battleSlots.length;i++){
        if (this.team == 1){
            if (!this.battle.team1Pokemon[this.battleSlots[i]]){
                return this.battleSlots[i];
            }
        }else{
            if (!this.battle.team2Pokemon[this.battleSlots[i]]){
                return this.battleSlots[i];
            }
        }
    }
    return null;
};

Trainer.prototype.getPokemon = function(id){
    for (var i = 0; i < this.party.length; i++){
        if (this.party[i].id == id){
            return this.party[i];
        }
    }
    return null;
};

Trainer.prototype.getClientData = function(less = false){

    //create object to send to the client
    var data = this.getLessClientData();
    if (less){
        return data;
    }

    return data;
}
Trainer.prototype.getLessClientData = function(){
    //create object to send to the client
    var data = {}
    data[CENUMS.NAME] = this.name;
    data[CENUMS.ID] = this.id;
    data[CENUMS.RESOURCE] = this.portrait;
    return data;
}

exports.Trainer = Trainer;