var Character = function(){
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
    this.currentNode = null;
    this.direction = null;

    this.money = null;

}

Character.prototype.init = function(data) {
    //Set up all stats and attributes
    this.name = data.name;
    this.sex = data.sex;
    this.owner = data.owner;
    this.id = data.id;
};

Character.prototype.getDBObj = function(){
    var dbObj = {};
    dbObj.name = this.name;
    dbObj.sex = this.sex;
    
    dbObj.inventory = [];
   
    return dbObj;
}
Character.prototype.getClientData = function(){
    //create object to send to the client
    
    data.owner = this.owner.id;
    data.name = this.name;
    data.sex = this.sex;
    data.id = this.id;
    
    data.inventory = {};
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