var Character = function(){
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
    this.id = data.id;
    this.money = data.money;

    this.currentMap = data.currentMap;
    this.currentSector = data.currentSector;
    this.currentTile = data.currentTile;

    this.currentMusic = data.music;

    this.owSprite = 'ash';

    //init badges
    //initpokedex
    //init pokemon
    //init pc stuff
    //init inventory
};

Character.prototype.getDBObj = function(){
    var dbObj = {};
    dbObj.name = this.name;
   
    return dbObj;
}
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