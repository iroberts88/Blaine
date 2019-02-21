
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

    Pokemon.prototype.setStat = function(data){
        switch(data[CENUMS.STAT]){
            case CENUMS.HP:
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
                this.speed = data[CENUMS.VALUE];
                break;
            case CENUMS.ATTACK:
                this.attack = data[CENUMS.VALUE];
                break;
            case CENUMS.SPECIALATTACK:
                this.specialAttack = data[CENUMS.VALUE];
                break;
            case CENUMS.DEFENSE:
                this.defense = data[CENUMS.VALUE];
                break;
            case CENUMS.SPECIALDEFENSE:
                this.specialDefense = data[CENUMS.VALUE];
                break;
        }
    }

    window.Pokemon = Pokemon;
})(window);
