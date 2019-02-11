var Pokemon = require('./pokemon.js').Pokemon;
var Inventory = require('./inventory.js').Inventory;
var PokemonStorage = require('./pokemonstorage.js').PokemonStorage;


CENUMS = require('./enums.js').Enums; //init client enums
CENUMS.init();

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

    this.currentTeam = null;
    this.activePokemon = {}; //a list of the currently active pokemon for use in a battle

    this.speed = 0.25;
    this.battle = null;
}

Character.prototype.init = function(data) {
    //Set up all stats and attributes
    this.name = data[CENUMS.NAME];
    this.slot = data[CENUMS.SLOT];
    this.owner = data.owner;
    this.engine = data.owner.engine
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

    if (spriteOptions[data[CENUMS.RESOURCE]]){
        this.owSprite = spriteOptions[data[CENUMS.RESOURCE]];
    }else{
        this.owSprite = 'ash';
    }

    //init badges
    //initpokedex
    this.pokedex = data.pokedex;
    //init pokemon
    this.party = [];
    var pkmn = [1,4,7,10,13];
    for (var i = 0; i < pkmn.length;i++){
        var newPoke = new Pokemon();
        newPoke.init(this.owner.engine.pokemon[pkmn[i]],{
            character: this,
            engine: this.engine,
            nickname: '',
            id: this.owner.engine.getId()
        })
        this.addPokemon(newPoke,true);
    }
    //init pc stuff
    this.pokemonStorage = new PokemonStorage();
    this.pokemonStorage.init();
    //init inventory
    this.inventory = new Inventory();
    this.inventory.init();
    for (var i in this.engine.items){
        var item = this.engine.items[i];
        var add = this.inventory.addItem(item,5);
    }
};

Character.prototype.initBattle = function(battle,wild,team){
    this.activePokemon = {};
    this.currentTeam = team;
    this.currentEnemyTeam = null;
    this.battle = battle;
    if (team == battle.team1){
        this.currentEnemyTeam = battle.team2;
    }else{
        this.currentEnemyTeam = battle.team1;
    }
    var n = 3;
    if (wild){n = 1}
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
        this.activePokemon[this.party[i].id] = this.party[i];
        battle.activePokemon[this.party[i].id] = this.party[i];
        if (team == 1){
            battle.team1Pokemon.push(this.party[i]);
        }else{
            battle.team2Pokemon.push(this.party[i]);
        }
    }
};

Character.prototype.swapPkmn = function(data){
    if (typeof data[CENUMS.POKEMON1] == 'number' && typeof data[CENUMS.POKEMON2] == 'number'){
        if (data[CENUMS.POKEMON1] < 1 || data[CENUMS.POKEMON2] < 1){
            //TODO THROW ERROR
            console.log("error - cant be less than 1");
            return;
        }
        if (data[CENUMS.POKEMON1] > this.party.length || data[CENUMS.POKEMON2] > this.party.length){
            //TODO THROW ERROR
            console.log("error - cant be > party length");
            return;
        }
        var temp = this.party[data[CENUMS.POKEMON1]-1];
        this.party[data[CENUMS.POKEMON1]-1] = this.party[data[CENUMS.POKEMON2]-1];
        this.party[data[CENUMS.POKEMON2]-1] = temp;
    }
};
Character.prototype.addPokemon = function(p,initBool){
    var info = {
        partySlot: null,
        addedToPokedex: null,
        pcBox: null
    }
    if (this.party.length < this.MAX_POKEMON){
        this.party.push(p);
        p.slot = this.party.length;
        info.partySlot = p.slot;
        if (typeof initBool == 'undefined'){
            var cData = {};
            cData[CENUMS.POKEMON] = p.getClientData();
            cData[CENUMS.SLOT] = this.party.length;
            this.owner.engine.queuePlayer(this.owner,CENUMS.ADDPOKEMON,cData);
        }
        //do pokedex stuff
        if (!this.pokedex[p.number]){
            this.pokedex[p.number] = true;
            info.addedToPokedex = true;
        }
    }else{
        //add to pc?
        info.pcBox = this.pokemonStorage.addPokemon(p);
    }

    return info;
};

Character.prototype.getPokemon = function(id){
    for (var i = 0; i < this.party.length; i++){
        if (this.party[i].id == id){
            return this.party[i];
        }
    }
    return null;
};

Character.prototype.getDBObj = function(){
    var dbObj = {};
    dbObj.name = this.name;
    
    return dbObj;
};

Character.prototype.getClientData = function(less = false){

    //create object to send to the client
    var data = this.getLessClientData();
    if (less){
        return data;
    }

    data[CENUMS.MONEY] = this.money;
    data[CENUMS.INVENTORY] = this.inventory.getClientData();
    //badges
    //pokemon
    data[CENUMS.POKEMON] = [];
    for (var i = 0;i< this.party.length;i++){
        data[CENUMS.POKEMON].push(this.party[i].getClientData());
    }
    //pokedex ETCCCC
    return data;
}
Character.prototype.getLessClientData = function(){
    //create object to send to the client
    var data = {}
    data[CENUMS.OWNER] = this.owner.id;
    data[CENUMS.NAME] = this.name;
    data[CENUMS.USER] = this.owner.user.userData.username;
    data[CENUMS.ID] = this.id
    data[CENUMS.SECTOR] = this.currentSector;
    data[CENUMS.TILE] = this.currentTile;
    data[CENUMS.RESOURCE] = this.owSprite;
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