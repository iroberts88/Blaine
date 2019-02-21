var Pokemon = require('./pokemon.js').Pokemon;
var Trainer = require('./trainer.js').Trainer;
var Inventory = require('./inventory.js').Inventory;
var PokemonStorage = require('./pokemonstorage.js').PokemonStorage;


CENUMS = require('./enums.js').Enums; //init client enums
CENUMS.init();

var Character = function(){

    var trainer = new Trainer();

    trainer._init = function(data){

        this.MAX_POKEMON = 6;

        this.isCharacter = true;
        
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
        this.participated = {}; //list of pokemon that had participated in the current battle for exp purposes

        this.speed = 0.25;
        this.battle = null;

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
                id: this.owner.engine.getId(),
                level: 5
            })
            this._addPokemon(newPoke,true);
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

    }

    trainer._initBattle = function(battle,wild,team){
        this.initBattle(battle,wild,team);
        console.log('DSJADJSKALDJASKLDJ  --  ' + wild)
        for (var i = 0; i < this.party.length;i++){
            this.participated[this.party[i].id] = false;
        }
    };

    trainer.swapPkmn = function(data){
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
    trainer._addPokemon = function(p,initBool){
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

    trainer.getPokemon = function(id){
        for (var i = 0; i < this.party.length; i++){
            if (this.party[i].id == id){
                return this.party[i];
            }
        }
        return null;
    };

    trainer.hasWaitingPokemon = function(id){
        for (var i = 0; i < this.party.length; i++){
            if (!this.activePokemon[this.party[i].id] && this.party[i].hpPercent.value != 0){
                return true;
            }
        }
        return false;
    };

    trainer.getDBObj = function(){
        var dbObj = {};
        dbObj.name = this.name;
        
        return dbObj;
    };

    trainer.getClientData = function(less = false){

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
    trainer.getLessClientData = function(){
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


    trainer.setStat = function(id,amt){
        try{
            this.getStat(id).base = amt;
            this.getStat(id).set(true);
        }catch(e){
            console.log("unable to set stat " + id);
            console.log(e);
        }
    };


    trainer.update = function(dt) {
        if (this.hasFaintedPokemon()){
            this.checkBattleEnd();
        }
    }

    return trainer;
}




exports.Character = Character;