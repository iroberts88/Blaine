var Pokemon = require('./pokemon.js').Pokemon;

var Inventory = function(){
    this.MAX_ACTIVE_ITEMS = 4;
    this.MAX_ITEM_STACK = 99;
    this.TYPES = [
        'main', //main items that can be placed in active items
        //ONLY ACTIVE ITEMS can be used during battles
        'ball', //pokeballs
        'key' //key items
        //hold items?
    ];

    this.items = {};
    this.activeItems = [];

    this.order = {
        key: [],
        main: [],
        ball: [],
        tm: []
    }
}

Inventory.prototype.init = function(data) {
    //get existing inventory data?
};

Inventory.prototype.addItem = function(baseItem,amount){
    var amountAdded = 0;
    var amountNotAdded = 0;

    //check to see if item already exists
    var item = this.getItem(baseItem.itemid);
    if (item){
        //item exists
        //if key item, return
        if (!item.type == 'key'){
            return {
                amountAdded: 0,
                amountNotAdded: amount,
                reason: "May only have 1 of those items!"
            };
        }
        if (this.MAX_ITEM_STACK - item.amount >= amount){
            item.amount += amount;
            amountAdded = amount;
        }else{
            amountNotAdded = amount - (this.MAX_ITEM_STACK - item.amount);
            amountAdded = amount - amountNotAdded;
            item.amount = this.MAX_ITEM_STACK;
        }
    }else{
        //create new item
        var newItem = new Item()
        newItem.init(baseItem);
        if (newItem.type != 'key'){
            newItem.amount = amount;
        }
        this.items[newItem.id] = newItem;
    }

    return {
        amountAdded: amountAdded,
        amountNotAdded: amountNotAdded
    };
};

Inventory.prototype.getItem = function(id){
    if (typeof this.items[id] != 'undefined'){
        return this.items[id];
    }
    return 0;
}

Inventory.prototype.removeItem = function(id,amount){
    //check to see if item already exists
    if (typeof this.items[id] == 'undefined'){
        return false;
    }
    var item = this.items[id];
    if (item.amount <= amount){
        //remove the item
        delete this.items[id];
    }else{
        item.amount -= amount;
    }
    return true;
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


var Item = function(){};

Item.prototype.init = function(data) {
    this.id = data.itemid;
    this.name = data.name;
    this.type = data.type;
    this.price = data.price;
    this.stack = data.stack;
    this.description = data.description;
    this.use = data.use;

    this.amount = 1;
};

exports.Item = Item;