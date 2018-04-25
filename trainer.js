//
//  trainer.js
//
//  trainer for the purpose of battles/

var Pokemon = require('./pokemon.js').Pokemon;

var Trainer = function(ge){
    this.gameEngine = ge;
    this.MAX_POKEMON = 6;

    this.id = null;
    this.name = null;
    this.portrait = null;

    this.wild = false;

    //inventory
    this.inventory = null;
    //active party of pokemon
    this.party = null;
    this.activePokemon = []; //a list of the currently active pokemon for use in a battle
}

Trainer.prototype.init = function(data) {
    //Set up all stats and attributes

    this.party = [];

    //is it a wild pokemon?
    if (data.wild){
        this.wild = true;
        for (var i = 0 ; i < data.pokemon.length;i++){
            var newPoke = new Pokemon();
            newPoke.init(this.gameEngine.pokemon[data.pokemon],{
                character: this,
                nickname: '',
                level: data.levels[i],
                id: this.gameEngine.getId()
            })
            this.addPokemon(newPoke);
        }
    }else{
        this.wild = false;//init pokemon
    }
    
};

Trainer.prototype.initBattle = function(n){
    this.activePokemon = [];
    for (var i = 0; i < n;i++){
        this.activePokemon.push(this.party[i]);
    }
};

Trainer.prototype.addPokemon = function(p){
    if (this.party.length < this.MAX_POKEMON){
        this.party.push(p);
        p.slot = this.party.length;
    }
};

exports.Trainer = Trainer;