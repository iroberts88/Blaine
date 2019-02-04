
(function(window) {
    var Pokemon = function(){

    }

    Pokemon.prototype.init = function(data){
        console.log(data);
        this.nickname = data[CENUMS.NICKNAME];
        this.owner = data[CENUMS.OWNER];
        this.number = data[CENUMS.NUMBER];
        this.level = data[CENUMS.LEVEL];
        this.id = data[CENUMS.ID];
        this.hpPercent = data[CENUMS.HPPERCENT];
        this.battleSprite = null;

        this.charge = 0;
        this.battleCommand = null;
        
        this.name = Utils.udCheck(data[CENUMS.NAME],null,data[CENUMS.NAME]);
        this.types = Utils.udCheck(data[CENUMS.TYPES],null,data[CENUMS.TYPES]);
        this.moves = Utils.udCheck(data[CENUMS.MOVES],null,data[CENUMS.MOVES]);
        this.exp = Utils.udCheck(data[CENUMS.EXP],null,data[CENUMS.EXP]);
        this.currentHP = Utils.udCheck(data[CENUMS.CURRENTHP],null,data[CENUMS.CURRENTHP]);
        this.currentPP = Utils.udCheck(data[CENUMS.CURRENTPP],null,data[CENUMS.CURRENTPP]);
        this.slot = Utils.udCheck(data[CENUMS.SLOT],null,data[CENUMS.SLOT]);
        this.hp = Utils.udCheck(data[CENUMS.HP],null,data[CENUMS.HP]);
        this.speed = Utils.udCheck(data[CENUMS.SPEED],null,data[CENUMS.SPEED]);
        this.attack = Utils.udCheck(data[CENUMS.ATTACK],null,data[CENUMS.ATTACK]);
        this.defense = Utils.udCheck(data[CENUMS.DEFENSE],null,data[CENUMS.DEFENSE]);
        this.specialAttack = Utils.udCheck(data[CENUMS.SPECIALATTACK],null,data[CENUMS.SPECIALATTACK]);
        this.specialDefense = Utils.udCheck(data[CENUMS.SPECIALDEFENSE],null,data[CENUMS.SPECIALDEFENSE]);
    }

    Pokemon.prototype.update = function(deltaTime){
        if (this.charge == Battle.chargeCounter){
            return;
        }
        this.charge += deltaTime*this.speed;
        if (this.charge >= Battle.chargeCounter){
            this.charge = Battle.chargeCounter;
        }
        var bar = Battle.pokemonSpriteContainer[this.id].chargeBar;
        Battle.drawChargeBar(bar,this.charge/Battle.chargeCounter);
    }

    

    window.Pokemon = Pokemon;
})(window);
