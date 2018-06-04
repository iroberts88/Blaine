
    

var Attack = function(){}
        
Attack.prototype.init = function(data){
    this.attackid = data.attackid;
    this.name = data.name;
    this.targetType = data.targetType;
    this.acc = data.acc;
    this.pp = data.pp;
    this.power = data.power;

    //optional
    this.type = (typeof data.type == 'undefined') ? 1 : data.type;
    this.description = (typeof data.description == 'undefined') ? '' : data.description;

    //target types

    //single -- target another pokemon 
    //all -- target all pokemon
    //self -- target self
}

Attack.prototype.getClientData = function(){
    var data = {}
    data.attackid = this.attackid;
    data.name = this.name;
    data.targetType = this.targetType;
    data.acc = this.acc;
    data.pp = this.pp;
    data.power = this.power;
    data.type = this.type;
    data.description = this.description;
    return data;
}

exports.Attack = Attack;
