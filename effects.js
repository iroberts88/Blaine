//Collection of effects for certain attacks

var Effects = function() {};

var EffectEnums = {
    AlterStatStage: 'alterStatStage',
}


///////////////////////////////////////////////////-----------|
////       Attack Effects      ////////////////////           |
///////////////////////////////////////////////////////////////

//attack - the attack containing the effect
//battle - the battle
//turnData
//effect
//ctd

Effects.prototype.alterStatStage = function(data){
    if (typeof data.effect.chance == 'undefined'){
        data.effect.chance = 1;
    }
    
    if (Math.random() < data.effect.chance){
        var stat = data.target.getStat(data.effect.stat);
        console.log(stat.value)
        var previous = stat.stage;
        stat.modStage(data.effect.val);
        var change = stat.stage - previous;
        var text = '';
        //todo these should all be parsed on the client instead of having the text sent down...
        if (change == 0){
            if (data.effect.val < 0){
                text = data.target.nickname + '\'s ' + stat.name + ' won\'t go any lower!';
            }else{
                text = data.target.nickname + '\'s ' + stat.name + ' won\'t go any higher!';
            }
        }else if (change == 1){
                text = data.target.nickname + '\'s ' + stat.name + ' went up!';
        }else if (change == -1){
                text = data.target.nickname + '\'s ' + stat.name + ' went down!';
        }else if (change > 1){
                text = data.target.nickname + '\'s ' + stat.name + ' went way up!';
        }else if (change < 1){
                text = data.target.nickname + '\'s ' + stat.name + ' went way down!';
        }
        console.log(stat.value)
        data.ctd.push({
            action: 'text',
            text: text
        });
    }
}

///////////////////////////////////
////        Get Effects        ////
///////////////////////////////////

Effects.prototype.getEffect = function(effectStr){
    //return a behaviour based on passed id
    var Effects = require('./effects.js').Effects;
    switch(effectStr) {
        case EffectEnums.AlterStatStage:
            return Effects.alterStatStage;
            break;
        default:
            console.log('Unable to find Effect: ' + EffectStr);
            return null;
            break;
    }
}

exports.Effects = new Effects();