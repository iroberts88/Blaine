var Pokemon = require('./pokemon.js').Pokemon;
var Inventory = require('./inventory.js').Inventory;

var Character = function(){
    this.MAX_POKEMON = 6;

    this.id = null;
    this.owner = null;
    this.name = null;

    //game stats (games won etc)
    this.gameStats = null;
    //inventory
    this.inventory = null;
    //badges obtained
    this.badges = null;
    //pokedex completion
    this.pokedex = null;
    //active party of pokemon
    this.party = null;
    //pokemon stored in PC
    this.pc = null

    //Map stuff
    this.currentMap = null;
    this.currentSector = null;
    this.currentTile = null;

    this.money = null;
    this.owSprite = null;
    this.slot = null;

    this.currentMusic = null;

    this.activePokemon = []; //a list of the currently active pokemon for use in a battle
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
    this.pokedex = data.pokedex;
    //init pokemon
    this.party = [];
    var pkmn = [1,4,7,3,6,9];
    for (var i = 0; i < pkmn.length;i++){
        var newPoke = new Pokemon();
        newPoke.init(this.owner.gameEngine.pokemon[pkmn[i]],{
            character: this,
            nickname: '',
            id: this.owner.gameEngine.getId()
        })
        this.addPokemon(newPoke);
    }
    //init pc stuff
    //init inventory
    this.inventory = new Inventory();
    this.inventory.init();
    for (var i in this.gameEngine.items){
        var item = this.gameEngine.items[i];
        var add = this.inventory.addItem(item,5);
    }
};

Character.prototype.initBattle = function(n){
    this.activePokemon = [];
    for (var i = 0; i < n;i++){
        this.activePokemon.push(this.party[i]);
    }
};

Character.prototype.swapPkmn = function(data){
    if (typeof data.first == 'number' && typeof data.second == 'number'){
        if (data.first < 1 || data.second < 1){
            //TODO THROW ERROR
            console.log("error - cant be less than 1");
            return;
        }
        if (data.first > this.party.length || data.second > this.party.length){
            //TODO THROW ERROR
            console.log("error - cant be > party length");
            return;
        }
        var temp = this.party[data.first-1];
        this.party[data.first-1] = this.party[data.second-1];
        this.party[data.second-1] = temp;
    }
};
Character.prototype.addPokemon = function(p){
    if (this.party.length < this.MAX_POKEMON){
        this.party.push(p);
        p.slot = this.party.length;
        //this.owner.gameEngine.queuePlayer(this.owner,'pokemonInfo',{
        //    'pokemon': p.getClientData(),
        //    'slot': this.party.length
        //});
        //do pokedex stuff
        if (!this.pokedex[p.number]){
            this.pokedex[p.number] = true;
        }
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
    data.user = this.owner.user.userData.username;
    data.id = this.id
    data.money = this.money;
    data.sector = this.currentSector;
    data.tile = this.currentTile;
    data.owSprite = this.owSprite;
    
    data.inventory = this.inventory.getClientData();
    //badges
    //pokemon
    data.pokemon = [];
    for (var i = 0;i< this.party.length;i++){
        data.pokemon.push(this.party[i].getClientData());
    }
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