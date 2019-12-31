
var CENUMS = require('./enums.js').Enums; //init client enums

var PokemonStorage = function(){
    this.MAX_BOXES = 10;
    this.POKEMON_PER_BOX = 100;
    this.currentBox = 0;
    this.boxes = [];
    this.positionIndex = {};
    this.pokemonCount = {}; //index of pokemon count
    this.totallyFull = false; //all boxes totally full!
}

PokemonStorage.prototype.init = function(data) {
    //get existing storage data?
    this.boxes.push({});
    this.pokemonCount[0] = 0;
};

PokemonStorage.prototype.addPokemon = function(p){
    var box = this.boxes[this.currentBox];
    if (this.pokemonCount[this.currentBox] == this.POKEMON_PER_BOX){
        //this box is full!
        var foundBox = false;
        //try to find an empty box
        var I = this.currentBox + 1;
        while(!foundBox){
            if (I == this.MAX_BOXES){
                I = 0
            }
            if (I == this.currentBox){
                //loop complete, all boxes full...
                //TODO deal with that...
                this.totallyFull = true;
                console.log("ALL BOXES FULL");
                return;
            }
            //IF box doesnt exist, create a new one!
            if (typeof this.boxes[I] == 'undefined'){
                this.boxes.push({});
                this.pokemonCount[I] = 0;
            }
            if (this.pokemonCount[I] < this.POKEMON_PER_BOX){ //check the next box
                foundBox = true;
                this.currentBox = I;
                box = this.boxes[I];
            }
            I += 1;
        }
    }

    //got an empty box...
    for (var i = 0; i < this.POKEMON_PER_BOX; i++){
        if (typeof box[i] == 'undefined'){
            box[i] = p;
            this.positionIndex[p.id] = {
                boxNumber: this.currentBox,
                boxIndex: i
            }
            this.pokemonCount[this.currentBox] += 1;
            break;
        }
    }

    //console.log(JSON.stringify(this.getDBObj(),null,2));
    return this.currentBox;
};

PokemonStorage.prototype.getPokemon = function(box,index){
};

PokemonStorage.prototype.getPokemonById = function(id){
}

PokemonStorage.prototype.removePokemon = function(box,index){
};

PokemonStorage.prototype.removePokemonById = function(idt){
};

PokemonStorage.prototype.getDBObj = function(){
    var dbObj = {};
    dbObj.currentBox = this.currentBox;
    dbObj.boxes = [];
    for (var i = 0; i < this.boxes.length;i++){
        var box = {};
        for (var j in this.boxes[i]){
            box[j] = this.boxes[i][j].getDBObj();
        }
        dbObj.boxes.push(box);
    }
    dbObj.positionIndex = this.positionIndex;
   
    return dbObj;
};

PokemonStorage.prototype.getBoxData = function(box){
    //create object to send to the client
    var bData = {};
    for (var j in this.boxes[box]){
        bData[j] = this.boxes[i].getClientData();
    }
    return bData;
}

exports.PokemonStorage = PokemonStorage;
