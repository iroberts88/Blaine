var Pokemon = require('./pokemon.js').Pokemon;

var Inventory = function(){
   items: {}
}

Inventory.prototype.init = function(data) {
   
};


Inventory.prototype.addItem = function(item){
  
};

Inventory.prototype.removeItem = function(item){
  
};

Inventory.prototype.getDBObj = function(){
    var dbObj = {};
    dbObj.name = this.name;
   
    return dbObj;
};

Inventory.prototype.getClientData = function(){
    //create object to send to the client
    var data = {}
    
    return data;
}

exports.Inventory = Inventory;