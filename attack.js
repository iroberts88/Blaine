var Attack = function(){}

var CENUMS = require('./enums.js').Enums; //init client enums
CENUMS.init();

var typeEnums = {
    'single': CENUMS.SINGLE,
    'all': CENUMS.ALL,
    'self': CENUMS.SELF,
    'ally': CENUMS.ALLY,
    'enemy': CENUMS.ENEMY,
    'enemyTeam': CENUMS.ENEMYTEAM
}
Attack.prototype.init = function(data){
    this.attackid = null;
    this.id = data.attackid;
    this.name = data.name;
    this.targetType = (typeof data.targetType == 'undefined') ? CENUMS.SINGLE : typeEnums[data.targetType];
    this.acc = data.acc;
    this.pp = data.pp;
    this.power = data.power;
    this.castTime = data.castTime; //the time in which the attack can be interrupted
    this.animationTime = data.animationTime; //the full duration of the animation time before the attack completes
    this.clientID = data.clientID;
    //optional
    this.type = (typeof data.type == 'undefined') ? 1 : data.type;
    this.physical = (typeof data.physical == 'undefined') ? false : data.physical;
    this.description = (typeof data.description == 'undefined') ? '' : data.description;
    this.effects = (typeof data.effects == 'undefined') ? [] : data.effects;

    this.attackindex = 0;
}

Attack.prototype.getClientData = function(){
    var data = {}
    data[CENUMS.MOVEID] = this.attackid;
    data[CENUMS.NAME] = this.name;
    data[CENUMS.TARGETTYPE] = this.targetType;
    data[CENUMS.ACCURACY] = this.acc;
    data[CENUMS.PP] = this.pp;
    data[CENUMS.POWER] = this.power;
    data[CENUMS.TYPE] = this.type;
    data[CENUMS.DESCRIPTION] = this.description;
    return data;
}

exports.Attack = Attack;
