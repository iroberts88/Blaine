
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
        this.battleCommandSent = false;

        this.n = null;
        this.team = null;
        
        this.name = Utils.udCheck(data[CENUMS.NAME],null,data[CENUMS.NAME]);
        this.types = Utils.udCheck(data[CENUMS.TYPES],null,data[CENUMS.TYPES]);
        this.moves = Utils.udCheck(data[CENUMS.MOVES],null,data[CENUMS.MOVES]);
        this.exp = Utils.udCheck(data[CENUMS.EXP],null,data[CENUMS.EXP]);
        this.expType = Utils.udCheck(data[CENUMS.EXPTYPE],null,data[CENUMS.EXPTYPE]);
        this.currentHP = Utils.udCheck(data[CENUMS.CURRENTHP],null,data[CENUMS.CURRENTHP]);
        this.currentPP = Utils.udCheck(data[CENUMS.CURRENTPP],null,data[CENUMS.CURRENTPP]);
        this.slot = Utils.udCheck(data[CENUMS.SLOT],null,data[CENUMS.SLOT]);
        this.hp = Utils.udCheck(data[CENUMS.HP],null,data[CENUMS.HP]);
        this.speed = Utils.udCheck(data[CENUMS.SPEED],null,data[CENUMS.SPEED]);
        this.attack = Utils.udCheck(data[CENUMS.ATTACK],null,data[CENUMS.ATTACK]);
        this.defense = Utils.udCheck(data[CENUMS.DEFENSE],null,data[CENUMS.DEFENSE]);
        this.specialAttack = Utils.udCheck(data[CENUMS.SPECIALATTACK],null,data[CENUMS.SPECIALATTACK]);
        this.specialDefense = Utils.udCheck(data[CENUMS.SPECIALDEFENSE],null,data[CENUMS.SPECIALDEFENSE]);

        this.previousStatValues = {
            hp: this.hp,
            speed: this.speed,
            attack: this.attack,
            spattack: this.specialAttack,
            spdefense: this.specialDefense,
            defense: this.defense,
            exp: this.exp
        }
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

    };
    Pokemon.prototype.getMove = function(id){
        for (var i = 0; i < this.moves.length;i++){
            if (this.moves[i][CENUMS.MOVEID] == id){
                return this.moves[i];
            }
        }
        return null;
    };
    Pokemon.prototype.reset = function(){
        this.battleCommand = null;
        this.battleCommandSent = false;
        this.charge = 0;
    }

    Pokemon.prototype.getExpValue = function(level){
        if (level == 0){return 0;}
        switch (this.expType){
            case 1:
                return Math.round((5*Math.pow(level,3))/4);
                break;
            case 2:
                return Math.max(level*20,Math.round((6/5)*Math.pow(level,3)-(15*Math.pow(level,2))+100*level-140));
                break;
            case 3:
                return Math.pow(level,3);
                break;
            case 4:
                return Math.round((4*Math.pow(level,3))/5);
                break;
            case 5:
                if (level <= 15){
                    return Math.round(Math.pow(level,3)*((((level+1)/3)+24)/50));
                }else if (level <= 36){
                    return Math.round(Math.pow(level,3)*((level+14)/50));
                }else {
                    return Math.round(Math.pow(level,3)*(((level/2)+32)/50));
                }
                break;
            case 6:
                if (level <= 50){
                    return Math.round((Math.pow(level,3)*(100-level))/50);
                }else if (level <= 68){
                    return Math.round((Math.pow(level,3)*(150-level))/100);
                }else if (level <= 98){
                    return Math.round((Math.pow(level,3)*((1911-10*level)/3))/500);
                }else {
                    return Math.round((Math.pow(level,3)*(160-level))/100);
                }
                break;

        }
    }

    Pokemon.prototype.setStat = function(data){
        switch(data[CENUMS.STAT]){
            case CENUMS.HP:
                this.previousStatValues.hp = this.hp;
                this.hp = data[CENUMS.VALUE];
                break;
            case CENUMS.CURRENTHP:
                this.currentHP = data[CENUMS.VALUE];
                break;
            case CENUMS.HPPERCENT:
                this.hpPercent = data[CENUMS.VALUE];
                var pkmn = Battle.pokemonContainer[this.id];
                if (pkmn){
                    pkmn.hpPercent = data[CENUMS.VALUE];
                    Battle.drawHPBar(Battle.pokemonSpriteContainer[this.id].hpBar,data[CENUMS.VALUE]/100);

                    if (data[CENUMS.VALUE] == 0){
                        //if it's your pokemon, add a "send out pokemon" button
                        Battle.addChat('& ' + pkmn.nickname + ' fainted!');
                        Battle.removePokemon(pkmn);
                        if (Party.getPokemon(this.id)){
                            Battle.newPokemonButtons[pkmn.n].visible = true;
                        }
                    }
                }
                break;
            case CENUMS.SPEED:
                this.previousStatValues.speed = this.speed;
                this.speed = data[CENUMS.VALUE];
                break;
            case CENUMS.ATTACK:
                this.previousStatValues.speed = this.speed;
                this.attack = data[CENUMS.VALUE];
                break;
            case CENUMS.SPECIALATTACK:
                this.previousStatValues.spattack = this.specialAttack;
                this.specialAttack = data[CENUMS.VALUE];
                break;
            case CENUMS.DEFENSE:
                this.previousStatValues.defense = this.defense;
                this.defense = data[CENUMS.VALUE];
                break;
            case CENUMS.SPECIALDEFENSE:
                this.previousStatValues.spdefense = this.specialDefense;
                this.specialDefense = data[CENUMS.VALUE];
                break;
            case CENUMS.EXP:
                this.previousStatValues.exp = this.exp;
                this.exp = data[CENUMS.VALUE];
                break;
        }
    }


    window.Pokemon = Pokemon;
})(window);
