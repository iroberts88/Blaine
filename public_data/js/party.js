//client side Party pokemon
(function(window) {
    Party = {
        pokemon: {},
        init: function(pokeArray){
        	this.pokemon = {
                '1': '',
                '2': '',
                '3': '',
                '4': '',
                '5': '',
                '6': ''
            }
            for (var i = 0; i < pokeArray.length;i++){
                var newpoke = new Pokemon();
                newpoke.init(pokeArray[i]);
                this.setPokemon(newpoke.slot,newpoke);
            }
            for (var i = 1; i < 7; i++){
                Game.resetPokemon(i);
            }
        },

        reset: function(){
            for (var i in this.pokemon){
                if (this.pokemon[i] != ''){
                    this.pokemon[i].reset();
                }
            }
        },
        resetPreviousValues: function(){
            for (var i in this.pokemon){
                if (this.pokemon[i] != ''){
                    this.pokemon[i].resetPreviousValues();
                }
            }
        },
        setPokemon: function(slot,pokemon){
            this.pokemon[slot] = pokemon;
        },

        getPokemon: function(id){
            for (var i = 1;i < 7;i++){
                if (this.pokemon[i] != ''){ 
                    if (this.pokemon[i].id == id){
                        return this.pokemon[i];
                    }
                }
            }
            return null;
        },
        getPokemonIndex: function(id){
            for (var i = 1;i < 7;i++){
                if (this.pokemon[i] != ''){
                    if (this.pokemon[i].id == id){
                        return i;
                    }
                }
            }
            return null;
        }
    }

    window.Party = Party;
})(window);


