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

    this.battle = null;

    //inventory
    this.inventory = null;
    //active party of pokemon
    this.party = null;
    this.currentTeam = null;
    this.activePokemon = []; //a list of the currently active pokemon for use in a battle
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

Trainer.prototype.initBattle = function(battle,wild,team){
    this.activePokemon = [];
    this.currentTeam = team;
    this.battle = battle;
    var n = 3;
    if (wild){n == 1};
    if (battle.type == 'team'){
        n = 2;
    };
    for (var i = 0; i < n;i++){
        if (typeof this.party[i] == 'undefined'){
            continue;
        }
        if (this.party[i].currentHP <= 0){
            continue;
        }
        this.activePokemon.push(this.party[i]);
        battle.activePokemon[this.party[i].id] = this.party[i];
        if (team == 1){
            battle.team1Pokemon.push(this.party[i]);
        }else{
            battle.team2Pokemon.push(this.party[i]);
        }
    }
};

Trainer.prototype.addPokemon = function(p){
    if (this.party.length < this.MAX_POKEMON){
        this.party.push(p);
        p.slot = this.party.length;
    }
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