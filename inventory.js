var CENUMS = require('./enums.js').Enums; //init client enums
CENUMS.init();

var targetTypeEnums = {
    'field': CENUMS.FIELD, //ONLY used in the field, just a straight use
    'fieldpkmn': CENUMS.FIELDPKMN, //only used in the field on pokemon

    'all': CENUMS.ALL, //can be used in the field or in battle, just a straight use
    'allpkmn': CENUMS.ALLPKMN, //can be used in the field or in battle, on a pokemon
    'ball': CENUMS.BALL, //can be used in a wild battle to catch the opossing pokemon
    'enemy': CENUMS.ENEMY, // can be used in a battle on an enemy pokemon
    'battlepkmn': CENUMS.BATTLEPKMN, //can only be used in battle on a pokemon
    'battle': CENUMS.BATTLE //can only be used in battle, on all pokemon!
}

var typeEnums = {
    'main': CENUMS.MAIN,
    'ball': CENUMS.BALL,
    'tm': CENUMS.TM,
    'key': CENUMS.KEY
}

var Inventory = function(){
    this.MAX_ITEM_STACK = 99;
    this.TYPES = [
        'main', //main items that can be placed in active items
        //ONLY ACTIVE ITEMS can be used during battles
        'ball', //pokeballs
        'key',  //key items
        'tm'
        //hold items?
    ];

    this.items = {};
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
        if (item.type == 'key'){
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
        //add item to correct order
        this.order[newItem.type].push(newItem.id);
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

Inventory.prototype.getItemByOrder = function(type,index){
    return this.items[this.order[type][index]];
}

Inventory.prototype.removeItem = function(id,amount){
    //check to see if item already exists
    if (typeof this.items[id] == 'undefined'){
        return false;
    }
    var item = this.items[id];
    if (item.amount <= amount){
        //remove the item!
        for (var i = 0; i < this.order[item.type].length;i++){
            if (this.order[item.type][i] == item.id){
                this.order[item.type].splice(i,0);
                break;
            }
        }
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
    data[CENUMS.ITEMS] = {};
    for (var i in this.items){
        data[CENUMS.ITEMS][i] = this.items[i].clientData;
    }
    data[CENUMS.ORDER] = {};
    data[CENUMS.ORDER][CENUMS.MAIN] = [];
    for (var i = 0; i < this.order.main.length;i++){
        data[CENUMS.ORDER][CENUMS.MAIN].push(this.order.main[i]);
    }
    data[CENUMS.ORDER][CENUMS.BALL] = [];
    for (var i = 0; i < this.order.ball.length;i++){
        data[CENUMS.ORDER][CENUMS.BALL].push(this.order.ball[i]);
    }
    data[CENUMS.ORDER][CENUMS.TM] = [];
    for (var i = 0; i < this.order.tm.length;i++){
        data[CENUMS.ORDER][CENUMS.TM].push(this.order.tm[i]);
    }
    data[CENUMS.ORDER][CENUMS.KEY] = [];
    for (var i = 0; i < this.order.key.length;i++){
        data[CENUMS.ORDER][CENUMS.KEY].push(this.order.key[i]);
    }

    return data;
}

exports.Inventory = Inventory;


var Item = function(){};

Item.prototype.init = function(data) {
    this.id = data['itemid'];
    this.name = data['name'];
    this.type = data['type'];
    this.price = data['price'];
    this.stack = data['stack'];
    this.description = data['description'];
    this.use = data['use'];
    this.amount = 1;

    this.targetType = this['use']['type'];

    this.clientData = this.getClientData();
    //Target types
    //allpkmn
    //fieldpkmn
    //battlepkmn
    //all
    //field
    //battle
    //battleenemy
};

Item.prototype.getClientData = function() {
    var data = {};
    data[CENUMS.NAME] = this.name;
    data[CENUMS.ID] = this.id;
    data[CENUMS.TYPE] = this.type;
    data[CENUMS.PRICE] = this.price;
    data[CENUMS.DESCRIPTION] = this.description;
    data[CENUMS.AMOUNT] = this.amount;
    data[CENUMS.TARGETTYPE] = targetTypeEnums[this.targetType];
    return data;
};

exports.Item = Item;