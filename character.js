var Pokemon = require('./pokemon.js').Pokemon;

var Character = function(){
    this.MAX_POKEMON = 6;

    this.id = null;
    this.owner = null;
    this.name = null;
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
    this.slot = data.slot;
    this.owner = data.owner;
    this.gameEngine = data.owner.gameEngine
    this.id = data.id;
    this.money = data.money;

    this.currentMap = data.currentMap;
    this.currentSector = data.currentSector;
    this.currentTile = data.currentTile;

    this.currentMusic = data.music;

    var spriteOptions = {
        'ash2': 'ash',
        'agatha': 'agatha',
        'beauty': 'beauty',
        'beauty2': 'beauty',
        'birdcatcher2': 'lad',
        'bugcatcher2': 'youngster',
        'burglar2': 'glasses',
        'channeler': 'channeler',
        'blaine2': 'blaine',
        'brock2': 'brock',
        'bruno2': 'bruno',
        'bugsy': 'bugsy',
        'chuck': 'chuck',
        'clair': 'clair',
        'cooltrainer2_f': 'erika',
        'cooltrainer2_m': 'coolt',
        'crazylady': 'oldlady',
        'cueball': 'fatty',
        'engineer': 'hatguy',
        'erika2': 'erika2',
        'ethan': 'ethan',
        'fighter2': 'headband',
        'firebreather': 'chef',
        'fisherman2': 'sailor',
        'gambler': 'punk',
        'gary': 'rival',
        'gentleman': 'gent',
        'giovanni': 'gio',
        'hiker2': 'hiker',
        'james': 'james',
        'jessie': 'jessie',
        'janine': 'janine',
        'jrtrainer_f': 'lass',
        'jrtrainer_m': 'lad',
        'juggler': 'punk',
        'kid': 'kid',
        'koga2': 'koga',
        'lance2': 'lance',
        'lass': 'lass',
        'lorelei': 'lorelei',
        'maniac': 'glasses2',
        'misty2': 'misty',
        'monk': 'monk',
        'psychic': 'lad',
        'pokefan_f': 'lady2',
        'pokefan_m': 'fatty',
        'pryce': 'pryce',
        'rocker2': 'punk',
        'rocket2': 'rocket',
        'rival4': 'rival2',
        'rocketf': 'rocketf',
        'sabrina2': 'sabrina',
        'sailor2': 'sailor2',
        'schoolboy': 'youngster',
        'scientist2': 'scientist',
        'supernerd': 'scientist',
        'surge2': 'surge',
        'teacher': 'lady',
        'whitney': 'whitney',
        'youngster2': 'youngster'
    };

    if (spriteOptions[data.sprite]){
        this.owSprite = spriteOptions[data.sprite];
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