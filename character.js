var Pokemon = require('./pokemon.js').Pokemon;

var Character = function(){
    this.MAX_POKEMON = 6;

    this.id = null;
    this.owner = null;
    this.name = null;
    this.rival = null;
    this.sex = null;

    //game stats (games won etc)
    this.gameStats = null;
    //inventory
    this.inventory = null;
    //badges obtained
    this.badges = null
    //pokedex completion
    this.pokedex = null;
    //active party of pokemon
    this.party = null;
    //items and pokemon stored in PC
    this.pc = null

    //Map stuff
    this.currentMap = null;
    this.currentSector = null;
    this.currentTile = null;

    this.money = null;
    this.owSprite = null;
    this.slot = null;

    this.currentMusic = null;
}

Character.prototype.init = function(data) {
    //Set up all stats and attributes
    this.name = data.name;
    this.rival = data.rival;
    this.slot = data.slot;
    this.owner = data.owner;
    this.gameEngine = data.owner.gameEngine
    this.id = data.id;
    this.money = data.money;

    this.currentMap = data.currentMap;
    this.currentSector = data.currentSector;
    this.currentTile = data.currentTile;

    this.currentMusic = data.music;

    var owSpriteOptions = {
        'agatha': true,
        'ash': true,
        'rival':true,
        'beauty': true,
        'bruno': true,
        'chef': true,
        'channeler': true,
        'coolt': true,
        'erika': true,
        'fatty': true,
        'gent': true,
        'gio': true,
        'hatguy': true,
        'headband': true,
        'hiker': true,
        'james': true,
        'jessie': true,
        'jenny': true,
        'kid': true,
        'lad': true,
        'lady': true,
        'lady2': true,
        'lance': true,
        'lass': true,
        'lorelei': true,
        'misty': true,
        'monk': true,
        'oak': true,
        'oldguy': true,
        'punk': true,
        'rocket': true,
        'sabrina': true,
        'sailor': true,
        'scientist': true,
        'youngster': true,

        'oldlady': true,
        'koga': true,
        'erika2': true,
        'surge': true,
        'whitney': true,
        'brock': true,
        'clair': true,
        'pryce': true,
        'chuck': true,
        'janine': true,
        'rival2': true,
        'rocketf': true,
        'ethan': true,
        'bugsy': true,
        'sailor2': true,
        'glasses': true,
        'glasses2': true

    }
    if (data.sprite == 'random'){
        var arr = []
        for (var i in owSpriteOptions){
            arr.push(i);
        }
        this.owSprite = arr[Math.floor(Math.random()*arr.length)];
    }else if (owSpriteOptions[data.sprite]){
        this.owSprite = data.sprite;
    }else{
        this.owSprite = 'ash';
    }

    //init badges
    //initpokedex
    //init pokemon
    this.party = [];
    var pkmn = [1,4,7];
    for (var i = 0; i < pkmn.length;i++){
        var newPoke = new Pokemon();
        newPoke.init(this.owner.gameEngine.pokemon[pkmn[i]],{
            character: this,
            nickname: '',
            id: this.owner.gameEngine.getId()
        })
        this.addPokemon(newPoke);
        this.owner.gameEngine.queuePlayer(this.owner,'pokemonInfo',{
            'pokemon': newPoke.getClientData()
        });
    }
    //init pc stuff
    //init inventory
};

Character.prototype.addPokemon = function(p){
    if (this.party.length < this.MAX_POKEMON){
        this.party.push(p);
        //do stuff
    }else{
        //add to pc?
    }
};

Character.prototype.getDBObj = function(){
    var dbObj = {};
    dbObj.name = this.name;
   
    return dbObj;
};

Character.prototype.getClientData = function(){
    //create object to send to the client
    var data = {}
    data.owner = this.owner.id;
    data.name = this.name;
    data.rival = this.rival
    data.id = this.id
    data.money = this.money;
    data.sector = this.currentSector;
    data.tile = this.currentTile;
    data.owSprite = this.owSprite;
    
    //data.inventory = {};
    //badges
    //pokemon
    //pokedex ETCCCC
    return data;
}

Character.prototype.setStat = function(id,amt){
    try{
        this.getStat(id).base = amt;
        this.getStat(id).set(true);
    }catch(e){
        console.log("unable to set stat " + id);
        console.log(e);
    }
};


Character.prototype.update = function(dt) {

}

exports.Character = Character;