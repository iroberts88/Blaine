//----------------------------------------------------------------
//inventory.js
//Author: Ian Roberts
//----------------------------------------------------------------
(function(window) {

    var Inventory = function(data){
        var itemTypes = [CENUMS.MAIN, CENUMS.BALL,CENUMS.TM,CENUMS.KEY];
        var items = {};
        var order = {};
        for (var i in data[CENUMS.ITEMS]){
            var newItem = new Item(data[CENUMS.ITEMS][i]);
            items[newItem.id] = newItem;
        }
        for (var i in data[CENUMS.ORDER]){
            order[i] = [];
            for (var j = 0; j < data[CENUMS.ORDER][i].length;j++){
                order[i].push(data[CENUMS.ORDER][i][j]);
            }
        }
        return {
            items: items,
            order: order
        }
    };
    window.Inventory = Inventory;
})(window);


(function(window) {
    var Item = function(data){
        this.name = data[CENUMS.NAME];
        this.id = data[CENUMS.ID];
        this.type = data[CENUMS.TYPE];
        this.price = data[CENUMS.PRICE];
        this.description = data[CENUMS.DESCRIPTION];
        this.amount = data[CENUMS.AMOUNT];
        this.targetType = data[CENUMS.TARGETTYPE];
    }

    window.Item = Item;
})(window);
